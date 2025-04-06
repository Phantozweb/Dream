exports.handler = async (event, context) => {
  try {
    const { apiKey } = JSON.parse(event.body)

    if (!apiKey) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: "API key is required" }),
      }
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
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
      }
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: false,
          error: data.error?.message || "Invalid API key or API error",
        }),
      }
    }
  } catch (error) {
    console.error("Error testing Gemini API key:", error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: "An error occurred while testing the API key",
      }),
    }
  }
}

