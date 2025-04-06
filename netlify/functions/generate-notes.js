const { GoogleGenerativeAI } = require("@google/generative-ai")

exports.handler = async (event, context) => {
  try {
    const { topic, subject, detail = "medium" } = JSON.parse(event.body)

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

    // Use Gemini for note generation
    const apiKey =
      event.headers["x-gemini-api-key"] || process.env.GEMINI_API_KEY || "AIzaSyB6RHAgIkXqpRaOAjm8i-U4YqLyHT5BmLE"
    const genAI = new GoogleGenerativeAI(apiKey)

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    })

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    return {
      statusCode: 200,
      body: JSON.stringify({ content: text }),
    }
  } catch (error) {
    console.error("Error generating notes:", error)

    // Fallback response
    return {
      statusCode: 500,
      body: JSON.stringify({
        content: `# ${topic || "Requested Topic"}\n\nUnable to generate detailed notes at this time. Please try again later.`,
        error: "Failed to generate notes",
      }),
    }
  }
}

