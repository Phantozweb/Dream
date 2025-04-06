import { GoogleGenerativeAI } from "@google/generative-ai"
import { getCurrentUser, hasAIAccess } from "@/lib/auth"

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

// Helper function to check if a query is optometry-related using AI
async function isOptometryRelated(query: string): Promise<boolean> {
  try {
    const apiKey = "AIzaSyB6RHAgIkXqpRaOAjm8i-U4YqLyHT5BmLE"
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const prompt = `Determine if the following query is related to optometry, ophthalmology, eye health, vision, or eye care.
   
   Query: "${query}"
   
   Respond with only "YES" if it's related to eyes, vision, or optometry, or "NO" if it's completely unrelated.`

    const result = await model.generateContent(prompt)
    const response = result.response.text().trim().toUpperCase()

    return response === "YES"
  } catch (error) {
    console.error("Error checking if query is optometry-related:", error)

    // Fallback to keyword checking if AI check fails
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
}

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

    const { messages } = await req.json()

    // Get the last user message
    const lastUserMessage = messages[messages.length - 1].content

    // Check if the query is optometry-related
    const isOptometryQuery = await isOptometryRelated(lastUserMessage)

    if (!isOptometryQuery) {
      return Response.json({
        text: "I'm Focus.AI, an optometry specialist. I can only assist with questions related to eye health, vision care, and optometry. Please ask me about topics like eye anatomy, vision conditions, contact lenses, or other eye-related concerns.",
      })
    }

    // Use the Google Generative AI SDK with Gemini 2.0 Flash
    const apiKey =
      req.headers.get("x-gemini-api-key") || process.env.GEMINI_API_KEY || "AIzaSyB6RHAgIkXqpRaOAjm8i-U4YqLyHT5BmLE"
    const genAI = new GoogleGenerativeAI(apiKey)

    // Get the generative model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    })

    // Format the chat history
    const formattedHistory = formatChatHistory(messages.slice(0, -1))

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

      return Response.json({ text: responseText })
    } catch (aiError) {
      console.error("Error with Gemini API:", aiError)
      // Fallback to a structured response if the API fails
      return generateFallbackResponse(lastUserMessage)
    }
  } catch (error) {
    console.error("Error in chat API:", error)
    return Response.json({
      text: "# I apologize for the technical difficulty\n\nI encountered an error while processing your request. Please try again, perhaps with different wording.\n\n## Troubleshooting Tips\n- Make sure your question is related to optometry\n- Try breaking complex questions into simpler ones\n- Check your internet connection",
    })
  }
}

// Helper function to format chat history for the Gemini API
function formatChatHistory(messages: any[]) {
  return messages.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }))
}

// Fallback function to generate structured responses using Gemini-specific topics
async function generateFallbackResponse(query: string) {
  // Extract key terms from the query
  const queryLower = query.toLowerCase()
  let topic = "optometry"

  if (queryLower.includes("diabetic retinopathy")) {
    topic = "diabetic retinopathy"
  } else if (queryLower.includes("glaucoma")) {
    topic = "glaucoma"
  } else if (queryLower.includes("cataract")) {
    topic = "cataracts"
  } else if (queryLower.includes("myopia")) {
    topic = "myopia"
  } else if (queryLower.includes("contact lens")) {
    topic = "contact lenses"
  } else if (queryLower.includes("dry eye")) {
    topic = "dry eye syndrome"
  }

  // Generate a dynamic response based on the topic
  try {
    const apiKey = "AIzaSyB6RHAgIkXqpRaOAjm8i-U4YqLyHT5BmLE"
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }) // Updated to Gemini 2.0 Flash

    const prompt = `Generate a comprehensive overview of ${topic} in optometry. Include:
1. Definition and overview
2. Key clinical features
3. Diagnostic approach
4. Management strategies
5. Related questions that an optometry student might ask

Format your response in markdown with clear headings and bullet points.`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    if (responseText && responseText.trim() !== "") {
      return Response.json({ text: responseText })
    } else {
      throw new Error("Empty fallback response")
    }
  } catch (error) {
    console.error("Error generating fallback response:", error)

    // Static fallback if dynamic generation fails
    const fallbackResponse = `# ${topic.charAt(0).toUpperCase() + topic.slice(1)}\n\n## Overview\n${topic.charAt(0).toUpperCase() + topic.slice(1)} is an important topic in optometry that involves specific diagnostic and management approaches.\n\n## Key Clinical Features\n- Characteristic signs and symptoms\n- Potential complications if untreated\n- Variations in presentation\n\n## Diagnostic Approach\n- Comprehensive eye examination\n- Specific diagnostic tests\n- Differential diagnosis considerations\n\n## Management\n- Evidence-based treatment approaches\n- Patient education\n- Follow-up recommendations\n\n## Related Questions\n- What are the risk factors for ${topic}?\n- How is ${topic} diagnosed?\n- What are the latest treatments for ${topic}?\n- How does ${topic} affect quality of life?\n- What preventive measures can be taken for ${topic}?`

    return Response.json({ text: fallbackResponse })
  }
}

