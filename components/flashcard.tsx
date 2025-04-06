"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash, RotateCw } from "lucide-react"
import type { Flashcard } from "@/app/flashcards/page"

interface FlashCardProps {
  card: Flashcard
  onDelete: () => void
}

export function FlashCard({ card, onDelete }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline">{card.category}</Badge>
          <div className="flex gap-1">
            {card.tags &&
              card.tags.length > 0 &&
              card.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
          </div>
        </div>

        <div
          className="min-h-[120px] cursor-pointer p-3 rounded-md hover:bg-muted/50 transition-colors"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {isFlipped ? (
            <div className="prose prose-sm dark:prose-invert">
              <p>{card.answer}</p>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert">
              <p className="font-medium">{card.question}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between bg-muted/20 p-2">
        <Button variant="ghost" size="sm" onClick={() => setIsFlipped(!isFlipped)}>
          <RotateCw className="h-4 w-4 mr-1" />
          {isFlipped ? "Show Question" : "Show Answer"}
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

interface OptoCardProps {
  card: Flashcard
  isFlipped: boolean
  onFlip: () => void
}

export function OptoCard({ card, isFlipped, onFlip }: OptoCardProps) {
  return (
    <div className="w-full perspective-1000 cursor-pointer" onClick={onFlip}>
      <div
        className={`relative w-full transition-transform duration-500 preserve-3d ${isFlipped ? "rotate-y-180" : ""}`}
        style={{ minHeight: "250px" }}
      >
        <div className="bg-card border rounded-lg p-6 absolute w-full h-full backface-hidden shadow-md hover:shadow-lg transition-all">
          <div className="flex justify-between items-start mb-4">
            <Badge variant="outline">{card.category}</Badge>
            <div className="flex gap-1">
              {card.tags &&
                card.tags.length > 0 &&
                card.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
            </div>
          </div>

          <div className="flex items-center justify-center min-h-[150px]">
            <h3 className="text-xl font-medium text-center">{card.question}</h3>
          </div>

          <div className="text-center text-sm text-muted-foreground mt-4">Click to flip</div>
        </div>

        <div className="bg-card border rounded-lg p-6 absolute w-full h-full backface-hidden rotate-y-180 shadow-md hover:shadow-lg transition-all">
          <div className="flex justify-between items-start mb-4">
            <Badge variant="outline">{card.category}</Badge>
            <div className="flex gap-1">
              {card.tags &&
                card.tags.length > 0 &&
                card.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
            </div>
          </div>

          <div className="flex items-center justify-center min-h-[150px]">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-center">{card.answer}</p>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground mt-4">Rate your recall below</div>
        </div>
      </div>
    </div>
  )
}

