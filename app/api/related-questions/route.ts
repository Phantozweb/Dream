import { GoogleGenerativeAI } from "@google/generative-ai"
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

    const { content } = await req.json()

    if (!content) {
      return Response.json({ error: "Content is required" }, { status: 400 })
    }

    // Use the Google Generative AI SDK with Gemini 2.0 Flash
    const apiKey = req.headers.get("x-gemini-api-key") || "AIzaSyB6RHAgIkXqpRaOAjm8i-U4YqLyHT5BmLE"
    const genAI = new GoogleGenerativeAI(apiKey)

    const geminiModel = genAI.getGenerativeModel({
      model: "gemini-2.0-flash", // Updated to Gemini 2.0 Flash
    })

    const prompt = `Based on the following optometry-related content, generate 5 related follow-up questions that a student might want to ask next. Make the questions specific, relevant, and educational. Format each question on a new line with a number and a question mark at the end.

Content: ${content}`

    try {
      const result = await geminiModel.generateContent(prompt)
      const responseText = result.response.text()

      // Parse the questions from the response
      const questions = responseText
        .split("\n")
        .filter((line) => /^\d+\./.test(line.trim()))
        .map((line) => line.replace(/^\d+\.\s+/, "").trim())
        .filter((question) => question.length > 0)

      return Response.json({ questions: questions.slice(0, 5) })
    } catch (aiError) {
      console.error("Error generating related questions with Gemini:", aiError)

      // Fallback to topic-based questions
      return generateTopicBasedQuestions(content)
    }
  } catch (error) {
    console.error("Error in related questions API:", error)
    return Response.json({
      questions: [
        "What are the symptoms of diabetic retinopathy?",
        "How is glaucoma diagnosed?",
        "What are the different types of contact lenses?",
        "How does myopia develop?",
        "What treatments are available for dry eye?",
      ],
    })
  }
}

// Fallback function to generate topic-based questions
function generateTopicBasedQuestions(content: string) {
  const contentLower = content.toLowerCase()
  let questions: string[] = []

  if (contentLower.includes("diabetic retinopathy")) {
    questions = [
      "What are the stages of diabetic retinopathy?",
      "How is diabetic retinopathy diagnosed?",
      "What treatments are available for diabetic retinopathy?",
      "Can diabetic retinopathy be prevented?",
      "How often should diabetic patients have eye exams?",
    ]
  } else if (contentLower.includes("glaucoma")) {
    questions = [
      "What are the different types of glaucoma?",
      "How is intraocular pressure measured?",
      "What medications are used to treat glaucoma?",
      "Is glaucoma hereditary?",
      "What visual field tests are used for glaucoma?",
    ]
  } else if (contentLower.includes("contact lens")) {
    questions = [
      "What are the differences between soft and RGP lenses?",
      "How do you fit toric contact lenses?",
      "What are multifocal contact lenses?",
      "How do you manage contact lens-related dry eye?",
      "What are scleral contact lenses used for?",
    ]
  } else if (contentLower.includes("myopia")) {
    questions = [
      "What causes myopia progression in children?",
      "How effective is orthokeratology for myopia control?",
      "What are low-dose atropine treatments for myopia?",
      "How do multifocal lenses help with myopia control?",
      "What is the relationship between screen time and myopia?",
    ]
  } else if (contentLower.includes("dry eye")) {
    questions = [
      "What are the main causes of dry eye syndrome?",
      "How do you diagnose meibomian gland dysfunction?",
      "What treatments are available for severe dry eye?",
      "How do punctal plugs work for dry eye?",
      "What lifestyle changes can help with dry eye symptoms?",
    ]
  } else {
    // Default questions
    questions = [
      "What are the symptoms of diabetic retinopathy?",
      "How is glaucoma diagnosed?",
      "What are the different types of contact lenses?",
      "How does myopia develop?",
      "What treatments are available for dry eye?",
    ]
  }

  return Response.json({ questions })
}

