"use client"

import { useState } from "react"
import { Loader2, Bone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function SegmentationPanel({
  file,
  onSegmentationComplete,
}: {
  file: File | null
  onSegmentationComplete: (images: any) => void
}) {
  const [isSegmenting, setIsSegmenting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSegment = async () => {
    if (!file) {
      alert("Please upload an MRI file first!")
      return
    }

    setIsSegmenting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("http://localhost:8000/segment", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()

      onSegmentationComplete(data.images) // ✅ send images to parent
    } catch (err: any) {
      console.error(err)
      setError("Segmentation failed. Please try again.")
    } finally {
      setIsSegmenting(false)
    }
  }

  return (
    <Card className="border-medical-accent/30 bg-card">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Bone className="w-5 h-5 text-medical-primary" />
          AI Segmentation
        </CardTitle>
        <CardDescription>Run segmentation on the uploaded 3D MRI file</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Button
          className="w-full bg-gradient-to-r from-medical-primary to-medical-accent text-white"
          onClick={handleSegment}
          disabled={isSegmenting}
        >
          {isSegmenting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Bone className="w-4 h-4 mr-2" />
              Start Segmentation
            </>
          )}
        </Button>

        {error && <p className="text-xs text-red-500">{error}</p>}
      </CardContent>
    </Card>
  )
}
