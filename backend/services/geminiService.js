/**
 * Service to handle integration with the Google Gemini API
 */
const generateAIChatReply = async (contextPrompt) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== "dummy_api_key" && !apiKey.startsWith("YOUR_")) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: contextPrompt
                  }
                ]
              }
            ]
          })
        }
      );

      if (response.ok) {
        const json = await response.json();
        if (json.candidates && json.candidates[0] && json.candidates[0].content && json.candidates[0].content.parts[0]) {
          return json.candidates[0].content.parts[0].text;
        }
      } else {
        const errBody = await response.text();
        console.error("Gemini API call failed with response error status:", response.status, errBody);
      }
    } catch (geminiErr) {
      console.error("Gemini API request exception:", geminiErr.message);
    }
  }
  return null;
};

module.exports = {
  generateAIChatReply
};
