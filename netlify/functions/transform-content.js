const { GoogleGenerativeAI } = require("@google/generative-ai")

exports.handler = async (event, context) => {
  try {
    const { content, action, instruction } = JSON.parse(event.body)

    if (!content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Content is required" }),
      }
    }

    // Use the Google Generative AI SDK
    const apiKey =
      event.headers["x-gemini-api-key"] || process.env.GEMINI_API_KEY || "AIzaSyB6RHAgIkXqpRaOAjm8i-U4YqLyHT5BmLE"
    const genAI = new GoogleGenerativeAI(apiKey)

    const geminiModel = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
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
      case "custom":
        // Use the custom instruction provided by the user
        if (!instruction) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: "Custom instruction is required" }),
          }
        }
        prompt = `${instruction}:

${content}`
        break
      case "original":
        // Just return the original content
        return {
          statusCode: 200,
          body: JSON.stringify({
            transformedContent: content,
            action,
          }),
        }
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Invalid transformation action" }),
        }
    }

    const result = await geminiModel.generateContent(prompt)
    const transformedContent = result.response.text()

    return {
      statusCode: 200,
      body: JSON.stringify({
        transformedContent,
        action,
      }),
    }
  } catch (error) {
    console.error("Error transforming content:", error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "An error occurred while transforming the content",
        transformedContent: "Failed to transform the content. Please try again.",
      }),
    }
  }
}

