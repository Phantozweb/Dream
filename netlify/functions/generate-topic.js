const { GoogleGenerativeAI } = require("@google/generative-ai")

exports.handler = async (event, context) => {
  try {
    const { topic } = JSON.parse(event.body)

    // Use the Google Generative AI SDK
    const apiKey = process.env.GEMINI_API_KEY || "AIzaSyB6RHAgIkXqpRaOAjm8i-U4YqLyHT5BmLE"
    const genAI = new GoogleGenerativeAI(apiKey)

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    })

    const prompt = `Generate comprehensive educational content about the optometry topic: "${topic}".

Include the following sections:
1. Overview: A brief introduction to the topic
2. Key Concepts: The main principles or ideas related to the topic
3. Clinical Relevance: How this topic applies to optometric practice
4. Techniques or Procedures: Any specific methods related to this topic
5. Case Examples: Brief examples illustrating the topic in practice
6. Recent Developments: Current research or advances in this area
7. Study Questions: 3-5 questions to test understanding of the material

Format the content with clear headings, bullet points, and concise explanations. Make the content educational, accurate, and helpful for optometry students studying this topic.

Make sure to include relevant terminology, concepts, and clinical applications that would be covered in an optometry curriculum.`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    return {
      statusCode: 200,
      body: JSON.stringify({ content: text }),
    }
  } catch (error) {
    console.error("Error generating topic content:", error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to generate topic content",
        content: `# ${topic || "Requested Topic"}\n\nContent generation failed. Please try again.`,
      }),
    }
  }
}

