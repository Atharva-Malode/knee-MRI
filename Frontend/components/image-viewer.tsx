"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ImageViewer({ onFileUpload }: { onFileUpload: (file: File | null) => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFile(file)
    onFileUpload(file)

    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      setImageLoaded(true)
    }, 1500)
  }

  const resetImage = () => {
    setImageLoaded(false)
    setUploadedFile(null)
    onFileUpload(null)
  }

  return (
    <Card className="border-2 border-dashed border-medical-accent/30 hover:border-medical-accent/60 transition-colors">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-medical-primary rounded-full animate-pulse"></span>
          3D Medical Image
        </CardTitle>
        <CardDescription>Upload and view NIfTI (.nii.gz) knee MRI imaging data</CardDescription>
      </CardHeader>

      <CardContent>
        {!imageLoaded ? (
          <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:bg-muted/50 cursor-pointer">
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-4">
                {isLoading ? (
                  <>
                    <Loader2 className="w-12 h-12 text-medical-accent animate-spin" />
                    <p className="text-sm text-muted-foreground">Processing your image...</p>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-medical-accent/10 rounded-lg">
                      <Upload className="w-8 h-8 text-medical-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Drag or click to upload</p>
                      <p className="text-xs text-muted-foreground">
                        Supported: .nii / .nii.gz up to 500MB
                      </p>
                    </div>
                  </>
                )}
              </div>

              <input
                id="file-upload"
                type="file"
                accept=".nii,.gz"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview Placeholder */}
            <div className="bg-gradient-to-b from-medical-primary/20 to-medical-accent/20 rounded-lg p-24 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block p-4 bg-medical-accent/20 rounded-full mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-medical-primary to-medical-accent rounded-full opacity-40"></div>
                </div>
                <p className="text-sm text-muted-foreground">3D viewer – Image loaded</p>
                <p className="text-xs text-muted-foreground mt-2">{uploadedFile?.name}</p>
              </div>
            </div>

            {/* Reset Button */}
            <Button variant="ghost" size="sm" onClick={resetImage} className="w-full text-xs">
              Upload different image
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
