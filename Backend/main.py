import os
import io
import base64
import gc
import numpy as np
import nibabel as nib
import matplotlib.pyplot as plt
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from monai.networks.nets import UNet
from monai.transforms import (
    Compose, LoadImaged, EnsureChannelFirstd, Orientationd, Spacingd,
    ScaleIntensityRanged, CropForegroundd, EnsureTyped
)
from monai.inferers import sliding_window_inference
import torch

# ========== FastAPI Setup ==========
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev; tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== Model Setup ==========
device = torch.device("cpu")
model_path = r"C:\Users\athar\OneDrive\Desktop\Atharva\knee_MRI\Backend\model\best_model.pth"
num_classes = 6  # Adjust based on your training

model = UNet(
    spatial_dims=3,
    in_channels=1,
    out_channels=num_classes,
    channels=(16, 32, 64, 128, 256),
    strides=(2, 2, 2, 2),
    num_res_units=2,
).to(device)

checkpoint = torch.load(model_path, map_location=device)
if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
    model.load_state_dict(checkpoint["model_state_dict"])
else:
    model.load_state_dict(checkpoint)
model.eval()

# ========== Transforms ==========
test_transforms = Compose([
    LoadImaged(keys=["image"]),
    EnsureChannelFirstd(keys=["image"]),
    Orientationd(keys=["image"], axcodes="RAS"),
    Spacingd(keys=["image"], pixdim=(1.0, 1.0, 1.0), mode=("bilinear")),
    ScaleIntensityRanged(keys=["image"], a_min=0, a_max=5000, b_min=0.0, b_max=1.0, clip=True),
    CropForegroundd(keys=["image"], source_key="image"),
    EnsureTyped(keys=["image"]),
])

# ========== Helper Function ==========
def array_to_base64_image(array, cmap="jet"):
    """Convert a 2D numpy array to base64 PNG string"""
    fig, ax = plt.subplots(figsize=(5, 5))
    ax.imshow(array.T, cmap=cmap, origin="lower")
    ax.axis("off")

    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches="tight", pad_inches=0)
    plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("utf-8")


# ========== Segmentation Endpoint ==========
@app.post("/segment")
async def segment_mri(file: UploadFile = File(...)):
    try:
        # Save uploaded file
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, file.filename)

        with open(file_path, "wb") as f:
            f.write(await file.read())

        # Run preprocessing + inference
        test_file = {"image": file_path}
        test_data = test_transforms(test_file)
        test_image = test_data["image"].unsqueeze(0).to(device)

        with torch.no_grad():
            pred = sliding_window_inference(test_image, (64, 64, 64), 1, model)
            pred_label = torch.argmax(pred, dim=1).squeeze().cpu().numpy()

        # Select middle slices for visualization
        axial_slice = pred_label[:, :, pred_label.shape[2] // 2]
        coronal_slice = pred_label[:, pred_label.shape[1] // 2, :]
        sagittal_slice = pred_label[pred_label.shape[0] // 2, :, :]

        # Convert to base64 images
        axial_b64 = array_to_base64_image(axial_slice)
        coronal_b64 = array_to_base64_image(coronal_slice)
        sagittal_b64 = array_to_base64_image(sagittal_slice)

        gc.collect()

        return {
            "status": "success",
            "classes": list(range(num_classes)),
            "images": {
                "axial": f"data:image/png;base64,{axial_b64}",
                "coronal": f"data:image/png;base64,{coronal_b64}",
                "sagittal": f"data:image/png;base64,{sagittal_b64}",
            },
        }

    except Exception as e:
        print("Error:", e)
        return {"status": "error", "message": str(e)}

