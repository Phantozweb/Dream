// Ensure the mock response API is properly returning JSON

// Make sure the Content-Type header is explicitly set to application/json
export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Get the last user message
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")
    const userQuestion = lastUserMessage?.content || "Tell me about optometry"

    // Generate a mock response based on the question
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

    return new Response(JSON.stringify({ text: response }), {
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error in mock response API:", error)
    return new Response(
      JSON.stringify({
        text: "I'm Focus.AI, your optometry study assistant. I can help answer questions about optometry concepts, clinical procedures, and ocular conditions. What would you like to know about today?",
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}

