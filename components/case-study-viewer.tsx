"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronDown, ChevronUp, Printer, Download, FileText } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import JSZip from "jszip"
import { useIsMobile } from "@/hooks/use-mobile"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

interface CaseStudyViewerProps {
  caseStudy: string
  questions: {
    id: number
    question: string
    answer: string
  }[]
  patientInfo: {
    name: string
    age: number
    gender: string
    occupation: string
    location: string
  }
  condition: string
}

export function CaseStudyViewer({ caseStudy, questions, patientInfo, condition }: CaseStudyViewerProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("case")
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())
  const isMobile = useIsMobile()
  const contentRef = useRef<HTMLDivElement>(null)

  const toggleQuestion = (id: number) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedQuestions(newExpanded)
  }

  const handlePrint = () => {
    window.print()
    toast({
      title: "Print dialog opened",
      description: "The case study is ready to print.",
    })
  }

  // Improved download function to create a proper markdown file
  const handleDownload = () => {
    // Create a text version of the case study
    const content =
      `# Case Study: ${condition}

` +
      `## Patient Information

` +
      `- **Name**: ${patientInfo.name}
` +
      `- **Age**: ${patientInfo.age} years
` +
      `- **Gender**: ${patientInfo.gender}
` +
      `- **Occupation**: ${patientInfo.occupation}
` +
      `- **Location**: ${patientInfo.location}

` +
      caseStudy +
      `

# Educational Questions

` +
      questions
        .map(
          (q) => `## Question ${q.id}: ${q.question}

${q.answer}

`,
        )
        .join("")

    // Create a blob and download it
    const blob = new Blob([content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `case-study-${condition.toLowerCase().replace(/\s+/g, "-")}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Case Study Downloaded",
      description: "The case study has been downloaded as a markdown file.",
    })
  }

  // Add function to download as a PDF file
  const handleDownloadPDF = async () => {
    if (!contentRef.current) return

    toast({
      title: "Generating PDF",
      description: "Please wait while we prepare your PDF...",
    })

    try {
      // Temporarily expand all questions for PDF
      const originalExpanded = new Set(expandedQuestions)
      const allQuestions = new Set(questions.map((q) => q.id))
      setExpandedQuestions(allQuestions)

      // Wait for state update to take effect
      await new Promise((resolve) => setTimeout(resolve, 100))

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
      pdf.save(`case-study-${condition.toLowerCase().replace(/\s+/g, "-")}.pdf`)

      // Restore original expanded state
      setExpandedQuestions(originalExpanded)

      toast({
        title: "PDF Downloaded",
        description: "Your case study has been downloaded as a PDF file.",
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

  // Add function to download as a zip file with images
  const handleDownloadZip = async () => {
    const zip = new JSZip()

    // Add the main case study markdown file
    const content =
      `# Case Study: ${condition}

` +
      `## Patient Information

` +
      `- **Name**: ${patientInfo.name}
` +
      `- **Age**: ${patientInfo.age} years
` +
      `- **Gender**: ${patientInfo.gender}
` +
      `- **Occupation**: ${patientInfo.occupation}
` +
      `- **Location**: ${patientInfo.location}

` +
      caseStudy +
      `

# Educational Questions

` +
      questions
        .map(
          (q) => `## Question ${q.id}: ${q.question}

${q.answer}

`,
        )
        .join("")

    zip.file("case-study.md", content)

    // Create HTML version for better viewing
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Case Study: ${condition}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #2563eb; }
    h2 { color: #3b82f6; margin-top: 20px; }
    table { border-collapse: collapse; width: 100%; margin: 15px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    .patient-info { background-color: #f8fafc; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .question { background-color: #f0f9ff; padding: 10px; border-radius: 5px; margin-top: 10px; }
    .answer { background-color: #f8fafc; padding: 15px; border-left: 3px solid #3b82f6; margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>Case Study: ${condition}</h1>
  
  <div class="patient-info">
    <h2>Patient Information</h2>
    <p><strong>Name:</strong> ${patientInfo.name}</p>
    <p><strong>Age:</strong> ${patientInfo.age} years</p>
    <p><strong>Gender:</strong> ${patientInfo.gender}</p>
    <p><strong>Occupation:</strong> ${patientInfo.occupation}</p>
    <p><strong>Location:</strong> ${patientInfo.location}</p>
  </div>
  
  <div class="case-content">
    ${caseStudy.replace(/\n/g, "<br>")}
  </div>
  
  <h1>Educational Questions</h1>
  ${questions
    .map(
      (q) => `
    <div class="question">
      <h2>Question ${q.id}: ${q.question}</h2>
      <div class="answer">
        ${q.answer.replace(/\n/g, "<br>")}
      </div>
    </div>
  `,
    )
    .join("")}
</body>
</html>
    `

    zip.file("case-study.html", htmlContent)

    // Generate the zip file
    const zipBlob = await zip.generateAsync({ type: "blob" })
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = `case-study-${condition.toLowerCase().replace(/\s+/g, "-")}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Case Study Downloaded",
      description: "The case study has been downloaded as a zip file with markdown and HTML versions.",
    })
  }

  return (
    <div className="space-y-4 print:space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2 print:hidden">
        <h2 className="text-2xl font-bold">Case Study: {condition}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="border-primary/20 hover:bg-primary/10 transition-colors"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="border-primary/20 hover:bg-primary/10 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Download MD
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPDF}
            className="border-primary/20 hover:bg-primary/10 transition-colors"
          >
            <FileText className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadZip}
            className="border-primary/20 hover:bg-primary/10 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Download ZIP
          </Button>
        </div>
      </div>

      <Tabs defaultValue="case" value={activeTab} onValueChange={setActiveTab} className="print:hidden">
        <TabsList>
          <TabsTrigger value="case">Case Study</TabsTrigger>
          <TabsTrigger value="questions">Educational Questions</TabsTrigger>
        </TabsList>
      </Tabs>

      <div ref={contentRef} className="case-study-content">
        <div className={activeTab === "case" ? "block" : "hidden print:block"}>
          <Card className="bg-gradient-to-br from-background to-muted/30 border shadow-md print:shadow-none print:border-0">
            <CardHeader className="pb-2">
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <th className="border px-4 py-2 bg-muted/50 text-left">Name</th>
                      <td className="border px-4 py-2">{patientInfo.name}</td>
                    </tr>
                    <tr>
                      <th className="border px-4 py-2 bg-muted/50 text-left">Age</th>
                      <td className="border px-4 py-2">{patientInfo.age}</td>
                    </tr>
                    <tr>
                      <th className="border px-4 py-2 bg-muted/50 text-left">Gender</th>
                      <td className="border px-4 py-2">{patientInfo.gender}</td>
                    </tr>
                    <tr>
                      <th className="border px-4 py-2 bg-muted/50 text-left">Occupation</th>
                      <td className="border px-4 py-2">{patientInfo.occupation}</td>
                    </tr>
                    <tr>
                      <th className="border px-4 py-2 bg-muted/50 text-left">Location</th>
                      <td className="border px-4 py-2">{patientInfo.location}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto my-4">
                        <table
                          className="min-w-full border-collapse border border-gray-300 dark:border-gray-700"
                          {...props}
                        />
                      </div>
                    ),
                    thead: ({ node, ...props }) => <thead className="bg-gray-100 dark:bg-gray-800" {...props} />,
                    th: ({ node, ...props }) => (
                      <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2" {...props} />
                    ),
                    h1: ({ node, ...props }) => (
                      <h1 className="text-xl font-bold mt-6 mb-3 text-blue-600 dark:text-blue-400" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="text-lg font-bold mt-5 mb-2 text-blue-500 dark:text-blue-400" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="text-base font-bold mt-4 mb-2 text-blue-500 dark:text-blue-400" {...props} />
                    ),
                    ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-3" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-3" {...props} />,
                    li: ({ node, ...props }) => <li className="my-1" {...props} />,
                  }}
                >
                  {caseStudy}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className={activeTab === "questions" ? "block" : "hidden print:block print:mt-8"}>
          <Card className="bg-gradient-to-br from-background to-muted/30 border shadow-md print:shadow-none print:border-0">
            <CardHeader className="pb-2">
              <CardTitle>Educational Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {questions.map((q) => (
                  <div key={q.id} className="border rounded-lg overflow-hidden">
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30"
                      onClick={() => toggleQuestion(q.id)}
                    >
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5 min-w-[24px] text-center">
                          {q.id}
                        </Badge>
                        <span className="font-medium">{q.question}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="ml-2 print:hidden">
                        {expandedQuestions.has(q.id) ? (
                          <ChevronUp className="h-4 w-4 text-blue-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-blue-500" />
                        )}
                      </Button>
                    </div>
                    <div
                      className={`p-4 bg-muted/20 border-t ${expandedQuestions.has(q.id) ? "block" : "hidden print:block"}`}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.answer}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

