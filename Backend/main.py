import os
import io
import gc
import base64
import numpy as np
import matplotlib.pyplot as plt
import torch
import torch.nn as nn
import torch.nn.functional as F

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from monai.networks.nets import UNet
from monai.transforms import (
    Compose, LoadImaged, EnsureChannelFirstd,
    Orientationd, Spacingd, ScaleIntensityRanged,
    CropForegroundd, EnsureTyped
)
from monai.inferers import sliding_window_inference
from torchvision.models.video import r3d_18


# =========================================================
# FASTAPI SETUP
# =========================================================
app = FastAPI(title="Knee MRI API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # <-- tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# DEVICE
# =========================================================
SEG_DEVICE = torch.device("cpu")
CLF_DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print("Segmentation device:", SEG_DEVICE)
print("Classification device:", CLF_DEVICE)


# =========================================================
# ----------- SEGMENTATION MODEL SETUP ---------------------
# =========================================================

SEG_MODEL_PATH = r"D:\Atharva\knee-MRI\Backend\model\segment.pth"
NUM_CLASSES = 6

seg_model = UNet(
    spatial_dims=3,
    in_channels=1,
    out_channels=NUM_CLASSES,
    channels=(16, 32, 64, 128, 256),
    strides=(2, 2, 2, 2),
    num_res_units=2,
).to(SEG_DEVICE)

seg_checkpoint = torch.load(SEG_MODEL_PATH, map_location=SEG_DEVICE)

if isinstance(seg_checkpoint, dict) and "model_state_dict" in seg_checkpoint:
    seg_model.load_state_dict(seg_checkpoint["model_state_dict"])
else:
    seg_model.load_state_dict(seg_checkpoint)

seg_model.eval()
print("Segmentation model loaded:", SEG_MODEL_PATH)


# =========================================================
# ----------- SEGMENTATION TRANSFORMS ----------------------
# =========================================================
seg_transforms = Compose([
    LoadImaged(keys=["image"]),
    EnsureChannelFirstd(keys=["image"]),
    Orientationd(keys=["image"], axcodes="RAS"),
    Spacingd(keys=["image"], pixdim=(1.0, 1.0, 1.0), mode=("bilinear")),
    ScaleIntensityRanged(
        keys=["image"], a_min=0, a_max=5000,
        b_min=0.0, b_max=1.0, clip=True
    ),
    CropForegroundd(keys=["image"], source_key="image"),
    EnsureTyped(keys=["image"]),
])


# =========================================================
# ----------- HELPER: Convert array → base64 image ----------
# =========================================================
def array_to_base64_image(array, cmap="jet"):
    fig, ax = plt.subplots(figsize=(5, 5))
    ax.imshow(array.T, cmap=cmap, origin="lower")
    ax.axis("off")

    buffer = io.BytesIO()
    plt.savefig(buffer, format="png", bbox_inches="tight", pad_inches=0)
    plt.close(fig)
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode("utf-8")


# =========================================================
# ---------------- SEGMENTATION ENDPOINT -------------------
# =========================================================
@app.post("/segment", summary="Segment knee MRI volume")
async def segment_mri(file: UploadFile = File(...)):
    try:
        # Save uploaded file
        upload_dir = "uploads_segmentation"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, file.filename)

        with open(file_path, "wb") as f:
            f.write(await file.read())

        # Preprocess
        sample = {"image": file_path}
        data = seg_transforms(sample)
        image_tensor = data["image"].unsqueeze(0).to(SEG_DEVICE)

        # Inference
        with torch.no_grad():
            pred = sliding_window_inference(image_tensor, (64, 64, 64), 1, seg_model)
            seg_mask = torch.argmax(pred, dim=1).squeeze().cpu().numpy()

        # Extract slices
        axial = seg_mask[:, :, seg_mask.shape[2] // 2]
        coronal = seg_mask[:, seg_mask.shape[1] // 2, :]
        sagittal = seg_mask[seg_mask.shape[0] // 2, :, :]

        # Convert to base64
        result = {
            "status": "success",
            "classes": list(range(NUM_CLASSES)),
            "images": {
                "axial":    f"data:image/png;base64,{array_to_base64_image(axial)}",
                "coronal":  f"data:image/png;base64,{array_to_base64_image(coronal)}",
                "sagittal": f"data:image/png;base64,{array_to_base64_image(sagittal)}",
            }
        }

        gc.collect()
        return result

    except Exception as e:
        return {"status": "error", "message": str(e)}



# =========================================================
# ---------------- CLASSIFICATION MODEL --------------------
# =========================================================

class MRNetResNet(nn.Module):
    def __init__(self):
        super().__init__()
        model = r3d_18(weights=None)

        # Change first conv to accept 1-channel MRI
        model.stem[0] = nn.Conv3d(
            1, 64,
            kernel_size=(3,7,7),
            stride=(1,2,2),
            padding=(1,3,3),
            bias=False
        )

        model.fc = nn.Linear(model.fc.in_features, 2)
        self.model = model

    def forward(self, x):
        return self.model(x)


CLF_MODEL_PATH = r"D:\Atharva\knee-MRI\Backend\model\classify.pth"

clf_model = MRNetResNet().to(CLF_DEVICE)
clf_model.load_state_dict(torch.load(CLF_MODEL_PATH, map_location=CLF_DEVICE))
clf_model.eval()

print("Classification model loaded:", CLF_MODEL_PATH)


# =========================================================
# ----------- PREPROCESS .NPY MRI FOR CLASSIFICATION -------
# =========================================================
FIXED_SLICES = 32

def load_npy_for_classification(npy_path):
    img = np.load(npy_path).astype(np.float32)

    # Normalize 0–1
    img = (img - img.min()) / (img.max() - img.min() + 1e-5)

    # Fix to 32 slices
    n = img.shape[0]
    if n < FIXED_SLICES:
        pad = FIXED_SLICES - n
        before = pad // 2
        after = pad - before
        img = np.pad(img, ((before, after), (0,0), (0,0)), "constant")
    elif n > FIXED_SLICES:
        start = (n - FIXED_SLICES) // 2
        img = img[start:start+FIXED_SLICES]

    return img[np.newaxis, ...]     # shape (1, 32, H, W)


# =========================================================
# ---------------- CLASSIFICATION ENDPOINT -----------------
# =========================================================
@app.post("/classify", summary="Classify MRI as Normal / Abnormal")
async def classify_mri(file: UploadFile = File(...)):
    try:
        # Save uploaded .npy
        upload_dir = "uploads_classification"
        os.makedirs(upload_dir, exist_ok=True)
        npy_path = os.path.join(upload_dir, file.filename)

        with open(npy_path, "wb") as f:
            f.write(await file.read())

        img = load_npy_for_classification(npy_path)

        # Convert to tensor: (B, C, D, H, W)
        img_tensor = torch.tensor(img, dtype=torch.float32).unsqueeze(0).to(CLF_DEVICE)

        # Inference
        with torch.no_grad():
            output = clf_model(img_tensor)
            prob_ab = F.softmax(output, dim=1)[0][1].item()
            pred = torch.argmax(output).item()

        label = "Abnormal" if pred == 1 else "Normal"

        return {
            "status": "success",
            "prediction": label,
            "probability_abnormal": round(prob_ab, 4)
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}

# import os
# import io
# import base64
# import gc
# import numpy as np
# import nibabel as nib
# import matplotlib.pyplot as plt
# from fastapi import FastAPI, UploadFile, File
# from fastapi.middleware.cors import CORSMiddleware
# from monai.networks.nets import UNet
# from monai.transforms import (
#     Compose, LoadImaged, EnsureChannelFirstd, Orientationd, Spacingd,
#     ScaleIntensityRanged, CropForegroundd, EnsureTyped
# )
# from monai.inferers import sliding_window_inference
# import torch

# # ========== FastAPI Setup ==========
# app = FastAPI()
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # For dev; tighten in production
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ========== Model Setup ==========
# device = torch.device("cpu")
# model_path = r"C:\Users\athar\OneDrive\Desktop\Atharva\knee_MRI\Backend\model\best_model.pth"
# num_classes = 6  # Adjust based on your training

# model = UNet(
#     spatial_dims=3,
#     in_channels=1,
#     out_channels=num_classes,
#     channels=(16, 32, 64, 128, 256),
#     strides=(2, 2, 2, 2),
#     num_res_units=2,
# ).to(device)

# checkpoint = torch.load(model_path, map_location=device)
# if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
#     model.load_state_dict(checkpoint["model_state_dict"])
# else:
#     model.load_state_dict(checkpoint)
# model.eval()

# # ========== Transforms ==========
# test_transforms = Compose([
#     LoadImaged(keys=["image"]),
#     EnsureChannelFirstd(keys=["image"]),
#     Orientationd(keys=["image"], axcodes="RAS"),
#     Spacingd(keys=["image"], pixdim=(1.0, 1.0, 1.0), mode=("bilinear")),
#     ScaleIntensityRanged(keys=["image"], a_min=0, a_max=5000, b_min=0.0, b_max=1.0, clip=True),
#     CropForegroundd(keys=["image"], source_key="image"),
#     EnsureTyped(keys=["image"]),
# ])

# # ========== Helper Function ==========
# def array_to_base64_image(array, cmap="jet"):
#     """Convert a 2D numpy array to base64 PNG string"""
#     fig, ax = plt.subplots(figsize=(5, 5))
#     ax.imshow(array.T, cmap=cmap, origin="lower")
#     ax.axis("off")

#     buf = io.BytesIO()
#     plt.savefig(buf, format="png", bbox_inches="tight", pad_inches=0)
#     plt.close(fig)
#     buf.seek(0)
#     return base64.b64encode(buf.read()).decode("utf-8")


# # ========== Segmentation Endpoint ==========
# @app.post("/segment")
# async def segment_mri(file: UploadFile = File(...)):
#     try:
#         # Save uploaded file
#         upload_dir = "uploads"
#         os.makedirs(upload_dir, exist_ok=True)
#         file_path = os.path.join(upload_dir, file.filename)

#         with open(file_path, "wb") as f:
#             f.write(await file.read())

#         # Run preprocessing + inference
#         test_file = {"image": file_path}
#         test_data = test_transforms(test_file)
#         test_image = test_data["image"].unsqueeze(0).to(device)

#         with torch.no_grad():
#             pred = sliding_window_inference(test_image, (64, 64, 64), 1, model)
#             pred_label = torch.argmax(pred, dim=1).squeeze().cpu().numpy()

#         # Select middle slices for visualization
#         axial_slice = pred_label[:, :, pred_label.shape[2] // 2]
#         coronal_slice = pred_label[:, pred_label.shape[1] // 2, :]
#         sagittal_slice = pred_label[pred_label.shape[0] // 2, :, :]

#         # Convert to base64 images
#         axial_b64 = array_to_base64_image(axial_slice)
#         coronal_b64 = array_to_base64_image(coronal_slice)
#         sagittal_b64 = array_to_base64_image(sagittal_slice)

#         gc.collect()

#         return {
#             "status": "success",
#             "classes": list(range(num_classes)),
#             "images": {
#                 "axial": f"data:image/png;base64,{axial_b64}",
#                 "coronal": f"data:image/png;base64,{coronal_b64}",
#                 "sagittal": f"data:image/png;base64,{sagittal_b64}",
#             },
#         }

#     except Exception as e:
#         print("Error:", e)
#         return {"status": "error", "message": str(e)}



