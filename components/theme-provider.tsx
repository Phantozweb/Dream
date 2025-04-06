"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Force client-side rendering for theme provider
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add("dark")
    localStorage.setItem("dark_mode", "true")
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

