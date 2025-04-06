"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Search, ArrowLeft, Plus, Loader2, Filter, Upload, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Add import for the AcademicMarkdown component
import { AcademicMarkdown } from "@/components/academic-markdown"

// Define types for syllabus structure
interface Topic {
  id: string
  title: string
  completed: boolean
}

interface Unit {
  title: string
  topics: Topic[]
}

interface Subject {
  id: string
  title: string
  progress: number
  units: Unit[]
}

interface Curriculum {
  [year: string]: {
    [semester: string]: Subject[]
  }
}

export default function AcademicsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedYear, setSelectedYear] = useState("1")
  const [selectedSemester, setSelectedSemester] = useState("1")
  const [selectedUniversity, setSelectedUniversity] = useState("generic")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState("")
  const [currentTopic, setCurrentTopic] = useState("")
  const [currentUnit, setCurrentUnit] = useState("")
  const [currentSubject, setCurrentSubject] = useState("")
  const contentRef = useRef<HTMLDivElement>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [markdownInput, setMarkdownInput] = useState("")
  const [curriculum, setCurriculum] = useState<Curriculum>({})
  const [showInstructionsDialog, setShowInstructionsDialog] = useState(false)
  const [generationLevel, setGenerationLevel] = useState<"topic" | "unit" | "subject">("topic")
  const [activeTab, setActiveTab] = useState("curriculum")

  // Function to parse markdown into curriculum structure
  const parseSyllabusMarkdown = (markdown: string): Curriculum => {
    const curriculum: Curriculum = {}

    // Split by year sections
    const yearSections = markdown.split(/^# Year (\d+)/gm).filter(Boolean)

    for (let i = 0; i < yearSections.length; i += 2) {
      const year = yearSections[i]
      const yearContent = yearSections[i + 1]

      if (!yearContent) continue

      curriculum[year] = {}

      // Split by semester sections
      const semesterSections = yearContent.split(/^## Semester (\d+)/gm).filter(Boolean)

      for (let j = 0; j < semesterSections.length; j += 2) {
        const semester = semesterSections[j]
        const semesterContent = semesterSections[j + 1]

        if (!semesterContent) continue

        curriculum[year][semester] = []

        // Split by subject sections
        const subjectSections = semesterContent.split(/^### (.+?) $$(.+?)$$/gm)

        for (let k = 1; k < subjectSections.length; k += 3) {
          const subjectTitle = subjectSections[k]
          const subjectId = subjectSections[k + 1]
          const subjectContent = subjectSections[k + 2]

          if (!subjectContent) continue

          const subject: Subject = {
            id: subjectId,
            title: subjectTitle,
            progress: 0,
            units: [],
          }

          // Split by unit sections
          const unitSections = subjectContent.split(/^#### (.+?)$/gm).filter(Boolean)

          for (let l = 0; l < unitSections.length; l += 2) {
            const unitTitle = unitSections[l]
            const unitContent = unitSections[l + 1]

            if (!unitContent) continue

            const unit: Unit = {
              title: unitTitle,
              topics: [],
            }

            // Extract topics
            const topicLines = unitContent.match(/- (.+?)$/gm)

            if (topicLines) {
              topicLines.forEach((line, index) => {
                const topicTitle = line.replace(/^- /, "")
                unit.topics.push({
                  id: `${subjectId}.${l / 2 + 1}.${index + 1}`,
                  title: topicTitle,
                  completed: false,
                })
              })
            }

            subject.units.push(unit)
          }

          curriculum[year][semester].push(subject)
        }
      }
    }

    return curriculum
  }

  // Function to handle importing syllabus
  const handleImportSyllabus = () => {
    try {
      const parsedCurriculum = parseSyllabusMarkdown(markdownInput)
      setCurriculum(parsedCurriculum)
      setSelectedUniversity("custom")

      // Save to localStorage for persistence
      localStorage.setItem("custom_curriculum", JSON.stringify(parsedCurriculum))

      setShowImportDialog(false)
      toast({
        title: "Syllabus Imported",
        description: "Your custom syllabus has been successfully imported.",
      })
    } catch (error) {
      console.error("Error parsing syllabus:", error)
      toast({
        title: "Import Failed",
        description: "Failed to parse the syllabus. Please check the format and try again.",
        variant: "destructive",
      })
    }
  }

  // Load custom curriculum from localStorage on component mount
  useEffect(() => {
    const storedCurriculum = localStorage.getItem("custom_curriculum")
    if (storedCurriculum) {
      try {
        setCurriculum(JSON.parse(storedCurriculum))
      } catch (error) {
        console.error("Error parsing stored curriculum:", error)
      }
    }
  }, [])

  // Original curriculum data structure (renamed to genericCurriculum)
  const genericCurriculum: Curriculum = {
    "1": {
      "1": [
        {
          id: "OPT101",
          title: "Introduction to Optometry",
          progress: 85,
          units: [
            {
              title: "Unit 1: History and Scope of Optometry",
              topics: [
                { id: "1.1", title: "Evolution of Optometry as a Profession", completed: true },
                { id: "1.2", title: "Scope of Practice and Legal Regulations", completed: true },
                { id: "1.3", title: "Optometry Education and Specializations", completed: false },
              ],
            },
            {
              title: "Unit 2: Optometric Examination Basics",
              topics: [
                { id: "2.1", title: "Patient History and Communication", completed: true },
                { id: "2.2", title: "Preliminary Testing Procedures", completed: true },
                { id: "2.3", title: "Documentation and Record Keeping", completed: true },
              ],
            },
          ],
        },
        {
          id: "OPT102",
          title: "Ocular Anatomy and Physiology I",
          progress: 70,
          units: [
            {
              title: "Unit 1: External Ocular Structures",
              topics: [
                { id: "1.1", title: "Eyelids and Lacrimal System", completed: true },
                { id: "1.2", title: "Conjunctiva and Sclera", completed: true },
                { id: "1.3", title: "Cornea: Structure and Function", completed: false },
              ],
            },
            {
              title: "Unit 2: Anterior Segment",
              topics: [
                { id: "2.1", title: "Anterior Chamber and Angle", completed: true },
                { id: "2.2", title: "Iris and Pupil", completed: true },
                { id: "2.3", title: "Crystalline Lens", completed: false },
              ],
            },
          ],
        },
      ],
      "2": [
        {
          id: "OPT201",
          title: "Ocular Anatomy and Physiology II",
          progress: 40,
          units: [
            {
              title: "Unit 1: Posterior Segment",
              topics: [
                { id: "1.1", title: "Vitreous Humor", completed: true },
                { id: "1.2", title: "Retina: Structure and Function", completed: false },
                { id: "1.3", title: "Optic Nerve and Visual Pathway", completed: false },
              ],
            },
          ],
        },
      ],
    },
    "2": {
      "1": [
        {
          id: "OPT301",
          title: "Clinical Procedures I",
          progress: 30,
          units: [
            {
              title: "Unit 1: Refraction Techniques",
              topics: [
                { id: "1.1", title: "Retinoscopy", completed: true },
                { id: "1.2", title: "Subjective Refraction", completed: false },
                { id: "1.3", title: "Binocular Balance", completed: false },
              ],
            },
          ],
        },
      ],
    },
  }

  // Function to get the appropriate curriculum based on selected university
  const getCurriculum = () => {
    switch (selectedUniversity) {
      case "custom":
        return Object.keys(curriculum).length > 0 ? curriculum : genericCurriculum
      default:
        return genericCurriculum
    }
  }

  // Update the handleContentGeneration function to use the AI note maker
  const handleContentGeneration = async (level: "topic" | "unit" | "subject", content: string) => {
    setGenerationLevel(level)

    if (level === "topic") {
      setCurrentTopic(content)
      setCurrentUnit("")
      setCurrentSubject("")
    } else if (level === "unit") {
      setCurrentUnit(content)
      setCurrentTopic("")
      setCurrentSubject("")
    } else if (level === "subject") {
      setCurrentSubject(content)
      setCurrentUnit("")
      setCurrentTopic("")
    }

    setIsGenerating(true)
    setGeneratedContent("")
    setActiveTab("content")

    try {
      // Use the API route that will use the environment variable from .env
      const response = await fetch("/api/generate-topic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: content,
          level: level,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate content")
      }

      const data = await response.json()
      setGeneratedContent(data.content || "")
    } catch (error) {
      console.error("Error generating content:", error)

      // Fallback content if API fails
      const fallbackContent = `
        <h2>${content}</h2>
        <p>This is a placeholder content for ${content}. The actual content generation is currently unavailable.</p>
        <p>Here are some key points that would typically be covered in this topic:</p>
        <ul>
          <li>Definition and basic concepts</li>
          <li>Key principles and mechanisms</li>
          <li>Clinical significance and applications</li>
          <li>Related disorders and conditions</li>
          <li>Diagnostic and treatment approaches</li>
        </ul>
        <p>Please try again later when the content generation service is available.</p>
      `

      setGeneratedContent(fallbackContent)

      toast({
        title: "Using Fallback Content",
        description: "We're having trouble connecting to our AI service. Showing basic information instead.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Add a function to download content as Markdown
  const downloadAsMarkdown = () => {
    if (!generatedContent) return

    const title = currentTopic || currentUnit || currentSubject
    if (!title) return

    // Convert HTML to Markdown (simple conversion)
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = generatedContent

    // Basic HTML to Markdown conversion
    const markdown = tempDiv.innerText

    // Create and download the file
    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title.replace(/[^a-z0-9]/gi, "_")}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Markdown Downloaded",
      description: "Your content has been downloaded as a Markdown file.",
    })
  }

  const handleTopicClick = (topicTitle: string) => {
    handleContentGeneration("topic", topicTitle)
  }

  const handleUnitClick = (unitTitle: string) => {
    handleContentGeneration("unit", unitTitle)
  }

  const handleSubjectClick = (subjectTitle: string) => {
    handleContentGeneration("subject", subjectTitle)
  }

  const handleTopicToggle = (topicId: string, completed: boolean) => {
    // In a real app, this would update the database
    console.log(`Topic ${topicId} marked as ${completed ? "completed" : "incomplete"}`)

    toast({
      title: completed ? "Topic Completed" : "Topic Marked as Incomplete",
      description: `Your progress has been updated.`,
    })
  }

  // Filter subjects based on selected year and semester
  const filteredSubjects = getCurriculum()[selectedYear]?.[selectedSemester] || []

  // Filter subjects based on search query (now includes subject code search)
  const searchedSubjects = searchQuery
    ? filteredSubjects.filter(
        (subject) =>
          subject.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subject.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subject.units.some(
            (unit) =>
              unit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              unit.topics.some((topic) => topic.title.toLowerCase().includes(searchQuery.toLowerCase())),
          ),
      )
    : filteredSubjects

  // Add function to download content as PDF
  const downloadAsPDF = async () => {
    if (!contentRef.current) return

    const title = currentTopic || currentUnit || currentSubject
    if (!title) return

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
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Add image to PDF with proper pagination
      let heightLeft = imgHeight
      let position = 0
      const pageData = imgData

      // First page
      pdf.addImage(pageData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // Add subsequent pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(pageData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Save PDF
      pdf.save(`${title.replace(/[^a-z0-9]/gi, "_")}.pdf`)

      toast({
        title: "PDF Downloaded",
        description: "Your content has been downloaded as a PDF file.",
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

  // Example syllabus markdown format
  const exampleSyllabusMarkdown = `# Year 1
## Semester 1
### Introduction to Optometry (OPT101)
#### Unit 1: History and Scope of Optometry
- Evolution of Optometry as a Profession
- Scope of Practice and Legal Regulations
- Optometry Education and Specializations

#### Unit 2: Optometric Examination Basics
- Patient History and Communication
- Preliminary Testing Procedures
- Documentation and Record Keeping

### Ocular Anatomy and Physiology I (OPT102)
#### Unit 1: External Ocular Structures
- Eyelids and Lacrimal System
- Conjunctiva and Sclera
- Cornea: Structure and Function

#### Unit 2: Anterior Segment
- Anterior Chamber and Angle
- Iris and Pupil
- Crystalline Lens

## Semester 2
### Ocular Anatomy and Physiology II (OPT201)
#### Unit 1: Posterior Segment
- Vitreous Humor
- Retina: Structure and Function
- Optic Nerve and Visual Pathway

# Year 2
## Semester 1
### Clinical Procedures I (OPT301)
#### Unit 1: Refraction Techniques
- Retinoscopy
- Subjective Refraction
- Binocular Balance`

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
          <h1 className="text-3xl font-bold tracking-tight">Optometry Academics</h1>
        </div>
        <p className="text-muted-foreground">Browse the curriculum, track your progress, and manage your studies</p>

        <div className="flex justify-between items-center">
          <Tabs defaultValue="curriculum" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="content" disabled={!currentTopic && !currentUnit && !currentSubject}>
                Generated Content
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowInstructionsDialog(true)}>
              <Info className="h-4 w-4 mr-2" />
              Format Instructions
            </Button>

            <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import Syllabus
            </Button>
          </div>
        </div>

        <TabsContent value="curriculum" className="mt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>Filter Syllabus</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
                      <Filter className="h-4 w-4 mr-2" />
                      {showFilters ? "Hide Filters" : "Show Filters"}
                    </Button>
                  </div>
                  <CardDescription>Select curriculum, year and semester to view subjects</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="university">Curriculum</Label>
                    <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
                      <SelectTrigger id="university">
                        <SelectValue placeholder="Select curriculum" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom Curriculum</SelectItem>
                        <SelectItem value="generic">Generic Curriculum</SelectItem>
                      </SelectContent>
                    </Select>
                    {selectedUniversity === "custom" && Object.keys(curriculum).length === 0 && (
                      <p className="text-xs text-amber-500 mt-1">No custom curriculum found. Please import one.</p>
                    )}
                  </div>

                  {showFilters && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="year">Year</Label>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                          <SelectTrigger id="year">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Year 1</SelectItem>
                            <SelectItem value="2">Year 2</SelectItem>
                            <SelectItem value="3">Year 3</SelectItem>
                            <SelectItem value="4">Year 4</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="semester">Semester</Label>
                        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                          <SelectTrigger id="semester">
                            <SelectValue placeholder="Select semester" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Semester 1</SelectItem>
                            <SelectItem value="2">Semester 2</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="search">Search by Subject Code or Title</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="e.g., OPT101 or Ocular Anatomy..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Content Generation</CardTitle>
                  <CardDescription>Generate detailed content at different levels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Generation Level</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={generationLevel === "topic" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setGenerationLevel("topic")}
                      >
                        Topic
                      </Button>
                      <Button
                        variant={generationLevel === "unit" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setGenerationLevel("unit")}
                      >
                        Unit
                      </Button>
                      <Button
                        variant={generationLevel === "subject" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setGenerationLevel("subject")}
                      >
                        Subject
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click on a {generationLevel} to generate detailed content
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>
                    {selectedUniversity === "custom" ? "Custom" : "Generic"} Curriculum: Year {selectedYear}, Semester{" "}
                    {selectedSemester} Subjects
                  </CardTitle>
                  <CardDescription>{searchedSubjects.length} subjects found</CardDescription>
                </CardHeader>
                <CardContent className="h-[calc(100vh-300px)] overflow-y-auto">
                  {searchedSubjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <Search className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No subjects found</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {Object.keys(getCurriculum()).length === 0
                          ? "Please import a curriculum or select the generic curriculum"
                          : "Try adjusting your search or filters"}
                      </p>
                    </div>
                  ) : (
                    <Accordion type="multiple" className="space-y-4">
                      {searchedSubjects.map((subject) => (
                        <AccordionItem key={subject.id} value={subject.id} className="border rounded-lg px-2">
                          <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex flex-col items-start text-left">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono">
                                  {subject.id}
                                </Badge>
                                <span className="text-base font-semibold">{subject.title}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="ml-2"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSubjectClick(subject.title)
                                  }}
                                >
                                  Generate Content
                                </Button>
                              </div>
                              <div className="w-full mt-2">
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                  <span>Progress</span>
                                  <span>{subject.progress}%</span>
                                </div>
                                <Progress value={subject.progress} className="h-2" />
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 py-2">
                              {subject.units.map((unit, unitIndex) => (
                                <div key={unitIndex} className="space-y-2">
                                  <div className="flex items-center">
                                    <h4 className="font-medium text-sm">{unit.title}</h4>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="ml-2"
                                      onClick={() => handleUnitClick(unit.title)}
                                    >
                                      Generate Content
                                    </Button>
                                  </div>
                                  <div className="space-y-2 ml-4">
                                    {unit.topics.map((topic) => (
                                      <div key={topic.id} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`topic-${topic.id}`}
                                          checked={topic.completed}
                                          onCheckedChange={(checked) => handleTopicToggle(topic.id, checked as boolean)}
                                        />
                                        <Label
                                          htmlFor={`topic-${topic.id}`}
                                          className={`text-sm ${topic.completed ? "line-through text-muted-foreground" : ""}`}
                                        >
                                          {topic.title}
                                        </Label>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 ml-auto"
                                          onClick={() => handleTopicClick(topic.title)}
                                        >
                                          <Plus className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Replace the content rendering section in the "content" TabsContent with: */}
        <TabsContent value="content" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{currentTopic || currentUnit || currentSubject}</CardTitle>
                  <CardDescription>
                    {generationLevel === "topic"
                      ? "Topic content"
                      : generationLevel === "unit"
                        ? "Unit overview"
                        : "Subject overview"}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("curriculum")}>
                  Back to Curriculum
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                  <p className="text-muted-foreground">
                    Generating content for {currentTopic || currentUnit || currentSubject}...
                  </p>
                </div>
              ) : (
                <div ref={contentRef}>
                  {generatedContent ? (
                    <AcademicMarkdown
                      content={generatedContent}
                      title={currentTopic || currentUnit || currentSubject}
                      onDownloadMd={downloadAsMarkdown}
                      onDownloadPdf={downloadAsPDF}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No content generated yet. Please select a topic, unit, or subject.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </div>

      {/* Import Syllabus Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Import Syllabus</DialogTitle>
            <DialogDescription>Paste your syllabus in Markdown format to import it into the system</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-4">
              <Label htmlFor="markdown-input">Syllabus Markdown</Label>
              <Textarea
                id="markdown-input"
                placeholder="Paste your syllabus markdown here..."
                className="min-h-[300px] font-mono text-sm"
                value={markdownInput}
                onChange={(e) => setMarkdownInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Make sure your markdown follows the required format. Click "Format Instructions" to see examples.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportSyllabus}>Import Syllabus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Format Instructions Dialog */}
      <Dialog open={showInstructionsDialog} onOpenChange={setShowInstructionsDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Syllabus Format Instructions</DialogTitle>
            <DialogDescription>
              Follow this format to create a syllabus that can be imported into the system
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Format Structure</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    Use <code className="bg-muted px-1 rounded"># Year X</code> for year headings
                  </li>
                  <li>
                    Use <code className="bg-muted px-1 rounded">## Semester X</code> for semester headings
                  </li>
                  <li>
                    Use <code className="bg-muted px-1 rounded">### Subject Title (SubjectCode)</code> for subject
                    headings
                  </li>
                  <li>
                    Use <code className="bg-muted px-1 rounded">#### Unit Title</code> for unit headings
                  </li>
                  <li>
                    Use <code className="bg-muted px-1 rounded">- Topic Title</code> for topics (bullet points)
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Example</h3>
                <div className="bg-muted p-4 rounded-md overflow-x-auto">
                  <pre className="text-xs">{exampleSyllabusMarkdown}</pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Tips</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Make sure to follow the exact format with proper indentation</li>
                  <li>Each subject must have a code in parentheses</li>
                  <li>Each unit must have at least one topic</li>
                  <li>Use descriptive names for better content generation</li>
                </ul>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setMarkdownInput(exampleSyllabusMarkdown)
                setShowInstructionsDialog(false)
                setShowImportDialog(true)
              }}
            >
              Use Example
            </Button>
            <Button variant="outline" onClick={() => setShowInstructionsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

