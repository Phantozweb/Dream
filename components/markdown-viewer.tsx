"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"
import { Button } from "@/components/ui/button"
import { Copy, Check, Download } from "lucide-react"
import { useState } from "react"

interface MarkdownViewerProps {
  content: string
  className?: string
  title?: string
}

export function MarkdownViewer({ content, className = "", title }: MarkdownViewerProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const downloadMarkdown = () => {
    const blob = new Blob([content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title || "note"}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`markdown-viewer ${className}`}>
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <Button variant="outline" size="sm" onClick={downloadMarkdown}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      )}
      <div className="prose prose-sm dark:prose-invert max-w-none">
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
                className="text-primary underline hover:text-primary/80"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              />
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
            tbody: ({ node, ...props }) => (
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800" {...props} />
            ),
            tr: ({ node, ...props }) => <tr className="hover:bg-gray-50 dark:hover:bg-gray-900" {...props} />,
            th: ({ node, ...props }) => (
              <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider" {...props} />
            ),
            td: ({ node, ...props }) => <td className="px-3 py-2 text-sm" {...props} />,
            hr: ({ node, ...props }) => <hr className="my-4 border-gray-300 dark:border-gray-700" {...props} />,
            img: ({ node, ...props }) => (
              <img className="max-w-full h-auto rounded-md my-2" {...props} alt={props.alt || "Image"} />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}

export default MarkdownViewer

