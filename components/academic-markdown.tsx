"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, FileText, Printer } from "lucide-react"

interface AcademicMarkdownProps {
  content: string
  title?: string
  onDownloadMd?: () => void
  onDownloadPdf?: () => void
}

export function AcademicMarkdown({
  content,
  title = "Academic Content",
  onDownloadMd,
  onDownloadPdf,
}: AcademicMarkdownProps) {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: system-ui, sans-serif; line-height: 1.5; padding: 2rem; }
            h1, h2, h3, h4 { margin-top: 1.5em; }
            p, ul, ol { margin-bottom: 1em; }
            code { background: #f0f0f0; padding: 0.2em 0.4em; border-radius: 3px; }
            pre { background: #f0f0f0; padding: 1em; border-radius: 5px; overflow-x: auto; }
            blockquote { border-left: 4px solid #ddd; padding-left: 1em; font-style: italic; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${content}
        </body>
      </html>
    `)

    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        {onDownloadMd && (
          <Button variant="outline" size="sm" onClick={onDownloadMd}>
            <FileText className="h-4 w-4 mr-2" />
            Download MD
          </Button>
        )}
        {onDownloadPdf && (
          <Button variant="outline" size="sm" onClick={onDownloadPdf}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>

      <Card className="p-6">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </Card>
    </div>
  )
}

