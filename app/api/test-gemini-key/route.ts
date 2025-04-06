export async function POST(req: Request) {
  try {
    const { apiKey } = await req.json()

    if (!apiKey) {
      return Response.json({ success: false, error: "API key is required" }, { status: 400 })
    }

    // Test the Gemini API key with a simple request
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
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
                text: "Hello, this is a test request to verify my API key is working.",
              },
            ],
          },
        ],
      }),
    })

    const data = await response.json()

    // Check if the response contains expected fields
    if (data.candidates && data.candidates.length > 0) {
      return Response.json({ success: true })
    } else {
      return Response.json({
        success: false,
        error: data.error?.message || "Invalid API key or API error",
      })
    }
  } catch (error) {
    console.error("Error testing Gemini API key:", error)
    return Response.json(
      {
        success: false,
        error: "An error occurred while testing the API key",
      },
      { status: 500 },
    )
  }
}

