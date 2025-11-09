"use client"

import type { ReactNode } from "react"

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: "light" | "dark"
}

export function ThemeProvider({ children, defaultTheme = "light" }: ThemeProviderProps) {
  return <>{children}</>
}
