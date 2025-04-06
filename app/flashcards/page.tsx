"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Search, Download, Upload, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { FlashCard, OptoCard } from "@/components/flashcard"
import { Progress } from "@/components/ui/progress"

// Define the flashcard interface
export interface Flashcard {
  id: string
  question: string
  answer: string
  category: string
  difficulty: "easy" | "medium" | "hard"
  lastReviewed: string | null
  nextReview: string | null
  repetitions: number
  easeFactor: number
  interval: number
  rating: "again" | "hard" | "good" | "easy" | null
  source: string
  tags: string[]
  createdAt: string
}

export default function FlashcardsPage() {
  const { toast } = useToast()
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [filteredCards, setFilteredCards] = useState<Flashcard[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [newCardQuestion, setNewCardQuestion] = useState("")
  const [newCardAnswer, setNewCardAnswer] = useState("")
  const [newCardCategory, setNewCardCategory] = useState("General")
  const [newCardTags, setNewCardTags] = useState("")
  const [importSource, setImportSource] = useState("")
  const [generatingCards, setGeneratingCards] = useState(false)
  const [generationTopic, setGenerationTopic] = useState("")
  const [generationCount, setGenerationCount] = useState("10")
  const [reviewMode, setReviewMode] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [studySession, setStudySession] = useState<Flashcard[]>([])
  const [sessionProgress, setSessionProgress] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [selectedTag, setSelectedTag] = useState<string>("all")

  // Load flashcards from localStorage on component mount
  useEffect(() => {
    const storedCards = localStorage.getItem("optometry_flashcards")
    if (storedCards) {
      const parsedCards = JSON.parse(storedCards)
      setFlashcards(parsedCards)
      setFilteredCards(parsedCards)

      // Extract unique categories and tags
      const uniqueCategories = Array.from(new Set(parsedCards.map((card: Flashcard) => card.category)))
      setCategories(uniqueCategories)

      const allTags = parsedCards.flatMap((card: Flashcard) => card.tags)
      const uniqueTags = Array.from(new Set(allTags))
      setTags(uniqueTags)
    }
  }, [])

  // Update filtered cards when filters change
  useEffect(() => {
    let filtered = [...flashcards]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (card) =>
          card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((card) => card.category === selectedCategory)
    }

    // Apply difficulty filter
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter((card) => card.difficulty === selectedDifficulty)
    }

    // Apply tag filter
    if (selectedTag !== "all") {
      filtered = filtered.filter((card) => card.tags.includes(selectedTag))
    }

    setFilteredCards(filtered)
  }, [flashcards, searchQuery, selectedCategory, selectedDifficulty, selectedTag])

  // Create a new flashcard
  const handleCreateCard = () => {
    if (!newCardQuestion.trim() || !newCardAnswer.trim()) {
      toast({
        title: "Error",
        description: "Question and answer are required",
        variant: "destructive",
      })
      return
    }

    const tags = newCardTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag)

    const newCard: Flashcard = {
      id: `card_${Date.now()}`,
      question: newCardQuestion,
      answer: newCardAnswer,
      category: newCardCategory,
      difficulty: "medium",
      lastReviewed: null,
      nextReview: null,
      repetitions: 0,
      easeFactor: 2.5,
      interval: 1,
      rating: null,
      source: "manual",
      tags,
      createdAt: new Date().toISOString(),
    }

    const updatedCards = [...flashcards, newCard]
    setFlashcards(updatedCards)
    localStorage.setItem("optometry_flashcards", JSON.stringify(updatedCards))

    // Update categories and tags
    if (!categories.includes(newCardCategory)) {
      setCategories([...categories, newCardCategory])
    }

    const newTags = tags.filter((tag) => !tags.includes(tag))
    if (newTags.length > 0) {
      setTags([...tags, ...newTags])
    }

    setNewCardQuestion("")
    setNewCardAnswer("")
    setNewCardTags("")
    setShowCreateDialog(false)

    toast({
      title: "Success",
      description: "Flashcard created successfully",
    })
  }

  // Delete a flashcard
  const handleDeleteCard = (id: string) => {
    const updatedCards = flashcards.filter((card) => card.id !== id)
    setFlashcards(updatedCards)
    localStorage.setItem("optometry_flashcards", JSON.stringify(updatedCards))

    toast({
      title: "Success",
      description: "Flashcard deleted successfully",
    })
  }

  // Import flashcards from notes
  const handleImportFromNotes = () => {
    try {
      // Get notes from localStorage
      const notes = localStorage.getItem("optometry_notes")
      if (!notes) {
        toast({
          title: "Error",
          description: "No notes found to import",
          variant: "destructive",
        })
        return
      }

      const parsedNotes = JSON.parse(notes)
      const selectedNote = parsedNotes.find(
        (note: any) =>
          note.title.toLowerCase().includes(importSource.toLowerCase()) ||
          note.content.toLowerCase().includes(importSource.toLowerCase()),
      )

      if (!selectedNote) {
        toast({
          title: "Error",
          description: "No matching note found",
          variant: "destructive",
        })
        return
      }

      // Extract potential Q&A pairs from the note content
      const content = selectedNote.content
      const lines = content.split("\n")
      const newCards: Flashcard[] = []

      // Simple heuristic to find question-answer pairs
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        // Look for lines that end with ? or start with common question patterns
        if (line.endsWith("?") || /^(what|how|why|when|where|which|who|define|explain|describe)/i.test(line)) {
          // Consider the next line as the answer if it exists
          if (i + 1 < lines.length) {
            const answer = lines[i + 1].trim()
            if (answer && !answer.endsWith("?")) {
              newCards.push({
                id: `card_${Date.now()}_${i}`,
                question: line,
                answer: answer,
                category: selectedNote.subject || "Imported",
                difficulty: "medium",
                lastReviewed: null,
                nextReview: null,
                repetitions: 0,
                easeFactor: 2.5,
                interval: 1,
                rating: null,
                source: `Note: ${selectedNote.title}`,
                tags: selectedNote.tags || [],
                createdAt: new Date().toISOString(),
              })
            }
          }
        }
      }

      if (newCards.length === 0) {
        toast({
          title: "Warning",
          description: "No question-answer pairs found in the selected note",
          variant: "destructive",
        })
        return
      }

      // Add the new cards to the existing ones
      const updatedCards = [...flashcards, ...newCards]
      setFlashcards(updatedCards)
      localStorage.setItem("optometry_flashcards", JSON.stringify(updatedCards))

      setImportSource("")
      setShowImportDialog(false)

      toast({
        title: "Success",
        description: `Imported ${newCards.length} flashcards from notes`,
      })
    } catch (error) {
      console.error("Error importing from notes:", error)
      toast({
        title: "Error",
        description: "Failed to import flashcards from notes",
        variant: "destructive",
      })
    }
  }

  // Generate flashcards using AI
  const handleGenerateCards = async () => {
    if (!generationTopic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic for flashcard generation",
        variant: "destructive",
      })
      return
    }

    setGeneratingCards(true)

    try {
      // Get the API key from localStorage
      const apiKey = localStorage.getItem("gemini_api_key") || "AIzaSyB6RHAgIkXqpRaOAjm8i-U4YqLyHT5BmLE"

      const response = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": apiKey,
        },
        body: JSON.stringify({
          topic: generationTopic,
          count: Number.parseInt(generationCount),
        }),
      })

      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`)
      }

      const data = await response.json()

      if (data.flashcards && data.flashcards.length > 0) {
        // Format the generated flashcards
        const newCards: Flashcard[] = data.flashcards.map((card: any, index: number) => ({
          id: `card_${Date.now()}_${index}`,
          question: card.question,
          answer: card.answer,
          category: generationTopic,
          difficulty: "medium",
          lastReviewed: null,
          nextReview: null,
          repetitions: 0,
          easeFactor: 2.5,
          interval: 1,
          rating: null,
          source: "AI Generated",
          tags: [generationTopic.toLowerCase(), "ai-generated"],
          createdAt: new Date().toISOString(),
        }))

        // Add the new cards to the existing ones
        const updatedCards = [...flashcards, ...newCards]
        setFlashcards(updatedCards)
        localStorage.setItem("optometry_flashcards", JSON.stringify(updatedCards))

        // Update categories and tags
        if (!categories.includes(generationTopic)) {
          setCategories([...categories, generationTopic])
        }

        setGenerationTopic("")
        setShowGenerateDialog(false)

        toast({
          title: "Success",
          description: `Generated ${newCards.length} flashcards on ${generationTopic}`,
        })
      } else {
        throw new Error("No flashcards were generated")
      }
    } catch (error) {
      console.error("Error generating flashcards:", error)
      toast({
        title: "Error",
        description: "Failed to generate flashcards. Please try again.",
        variant: "destructive",
      })
    } finally {
      setGeneratingCards(false)
    }
  }

  // Start a review session
  const startReviewSession = () => {
    // Get cards due for review (in a real SRS, this would be based on the next review date)
    // For simplicity, we'll just use the filtered cards
    if (filteredCards.length === 0) {
      toast({
        title: "No cards to review",
        description: "There are no cards matching your current filters",
        variant: "destructive",
      })
      return
    }

    // Shuffle the cards for the study session
    const shuffled = [...filteredCards].sort(() => Math.random() - 0.5)
    setStudySession(shuffled)
    setCurrentCardIndex(0)
    setSessionProgress(0)
    setReviewMode(true)
    setIsFlipped(false)
  }

  // Handle card rating in review mode
  const handleCardRating = (rating: "again" | "hard" | "good" | "easy") => {
    if (currentCardIndex >= studySession.length) return

    // Get the current card
    const currentCard = studySession[currentCardIndex]

    // Calculate new SRS parameters based on the SM-2 algorithm (simplified)
    let newInterval = currentCard.interval
    let newEaseFactor = currentCard.easeFactor
    let newRepetitions = currentCard.repetitions

    switch (rating) {
      case "again":
        newRepetitions = 0
        newInterval = 1
        newEaseFactor = Math.max(1.3, currentCard.easeFactor - 0.2)
        break
      case "hard":
        newRepetitions += 1
        newInterval = Math.ceil(currentCard.interval * 1.2)
        newEaseFactor = Math.max(1.3, currentCard.easeFactor - 0.15)
        break
      case "good":
        newRepetitions += 1
        newInterval = Math.ceil(currentCard.interval * currentCard.easeFactor)
        break
      case "easy":
        newRepetitions += 1
        newInterval = Math.ceil(currentCard.interval * currentCard.easeFactor * 1.3)
        newEaseFactor = currentCard.easeFactor + 0.15
        break
    }

    // Calculate next review date
    const now = new Date()
    const nextReview = new Date(now)
    nextReview.setDate(nextReview.getDate() + newInterval)

    // Update the card
    const updatedCard: Flashcard = {
      ...currentCard,
      lastReviewed: now.toISOString(),
      nextReview: nextReview.toISOString(),
      repetitions: newRepetitions,
      easeFactor: newEaseFactor,
      interval: newInterval,
      rating,
    }

    // Update the card in the main flashcards array
    const updatedFlashcards = flashcards.map((card) => (card.id === updatedCard.id ? updatedCard : card))

    setFlashcards(updatedFlashcards)
    localStorage.setItem("optometry_flashcards", JSON.stringify(updatedFlashcards))

    // Move to the next card
    if (currentCardIndex < studySession.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setSessionProgress(Math.round(((currentCardIndex + 1) / studySession.length) * 100))
      setIsFlipped(false)
    } else {
      // End of session
      setReviewMode(false)
      toast({
        title: "Review Complete",
        description: `You've completed reviewing ${studySession.length} cards`,
      })
    }
  }

  // Export flashcards
  const handleExportCards = () => {
    const dataStr = JSON.stringify(flashcards, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `optometry_flashcards_${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    toast({
      title: "Export Successful",
      description: "Your flashcards have been exported as a JSON file",
    })
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild className="h-8 w-8">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Dashboard</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">OptoCards</h1>
        </div>
        <p className="text-muted-foreground">
          Create, study, and manage flashcards for effective spaced repetition learning
        </p>

        {reviewMode ? (
          <div className="flex flex-col items-center gap-6">
            <div className="w-full flex justify-between items-center">
              <Button variant="outline" onClick={() => setReviewMode(false)}>
                <X className="h-4 w-4 mr-2" />
                Exit Review
              </Button>
              <div className="text-sm">
                Card {currentCardIndex + 1} of {studySession.length}
              </div>
            </div>

            <Progress value={sessionProgress} className="w-full" />

            <div className="w-full max-w-2xl mx-auto">
              {studySession.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm">
                      {currentCardIndex + 1} of {studySession.length}
                    </span>
                  </div>
                  <Progress value={sessionProgress} className="h-2" />
                </div>
              )}
              {studySession.length > 0 && (
                <OptoCard
                  card={studySession[currentCardIndex]}
                  isFlipped={isFlipped}
                  onFlip={() => setIsFlipped(!isFlipped)}
                />
              )}
            </div>

            {isFlipped && (
              <div className="flex gap-2 mt-4 justify-center">
                <Button
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500/10 min-w-[80px]"
                  onClick={() => handleCardRating("again")}
                >
                  Again
                </Button>
                <Button
                  variant="outline"
                  className="border-orange-500 text-orange-500 hover:bg-orange-500/10 min-w-[80px]"
                  onClick={() => handleCardRating("hard")}
                >
                  Hard
                </Button>
                <Button
                  variant="outline"
                  className="border-green-500 text-green-500 hover:bg-green-500/10 min-w-[80px]"
                  onClick={() => handleCardRating("good")}
                >
                  Good
                </Button>
                <Button
                  variant="outline"
                  className="border-blue-500 text-blue-500 hover:bg-blue-500/10 min-w-[80px]"
                  onClick={() => handleCardRating("easy")}
                >
                  Easy
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Tabs defaultValue="browse">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="browse">Browse</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowGenerateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportCards}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <TabsContent value="browse" className="mt-4">
              <div className="grid gap-6 md:grid-cols-4">
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Filters</CardTitle>
                      <CardDescription>Narrow down your flashcards</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="search">Search</Label>
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="search"
                            placeholder="Search flashcards..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                          <SelectTrigger id="difficulty">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Difficulties</SelectItem>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tag">Tag</Label>
                        <Select value={selectedTag} onValueChange={setSelectedTag}>
                          <SelectTrigger id="tag">
                            <SelectValue placeholder="Select tag" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Tags</SelectItem>
                            {tags.map((tag) => (
                              <SelectItem key={tag} value={tag}>
                                {tag}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" onClick={startReviewSession} disabled={filteredCards.length === 0}>
                        Start Review Session
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Create New</CardTitle>
                      <CardDescription>Add your own flashcards</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" onClick={() => setShowCreateDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Flashcard
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="md:col-span-3">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>Your Flashcards</CardTitle>
                      <CardDescription>{filteredCards.length} flashcards found</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[calc(100vh-300px)] overflow-y-auto">
                      {filteredCards.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                          <Search className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium">No flashcards found</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Try adjusting your filters or create new flashcards
                          </p>
                        </div>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {filteredCards.map((card) => (
                            <FlashCard key={card.id} card={card} onDelete={() => handleDeleteCard(card.id)} />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Flashcard Statistics</CardTitle>
                  <CardDescription>Track your learning progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Total Flashcards</h3>
                      <p className="text-3xl font-bold">{flashcards.length}</p>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Categories</h3>
                      <p className="text-3xl font-bold">{categories.length}</p>
                    </div>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Cards Reviewed</h3>
                      <p className="text-3xl font-bold">
                        {flashcards.filter((card) => card.lastReviewed !== null).length}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-medium mb-4">Category Distribution</h3>
                    <div className="space-y-3">
                      {categories.map((category) => {
                        const count = flashcards.filter((card) => card.category === category).length
                        const percentage = Math.round((count / flashcards.length) * 100) || 0

                        return (
                          <div key={category} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{category}</span>
                              <span>
                                {count} cards ({percentage}%)
                              </span>
                            </div>
                            <Progress value={percentage} />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Create Flashcard Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Flashcard</DialogTitle>
            <DialogDescription>Add a new flashcard to your collection</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                placeholder="Enter the question..."
                value={newCardQuestion}
                onChange={(e) => setNewCardQuestion(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                placeholder="Enter the answer..."
                value={newCardAnswer}
                onChange={(e) => setNewCardAnswer(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={newCardCategory} onValueChange={setNewCardCategory}>
                <SelectTrigger id="new-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                placeholder="e.g., anatomy, cornea, important"
                value={newCardTags}
                onChange={(e) => setNewCardTags(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCard}>Create Flashcard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Import from Notes</DialogTitle>
            <DialogDescription>Convert your existing notes into flashcards</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="import-source">Search for Note</Label>
              <Input
                id="import-source"
                placeholder="Enter note title or keywords..."
                value={importSource}
                onChange={(e) => setImportSource(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Enter keywords to find the note you want to import from</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportFromNotes}>Import Flashcards</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Generate Flashcards</DialogTitle>
            <DialogDescription>Use AI to generate flashcards on any optometry topic</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="generation-topic">Topic</Label>
              <Input
                id="generation-topic"
                placeholder="e.g., Corneal Anatomy, Glaucoma, Contact Lenses"
                value={generationTopic}
                onChange={(e) => setGenerationTopic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="generation-count">Number of Flashcards</Label>
              <Select value={generationCount} onValueChange={setGenerationCount}>
                <SelectTrigger id="generation-count">
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
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateCards} disabled={generatingCards}>
              {generatingCards ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Flashcards"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

