'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import JSZip from 'jszip';
import { Upload, Loader2, Bone, CheckCircle, Activity, Brain } from 'lucide-react';

interface SegmentationResults {
  axial: string;
  coronal: string;
  sagittal: string;
}

const HEALING_MESSAGES = [
  "Analyzing knee structure...",
  "Detecting ACL integrity...",
  "Examining meniscus tissue...",
  "Processing cartilage data...",
  "Identifying potential tears...",
  "Generating segmentation maps...",
  "Almost there, finalizing results..."
];

export default function SegmentationPage() {
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [npyForClassify, setNpyForClassify] = useState<File | null>(null);
  const [isSegmenting, setIsSegmenting] = useState(false);
  const [segmentationResults, setSegmentationResults] = useState<SegmentationResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentMessage, setCurrentMessage] = useState(0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileNameLower = file.name.toLowerCase();
    setError(null);
    setSegmentationResults(null);

    if (fileNameLower.endsWith('.zip')) {
      const zip = new JSZip();
      try {
        const contents = await zip.loadAsync(file);
        let niiContent: Uint8Array | null = null;
        let npyContent: Uint8Array | null = null;
        let niiName = '';
        let npyName = '';

        for (const [name, content] of Object.entries(contents.files)) {
          if (name.toLowerCase().endsWith('.nii.gz')) {
            niiContent = await content.async('uint8array');
            niiName = name.split('/').pop() || 'extracted.nii.gz';
          } else if (name.toLowerCase().endsWith('.npy')) {
            npyContent = await content.async('uint8array');
            npyName = name.split('/').pop() || 'data.npy';
          }
        }

        if (!niiContent) {
          setError('No .nii.gz file found in the zip archive.');
          return;
        }

        // Create a new ArrayBuffer-backed Uint8Array copy to satisfy Blob's expected ArrayBufferView type
        const niiArray = new Uint8Array(niiContent);
        const niiBlob = new Blob([niiArray], { type: 'application/gzip' });
        const extractedNii = new File([niiBlob], niiName);
        setUploadedFile(extractedNii);
        if (npyContent) {
          // Ensure ArrayBuffer-backed Uint8Array for Blob compatibility
          const npyArray = new Uint8Array(npyContent);
          const npyBlob = new Blob([npyArray], { type: 'application/octet-stream' });
          const extractedNpy = new File([npyBlob], npyName);
          setNpyForClassify(extractedNpy);
        } else {
          setNpyForClassify(null);
        }
      } catch (err) {
        setError('Failed to extract zip file. Please ensure it is a valid archive.');
        console.error(err);
      }
      return;
    }

    if (fileNameLower.endsWith('.nii.gz') || fileNameLower.endsWith('.nii')) {
      setUploadedFile(file);
      setNpyForClassify(null);
    } else {
      setError('Please upload a valid .nii, .nii.gz, or .zip file');
    }
  };

  const handleSegment = async () => {
    if (!uploadedFile) {
      setError('Please upload an MRI file first!');
      return;
    }

    setIsSegmenting(true);
    setError(null);
    setCurrentMessage(0);

    // Cycle through healing messages
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % HEALING_MESSAGES.length);
    }, 2000);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const res = await fetch('http://localhost:8000/segment', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setSegmentationResults(data.images);
    } catch (err: any) {
      console.error(err);
      setError('Segmentation failed. Please ensure the backend is running and try again.');
    } finally {
      clearInterval(messageInterval);
      setIsSegmenting(false);
    }
  };

  const handleGoToClassify = () => {
    sessionStorage.setItem('uploadedFileName', uploadedFile?.name || 'MRI Scan');

    if (npyForClassify) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        sessionStorage.setItem('npyBase64', base64);
        sessionStorage.setItem('npyName', npyForClassify.name);
        router.push('/classify');
      };
      reader.readAsDataURL(npyForClassify);
    } else {
      router.push('/classify');
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setNpyForClassify(null);
    setSegmentationResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Knee MRI Segmentation
          </h1>
          <p className="text-gray-400 text-lg">
            AI-powered analysis for ACL tears, meniscus injuries, and ligament damage
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Upload Section */}
          {!segmentationResults && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-2xl mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold">Upload MRI Scan</h2>
              </div>

              <div className="space-y-6">
                {/* File Upload */}
                {!uploadedFile ? (
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center hover:border-blue-500 hover:bg-gray-700/30 transition-all duration-300">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-blue-500/10 rounded-lg">
                          <Upload className="w-12 h-12 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg mb-1">Click to upload or drag and drop</p>
                          <p className="text-sm text-gray-400">
                            Supported formats: .nii, .nii.gz, .zip (Max 500MB)
                          </p>
                        </div>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept=".nii,.gz,.zip"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-xl p-6 border border-blue-700/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-6 h-6 text-green-400" />
                          <div>
                            <p className="font-semibold text-green-300">File uploaded successfully</p>
                            <p className="text-sm text-gray-400">{uploadedFile.name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={resetUpload}
                          className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                          Change file
                        </button>
                      </div>
                    </div>

                    {/* Segment Button */}
                    <button
                      onClick={handleSegment}
                      disabled={isSegmenting}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSegmenting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Bone className="w-5 h-5" />
                          Start Segmentation
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isSegmenting && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700 shadow-2xl">
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                  <Bone className="w-10 h-10 text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2 text-blue-300">
                    {HEALING_MESSAGES[currentMessage]}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Our AI is analyzing your knee MRI scan
                  </p>
                </div>
                <div className="flex gap-2">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        i === currentMessage ? 'bg-blue-400 scale-125' : 'bg-gray-600'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results Section */}
          {segmentationResults && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 backdrop-blur-sm rounded-2xl p-8 border border-green-700/50 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                  <div>
                    <h2 className="text-3xl font-bold text-green-300">Segmentation Complete</h2>
                    <p className="text-gray-400 text-sm mt-1">Analysis completed for {uploadedFile?.name}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Axial View */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <h3 className="font-semibold text-lg mb-3 text-purple-300">Axial View</h3>
                    <div className="bg-gray-900 rounded-lg overflow-hidden">
                      <img
                        src={segmentationResults.axial}
                        alt="Axial segmentation"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>

                  {/* Coronal View */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <h3 className="font-semibold text-lg mb-3 text-pink-300">Coronal View</h3>
                    <div className="bg-gray-900 rounded-lg overflow-hidden">
                      <img
                        src={segmentationResults.coronal}
                        alt="Coronal segmentation"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>

                  {/* Sagittal View */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <h3 className="font-semibold text-lg mb-3 text-cyan-300">Sagittal View</h3>
                    <div className="bg-gray-900 rounded-lg overflow-hidden">
                      <img
                        src={segmentationResults.sagittal}
                        alt="Sagittal segmentation"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <button
                    onClick={resetUpload}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 rounded-xl transition-all duration-300"
                  >
                    Analyze Another Scan
                  </button>
                  
                  {/* Classify Button - Always visible */}
                  <button
                    onClick={handleGoToClassify}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2"
                  >
                    <Brain className="w-5 h-5" />
                    Get Classification
                  </button>
                  
                  <button
                    onClick={() => window.print()}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/50"
                  >
                    Download Segmentation Report
                  </button>
                </div>

                {/* Additional Info */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-4 border border-purple-700/30">
                    <p className="text-sm text-gray-300 text-center">
                      💡 <span className="font-semibold text-purple-300">Next Step:</span> Click "Get Classification" above to analyze if your knee is normal or abnormal
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}