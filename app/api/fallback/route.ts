// Update the fallback API to use the provided API key
export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const apiKey =
      req.headers.get("x-gemini-api-key") || process.env.GEMINI_API_KEY || "AIzaSyB6RHAgIkXqpRaOAjm8i-U4YqLyHT5BmLE"

    // Get the last user message
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")
    const userQuestion = lastUserMessage?.content || "Tell me about optometry"

    // Try to use the Gemini API with the provided key
    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are Focus.AI - Clinical Optometry Specialist. Answer questions about optometry, eye health, vision science, and eye care. Use peer-reviewed terminology and provide structured responses with clinical accuracy.`,
                  },
                  {
                    text: userQuestion,
                  },
                ],
              },
            ],
          }),
        },
      )

      const data = await response.json()
      const geminiResponse = data.candidates[0].content.parts[0].text

      return new Response(JSON.stringify({ text: geminiResponse }), {
        headers: {
          "Content-Type": "application/json",
        },
      })
    } catch (geminiError) {
      console.error("Error calling Gemini API:", geminiError)

      // If Gemini API fails, fall back to the original logic
      let response = "I'm Focus.AI, your optometry study assistant. "

      if (userQuestion.toLowerCase().includes("diabetic retinopathy")) {
        response +=
          "Diabetic retinopathy is a diabetes complication that affects the eyes. It's caused by damage to the blood vessels in the retina. At first, diabetic retinopathy may cause no symptoms or only mild vision problems. Eventually, it can cause blindness. The condition can develop in anyone who has type 1 or type 2 diabetes. The longer you have diabetes and the less controlled your blood sugar is, the more likely you are to develop this eye complication."
      } else if (userQuestion.toLowerCase().includes("glaucoma")) {
        response +=
          "Glaucoma is a group of eye conditions that damage the optic nerve, which is vital for good vision. This damage is often caused by abnormally high pressure in your eye. Glaucoma is one of the leading causes of blindness for people over the age of 60. It can occur at any age but is more common in older adults. Many forms of glaucoma have no warning signs, and the effect is so gradual that you may not notice a change in vision until the condition is at an advanced stage."
      } else if (userQuestion.toLowerCase().includes("contact lens")) {
        response +=
          "Contact lenses are thin, curved lenses that sit on the tear film that covers the surface of your eye. They're used to correct vision problems such as myopia (nearsightedness), hyperopia (farsightedness), astigmatism, and presbyopia. There are several types of contact lenses, including soft lenses, rigid gas permeable lenses, extended wear lenses, and disposable lenses. Each type has its own benefits and considerations for use."
      } else {
        response +=
          "Optometry is a healthcare profession that involves examining the eyes and related structures for defects or abnormalities. Optometrists are healthcare professionals who provide primary vision care ranging from sight testing and correction to the diagnosis, treatment, and management of vision changes. An optometrist is not a medical doctor but receives a Doctor of Optometry (OD) degree after completing four years of optometry school."
      }

      // Return the response with explicit content type
      return new Response(JSON.stringify({ text: response }), {
        headers: {
          "Content-Type": "application/json",
        },
      })
    }
  } catch (error) {
    console.error("Error in fallback API:", error)

    // Even if there's an error, return a valid JSON response
    return new Response(
      JSON.stringify({
        text: "I'm Focus.AI, your optometry study assistant. I'm currently experiencing technical difficulties. Please try again later.",
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}

