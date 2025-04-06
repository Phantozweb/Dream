"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Copy, Check, ExternalLink, Plus } from "lucide-react"
import { useState } from "react"

interface MarkdownRendererProps {
  content: string
  className?: string
  onQuestionClick?: (question: string) => void
}

export function MarkdownRenderer({ content, className = "", onQuestionClick }: MarkdownRendererProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  // Process related questions section
  const processedContent = processMarkdown(content)

  return (
    <div className={`markdown-content prose dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-3 mb-2" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-base font-bold mt-3 mb-1" {...props} />,
          h4: ({ node, ...props }) => <h4 className="text-base font-semibold mt-2 mb-1" {...props} />,
          p: ({ node, ...props }) => <p className="mb-2" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2" {...props} />,
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          a: ({ node, href, ...props }) => (
            <a
              className="text-primary underline hover:text-primary/80 inline-flex items-center gap-1"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {props.children}
              {href && !href.startsWith("#") && <ExternalLink className="h-3 w-3" />}
            </a>
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-primary/30 pl-4 italic my-2" {...props} />
          ),
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "")
            const code = String(children).replace(/\n$/, "")

            if (!inline && match) {
              return (
                <div className="relative group">
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm"
                      onClick={() => copyToClipboard(code)}
                    >
                      {copiedCode === code ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                  <pre className="rounded-md bg-gray-900 dark:bg-gray-950 p-4 overflow-x-auto text-sm my-2">
                    <code className={`language-${match[1]}`} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              )
            }

            return (
              <code className="bg-gray-200 dark:bg-gray-800 rounded px-1 py-0.5 text-sm font-mono" {...props}>
                {children}
              </code>
            )
          },
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <thead className="bg-gray-100 dark:bg-gray-800" {...props} />,
          tbody: ({ node, ...props }) => <tbody className="divide-y divide-gray-200 dark:divide-gray-800" {...props} />,
          tr: ({ node, ...props }) => <tr className="hover:bg-gray-50 dark:hover:bg-gray-900" {...props} />,
          th: ({ node, ...props }) => (
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider" {...props} />
          ),
          td: ({ node, ...props }) => <td className="px-3 py-2 text-sm" {...props} />,
          hr: ({ node, ...props }) => <hr className="my-4 border-gray-300 dark:border-gray-700" {...props} />,
          img: ({ node, ...props }) => (
            <img className="max-w-full h-auto rounded-md my-2" {...props} alt={props.alt || "Image"} />
          ),
          // Custom components for special markdown patterns
          div: ({ node, className, ...props }) => {
            if (className === "related-questions") {
              return (
                <Card className="mt-4 bg-muted/30">
                  <div className="p-4">
                    <h3 className="text-sm font-medium mb-2">Related Questions</h3>
                    <div className="grid grid-cols-1 gap-2">{props.children}</div>
                  </div>
                </Card>
              )
            }
            return <div className={className} {...props} />
          },
          // Handle related questions
          button: ({ node, ...props }) => {
            if (props.className === "related-question-btn") {
              return (
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start h-auto py-2 text-xs text-left"
                  onClick={() => onQuestionClick && onQuestionClick(props.children?.toString() || "")}
                >
                  <Plus className="h-3 w-3 mr-2 flex-shrink-0" />
                  <span>{props.children}</span>
                </Button>
              )
            }
            return <button {...props} />
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}

// Helper function to process markdown and add custom components
function processMarkdown(content: string): string {
  if (!content) return ""

  // Process related questions sections
  let processedContent = content

  // Find "Related Questions" section and transform it
  const relatedQuestionsRegex = /## Related Questions\s+((?:[-*]\s+.*\n?)+)/g
  const relatedQuestionsMatch = relatedQuestionsRegex.exec(content)

  if (relatedQuestionsMatch && relatedQuestionsMatch[1]) {
    const questionsBlock = relatedQuestionsMatch[1]
    const questions = questionsBlock
      .split("\n")
      .filter((line) => line.trim().startsWith("-") || line.trim().startsWith("*"))
      .map((line) => line.replace(/^[-*]\s+/, "").trim())
      .filter((q) => q)

    let replacementHtml = '<div class="related-questions">\n'
    questions.forEach((q) => {
      replacementHtml += `<button class="related-question-btn">${q}</button>\n`
    })
    replacementHtml += "</div>"

    processedContent = processedContent.replace(relatedQuestionsRegex, `## Related Questions\n\n${replacementHtml}`)
  }

  return processedContent
}

export default MarkdownRenderer

