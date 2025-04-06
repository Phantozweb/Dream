"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bot, Loader2, ArrowLeft, ArrowUpCircle, Bookmark, Copy, Check, X, FileText, Wand2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import MarkdownRenderer from "@/components/markdown-renderer"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Add AuthRequired wrapper around the assistant page
import { AuthRequired } from "@/components/auth-required"
import { sampleData } from "@/lib/auth"

// Pin storage key
const PIN_STORAGE_KEY = "optometry_pins"

// Pin interface
interface Pin {
  question: string
  answer: string
  timestamp: string
  truncated: string
}

export default function AssistantPage() {
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<
    {
      role: string
      content: string
      isTransforming?: boolean
      transformMode?: "normal" | "simplified" | "detailed" | "comprehensive" | "student"
    }[]
  >([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([])
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null)
  const [bookmarkedMessages, setBookmarkedMessages] = useState<Set<number>>(new Set())
  const [pins, setPins] = useState<Pin[]>([])
  const [showPinsDialog, setShowPinsDialog] = useState(false)
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null)

  // Add to state variables
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [noteTitle, setNoteTitle] = useState("")
  const [noteContent, setNoteContent] = useState("")
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number | null>(null)

  // Add wand icon for content transformation in the assistant
  const [contentMode, setContentMode] = useState<"normal" | "simplified" | "detailed" | "comprehensive" | "student">(
    "normal",
  )

  // Initialize pins from localStorage
  useEffect(() => {
    const storedPins = localStorage.getItem(PIN_STORAGE_KEY)
    if (storedPins) {
      setPins(JSON.parse(storedPins))
    } else {
      localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify([]))
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    // Add user message immediately
    const userMessage = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Scroll to bottom
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      }

      // Get the API key from localStorage
      const apiKey = localStorage.getItem("gemini_api_key") || "AIzaSyB6RHAgIkXqpRaOAjm8i-U4YqLyHT5BmLE"

      // Use the chat API route
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-gemini-api-key": apiKey,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
          }),
        })

        // Check if response is OK before trying to parse JSON
        if (!response.ok) {
          throw new Error(`API returned status: ${response.status}`)
        }

        const data = await response.json()

        // Add AI response
        const aiMessage = {
          role: "assistant",
          content: data.text || "I'm sorry, I couldn't generate a response. Please try again.",
        }
        setMessages((prev) => [...prev, aiMessage])

        // Generate related questions
        fetchRelatedQuestions(data.text)
      } catch (apiError) {
        console.error("Error with API:", apiError)
        throw apiError // Re-throw to be caught by the outer catch
      }
    } catch (error) {
      console.error("Error sending message:", error)

      // Add fallback response if API fails
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I encountered an error while processing your request. Please try again or ask a different question.",
        },
      ])

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get a response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)

      // Scroll to bottom again after response
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
      }, 100)
    }
  }

  // Also update the fetchRelatedQuestions function to be more resilient
  const fetchRelatedQuestions = async (content: string) => {
    try {
      // Get the API key from localStorage
      const apiKey = localStorage.getItem("gemini_api_key") || "AIzaSyB6RHAgIkXqpRaOAjm8i-U4YqLyHT5BmLE"

      const response = await fetch("/api/related-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": apiKey,
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`)
      }

      const data = await response.json()
      if (data.questions && data.questions.length > 0) {
        setRelatedQuestions(data.questions)
      } else {
        throw new Error("No questions returned")
      }
    } catch (error) {
      console.error("Error generating related questions:", error)

      // Generate questions client-side as fallback
      const contentLower = content.toLowerCase()
      let questions = []

      if (contentLower.includes("diabetic retinopathy")) {
        questions = [
          "What are the stages of diabetic retinopathy?",
          "How is diabetic retinopathy diagnosed?",
          "What treatments are available for diabetic retinopathy?",
          "Can diabetic retinopathy be prevented?",
          "How often should diabetic patients have eye exams?",
        ]
      } else if (contentLower.includes("glaucoma")) {
        questions = [
          "What are the different types of glaucoma?",
          "How is intraocular pressure measured?",
          "What medications are used to treat glaucoma?",
          "Is glaucoma hereditary?",
          "What visual field tests are used for glaucoma?",
        ]
      } else if (contentLower.includes("contact lens")) {
        questions = [
          "What are the differences between soft and RGP lenses?",
          "How do you fit toric contact lenses?",
          "What are multifocal contact lenses?",
          "How do you manage contact lens-related dry eye?",
          "What are scleral contact lenses used for?",
        ]
      } else if (contentLower.includes("myopia")) {
        questions = [
          "What causes myopia progression in children?",
          "How effective is orthokeratology for myopia control?",
          "What are low-dose atropine treatments for myopia?",
          "How do multifocal lenses help with myopia control?",
          "What is the relationship between screen time and myopia?",
        ]
      } else if (contentLower.includes("dry eye")) {
        questions = [
          "What are the main causes of dry eye syndrome?",
          "How do you diagnose meibomian gland dysfunction?",
          "What treatments are available for severe dry eye?",
          "How do punctal plugs work for dry eye?",
          "What lifestyle changes can help with dry eye symptoms?",
        ]
      } else {
        // Default questions
        questions = [
          "What are the symptoms of diabetic retinopathy?",
          "How is glaucoma diagnosed?",
          "What are the different types of contact lenses?",
          "How does myopia develop?",
          "What treatments are available for dry eye?",
        ]
      }

      setRelatedQuestions(questions)
    }
  }

  const handleRelatedQuestionClick = (question: string) => {
    setInput(question)
    // Auto-submit after a short delay
    setTimeout(() => {
      const fakeEvent = new Event("submit") as any
      handleSubmit(fakeEvent)
    }, 100)
  }

  const copyMessageToClipboard = (index: number) => {
    const message = messages[index]
    navigator.clipboard.writeText(message.content)
    setCopiedMessage(message.content)

    toast({
      title: "Copied to clipboard",
      description: "The message has been copied to your clipboard.",
    })

    setTimeout(() => setCopiedMessage(null), 2000)
  }

  const toggleBookmark = (index: number) => {
    const newBookmarks = new Set(bookmarkedMessages)
    const message = messages[index]

    if (newBookmarks.has(index)) {
      newBookmarks.delete(index)
      // Remove from pins if exists
      const updatedPins = pins.filter((pin) => pin.question !== getQuestionForMessage(index))
      setPins(updatedPins)
      localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(updatedPins))

      toast({
        title: "Bookmark removed",
        description: "The message has been removed from your bookmarks.",
      })
    } else {
      newBookmarks.add(index)
      // Add to pins
      const newPin = {
        question: getQuestionForMessage(index),
        answer: message.content,
        timestamp: new Date().toISOString(),
        truncated: message.content.slice(0, 150) + "...",
      }

      const updatedPins = [...pins, newPin]
      setPins(updatedPins)
      localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(updatedPins))

      toast({
        title: "Bookmark added",
        description: "The message has been added to your bookmarks.",
      })
    }

    setBookmarkedMessages(newBookmarks)
  }

  const getQuestionForMessage = (index: number): string => {
    // Find the user message that preceded this assistant message
    if (index > 0 && messages[index].role === "assistant") {
      for (let i = index - 1; i >= 0; i--) {
        if (messages[i].role === "user") {
          return messages[i].content
        }
      }
    }
    return "Untitled bookmark"
  }

  const deletePin = (question: string) => {
    const updatedPins = pins.filter((pin) => pin.question !== question)
    setPins(updatedPins)
    localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(updatedPins))

    // Also update bookmarked messages
    const newBookmarks = new Set(bookmarkedMessages)
    messages.forEach((message, index) => {
      if (message.role === "assistant" && getQuestionForMessage(index) === question) {
        newBookmarks.delete(index)
      }
    })
    setBookmarkedMessages(newBookmarks)

    toast({
      title: "Bookmark deleted",
      description: "The bookmark has been removed.",
    })
  }

  const viewPin = (pin: Pin) => {
    setSelectedPin(pin)
  }

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Add code to check for pending questions from the home page
  useEffect(() => {
    // Check if there's a pending question from the home page
    const pendingQuestion = localStorage.getItem("pendingQuestion")
    if (pendingQuestion) {
      // Clear it from localStorage
      localStorage.removeItem("pendingQuestion")
      // Set it as input and submit
      setInput(pendingQuestion)
      setTimeout(() => {
        const fakeEvent = new Event("submit") as any
        handleSubmit(fakeEvent)
      }, 500)
    }
  }, [])

  // Add function to save chat as note
  const saveAsNote = (index: number) => {
    const message = messages[index]
    if (message.role === "assistant") {
      setSelectedMessageIndex(index)

      // Generate a title based on the question
      const questionForMessage = getQuestionForMessage(index)
      const generatedTitle =
        questionForMessage.length > 50 ? questionForMessage.substring(0, 50) + "..." : questionForMessage

      setNoteTitle(generatedTitle)
      setNoteContent(message.content)
      setShowSaveDialog(true)
    }
  }

  // Add function to handle saving note
  const handleSaveNote = () => {
    if (!noteTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a note title",
        variant: "destructive",
      })
      return
    }

    // Get existing notes from localStorage
    const existingNotes = localStorage.getItem("optometry_notes")
    const notes = existingNotes ? JSON.parse(existingNotes) : []

    // Add new note
    const newNote = {
      id: `note${Date.now()}`,
      title: noteTitle,
      subject: "AI Assistant",
      content: noteContent,
      date: new Date().toISOString().split("T")[0],
      tags: ["ai-generated"],
    }

    notes.unshift(newNote)
    localStorage.setItem("optometry_notes", JSON.stringify(notes))

    setShowSaveDialog(false)
    setNoteTitle("")
    setNoteContent("")
    setSelectedMessageIndex(null)

    toast({
      title: "Note Saved",
      description: "Your note has been saved successfully.",
      variant: "success",
    })
  }

  // Add this function to handle content transformation
  const handleContentTransform = async (
    messageIndex: number,
    mode: "normal" | "simplified" | "detailed" | "comprehensive" | "student",
  ) => {
    if (messageIndex < 0 || messageIndex >= messages.length || messages[messageIndex].role !== "assistant") {
      return
    }

    const originalContent = messages[messageIndex].content

    // Set loading state for this message
    const updatedMessages = [...messages]
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      isTransforming: true,
    }
    setMessages(updatedMessages)

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
        const newMessages = [...messages]
        newMessages[messageIndex] = {
          ...newMessages[messageIndex],
          content: originalContent,
          isTransforming: false,
          transformMode: mode,
        }
        setMessages(newMessages)

        toast({
          title: "Content Restored",
          description: "Message has been restored to its original form.",
        })
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
          content: originalContent,
          action,
        }),
      })

      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`)
      }

      const data = await response.json()

      // Update the message with transformed content
      const newMessages = [...messages]
      newMessages[messageIndex] = {
        ...newMessages[messageIndex],
        content: data.transformedContent || originalContent,
        isTransforming: false,
        transformMode: mode,
      }
      setMessages(newMessages)

      toast({
        title: "Content Transformed",
        description: `Message has been ${
          mode === "simplified"
            ? "simplified"
            : mode === "detailed"
              ? "expanded with more details"
              : mode === "comprehensive"
                ? "formatted for clinical focus"
                : mode === "student"
                  ? "made more student-friendly"
                  : "restored to original"
        }.`,
      })
    } catch (error) {
      console.error("Error transforming content:", error)

      // Reset the message to original state
      const newMessages = [...messages]
      newMessages[messageIndex] = {
        ...newMessages[messageIndex],
        isTransforming: false,
      }
      setMessages(newMessages)

      toast({
        title: "Error",
        description: "Failed to transform content. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Wrap the entire component return with AuthRequired
  return (
    <AuthRequired
      requireAuth={true}
      requireAIAccess={true}
      fallback={
        <div className="container mx-auto p-2 sm:p-4 md:p-6 page-transition-enter page-transition-enter-active">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" asChild className="h-8 w-8 animate-float">
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back to Dashboard</span>
                  </Link>
                </Button>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">AI Study Assistant</h1>
              </div>
              <Badge
                variant="outline"
                className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/50"
              >
                Premium Feature
              </Badge>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Get answers to your optometry questions and enhance your understanding
            </p>

            <Card className="h-[calc(100vh-220px)] flex flex-col bg-gradient-to-br from-background to-muted/30 border shadow-md">
              <div className="p-2 border-b flex items-center justify-between bg-muted/10 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <span className="font-medium">Focus.AI Assistant (Preview)</span>
                </div>
              </div>
              <CardContent className="flex-1 p-2 sm:p-4 overflow-auto">
                <div className="space-y-4 pt-2 sm:pt-4">
                  <div className="flex items-start gap-3 justify-start">
                    <div className="rounded-lg px-3 py-2 max-w-[85%] sm:max-w-[80%] shadow-sm bg-muted/50 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="h-4 w-4" />
                        <span className="text-xs font-medium">Focus.AI</span>
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <MarkdownRenderer content={sampleData.chatResponse} onQuestionClick={() => {}} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <div className="p-3 border-t bg-muted/10 backdrop-blur-sm">
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Upgrade to premium to ask your own questions..."
                    disabled={true}
                    className="flex-1 bg-background/80 backdrop-blur-sm border-primary/20 focus-visible:ring-primary/50"
                  />
                  <Button
                    disabled={true}
                    variant="shimmer"
                    size="icon"
                    className="animate-pulse-border h-10 w-10 rounded-full flex-shrink-0"
                  >
                    <ArrowUpCircle className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      }
    >
      {/* Original component content */}
      <div className="container mx-auto p-2 sm:p-4 md:p-6 page-transition-enter page-transition-enter-active">
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" asChild className="h-8 w-8 animate-float">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back to Dashboard</span>
                </Link>
              </Button>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">AI Study Assistant</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPinsDialog(true)}
              className="flex items-center gap-1"
            >
              <Bookmark className="h-4 w-4 mr-1" />
              Saved Answers
              {pins.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pins.length}
                </Badge>
              )}
            </Button>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Get answers to your optometry questions and enhance your understanding
          </p>

          <Card className="h-[calc(100vh-220px)] flex flex-col bg-gradient-to-br from-background to-muted/30 border shadow-md">
            <div className="p-2 border-b flex items-center justify-between bg-muted/10 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <span className="font-medium">Focus.AI Assistant</span>
              </div>
            </div>
            <CardContent className="flex-1 p-2 sm:p-4 overflow-auto">
              <div className="space-y-4 pt-2 sm:pt-4">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center space-y-2 animate-float p-4">
                      <Bot className="mx-auto h-12 w-12 text-primary/70" />
                      <p className="text-lg font-medium">How can I help with your optometry studies today?</p>
                      <p className="text-sm text-muted-foreground">
                        Ask questions about any optometry topic to enhance your learning.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`rounded-lg px-3 py-2 max-w-[85%] sm:max-w-[80%] shadow-sm ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/50 backdrop-blur-sm"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            {message.role === "assistant" && <Bot className="h-4 w-4" />}
                            <span className="text-xs font-medium">{message.role === "user" ? "You" : "Focus.AI"}</span>
                          </div>
                          {message.role === "assistant" && (
                            <div className="flex items-center gap-1">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 rounded-full hover:bg-background/20"
                                  >
                                    <Wand2 className="h-3 w-3 text-blue-500" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleContentTransform(index, "normal")}
                                    className={message.transformMode === "normal" ? "bg-primary/10" : ""}
                                  >
                                    Original
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleContentTransform(index, "simplified")}
                                    className={message.transformMode === "simplified" ? "bg-primary/10" : ""}
                                  >
                                    Simplify
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleContentTransform(index, "detailed")}
                                    className={message.transformMode === "detailed" ? "bg-primary/10" : ""}
                                  >
                                    Add Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleContentTransform(index, "comprehensive")}
                                    className={message.transformMode === "comprehensive" ? "bg-primary/10" : ""}
                                  >
                                    Clinical Focus
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleContentTransform(index, "student")}
                                    className={message.transformMode === "student" ? "bg-primary/10" : ""}
                                  >
                                    Student-Friendly
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full hover:bg-background/20"
                                onClick={() => copyMessageToClipboard(index)}
                              >
                                {copiedMessage === message.content ? (
                                  <Check className="h-3 w-3 text-blue-500" />
                                ) : (
                                  <Copy className="h-3 w-3 text-blue-500" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full hover:bg-background/20"
                                onClick={() => toggleBookmark(index)}
                              >
                                <Bookmark
                                  className={`h-3 w-3 text-blue-500 ${bookmarkedMessages.has(index) ? "fill-current" : ""}`}
                                />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full hover:bg-background/20"
                                onClick={() => saveAsNote(index)}
                              >
                                <FileText className="h-3 w-3 text-blue-500" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <MarkdownRenderer content={message.content} onQuestionClick={handleRelatedQuestionClick} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex items-start gap-3 justify-start">
                    <div className="rounded-lg px-3 py-2 max-w-[85%] sm:max-w-[80%] shadow-sm bg-muted/50 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="h-4 w-4" />
                        <span className="text-xs font-medium">Focus.AI</span>
                      </div>
                      <div className="space-y-2 py-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-[90%]" />
                        <Skeleton className="h-4 w-[80%]" />
                        <div className="flex space-x-1 pt-1">
                          <div
                            className="h-2 w-2 rounded-full bg-primary animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="h-2 w-2 rounded-full bg-primary animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="h-2 w-2 rounded-full bg-primary animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            <div className="p-3 border-t bg-muted/10 backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                <Input
                  placeholder="Ask about any optometry topic..."
                  value={input}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="flex-1 bg-background/80 backdrop-blur-sm border-primary/20 focus-visible:ring-primary/50"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  variant="shimmer"
                  size="icon"
                  className="animate-pulse-border h-10 w-10 rounded-full flex-shrink-0"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUpCircle className="h-5 w-5" />}
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Pins Dialog */}
        <Dialog open={showPinsDialog} onOpenChange={setShowPinsDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Saved Answers</DialogTitle>
              <DialogDescription>Your bookmarked answers for quick reference</DialogDescription>
            </DialogHeader>

            {pins.length === 0 ? (
              <div className="text-center py-8">
                <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No saved answers yet</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Use the bookmark icon in responses to save them here
                </p>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                {pins.map((pin, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-sm">{pin.question}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full hover:bg-muted"
                          onClick={() => deletePin(pin.question)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(pin.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-sm mt-2 line-clamp-2">{pin.truncated}</p>
                      <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => viewPin(pin)}>
                        View Full Answer
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Selected Pin Dialog */}
        <Dialog open={!!selectedPin} onOpenChange={(open) => !open && setSelectedPin(null)}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPin?.question}</DialogTitle>
              <DialogDescription>
                Saved on {selectedPin && new Date(selectedPin.timestamp).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">{selectedPin && <MarkdownRenderer content={selectedPin.answer} />}</div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedPin) {
                    navigator.clipboard.writeText(selectedPin.answer)
                    toast({
                      title: "Copied to clipboard",
                      description: "The answer has been copied to your clipboard.",
                    })
                  }
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <DialogClose asChild>
                <Button>Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Save Note Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Save as Note</DialogTitle>
              <DialogDescription>Save this conversation as a study note</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="note-title">Title</Label>
                <Input
                  id="note-title"
                  placeholder="Note title"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note-content">Content</Label>
                <Textarea
                  id="note-content"
                  placeholder="Note content"
                  className="min-h-[200px]"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveNote}>Save Note</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AuthRequired>
  )
}

