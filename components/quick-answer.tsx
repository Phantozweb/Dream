"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Bot, X, Wand2, ArrowRight, Bookmark, Copy, Check, Download, FileText } from "lucide-react"
import Link from "next/link"
import MarkdownRenderer from "@/components/markdown-renderer"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { useRef } from "react"

// Add authentication check to the QuickAnswer component
import { useAuth } from "@/components/auth-provider"
import { sampleData } from "@/lib/auth"

interface QuickAnswerProps {
  question: string
  onClose: () => void
}

export function QuickAnswer({ question, onClose }: QuickAnswerProps) {
  const { toast } = useToast()
  const [answer, setAnswer] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contentMode, setContentMode] = useState<"normal" | "simplified" | "detailed" | "comprehensive" | "student">(
    "normal",
  )
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // Inside the component, add this near the top:
  const { hasAIFeatures } = useAuth()

  // Then modify the useEffect to check for AI access:
  useEffect(() => {
    const fetchAnswer = async () => {
      try {
        setIsLoading(true)

        // Check if user has AI access
        if (!hasAIFeatures) {
          // Use sample data for non-premium users
          setAnswer(sampleData.chatResponse)
          setIsLoading(false)
          return
        }

        // Get the API key from localStorage
        const apiKey = localStorage.getItem("gemini_api_key") || "AIzaSyB6RHAgIkXqpRaOAjm8i-U4YqLyHT5BmLE"

        // Use the chat API directly
        try {
          console.log("Fetching from chat API...")
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-gemini-api-key": apiKey,
            },
            body: JSON.stringify({
              messages: [{ role: "user", content: question }],
            }),
          })

          // Check if the response is OK
          if (!response.ok) {
            console.log(`API returned status: ${response.status}`)
            throw new Error(`Server returned ${response.status}`)
          }

          // Safely parse the JSON response
          try {
            const data = await response.json()
            if (data.text && data.text.trim() !== "") {
              setAnswer(data.text)
              return
            } else {
              throw new Error("Empty response received")
            }
          } catch (jsonError) {
            console.error("Error parsing JSON from API:", jsonError)
            throw new Error("Failed to parse JSON response")
          }
        } catch (apiError) {
          console.error("Error with API, using fallback:", apiError)
          throw apiError // Re-throw to be caught by the outer catch
        }
      } catch (err) {
        console.error("All API attempts failed, using hardcoded fallback:", err)

        // Client-side fallback as last resort
        let fallbackAnswer = "I'm Focus.AI, your optometry study assistant. "

        if (question.toLowerCase().includes("diabetic retinopathy")) {
          fallbackAnswer +=
            "Diabetic retinopathy is a diabetes complication that affects the eyes. It's caused by damage to the blood vessels in the retina. At first, diabetic retinopathy may cause no symptoms or only mild vision problems. Eventually, it can cause blindness. The condition can develop in anyone who has type 1 or type 2 diabetes. The longer you have diabetes and the less controlled your blood sugar is, the more likely you are to develop this eye complication."
        } else if (question.toLowerCase().includes("glaucoma")) {
          fallbackAnswer +=
            "Glaucoma is a group of eye conditions that damage the optic nerve, which is vital for good vision. This damage is often caused by abnormally high pressure in your eye. Glaucoma is one of the leading causes of blindness for people over the age of 60. It can occur at any age but is more common in older adults. Many forms of glaucoma have no warning signs, and the effect is so gradual that you may not notice a change in vision until the condition is at an advanced stage."
        } else if (question.toLowerCase().includes("contact lens")) {
          fallbackAnswer +=
            "Contact lenses are thin, curved lenses that sit on the tear film that covers the surface of your eye. They're used to correct vision problems such as myopia (nearsightedness), hyperopia (farsightedness), astigmatism, and presbyopia. There are several types of contact lenses, including soft lenses, rigid gas permeable lenses, extended wear lenses, and disposable lenses. Each type has its own benefits and considerations for use."
        } else {
          fallbackAnswer +=
            "I'm currently experiencing technical difficulties connecting to my knowledge base. Please try again later or ask a different question about optometry topics like eye anatomy, vision conditions, or clinical procedures."
        }

        setAnswer(fallbackAnswer)
        setError("Failed to connect to AI service. Using basic response instead.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnswer()
  }, [question, hasAIFeatures])

  // Add wand icon with transformation options to the quick answer component
  const handleContentModeChange = async (mode: "normal" | "simplified" | "detailed" | "comprehensive" | "student") => {
    if (!answer || mode === contentMode) return

    setIsLoading(true)
    setContentMode(mode)

    try {
      // Get the API key from localStorage
      const apiKey = localStorage.getItem("gemini_api_key") || "AIzaSyB6RHAgIkXqpRaOAjm8i-U4YqLyHT5BmLE"

      const action =
        mode === "simplified"
          ? "simplify"
          : mode === "detailed"
            ? "expand"
            : mode === "comprehensive"
              ? "clinical"
              : mode === "student"
                ? "student"
                : "normal"

      if (action === "normal") {
        // Just restore the original content
        setIsLoading(false)
        return
      }

      // Use the transform-content API
      const response = await fetch("/api/transform-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": apiKey,
        },
        body: JSON.stringify({
          content: answer,
          action,
        }),
      })

      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`)
      }

      const data = await response.json()
      setAnswer(data.transformedContent)
    } catch (err) {
      console.error("Error transforming content:", err)
      // Keep the current answer if transformation fails
    } finally {
      setIsLoading(false)
    }
  }

  const toggleBookmark = () => {
    if (!answer) return

    setIsBookmarked(!isBookmarked)

    // Get existing pins
    const PIN_STORAGE_KEY = "optometry_pins"
    const storedPins = localStorage.getItem(PIN_STORAGE_KEY)
    const pins = storedPins ? JSON.parse(storedPins) : []

    if (!isBookmarked) {
      // Add to pins
      pins.push({
        question,
        answer,
        timestamp: new Date().toISOString(),
        truncated: answer.slice(0, 150) + "...",
      })
      localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(pins))

      toast({
        title: "Answer saved",
        description: "This answer has been saved to your bookmarks.",
      })
    } else {
      // Remove from pins
      const updatedPins = pins.filter((pin: any) => pin.question !== question)
      localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(updatedPins))

      toast({
        title: "Answer removed",
        description: "This answer has been removed from your bookmarks.",
      })
    }
  }

  const copyToClipboard = () => {
    if (!answer) return

    navigator.clipboard.writeText(answer)
    setIsCopied(true)

    toast({
      title: "Copied to clipboard",
      description: "The answer has been copied to your clipboard.",
    })

    setTimeout(() => setIsCopied(false), 2000)
  }

  // Add function to save as note
  const saveAsNote = () => {
    if (!answer) return

    // Get existing notes from localStorage
    const existingNotes = localStorage.getItem("optometry_notes")
    const notes = existingNotes ? JSON.parse(existingNotes) : []

    // Add new note
    const newNote = {
      id: `note${Date.now()}`,
      title: question,
      subject: "AI Assistant",
      content: answer,
      date: new Date().toISOString().split("T")[0],
      tags: ["ai-generated"],
    }

    notes.unshift(newNote)
    localStorage.setItem("optometry_notes", JSON.stringify(notes))

    toast({
      title: "Note Saved",
      description: "This answer has been saved as a note.",
    })
  }

  // Add function to download as PDF
  const downloadAsPDF = async () => {
    if (!answer || !contentRef.current) return

    toast({
      title: "Generating PDF",
      description: "Please wait while we prepare your PDF...",
    })

    try {
      // Create a canvas from the content
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      })

      // Create PDF
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Add image to PDF
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)

      // If content is longer than one page, create multiple pages
      if (imgHeight > 297) {
        // A4 height in mm
        let remainingHeight = imgHeight
        let position = 0

        while (remainingHeight > 0) {
          position += 297
          remainingHeight -= 297

          if (remainingHeight > 0) {
            pdf.addPage()
            pdf.addImage(imgData, "PNG", 0, -position, imgWidth, imgHeight)
          }
        }
      }

      // Save PDF
      pdf.save(`${question.substring(0, 30).replace(/[^a-z0-9]/gi, "_")}.pdf`)

      toast({
        title: "PDF Downloaded",
        description: "Your answer has been downloaded as a PDF file.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="fixed inset-4 sm:inset-auto sm:fixed sm:top-20 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:w-[90%] sm:max-w-3xl max-h-[80vh] z-50 bg-background/95 backdrop-blur-md border shadow-lg overflow-hidden flex flex-col">
      <CardHeader className="pb-2 border-b flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <span>Quick Answer</span>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleBookmark}>
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyToClipboard}>
            {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={saveAsNote}>
            <FileText className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={downloadAsPDF}>
            <Download className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Wand2 className="h-4 w-4 text-blue-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleContentModeChange("normal")}
                className={contentMode === "normal" ? "bg-primary/10" : ""}
              >
                Normal
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleContentModeChange("simplified")}
                className={contentMode === "simplified" ? "bg-primary/10" : ""}
              >
                Simplified
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleContentModeChange("detailed")}
                className={contentMode === "detailed" ? "bg-primary/10" : ""}
              >
                Detailed
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleContentModeChange("comprehensive")}
                className={contentMode === "comprehensive" ? "bg-primary/10" : ""}
              >
                Clinical Focus
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleContentModeChange("student")}
                className={contentMode === "student" ? "bg-primary/10" : ""}
              >
                Student-Friendly
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 overflow-y-auto flex-grow">
        <div className="mb-2 text-sm font-medium">
          <span className="text-muted-foreground">Question:</span> {question}
        </div>

        {isLoading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[95%]" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[85%]" />
            <div className="pt-2">
              <Skeleton className="h-4 w-[80%]" />
              <Skeleton className="h-4 w-[75%] mt-1" />
            </div>
            <div className="pt-2">
              <Skeleton className="h-4 w-[70%]" />
              <Skeleton className="h-4 w-[65%] mt-1" />
              <Skeleton className="h-4 w-[60%] mt-1" />
            </div>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : (
          <div className="relative" ref={contentRef}>
            <MarkdownRenderer content={answer || ""} />
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t p-4 flex justify-between">
        <div className="text-xs text-muted-foreground">
          {contentMode !== "normal" && (
            <span className="italic">
              {contentMode === "simplified"
                ? "Simplified view"
                : contentMode === "detailed"
                  ? "Detailed view"
                  : contentMode === "comprehensive"
                    ? "Clinical Focus view"
                    : "Student-friendly view"}
            </span>
          )}
        </div>
        <Button asChild variant="outline" className="border-primary/20 hover:bg-primary/10">
          <Link href="/assistant">
            Continue in Assistant
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

