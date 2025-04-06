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

    const { topic, difficulty, numberOfQuestions } = await req.json()

    // Use the hardcoded API key if none is provided
    const apiKey = req.headers.get("x-gemini-api-key") || "AIzaSyB6RHAgIkXqpRaOAjm8i-U4YqLyHT5BmLE"
    const genAI = new GoogleGenerativeAI(apiKey)

    const geminiModel = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    })

    const prompt = `Generate a ${difficulty} difficulty quiz about ${topic} in optometry with ${numberOfQuestions} multiple choice questions. 

For each question:
1. Provide a clear, concise question about ${topic}
2. Provide exactly 4 answer options labeled A, B, C, and D
3. Indicate which option is correct
4. Provide a brief explanation of why the answer is correct

Make the questions challenging but fair for optometry students.

Format the response as follows for each question:

Question: [Question text]
A. [Option A]
B. [Option B]
C. [Option C]
D. [Option D]
Correct Answer: [A, B, C, or D]
Explanation: [Explanation text]

Ensure all questions are properly separated and clearly formatted. Make sure the questions are clinically accurate and reflect current optometry practice.`

    try {
      const result = await geminiModel.generateContent(prompt)
      const content = result.response.text()

      // Parse the content into structured quiz format
      const questions = []
      const questionRegex =
        /Question:\s+(.*?)\s+A\.\s+(.*?)\s+B\.\s+(.*?)\s+C\.\s+(.*?)\s+D\.\s+(.*?)\s+Correct Answer:\s+([A-D])\s+Explanation:\s+(.*?)(?=Question:|$)/gs

      let match
      while ((match = questionRegex.exec(content + "\nQuestion: ")) !== null) {
        questions.push({
          id: questions.length + 1,
          text: match[1].trim(),
          options: [
            { id: "A", text: match[2].trim() },
            { id: "B", text: match[3].trim() },
            { id: "C", text: match[4].trim() },
            { id: "D", text: match[5].trim() },
          ],
          correctAnswer: match[6].trim(),
          explanation: match[7].trim(),
        })
      }

      // If regex parsing failed, try alternative parsing
      if (questions.length === 0) {
        return Response.json({
          title: `${difficulty} Quiz on ${topic}`,
          questions: parseQuizFallback(content),
        })
      }

      return Response.json({
        title: `${difficulty} Quiz on ${topic}`,
        questions,
      })
    } catch (error) {
      console.error("Error generating quiz with Gemini:", error)

      // Return a mock quiz if all API attempts fail
      return Response.json({
        title: `${difficulty} Quiz on ${topic}`,
        questions: [
          {
            id: 1,
            text: "What is the most likely classification of diabetic retinopathy in this patient?",
            options: [
              { id: "A", text: "Mild non-proliferative diabetic retinopathy" },
              { id: "B", text: "Moderate non-proliferative diabetic retinopathy" },
              { id: "C", text: "Severe non-proliferative diabetic retinopathy" },
              { id: "D", text: "Proliferative diabetic retinopathy" },
            ],
            correctAnswer: "B",
            explanation:
              "The presence of multiple microaneurysms, dot/blot hemorrhages, hard exudates, and mild venous beading indicates moderate NPDR. Severe NPDR would require more extensive hemorrhages, venous beading in 2+ quadrants, or IRMA, while PDR would show neovascularization.",
          },
          {
            id: 2,
            text: "What OCT finding is most consistent with diabetic macular edema in this patient?",
            options: [
              { id: "A", text: "Epiretinal membrane" },
              { id: "B", text: "Cystoid spaces and increased retinal thickness" },
              { id: "C", text: "Drusen" },
              { id: "D", text: "Vitreomacular traction" },
            ],
            correctAnswer: "B",
            explanation:
              "Cystoid spaces and increased retinal thickness (310μm OD and 375μm OS) are characteristic OCT findings in diabetic macular edema. Normal central retinal thickness is approximately 250μm.",
          },
          {
            id: 3,
            text: "What is the first-line treatment for center-involving diabetic macular edema?",
            options: [
              { id: "A", text: "Observation" },
              { id: "B", text: "Focal laser photocoagulation" },
              { id: "C", text: "Intravitreal anti-VEGF injections" },
              { id: "D", text: "Topical NSAIDs" },
            ],
            correctAnswer: "C",
            explanation:
              "Intravitreal anti-VEGF injections are the first-line treatment for center-involving DME based on multiple clinical trials showing superior visual outcomes compared to laser photocoagulation.",
          },
        ],
      })
    }
  } catch (error) {
    console.error("Error in generate-quiz API route:", error)
    return Response.json(
      {
        title: "Error",
        questions: [
          {
            id: 1,
            text: "An error occurred while generating the quiz. Please try again.",
            options: [
              { id: "A", text: "Retry with a different topic" },
              { id: "B", text: "Retry with fewer questions" },
              { id: "C", text: "Check your internet connection" },
              { id: "D", text: "Contact support if the issue persists" },
            ],
            correctAnswer: "A",
            explanation: "Sometimes changing the topic can help avoid generation issues.",
          },
        ],
      },
      { status: 200 }, // Return 200 even for errors to prevent cascading failures
    )
  }
}

