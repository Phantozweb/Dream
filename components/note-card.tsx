"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, Edit, Eye, MoreVertical, Trash, Layers } from "lucide-react"

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

interface NoteCardProps {
  note: Note
  onPreview: (note: Note) => void
  onDelete: (id: string) => void
  onEdit: (note: Note) => void
  onDownload: (note: Note) => void
  onCreateFlashcards: (note: Note) => void
  bulkSelectMode: boolean
  isSelected: boolean
  onToggleSelect: (id: string) => void
}

export function NoteCard({
  note,
  onPreview,
  onDelete,
  onEdit,
  onDownload,
  onCreateFlashcards,
  bulkSelectMode,
  isSelected,
  onToggleSelect,
}: NoteCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Get a preview of the content (first 100 characters)
  const contentPreview =
    note.content
      .replace(/^#+ /gm, "") // Remove markdown headers
      .replace(/\*\*/g, "") // Remove bold markers
      .replace(/\n/g, " ") // Replace newlines with spaces
      .slice(0, 100) + (note.content.length > 100 ? "..." : "")

  return (
    <Card
      className={`relative border border-border/40 transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {bulkSelectMode && (
        <div className="absolute top-3 left-3 z-10">
          <Checkbox checked={isSelected} onCheckedChange={() => onToggleSelect(note.id)} />
        </div>
      )}

      <CardHeader className={bulkSelectMode ? "pl-10" : "p-4 pb-2"}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg line-clamp-1">{note.title}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <span>{note.subject}</span>
              <span>•</span>
              <span>{note.date}</span>
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onPreview(note)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(note)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit with AI
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload(note)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCreateFlashcards(note)}>
                <Layers className="h-4 w-4 mr-2" />
                Create Flashcards
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(note.id)} className="text-destructive">
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className={bulkSelectMode ? "pl-10" : "p-4 pt-2"}>
        <p className="text-sm text-muted-foreground line-clamp-3">{contentPreview}</p>
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {note.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {note.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{note.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className={bulkSelectMode ? "pl-10" : "p-4 pt-0"}>
        <Button variant="outline" size="sm" className="w-full" onClick={() => onPreview(note)}>
          <Eye className="h-4 w-4 mr-2" />
          View Note
        </Button>
      </CardFooter>
    </Card>
  )
}

