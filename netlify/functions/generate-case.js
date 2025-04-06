const { GoogleGenerativeAI } = require("@google/generative-ai")

exports.handler = async (event, context) => {
  try {
    const { condition } = JSON.parse(event.body)

    // Use the Google Generative AI SDK
    const apiKey =
      event.headers["x-gemini-api-key"] || process.env.GEMINI_API_KEY || "AIzaSyB6RHAgIkXqpRaOAjm8i-U4YqLyHT5BmLE"
    const genAI = new GoogleGenerativeAI(apiKey)

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    })

    // First, generate patient demographics
    const namePrompt = `Generate a realistic Tamil name for a patient with ${condition}. The name should be written in English, with an initial followed by the first name (e.g., "R. Kumar", "S. Priya"). Do NOT include caste names or surnames. Return ONLY the name in the format "Initial. FirstName", nothing else.`
    const nameResult = await model.generateContent(namePrompt)
    const patientName = nameResult.response.text().trim()

    const agePrompt = `What would be an appropriate age for a typical patient with ${condition}? Return ONLY a number between 5 and 85, nothing else.`
    const ageResult = await model.generateContent(agePrompt)
    const ageText = ageResult.response.text().trim()
    const patientAge = Number.parseInt(ageText) || Math.floor(Math.random() * 60) + 20 // Fallback to random age if parsing fails

    const genderPrompt = `What would be a typical gender for a patient named ${patientName} with ${condition}? Return ONLY "male" or "female", nothing else.`
    const genderResult = await model.generateContent(genderPrompt)
    const patientGender = genderResult.response.text().trim().toLowerCase().includes("female") ? "female" : "male"

    const occupationPrompt = `Generate a realistic occupation for a ${patientAge}-year-old ${patientGender} in Tamil Nadu, India. Return ONLY the occupation, nothing else.`
    const occupationResult = await model.generateContent(occupationPrompt)
    const patientOccupation = occupationResult.response.text().trim()

    const cities = [
      "Chennai",
      "Coimbatore",
      "Madurai",
      "Tiruchirappalli",
      "Salem",
      "Tirunelveli",
      "Erode",
      "Vellore",
      "Thanjavur",
      "Dindigul",
    ]
    const patientLocation = `${cities[Math.floor(Math.random() * cities.length)]}, Tamil Nadu`

    // Create patient info object
    const patientInfo = {
      name: patientName || "R. Kumar", // Fallback to a simple Tamil name
      age: patientAge,
      gender: patientGender,
      occupation: patientOccupation || "software engineer", // Fallback occupation
      location: patientLocation,
    }

    // Generate the full case study
    const caseStudyPrompt = `Generate a detailed, authentic optometry case study about ${condition} with Indian patient (Tamil name: ${patientInfo.name}).
      
Structure it as a professional medical record with:
1. Patient demographics (name: ${patientInfo.name}, age: ${patientInfo.age}, gender: ${patientInfo.gender}, occupation: ${patientInfo.occupation}, location: ${patientInfo.location}) in a separate dedicated table
2. Chief complaint & detailed history (include duration, severity, associated symptoms)
3. Ocular examination 
  - Visual acuity (uncorrected and best corrected) for both eyes in table format using 6/6 notation (NOT 20/20)
  - Refraction data (spherical, cylindrical, axis, add) in table format
  - Biomicroscopy findings (lids, conjunctiva, cornea, anterior chamber, iris, lens)
  - Fundus examination findings
  - IOP measurements
  - Additional tests specific to the condition
4. Assessment/diagnosis with detailed explanation
5. Management plan including:
  - Detailed prescription in table format
  - Medications with dosage
  - Patient education
  - Follow-up recommendations

Format all tables cleanly with proper headers and aligned data. Put patient demographics in a well-structured table separate from other data. Use medical terminology but include explanations where needed.

DO NOT include any educational questions in the case study itself. The case study should be purely clinical.`

    const result = await model.generateContent(caseStudyPrompt)
    const caseStudyText = result.response.text()

    // Generate educational questions separately
    const questionsPrompt = `Create 5 educational questions with detailed answers about ${condition} that would be relevant for optometry students studying this case.

Each question should:
1. Be directly related to the clinical aspects, diagnosis, or management of ${condition}
2. Test understanding of key concepts relevant to this condition
3. Have a comprehensive answer that includes clinical pearls and evidence-based information

DO NOT include any meta-text like "I'll create questions" or "Since I don't have access to the case". Just provide the questions and answers directly.

Format each question and answer with proper markdown:

## Question 1
[Question text]

### Answer
[Detailed answer with proper formatting, bullet points where appropriate]

## Question 2
[Question text]

And so on for 5 questions. Focus on diagnosis, treatment options, prognosis, and key clinical pearls.`

    const questionsResult = await model.generateContent(questionsPrompt)
    const questionsText = questionsResult.response.text()

    // Parse the questions into structured format
    const questionBlocks = questionsText.split(/## Question \d+/g).filter((block) => block.trim().length > 0)

    const questions = questionBlocks.map((block, index) => {
      const [questionText, answerText] = block.split(/### Answer|### Response|## Answer/i, 2)

      return {
        id: index + 1,
        question: questionText ? questionText.trim() : `Question ${index + 1}`,
        answer: answerText ? answerText.trim() : "No answer provided.",
      }
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        caseStudy: caseStudyText.trim(),
        questions: questions.length > 0 ? questions : parseQuestionsFromText(questionsText || ""),
        patientInfo,
        condition,
      }),
    }
  } catch (error) {
    console.error("Error generating case study:", error)

    // Generate a simple fallback case study
    const fallbackPatientInfo = {
      name: "R. Kumar",
      age: 45,
      gender: "male",
      occupation: "software engineer",
      location: "Chennai, Tamil Nadu",
    }

    let fallbackCaseStudy = `# Case Study: ${condition}\n\n`
    fallbackCaseStudy += `## Patient Information\n\n`
    fallbackCaseStudy += `${fallbackPatientInfo.name}, a ${fallbackPatientInfo.age}-year-old ${fallbackPatientInfo.gender} ${fallbackPatientInfo.occupation} from ${fallbackPatientInfo.location}, presented with symptoms related to ${condition}.\n\n`
    fallbackCaseStudy += `## Chief Complaint\n\nThe patient reported typical symptoms associated with ${condition}.\n\n`
    fallbackCaseStudy += `## Examination\n\nA comprehensive eye examination was performed.\n\n`
    fallbackCaseStudy += `## Diagnosis\n\nBased on the clinical findings, a diagnosis of ${condition} was made.\n\n`
    fallbackCaseStudy += `## Management\n\nStandard treatment protocols for ${condition} were recommended.`

    const fallbackQuestions = [
      {
        id: 1,
        question: `What are the typical symptoms of ${condition}?`,
        answer: `${condition} typically presents with several characteristic symptoms that optometrists should be aware of.`,
      },
      {
        id: 2,
        question: `What are the diagnostic criteria for ${condition}?`,
        answer: `Diagnosis of ${condition} involves careful clinical assessment and specific diagnostic tests.`,
      },
      {
        id: 3,
        question: `What treatment options are available for ${condition}?`,
        answer: `Treatment for ${condition} may include various approaches depending on severity and patient factors.`,
      },
    ]

    return {
      statusCode: 200,
      body: JSON.stringify({
        caseStudy: fallbackCaseStudy,
        questions: fallbackQuestions,
        patientInfo: fallbackPatientInfo,
        condition,
      }),
    }
  }
}

// Helper function to parse questions from text if the structured approach fails
function parseQuestionsFromText(text) {
  if (!text || text.trim() === "") return []

  const questions = []
  const questionMatches = text.match(/(?:Question|Q)[\s\d.:]+(.*?)(?=(?:Answer|A)[\s\d.:]|$)/gi)
  const answerMatches = text.match(/(?:Answer|A)[\s\d.:]+(.*?)(?=(?:Question|Q)[\s\d.:]|$)/gi)

  if (questionMatches && answerMatches) {
    const count = Math.min(questionMatches.length, answerMatches.length)

    for (let i = 0; i < count; i++) {
      const questionText = questionMatches[i].replace(/(?:Question|Q)[\s\d.:]*/i, "").trim()
      const answerText = answerMatches[i].replace(/(?:Answer|A)[\s\d.:]*/i, "").trim()

      questions.push({
        id: i + 1,
        question: questionText,
        answer: answerText,
      })
    }
  }

  return questions
}

