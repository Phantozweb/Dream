import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: NextRequest) {
  try {
    const { topic, count, content } = await request.json()

    // Get API key from request headers or environment variables
    const apiKey = request.headers.get("x-gemini-api-key") || process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 })
    }

    // Initialize the Google Generative AI with the API key
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    // Prepare the prompt for flashcard generation
    const prompt = `
    Create ${count || 10} flashcards based on the following content about ${topic}. 
    Each flashcard should have a question and an answer.
    The questions should test understanding of key concepts.
    
    Content:
    ${content}
    
    Format your response as a valid JSON object with a "flashcards" array containing objects with "question" and "answer" properties.
    Example:
    {
      "flashcards": [
        {
          "question": "What is the definition of...",
          "answer": "The definition is..."
        },
        ...
      ]
    }
    `

    try {
      // Generate content using the Gemini model
      const result = await model.generateContent(prompt)
      const response = result.response
      const text = response.text()

      // Try to extract JSON from the response
      const jsonMatch =
        text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/) || text.match(/(\{[\s\S]*\})/)

      let jsonStr = jsonMatch ? jsonMatch[1] : text

      // Clean up the string to ensure it's valid JSON
      jsonStr = jsonStr
        .replace(/^```json/, "")
        .replace(/```$/, "")
        .trim()

      try {
        const parsedData = JSON.parse(jsonStr)

        // Ensure the response has the expected structure
        if (!parsedData.flashcards || !Array.isArray(parsedData.flashcards)) {
          throw new Error("Invalid response format")
        }

        return NextResponse.json(parsedData)
      } catch (jsonError) {
        console.error("JSON parsing error:", jsonError)

        // If JSON parsing fails, try to extract flashcards manually
        const manualFlashcards = extractFlashcardsManually(text)

        if (manualFlashcards.length > 0) {
          return NextResponse.json({ flashcards: manualFlashcards })
        }

        // If all else fails, create some basic flashcards from the content
        return NextResponse.json({
          flashcards: createBasicFlashcards(content, topic, count || 5),
        })
      }
    } catch (aiError) {
      console.error("AI generation error:", aiError)

      // Fallback to basic flashcards if AI generation fails
      return NextResponse.json({
        flashcards: createBasicFlashcards(content, topic, count || 5),
      })
    }
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Failed to generate flashcards" }, { status: 500 })
  }
}

// Helper function to extract flashcards manually from text
function extractFlashcardsManually(text) {
  const flashcards = []

  // Look for patterns like "Question: ... Answer: ..."
  const questionAnswerPairs = text.match(/Question:([^?]*?)\s*Answer:([^?]*?)(?=Question:|$)/gi)

  if (questionAnswerPairs) {
    questionAnswerPairs.forEach((pair) => {
      const question = pair.match(/Question:(.*?)(?=Answer:)/i)?.[1]?.trim()
      const answer = pair.match(/Answer:(.*?)$/i)?.[1]?.trim()

      if (question && answer) {
        flashcards.push({ question, answer })
      }
    })
  }

  return flashcards
}

// Helper function to create basic flashcards from content
function createBasicFlashcards(content, topic, count) {
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

