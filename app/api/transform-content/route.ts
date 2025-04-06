import { GoogleGenerativeAI } from "@google/generative-ai"
// Add authentication check to the API route
import { getCurrentUser, hasAIAccess } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    // Check authentication
    const user = getCurrentUser()
    if (!user || !hasAIAccess(user)) {
      return Response.json(
        {
          error: "Unauthorized",
          message: "You do not have access to this feature",
        },
        { status: 403 },
      )
    }

    const { content, action, instruction } = await req.json()

    if (!content) {
      return Response.json({ error: "Content is required" }, { status: 400 })
    }

    // Use the Google Generative AI SDK with Gemini 2.0 Flash
    const apiKey = req.headers.get("x-gemini-api-key") || "AIzaSyB6RHAgIkXqpRaOAjm8i-U4YqLyHT5BmLE"
    const genAI = new GoogleGenerativeAI(apiKey)

    const geminiModel = genAI.getGenerativeModel({
      model: "gemini-2.0-flash", // Updated to Gemini 2.0 Flash
    })

    // Determine the transformation prompt based on the action
    let prompt = ""
    switch (action) {
      case "simplify":
        prompt = `Simplify the following optometry-related content to make it easier to understand for a first-year optometry student, while maintaining accuracy. Use simpler language, avoid jargon where possible, and explain complex concepts clearly:

${content}`
        break
      case "expand":
        prompt = `Expand on the following optometry-related content with more details, examples, clinical applications, and explanations. Add relevant research findings, clinical pearls, and practical insights:

${content}`
        break
      case "summarize":
        prompt = `Summarize the following optometry-related content into a concise format while preserving the key points. Focus on the most important clinical information and core concepts:

${content}`
        break
      case "clinical":
        prompt = `Reframe the following optometry-related content to focus on clinical applications and practical scenarios. Include diagnostic approaches, management strategies, and clinical decision-making considerations:

${content}`
        break
      case "student":
        prompt = `Rewrite the following optometry-related content in a student-friendly way, using simpler language, adding helpful analogies, mnemonics, and focusing on key concepts that students need to understand. Include study tips and clinical pearls:

${content}`
        break
      case "format-tables":
        prompt = `Reformat the following optometry case study to ensure all tables are properly formatted with markdown. 
Ensure visual acuity, refraction data, and prescription information are in clean, well-structured tables.
Maintain all the original content but improve the formatting:

${content}`
        break
      case "custom":
        // Use the custom instruction provided by the user
        if (!instruction) {
          return Response.json({ error: "Custom instruction is required" }, { status: 400 })
        }
        prompt = `${instruction}:

${content}`
        break
      case "original":
        // Just return the original content
        return Response.json({
          transformedContent: content,
          action,
        })
      default:
        return Response.json({ error: "Invalid transformation action" }, { status: 400 })
    }

    const result = await geminiModel.generateContent(prompt)
    const transformedContent = result.response.text()

    return Response.json({
      transformedContent,
      action,
    })
  } catch (error) {
    console.error("Error transforming content:", error)
    return Response.json(
      {
        error: "An error occurred while transforming the content",
        transformedContent: "Failed to transform the content. Please try again.",
      },
      { status: 500 },
    )
  }
}

