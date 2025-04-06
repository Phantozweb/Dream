const { GoogleGenerativeAI } = require("@google/generative-ai")

exports.handler = async (event, context) => {
  try {
    const { content } = JSON.parse(event.body)

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

      return {
        statusCode: 200,
        body: JSON.stringify({ questions: questions.slice(0, 5) }),
      }
    } catch (aiError) {
      console.error("Error generating related questions with Gemini:", aiError)

      // Fallback to topic-based questions
      return generateTopicBasedQuestions(content)
    }
  } catch (error) {
    console.error("Error in related questions API:", error)
    return {
      statusCode: 200,
      body: JSON.stringify({
        questions: [
          "What are the symptoms of diabetic retinopathy?",
          "How is glaucoma diagnosed?",
          "What are the different types of contact lenses?",
          "How does myopia develop?",
          "What treatments are available for dry eye?",
        ],
      }),
    }
  }
}

// Fallback function to generate topic-based questions
function generateTopicBasedQuestions(content) {
  const contentLower = content.toLowerCase()
  let questions = []

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

  return {
    statusCode: 200,
    body: JSON.stringify({ questions }),
  }
}

