const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const generateAIResponse = async (prompt) => {
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error(`Gemini API error (attempt ${attempt}):`, error.message);

      const errorMessage = error.message || "";

      const isTemporaryError =
        errorMessage.includes("503") ||
        errorMessage.includes("UNAVAILABLE");

      if (!isTemporaryError || attempt === maxRetries) {
        throw error;
      }

      const delay = attempt * 5000;

      console.log(`Gemini temporarily unavailable. Retrying in ${delay / 1000}s...`);

      await sleep(delay);
    }
  }
};

module.exports = {
  generateAIResponse,
};