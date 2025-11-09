"use client"

import { useState } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { MedicalHeader } from "@/components/medical-header"
import { ImageViewer } from "@/components/image-viewer"
import { SegmentationPanel } from "@/components/segmentation-panel"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function Home() {
  const [isDark, setIsDark] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [segmentationResults, setSegmentationResults] = useState<any>(null)

  return (
    <ThemeProvider defaultTheme={isDark ? "dark" : "light"}>
      <div className={isDark ? "dark" : ""}>
        <div className="min-h-screen bg-background transition-colors duration-300">
          <MedicalHeader isDark={isDark} setIsDark={setIsDark} />

          <main className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* LEFT SECTION */}
              <div className="lg:col-span-2 space-y-8">
                {/* Upload viewer */}
                <ImageViewer onFileUpload={setUploadedFile} />

                {/* ✅ Segmentation Output directly below viewer */}
                {segmentationResults && (
                  <Card className="border-green-500/40 bg-green-50 dark:bg-green-900/20">
                    <CardHeader>
                      <CardTitle className="text-green-600 dark:text-green-400">
                        Segmentation Output
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <div>
                        <p className="font-semibold mb-1">Axial</p>
                        <img src={segmentationResults.axial} className="rounded border" />
                      </div>

                      <div>
                        <p className="font-semibold mb-1">Coronal</p>
                        <img src={segmentationResults.coronal} className="rounded border" />
                      </div>

                      <div>
                        <p className="font-semibold mb-1">Sagittal</p>
                        <img src={segmentationResults.sagittal} className="rounded border" />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* RIGHT SECTION */}
              <div className="lg:col-span-1">
                <SegmentationPanel
                  file={uploadedFile}
                  onSegmentationComplete={setSegmentationResults}
                />
              </div>

            </div>
          </main>

        </div>
      </div>
    </ThemeProvider>
  )
}
