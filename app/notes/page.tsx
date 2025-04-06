"use client"

import { DropdownMenuLabel } from "@/components/ui/dropdown-menu"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  CheckSquare,
  Download,
  Filter,
  Folder,
  Loader2,
  Plus,
  Save,
  Search,
  SortDesc,
  Tag,
  Trash,
  Wand2,
  X,
  FileText,
  Edit,
  Layers,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { MarkdownViewer } from "@/components/markdown-viewer"
import { NoteCard } from "@/components/note-card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Add AuthRequired wrapper around the notes page
import { AuthRequired } from "@/components/auth-required"

// Define Note type for better type safety
interface Note {
  id: string
  title: string
  subject: string
  content: string
  date: string
  tags: string[]
  isPreview?: boolean
  isSavedAnswer?: boolean
}

// Define Flashcard type
interface Flashcard {
  id: string
  question: string
  answer: string
  category: string
  difficulty: string
  lastReviewed: string | null
  nextReview: string | null
  repetitions: number
  easeFactor: number
  interval: number
  rating: number | null
  source: string
  tags: string[]
  createdAt: string
}

export default function NotesPage() {
  const { toast } = useToast()
  // State variables
  const [notes, setNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedGroup, setSelectedGroup] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [noteTitle, setNoteTitle] = useState("")
  const [noteContent, setNoteContent] = useState("")
  const [aiTopic, setAiTopic] = useState("")
  const [aiDetail, setAiDetail] = useState("medium")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  // Note groups section
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [newGroupName, setNewGroupName] = useState("")

  // Note preview dialog
  const [previewNote, setPreviewNote] = useState<Note | null>(null)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)

  // Bulk selection functionality
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set())
  const [bulkSelectMode, setBulkSelectMode] = useState(false)

  // AI edit functionality
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [isAiEditing, setIsAiEditing] = useState(false)
  const [aiEditInstruction, setAiEditInstruction] = useState("")

  // Sorting and filtering
  const [sortBy, setSortBy] = useState<"date" | "title" | "subject">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  // Saved answers section
  const [savedAnswers, setSavedAnswers] = useState<Note[]>([])

  // Flashcard creation dialog
  const [showFlashcardDialog, setShowFlashcardDialog] = useState(false)
  const [selectedNoteForFlashcards, setSelectedNoteForFlashcards] = useState<Note | null>(null)
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false)
  const [flashcardCount, setFlashcardCount] = useState("10")

  // Load notes from localStorage
  useEffect(() => {
    const storedNotes = localStorage.getItem("optometry_notes")
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes))
    } else {
      // Create sample notes if none exist
      const sampleNotes = [
        {
          id: "note1",
          title: "Corneal Anatomy",
          subject: "Ocular Anatomy",
          content:
            "# Corneal Anatomy\n\nThe cornea is the transparent front part of the eye that covers the iris, pupil, and anterior chamber. It is a key refractive element of the eye.\n\n## Layers of the Cornea\n\n1. **Epithelium**: The outermost layer that protects the cornea\n2. **Bowman's Layer**: A tough layer that protects the corneal stroma\n3. **Stroma**: Makes up 90% of the corneal thickness\n4. **Descemet's Membrane**: A thin but strong membrane\n5. **Endothelium**: The innermost layer responsible for keeping the cornea clear",
          date: "2023-05-15",
          tags: ["anatomy", "cornea", "important"],
        },
        {
          id: "note2",
          title: "Glaucoma Classification",
          subject: "Ocular Disease",
          content:
            "# Glaucoma Classification\n\nGlaucoma is a group of eye conditions that damage the optic nerve, often caused by abnormally high pressure in the eye.\n\n## Primary Open-Angle Glaucoma\n- Most common form\n- Gradual loss of peripheral vision\n- Elevated intraocular pressure\n\n## Angle-Closure Glaucoma\n- Sudden onset\n- Painful\n- Requires immediate treatment\n\n## Normal-Tension Glaucoma\n- Optic nerve damage despite normal pressure\n\n## Secondary Glaucoma\n- Results from other eye conditions",
          date: "2023-06-22",
          tags: ["disease", "glaucoma", "clinical"],
        },
      ]
      setNotes(sampleNotes)
      localStorage.setItem("optometry_notes", JSON.stringify(sampleNotes))
    }

    // Load saved answers from localStorage
    const storedAnswers = localStorage.getItem("optometry_pins")
    if (storedAnswers) {
      const pins = JSON.parse(storedAnswers)
      // Convert pins to notes format
      const answerNotes = pins.map((pin: any, index: number) => ({
        id: `answer_${index}`,
        title: pin.question,
        subject: "Saved Answers",
        content: pin.answer,
        date: pin.timestamp.split("T")[0],
        tags: ["ai-answer"],
        isSavedAnswer: true,
      }))
      setSavedAnswers(answerNotes)
    }
  }, [])

  const subjects = [
    "Clinical Procedures",
    "Ocular Disease",
    "Contact Lenses",
    "Optics",
    "Pharmacology",
    "Ocular Anatomy",
    "Saved Answers",
    "Other",
  ]

  // Get all unique tags from notes
  const getAllTags = () => {
    const tagsSet = new Set<string>()
    notes.forEach((note) => {
      if (note.tags && note.tags.length > 0) {
        note.tags.forEach((tag) => tagsSet.add(tag))
      }
    })
    return Array.from(tagsSet)
  }

  const handleCreateNote = () => {
    if (!noteTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a note title",
        variant: "destructive",
      })
      return
    }

    const newNote: Note = {
      id: `note${Date.now()}`,
      title: noteTitle,
      subject: selectedSubject || "Other",
      content: noteContent,
      date: new Date().toISOString().split("T")[0],
      tags: [],
    }

    const updatedNotes = [newNote, ...notes]
    setNotes(updatedNotes)
    localStorage.setItem("optometry_notes", JSON.stringify(updatedNotes))
    setNoteTitle("")
    setNoteContent("")
    setSelectedSubject("")

    toast({
      title: "Note Created",
      description: "Your note has been saved successfully.",
    })
  }

  // Handle note preview
  const handlePreviewNote = (note: Note) => {
    setPreviewNote(note)
    setShowPreviewDialog(true)
  }

  // AI note generation function
  const handleGenerateAINotes = async () => {
    if (!aiTopic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic for AI to generate notes on",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Create fallback content immediately so we have it ready if needed
      const fallbackContent = `# ${aiTopic}

## Overview
${aiTopic} is an important topic in optometry that involves specific diagnostic and management approaches.

## Key Concepts
- Basic principles of ${aiTopic}
- Clinical significance in optometry practice
- Diagnostic considerations

## Clinical Applications
- How ${aiTopic} is applied in clinical settings
- Patient management considerations
- Best practices for assessment

## Summary
Understanding ${aiTopic} is essential for comprehensive optometric care and patient management.
`

      let content = ""
      let success = false

      // Skip the Netlify function and go directly to the Next.js API
      try {
        console.log("Attempting to use Next.js API route for note generation...")
        const response = await fetch("/api/generate-notes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-gemini-api-key": "AIzaSyB6RHAgIkXqpRaOAjm8i-U4YqLyHT5BmLE",
          },
          body: JSON.stringify({
            topic: aiTopic,
            subject: selectedSubject || "General Optometry",
            detail: aiDetail,
          }),
        })

        if (response.ok) {
          // Get the response text first to check if it's valid JSON
          const responseText = await response.text()

          try {
            // Try to parse as JSON
            const data = JSON.parse(responseText)
            if (data.content) {
              content = data.content
              success = true
              console.log("Successfully generated notes using Next.js API route")
            } else {
              throw new Error("API response missing content field")
            }
          } catch (jsonError) {
            console.error("Failed to parse response as JSON:", responseText.substring(0, 100) + "...")
            throw new Error("Response is not valid JSON")
          }
        } else {
          console.warn("Next.js API route returned error status:", response.status)
          throw new Error(`Next.js API route error: ${response.status}`)
        }
      } catch (apiError) {
        console.error("Error with Next.js API route:", apiError)
        // API call failed, use fallback content
        content = fallbackContent
        console.log("Using fallback content for notes")
      }

      // If we didn't get any content from the API, use the fallback
      if (!content) {
        content = fallbackContent
        console.log("No content received from API, using fallback content")
      }

      // Create a preview note
      const previewNote: Note = {
        id: `preview_${Date.now()}`,
        title: aiTopic,
        subject: selectedSubject || "General Optometry",
        content: content,
        date: new Date().toISOString().split("T")[0],
        tags: ["ai-generated", aiDetail, ...(success ? [] : ["fallback"])],
        isPreview: true,
      }

      // Show the preview
      handlePreviewNote(previewNote)

      if (!success) {
        toast({
          title: "Using Simplified Notes",
          description: "Could not connect to AI service. Generated simplified notes instead.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Unhandled error in note generation:", error)

      // Final fallback if everything else fails
      const fallbackNote: Note = {
        id: `preview_${Date.now()}`,
        title: aiTopic,
        subject: selectedSubject || "General Optometry",
        content: `# ${aiTopic}

Unable to generate detailed notes at this time. Please try again later.`,
        date: new Date().toISOString().split("T")[0],
        tags: ["ai-generated", "error"],
        isPreview: true,
      }

      handlePreviewNote(fallbackNote)

      toast({
        title: "Error",
        description: "Failed to generate notes. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Save the previewed note
  const savePreviewedNote = () => {
    if (!previewNote) return

    // Remove the isPreview flag
    const { isPreview, ...noteToSave } = previewNote

    const updatedNotes = [noteToSave, ...notes]
    setNotes(updatedNotes)
    localStorage.setItem("optometry_notes", JSON.stringify(updatedNotes))

    setShowPreviewDialog(false)
    setPreviewNote(null)

    toast({
      title: "Note Saved",
      description: "AI-generated note has been saved to your collection.",
    })
  }

  // Handle note deletion
  const handleDeleteNote = (noteId: string) => {
    setNoteToDelete(noteId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteNote = () => {
    if (noteToDelete) {
      const updatedNotes = notes.filter((note) => note.id !== noteToDelete)
      setNotes(updatedNotes)
      localStorage.setItem("optometry_notes", JSON.stringify(updatedNotes))

      toast({
        title: "Note Deleted",
        description: "Your note has been deleted successfully.",
      })

      setShowDeleteConfirm(false)
      setNoteToDelete(null)
    }
  }

  // Get note groups
  const getNoteGroups = () => {
    const groups = new Set<string>()
    notes.forEach((note) => {
      if (note.subject) {
        groups.add(note.subject)
      }
    })
    // Add "Saved Answers" group if there are saved answers
    if (savedAnswers.length > 0) {
      groups.add("Saved Answers")
    }
    return Array.from(groups)
  }

  // Handle group renaming
  const handleRenameGroup = (group: string) => {
    setEditingGroup(group)
    setNewGroupName(group)
  }

  const saveGroupRename = () => {
    if (!newGroupName.trim() || !editingGroup) return

    // Update all notes with the old group name to the new group name
    const updatedNotes = notes.map((note) => {
      if (note.subject === editingGroup) {
        return { ...note, subject: newGroupName }
      }
      return note
    })

    setNotes(updatedNotes)
    localStorage.setItem("optometry_notes", JSON.stringify(updatedNotes))
    setEditingGroup(null)

    toast({
      title: "Group Renamed",
      description: `Group "${editingGroup}" has been renamed to "${newGroupName}".`,
    })
  }

  // Handle bulk selection
  const toggleNoteSelection = (noteId: string) => {
    const newSelection = new Set(selectedNotes)
    if (newSelection.has(noteId)) {
      newSelection.delete(noteId)
    } else {
      newSelection.add(noteId)
    }
    setSelectedNotes(newSelection)
  }

  const toggleBulkSelectMode = () => {
    setBulkSelectMode(!bulkSelectMode)
    if (bulkSelectMode) {
      // Clear selections when exiting bulk select mode
      setSelectedNotes(new Set())
    }
  }

  // Handle bulk download
  const downloadSelectedNotes = () => {
    if (selectedNotes.size === 0) return

    // Create a zip file with JSZip
    import("jszip").then(({ default: JSZip }) => {
      const zip = new JSZip()

      // Add each selected note to the zip
      notes.forEach((note) => {
        if (selectedNotes.has(note.id)) {
          zip.file(`${note.title.replace(/[^a-z0-9]/gi, "_")}.md`, note.content)
        }
      })

      // Generate the zip file
      zip.generateAsync({ type: "blob" }).then((content) => {
        // Create a download link
        const url = URL.createObjectURL(content)
        const a = document.createElement("a")
        a.href = url
        a.download = "selected_notes.zip"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({
          title: "Notes Downloaded",
          description: `${selectedNotes.size} notes have been downloaded as a zip file.`,
        })
      })
    })
  }

  // Handle bulk delete
  const deleteSelectedNotes = () => {
    if (selectedNotes.size === 0) return

    const updatedNotes = notes.filter((note) => !selectedNotes.has(note.id))
    setNotes(updatedNotes)
    localStorage.setItem("optometry_notes", JSON.stringify(updatedNotes))

    toast({
      title: "Notes Deleted",
      description: `${selectedNotes.size} notes have been deleted.`,
    })

    setSelectedNotes(new Set())
    setBulkSelectMode(false)
  }

  // Handle AI editing
  const handleAiEdit = async () => {
    if (!editingNote || !aiEditInstruction.trim()) {
      toast({
        title: "Error",
        description: "Please provide instructions for AI editing",
        variant: "destructive",
      })
      return
    }

    setIsAiEditing(true)

    try {
      const response = await fetch("/api/transform-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": "AIzaSyB6RHAgIkXqpRaOAjm8i-U4YqLyHT5BmLE",
        },
        body: JSON.stringify({
          content: editingNote.content,
          action: "custom",
          instruction: aiEditInstruction,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to edit note with AI")
      }

      const data = await response.json()

      // Update the note with the edited content
      const updatedNote = {
        ...editingNote,
        content: data.transformedContent,
        tags: [...(editingNote.tags || []), "ai-edited"],
      }

      // Update the notes array
      const updatedNotes = notes.map((note) => (note.id === editingNote.id ? updatedNote : note))

      setNotes(updatedNotes)
      localStorage.setItem("optometry_notes", JSON.stringify(updatedNotes))

      // Show the updated note
      setPreviewNote(updatedNote)
      setShowPreviewDialog(true)
      setShowEditDialog(false)

      toast({
        title: "Note Edited",
        description: "Your note has been edited with AI assistance.",
      })
    } catch (error) {
      console.error("Error editing note with AI:", error)
      toast({
        title: "Error",
        description: "Failed to edit note with AI. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAiEditing(false)
    }
  }

  // Download a single note
  const downloadNote = (note: Note) => {
    const blob = new Blob([note.content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${note.title.replace(/[^a-z0-9]/gi, "_")}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Note Downloaded",
      description: "Your note has been downloaded as a markdown file.",
    })
  }

  // Get all notes including saved answers if needed
  const getAllNotes = () => {
    if (activeTab === "saved-answers") {
      return savedAnswers
    } else if (activeTab === "all") {
      return [...notes, ...savedAnswers]
    } else {
      return notes
    }
  }

  // Update the filtered notes logic with sorting and filtering
  const filteredNotes = getAllNotes()
    .filter((note) => {
      const matchesSearch = searchQuery
        ? note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase())
        : true

      const matchesSubject = selectedSubject ? note.subject === selectedSubject : true

      const matchesGroup = selectedGroup ? note.subject === selectedGroup : true

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "saved-answers" && note.isSavedAnswer) ||
        (activeTab === "notes" && !note.isSavedAnswer)

      const matchesTags = filterTags.length === 0 || (note.tags && filterTags.every((tag) => note.tags.includes(tag)))

      return matchesSearch && (matchesSubject || matchesGroup) && matchesTab && matchesTags
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "asc"
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime()
      } else if (sortBy === "title") {
        return sortOrder === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
      } else if (sortBy === "subject") {
        return sortOrder === "asc" ? a.subject.localeCompare(b.subject) : b.subject.localeCompare(a.subject)
      }
      return 0
    })

  // Create flashcards from a note
  const handleCreateFlashcards = (note: Note) => {
    setSelectedNoteForFlashcards(note)
    setShowFlashcardDialog(true)
  }

  // Helper function to create flashcards from content
  const createFlashcardsFromContent = (
    content: string,
    topic: string,
    count: number,
  ): Array<{ question: string; answer: string }> => {
    const flashcards = []
    const lines = content.split("\n").filter((line) => line.trim().length > 0)

    // Find headings and important sentences
    for (let i = 0; i < lines.length && flashcards.length < count; i++) {
      const line = lines[i].trim()

      // If it's a heading, use it as a question
      if (line.startsWith("#")) {
        const headingText = line.replace(/^#+\s+/, "")
        if (headingText.length > 3 && i + 1 < lines.length) {
          flashcards.push({
            question: `What is ${headingText}?`,
            answer: lines[i + 1].trim(),
          })
        }
      }
      // Look for lines with key terms
      else if (line.includes(":") && !line.startsWith("!") && !line.startsWith("[")) {
        const [term, definition] = line.split(":")
        if (term && definition && term.length < 50) {
          flashcards.push({
            question: `Define ${term.trim()}:`,
            answer: definition.trim(),
          })
        }
      }
      // Look for bullet points
      else if ((line.startsWith("- ") || line.startsWith("* ") || line.match(/^\d+\.\s/)) && line.length > 10) {
        const bulletContent = line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "")
        if (bulletContent.includes(" is ") || bulletContent.includes(" are ")) {
          const question = bulletContent.replace(/^(.*?)\s+(?:is|are)\s+.*$/, "What is $1?")
          flashcards.push({
            question,
            answer: bulletContent,
          })
        }
      }
    }

    // If we couldn't extract enough questions, create some generic ones
    while (flashcards.length < Math.min(5, count)) {
      flashcards.push({
        question: `Explain a key concept from ${topic}:`,
        answer: "This is a placeholder answer. You should edit this flashcard with more specific information.",
      })
    }

    return flashcards.slice(0, count)
  }

  // Generate flashcards from note content
  const generateFlashcards = async () => {
    if (!selectedNoteForFlashcards) return

    setGeneratingFlashcards(true)

    try {
      // Get existing flashcards
      const storedCards = localStorage.getItem("optometry_flashcards")
      const existingCards = storedCards ? JSON.parse(storedCards) : []

      // Create flashcards directly from the note content
      const count = Number.parseInt(flashcardCount, 10) || 10
      const localFlashcards = createFlashcardsFromContent(
        selectedNoteForFlashcards.content,
        selectedNoteForFlashcards.title,
        count,
      )

      // Format the locally generated flashcards
      const newCards: Flashcard[] = localFlashcards.map((card, index) => ({
        id: `card_${Date.now()}_${index}`,
        question: card.question,
        answer: card.answer,
        category: selectedNoteForFlashcards.subject,
        difficulty: "medium",
        lastReviewed: null,
        nextReview: null,
        repetitions: 0,
        easeFactor: 2.5,
        interval: 1,
        rating: null,
        source: `Note: ${selectedNoteForFlashcards.title}`,
        tags: [...(selectedNoteForFlashcards.tags || []), "from-notes", "local-generation"],
        createdAt: new Date().toISOString(),
      }))

      // Add the new cards to the existing ones
      const updatedCards = [...existingCards, ...newCards]
      localStorage.setItem("optometry_flashcards", JSON.stringify(updatedCards))

      setShowFlashcardDialog(false)
      setSelectedNoteForFlashcards(null)

      toast({
        title: "Success",
        description: `Generated ${newCards.length} flashcards from "${selectedNoteForFlashcards.title}"`,
      })
    } catch (error) {
      console.error("Error generating flashcards:", error)
      toast({
        title: "Error",
        description: "Failed to generate flashcards. Please try again.",
        variant: "destructive",
      })
    } finally {
      setGeneratingFlashcards(false)
    }
  }

  // Wrap the entire component return with AuthRequired
  return (
    <AuthRequired requireAuth={true} requireAIAccess={false} fallback={null}>
      {/* Original component content */}
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild className="h-8 w-8">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Dashboard</span>
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          </div>
          <p className="text-muted-foreground">Create, organize, and review your optometry study notes</p>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="saved-answers">Saved Answers</TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleBulkSelectMode}
                  className={bulkSelectMode ? "bg-primary/10" : ""}
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  {bulkSelectMode ? "Cancel Selection" : "Select Notes"}
                </Button>

                {bulkSelectMode && selectedNotes.size > 0 && (
                  <>
                    <Button variant="outline" size="sm" onClick={downloadSelectedNotes}>
                      <Download className="h-4 w-4 mr-2" />
                      Download ({selectedNotes.size})
                    </Button>
                    <Button variant="destructive" size="sm" onClick={deleteSelectedNotes}>
                      <Trash className="h-4 w-4 mr-2" />
                      Delete ({selectedNotes.size})
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Tabs>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-2/3 space-y-6">
              <Card className="bg-gradient-to-br from-background to-muted/30 border shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Your Notes</CardTitle>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-primary/90 hover:bg-primary transition-colors">
                            <Plus className="h-4 w-4 mr-2" />
                            New Note
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Create New Note</DialogTitle>
                            <DialogDescription>Add a new note to your collection</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="title">Title</Label>
                              <Input
                                id="title"
                                placeholder="Note title"
                                value={noteTitle}
                                onChange={(e) => setNoteTitle(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="subject">Subject</Label>
                              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                <SelectTrigger id="subject">
                                  <SelectValue placeholder="Select subject" />
                                </SelectTrigger>
                                <SelectContent>
                                  {subjects.map((subject) => (
                                    <SelectItem key={subject} value={subject}>
                                      {subject}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="content">Content</Label>
                              <Textarea
                                id="content"
                                placeholder="Write your notes here..."
                                className="min-h-[200px]"
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setNoteTitle("")
                                setNoteContent("")
                                setSelectedSubject("")
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleCreateNote}
                              className="bg-primary/90 hover:bg-primary transition-colors"
                            >
                              Save Note
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Wand2 className="h-4 w-4 mr-2" />
                            AI Generate
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Generate Notes with AI</DialogTitle>
                            <DialogDescription>Let AI create detailed notes on any optometry topic</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="ai-topic">Topic</Label>
                              <Input
                                id="ai-topic"
                                placeholder="e.g., Diabetic Retinopathy, Contact Lens Fitting"
                                value={aiTopic}
                                onChange={(e) => setAiTopic(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="ai-subject">Subject</Label>
                              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                <SelectTrigger id="ai-subject">
                                  <SelectValue placeholder="Select subject" />
                                </SelectTrigger>
                                <SelectContent>
                                  {subjects.map((subject) => (
                                    <SelectItem key={subject} value={subject}>
                                      {subject}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="ai-detail">Detail Level</Label>
                              <Select value={aiDetail} onValueChange={setAiDetail}>
                                <SelectTrigger id="ai-detail">
                                  <SelectValue placeholder="Select detail level" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="basic">Basic - Key concepts only</SelectItem>
                                  <SelectItem value="medium">Medium - Balanced detail</SelectItem>
                                  <SelectItem value="detailed">Detailed - Comprehensive coverage</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setAiTopic("")}>
                              Cancel
                            </Button>
                            <Button
                              onClick={handleGenerateAINotes}
                              disabled={isGenerating}
                              className="bg-primary/90 hover:bg-primary transition-colors"
                            >
                              {isGenerating ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Wand2 className="h-4 w-4 mr-2" />
                                  Generate Notes
                                </>
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <CardDescription>{filteredNotes.length} notes in your collection</CardDescription>
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search notes..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-10">
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                          <DropdownMenuLabel>Filter by Subject</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setSelectedSubject("")}>All Subjects</DropdownMenuItem>
                          {subjects.map((subject) => (
                            <DropdownMenuItem
                              key={subject}
                              onClick={() => setSelectedSubject(subject)}
                              className={selectedSubject === subject ? "bg-primary/10" : ""}
                            >
                              {subject}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-10">
                            <SortDesc className="h-4 w-4 mr-2" />
                            Sort
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSortBy("date")
                              setSortOrder("desc")
                            }}
                            className={sortBy === "date" && sortOrder === "desc" ? "bg-primary/10" : ""}
                          >
                            Date (Newest first)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSortBy("date")
                              setSortOrder("asc")
                            }}
                            className={sortBy === "date" && sortOrder === "asc" ? "bg-primary/10" : ""}
                          >
                            Date (Oldest first)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSortBy("title")
                              setSortOrder("asc")
                            }}
                            className={sortBy === "title" && sortOrder === "asc" ? "bg-primary/10" : ""}
                          >
                            Title (A-Z)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSortBy("title")
                              setSortOrder("desc")
                            }}
                            className={sortBy === "title" && sortOrder === "desc" ? "bg-primary/10" : ""}
                          >
                            Title (Z-A)
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredNotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No notes found</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Try creating a new note or adjusting your search filters
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredNotes.map((note) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          onPreview={handlePreviewNote}
                          onDelete={handleDeleteNote}
                          onEdit={(note) => {
                            setEditingNote(note)
                            setShowEditDialog(true)
                          }}
                          onDownload={downloadNote}
                          onCreateFlashcards={handleCreateFlashcards}
                          bulkSelectMode={bulkSelectMode}
                          isSelected={selectedNotes.has(note.id)}
                          onToggleSelect={toggleNoteSelection}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="md:w-1/3 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Note Groups</CardTitle>
                  <CardDescription>Organize your notes by subject</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getNoteGroups().length === 0 ? (
                      <p className="text-sm text-muted-foreground">No groups yet</p>
                    ) : (
                      getNoteGroups().map((group) => (
                        <div
                          key={group}
                          className={`flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer ${
                            selectedGroup === group ? "bg-primary/10" : ""
                          }`}
                          onClick={() => {
                            if (editingGroup !== group) {
                              setSelectedGroup(selectedGroup === group ? "" : group)
                            }
                          }}
                        >
                          {editingGroup === group ? (
                            <div className="flex items-center gap-2 w-full">
                              <Input
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                className="h-8"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    saveGroupRename()
                                  } else if (e.key === "Escape") {
                                    setEditingGroup(null)
                                  }
                                }}
                              />
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={saveGroupRename}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setEditingGroup(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <Folder className="h-4 w-4 text-muted-foreground" />
                                <span>{group}</span>
                                <Badge variant="outline" className="ml-2">
                                  {getAllNotes().filter((note) => note.subject === group).length}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRenameGroup(group)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                  <CardDescription>Filter notes by tags</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {getAllTags().length === 0 ? (
                      <p className="text-sm text-muted-foreground">No tags yet</p>
                    ) : (
                      getAllTags().map((tag) => (
                        <Badge
                          key={tag}
                          variant={filterTags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            if (filterTags.includes(tag)) {
                              setFilterTags(filterTags.filter((t) => t !== tag))
                            } else {
                              setFilterTags([...filterTags, tag])
                            }
                          }}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Note Preview Dialog */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>{previewNote?.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <span>{previewNote?.subject}</span>
                <span>•</span>
                <span>{previewNote?.date}</span>
                {previewNote?.tags && previewNote.tags.length > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex flex-wrap gap-1">
                      {previewNote.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto py-4">
              <MarkdownViewer content={previewNote?.content || ""} />
            </div>
            <DialogFooter>
              {previewNote?.isPreview ? (
                <>
                  <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={savePreviewedNote}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Note
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
                  Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this note? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteNote}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AI Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit with AI</DialogTitle>
              <DialogDescription>Provide instructions for how you want the AI to edit your note</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-note">Note to Edit</Label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">{editingNote?.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {editingNote?.content.substring(0, 150)}...
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ai-instruction">Instructions for AI</Label>
                <Textarea
                  id="ai-instruction"
                  placeholder="e.g., Simplify the content, Add more details about treatment options, Organize into bullet points..."
                  className="min-h-[100px]"
                  value={aiEditInstruction}
                  onChange={(e) => setAiEditInstruction(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAiEdit}
                disabled={isAiEditing}
                className="bg-primary/90 hover:bg-primary transition-colors"
              >
                {isAiEditing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Editing...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Edit with AI
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Flashcard Creation Dialog */}
        <Dialog open={showFlashcardDialog} onOpenChange={setShowFlashcardDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Flashcards</DialogTitle>
              <DialogDescription>Generate flashcards from this note for spaced repetition learning</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="flashcard-source">Source Note</Label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium">{selectedNoteForFlashcards?.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">Subject: {selectedNoteForFlashcards?.subject}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="flashcard-count">Number of Flashcards</Label>
                <Select value={flashcardCount} onValueChange={setFlashcardCount}>
                  <SelectTrigger id="flashcard-count">
                    <SelectValue placeholder="Select count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 cards</SelectItem>
                    <SelectItem value="10">10 cards</SelectItem>
                    <SelectItem value="15">15 cards</SelectItem>
                    <SelectItem value="20">20 cards</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFlashcardDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={generateFlashcards}
                disabled={generatingFlashcards}
                className="bg-primary/90 hover:bg-primary transition-colors"
              >
                {generatingFlashcards ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Layers className="h-4 w-4 mr-2" />
                    Generate Flashcards
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AuthRequired>
  )
}

