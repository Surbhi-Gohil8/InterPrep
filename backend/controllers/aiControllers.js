const { GoogleGenAI } = require("@google/genai");
const {
  conceptExplainPrompt,
  questionAnswerPrompt,
} = require("../utils/prompts");
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

// helper function to safely parse JSON
function safeJSONParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

const generateInterviewQuestions = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, numberOfQuestions } = req.body;
    if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const prompt = questionAnswerPrompt(
      role,
      experience,
      topicsToFocus,
      numberOfQuestions
    );
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [prompt],
    });

    let rawText = response.text || "";

    const cleanedText = rawText
      .replace(/^```(json)?\s*/i, "")
      .replace(/```$/, "")
      .trim();

    const data = safeJSONParse(cleanedText);

    res.status(200).json({
      success: true,
      questions: data ?? cleanedText, // fallback to raw text if not valid JSON
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to generate questions",
      error: error.message,
    });
  }
};

const generateConceptExplanation = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const prompt = conceptExplainPrompt(question);
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [prompt],
    });
    let rawText = response.text || "";

    const cleanedText = rawText
      .replace(/^```(json)?\s*/i, "")
      .replace(/```$/, "")
      .trim();

    const data = safeJSONParse(cleanedText);

    res.status(200).json({
      success: true,
      explanation: data ?? cleanedText, // fallback to text if not valid JSON
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to generate questions",
      error: error.message,
    });
  }
};

module.exports = { generateInterviewQuestions, generateConceptExplanation };
