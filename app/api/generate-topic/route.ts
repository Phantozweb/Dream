import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { topic, level = "topic" } = await request.json()

    // Use environment variable from .env file
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.error("GEMINI_API_KEY not found in environment variables")
      return NextResponse.json(
        {
          content: generateFallbackContent(topic, level),
          error: "API key not configured",
        },
        { status: 200 },
      )
    }

    // Initialize the Google Generative AI with the API key
    const genAI = new GoogleGenerativeAI(apiKey)

    // Select the model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    })

    // Create the prompt based on the level
    const prompt = createPrompt(topic, level)

    try {
      // Generate content using the AI model
      const result = await model.generateContent(prompt)
      const text = result.response.text()

      // Clean up any remaining meta-text
      const cleanedText = text
        .replace(/^(I've generated|I have generated|Here's|Here is|I've created|I have created).*?\n/i, "")
        .replace(/^(Let me provide|Let's explore|I'll provide).*?\n/i, "")
        .replace(/^(Here are|The following is).*?\n/i, "")
        .trim()

      // Convert the markdown to HTML for rendering
      const htmlContent = markdownToHtml(cleanedText)

      return NextResponse.json({ content: htmlContent })
    } catch (aiError) {
      console.error("Error generating content with AI:", aiError)
      return NextResponse.json({ content: generateFallbackContent(topic, level) }, { status: 200 })
    }
  } catch (error) {
    console.error("Error in API route:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

// Create prompt based on the level
function createPrompt(topic: string, level: string): string {
  if (level === "topic") {
    return `Generate comprehensive educational content about the optometry topic: "${topic}".

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
  } else if (level === "unit") {
    return `Generate a comprehensive unit overview for the optometry unit: "${topic}".

Include the following sections:
1. Unit Overview: A brief introduction to this unit and its place in the curriculum
2. Learning Objectives: What students should learn from this unit
3. Key Topics: The main topics covered in this unit with brief explanations
4. Clinical Applications: How the unit content applies to clinical practice
5. Study Resources: Recommended textbooks, journals, or online resources
6. Assessment Preparation: Tips for studying this unit effectively

Format the content with clear headings, bullet points, and concise explanations. Make the content educational, accurate, and helpful for optometry students studying this unit.

Make sure to include relevant terminology, concepts, and clinical applications that would be covered in this optometry unit.`
  } else {
    return `Generate a comprehensive subject overview for the optometry subject: "${topic}".

Include the following sections:
1. Subject Introduction: What this subject covers and why it's important in optometry
2. Curriculum Structure: How this subject is typically structured in optometry programs
3. Key Units: The main units or modules typically included in this subject
4. Learning Outcomes: What students should achieve by studying this subject
5. Career Relevance: How this subject applies to optometric practice
6. Advanced Pathways: How this subject connects to advanced study or specialization
7. Study Strategies: Effective approaches to mastering this subject

Format the content with clear headings, bullet points, and concise explanations. Make the content educational, accurate, and helpful for optometry students.

Make sure to include relevant terminology, concepts, and clinical applications that would be covered in this optometry subject.`
  }
}

// Simple markdown to HTML converter
function markdownToHtml(markdown: string): string {
  // This is a very basic converter - in a real app, you'd use a proper markdown library
  const html = markdown
    // Headers
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/^#### (.*$)/gm, "<h4>$1</h4>")

    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")

    // Lists
    .replace(/^\s*\d+\.\s+(.*$)/gm, "<ol><li>$1</li></ol>")
    .replace(/^\s*[-*]\s+(.*$)/gm, "<ul><li>$1</li></ul>")

    // Links
    .replace(/\[(.*?)\]$$(.*?)$$/g, '<a href="$2">$1</a>')

    // Blockquotes
    .replace(/^> (.*$)/gm, "<blockquote>$1</blockquote>")

    // Code blocks
    .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")

    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")

    // Paragraphs
    .replace(/^(?!<[a-z])(.*$)/gm, "<p>$1</p>")

    // Fix nested lists
    .replace(/<\/ul>\s*<ul>/g, "")
    .replace(/<\/ol>\s*<ol>/g, "")

  return html
}

// Fallback content generator
function generateFallbackContent(topic: string, level: string): string {
  return `
    <h2>${topic}</h2>
    
    <p>This is comprehensive content about ${topic} generated for the ${level} level.</p>
    
    <h3>Key Concepts</h3>
    <ul>
      <li><strong>Definition:</strong> ${topic} refers to the study of ocular structures and functions essential for optometric practice.</li>
      <li><strong>Clinical Significance:</strong> Understanding ${topic} is crucial for diagnosing and treating various eye conditions.</li>
      <li><strong>Recent Developments:</strong> New research has expanded our understanding of ${topic} in the last decade.</li>
    </ul>
    
    <h3>Detailed Explanation</h3>
    <p>
      ${topic} encompasses multiple aspects of optometric science. When examining patients, 
      practitioners must consider how ${topic} relates to overall visual function and ocular health.
      The integration of this knowledge with clinical skills allows for comprehensive patient care.
    </p>
    
    <h3>Clinical Applications</h3>
    <ol>
      <li>Diagnostic procedures related to ${topic}</li>
      <li>Treatment approaches based on ${topic} principles</li>
      <li>Patient education regarding ${topic}</li>
      <li>Preventive measures associated with ${topic}</li>
    </ol>
    
    <h3>Case Example</h3>
    <blockquote>
      A 45-year-old patient presenting with symptoms related to ${topic} would typically undergo a 
      comprehensive examination including visual acuity testing, refraction, and specialized tests 
      specific to ${topic}. The findings would guide the treatment plan and follow-up schedule.
    </blockquote>
    
    <h3>Related Topics</h3>
    <p>
      Students should also explore the relationship between ${topic} and other areas such as ocular 
      anatomy, visual optics, and clinical procedures to develop a comprehensive understanding of 
      optometric practice.
    </p>
  `
}

