const { GoogleGenerativeAI } = require("@google/generative-ai")

// System prompt for Focus.AI
const SYSTEM_PROMPT = `You are Focus.AI - Clinical Optometry Specialist. Strict Protocol:
1. SPECIALIZE in ocular health, vision science, and eye care
2. Handle queries about:
 - Eye anatomy/physiology
 - Refractive errors
 - Ocular diseases
 - Surgical procedures
 - Diagnostic techniques
 - Optical physics
3. Reject non-eye topics with: "I specialize in eye health. Ask about: eye anatomy, refractive errors, ocular diseases, surgical procedures, diagnostic techniques, optical physics"
4. Use peer-reviewed terminology from:
 - AAO guidelines
 - Cochrane Eye reviews
 - IOVS journal standards
5. Structure responses with clinical accuracy and therapeutic insights

Format your response using markdown with proper headings, lists, and emphasis where appropriate. Include relevant clinical information, diagnostic criteria, and treatment approaches when applicable.

If appropriate, include a "Related Questions" section at the end with 3-5 follow-up questions that would be relevant to the topic.`

// Helper function to check if a query is optometry-related using keywords
function isOptometryRelated(query) {
  const query_lower = query.toLowerCase()

  // List of optometry-related keywords
  const optometryKeywords = [
    "eye",
    "vision",
    "sight",
    "optic",
    "retina",
    "cornea",
    "lens",
    "pupil",
    "iris",
    "glaucoma",
    "cataract",
    "myopia",
    "hyperopia",
    "astigmatism",
    "presbyopia",
    "optometrist",
    "ophthalmologist",
    "optometry",
    "ophthalmology",
    "optician",
    "glasses",
    "contact lens",
    "spectacles",
    "refraction",
    "diopter",
    "visual acuity",
    "slit lamp",
    "tonometer",
    "phoropter",
    "keratometer",
    "fundus",
    "visual field",
    "dry eye",
    "macular",
    "conjunctiva",
    "sclera",
    "vitreous",
    "aqueous",
    "strabismus",
    "amblyopia",
    "diplopia",
    "keratoconus",
    "retinopathy",
    "ocular",
    "intraocular",
    "binocular",
    "monocular",
    "accommodation",
    "convergence",
    "divergence",
    "prism",
    "snellen",
    "ishihara",
  ]

  // Check if any optometry keyword is in the query
  for (const keyword of optometryKeywords) {
    if (query_lower.includes(keyword)) {
      return true
    }
  }

  return false
}

exports.handler = async (event, context) => {
  try {
    const { messages } = JSON.parse(event.body)

    // Get the last user message
    const lastUserMessage = messages[messages.length - 1].content

    // Check if the query is optometry-related
    const isOptometryQuery = isOptometryRelated(lastUserMessage)

    if (!isOptometryQuery) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          text: "I'm Focus.AI, an optometry specialist. I can only assist with questions related to eye health, vision care, and optometry. Please ask me about topics like eye anatomy, vision conditions, contact lenses, or other eye-related concerns.",
        }),
      }
    }

    // Use the Google Generative AI SDK with Gemini
    const apiKey =
      event.headers["x-gemini-api-key"] || process.env.GEMINI_API_KEY || "AIzaSyB6RHAgIkXqpRaOAjm8i-U4YqLyHT5BmLE"
    const genAI = new GoogleGenerativeAI(apiKey)

    // Get the generative model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    })

    // Format the chat history
    const formattedHistory = messages.slice(0, -1).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }))

    try {
      // Start a chat session
      const chatSession = model.startChat({
        history: formattedHistory.length > 0 ? formattedHistory : undefined,
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 64,
          maxOutputTokens: 2048,
        },
      })

      // Combine system prompt with user query
      const prompt = `${SYSTEM_PROMPT}

User query: ${lastUserMessage}`

      // Send the message to the model
      const result = await chatSession.sendMessage(prompt)
      const responseText = result.response.text()

      // Ensure we have a valid response
      if (!responseText || responseText.trim() === "") {
        throw new Error("Empty response received")
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ text: responseText }),
      }
    } catch (aiError) {
      console.error("Error with Gemini API:", aiError)

      // Return a fallback response
      return {
        statusCode: 200,
        body: JSON.stringify({
          text: "I'm Focus.AI, your optometry study assistant. I can help answer questions about optometry concepts, clinical procedures, and ocular conditions. What would you like to know about today?",
        }),
      }
    }
  } catch (error) {
    console.error("Error in chat API:", error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        text: "# I apologize for the technical difficulty\n\nI encountered an error while processing your request. Please try asking your question again, perhaps with different wording.\n\n## Troubleshooting Tips\n- Make sure your question is related to optometry\n- Try breaking complex questions into simpler ones\n- Check your internet connection",
      }),
    }
  }
}