// Helper function to parse questions from text if the regex approach fails
function parseQuizFallback(content: string) {
  const questions = []
  const lines = content.split("\n")

  let currentQuestion: any = null
  let collectingOptions = false
  let collectingExplanation = false

  for (const line of lines) {
    const trimmedLine = line.trim()

    // New question starts with "Question:" or a number followed by a period
    if (trimmedLine.startsWith("Question:") || /^\d+\./.test(trimmedLine)) {
      if (currentQuestion) {
        questions.push(currentQuestion)
      }

      const questionText = trimmedLine.replace(/^Question:\s+|^\d+\.\s+/, "")
      currentQuestion = {
        id: questions.length + 1,
        text: questionText,
        options: [],
        correctAnswer: "",
        explanation: "",
      }

      collectingOptions = true
      collectingExplanation = false
    }
    // Option line
    else if (collectingOptions && /^[A-D]\./.test(trimmedLine)) {
      const optionId = trimmedLine[0]
      const optionText = trimmedLine.substring(2).trim()

      if (currentQuestion) {
        currentQuestion.options.push({
          id: optionId,
          text: optionText,
        })
      }
    }
    // Correct answer line
    else if (/^(?:Correct Answer:|Answer:)\s+([A-D])/.test(trimmedLine)) {
      collectingOptions = false
      const match = trimmedLine.match(/^(?:Correct Answer:|Answer:)\s+([A-D])/)
      if (match && currentQuestion) {
        currentQuestion.correctAnswer = match[1]
      }
    }
    // Explanation line
    else if (/^(?:Explanation:|Why:)/.test(trimmedLine)) {
      collectingOptions = false
      collectingExplanation = true

      if (currentQuestion) {
        currentQuestion.explanation = trimmedLine.replace(/^(?:Explanation:|Why:)\s+/, "")
      }
    }
    // Continue collecting explanation
    else if (collectingExplanation && currentQuestion) {
      currentQuestion.explanation += " " + trimmedLine
    }
  }

  // Add the last question
  if (currentQuestion && currentQuestion.text) {
    questions.push(currentQuestion)
  }

  // If we still don't have any questions, create a fallback
  if (questions.length === 0) {
    questions.push({
      id: 1,
      text: "What is the most likely classification of diabetic retinopathy in this patient?",
      options: [
        { id: "A", text: "Mild non-proliferative diabetic retinopathy" },
        { id: "B", text: "Moderate non-proliferative diabetic retinopathy" },
        { id: "C", text: "Severe non-proliferative diabetic retinopathy" },
        { id: "D", text: "Proliferative diabetic retinopathy" },
      ],
      correctAnswer: "B",
      explanation:
        "The presence of multiple microaneurysms, dot/blot hemorrhages, hard exudates, and mild venous beading indicates moderate NPDR.",
    })
  }

  return questions
}

