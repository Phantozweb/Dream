"use client"

import { useState, useEffect } from "react"

export function useAIModel() {
  // Use a default API key that will be overridden if available
  const [model, setModel] = useState("gemini-1.5-pro")
  const [geminiApiKey, setGeminiApiKey] = useState("")
  const [isGeminiAvailable, setIsGeminiAvailable] = useState(false)

  useEffect(() => {
    // Set default model
    const storedModel = localStorage.getItem("default_model") || "gemini-1.5-pro"
    setModel(storedModel)

    // Try to get API key from localStorage
    const storedApiKey = localStorage.getItem("gemini_api_key")
    if (storedApiKey) {
      setGeminiApiKey(storedApiKey)
      setIsGeminiAvailable(true)
    } else {
      // If no key in localStorage, use a fallback approach
      setGeminiApiKey("")
      setIsGeminiAvailable(false)
    }
  }, [])

  const updateModel = (newModel: string) => {
    if (!newModel.startsWith("gemini")) {
      console.warn("Only Gemini models are supported")
      return
    }

    setModel(newModel)
    localStorage.setItem("default_model", newModel)
  }

  const getHeaders = () => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (geminiApiKey) {
      headers["x-gemini-api-key"] = geminiApiKey
    }

    return headers
  }

  return {
    model,
    setModel: updateModel,
    geminiApiKey,
    isGeminiAvailable,
    getHeaders,
  }
}

