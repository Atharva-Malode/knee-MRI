"use client"

import { Moon, Sun, Bone } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MedicalHeaderProps {
  isDark: boolean
  setIsDark: (value: boolean) => void
}

export function MedicalHeader({ isDark, setIsDark }: MedicalHeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-medical-primary to-medical-accent rounded-lg">
            <Bone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">KneeAI</h1>
            <p className="text-sm text-muted-foreground">Intelligent Knee MRI Segmentation</p>
          </div>
        </div>

        <Button variant="outline" size="icon" onClick={() => setIsDark(!isDark)} className="rounded-full">
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </div>
    </header>
  )
}
