import { GoogleGenerativeAI } from "@google/generative-ai"
// Add authentication check to the API route
import { getCurrentUser, hasAIAccess } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user || !hasAIAccess(user)) {
      return Response.json(
        {
          error: "Unauthorized",
          message: "You do not have access to this feature",
        },
        { status: 403 },
      )
    }

    const { topic, subject, detail = "medium" } = await req.json()

    // Adjust detail level based on input
    let detailPrompt = ""
    switch (detail) {
      case "basic":
        detailPrompt = "Create concise, beginner-friendly notes with fundamental concepts and simple explanations."
        break
      case "comprehensive":
        detailPrompt =
          "Create in-depth, advanced notes with detailed explanations, clinical applications, and recent research findings."
        break
      default: // medium
        detailPrompt = "Create balanced notes with key concepts, clinical relevance, and practical applications."
    }

    const prompt = `Generate comprehensive, well-structured study notes on the optometry topic: "${topic}" related to the subject area of ${subject}.
   
    ${detailPrompt}
    
    The notes should include:
    1. A clear title and introduction to the topic
    2. Key concepts and definitions
    3. Clinical relevance and applications
    4. Diagnostic and management approaches if applicable
    5. Recent developments or research in this area
    6. Summary of main points
    
    Format the notes with proper headings, subheadings, bullet points, and numbered lists where appropriate. The content should be accurate, educational, and useful for optometry students.`

    // Use the Google Generative AI SDK
    const apiKey =
      req.headers.get("x-gemini-api-key") || process.env.GEMINI_API_KEY || "AIzaSyB6RHAgIkXqpRaOAjm8i-U4YqLyHT5BmLE"
    const genAI = new GoogleGenerativeAI(apiKey)

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // Use a more reliable model
    })

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    return Response.json({ content: text })
  } catch (error) {
    console.error("Error generating notes:", error)

    // Generate a simple fallback response
    const { topic } = await req.json()
    return Response.json(
      {
        content: `# ${topic || "Requested Topic"}

## Overview
${topic || "This topic"} is an important area in optometry that involves specific principles and clinical applications.

## Key Concepts
- Basic principles and terminology
- Clinical significance in optometry practice
- Diagnostic considerations

## Clinical Applications
- How this knowledge is applied in clinical settings
- Patient management considerations
- Best practices for assessment

## Summary
Understanding ${topic || "this topic"} is essential for comprehensive optometric care and patient management.
`,
        error: "Failed to generate detailed notes",
      },
      { status: 200 },
    ) // Return 200 even for fallback to prevent cascading errors
  }
}

