const OpenAI = require("openai");
const {
  conceptExplainPrompt,
  questionAnswerPrompt,
} = require("../utils/prompts");

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  console.error("Missing GROQ_API_KEY in environment");
}

const ai = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://api.groq.com/openai/v1",
});

function extractGeneratedText(response) {
  if (!response) return "";
  if (response.choices && response.choices[0] && response.choices[0].message) {
    return response.choices[0].message.content || "";
  }
  return "";
}

// helper function to safely parse JSON
function safeJSONParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

// helper function to clean AI response
function cleanAIResponse(text) {
  if (!text) return text;
  // Remove code block markers
  return text.replace(/```[\w]*\n?/g, '').replace(/```\n?/g, '').trim();
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
    const response = await ai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    let rawText = extractGeneratedText(response);

    const cleanedText = rawText
      .replace(/^```(json)?\s*/i, "")
      .replace(/```$/, "")
      .trim();

    const data = safeJSONParse(cleanedText);

    // Clean code blocks from answers if data is an array
    let cleanedData = data;
    if (Array.isArray(data)) {
      cleanedData = data.map(item => ({
        ...item,
        answer: cleanAIResponse(item.answer)
      }));
    } else if (data && typeof data === 'object' && data.explanation) {
      cleanedData = {
        ...data,
        explanation: cleanAIResponse(data.explanation)
      };
    }

    res.status(200).json({
      success: true,
      questions: cleanedData ?? cleanAIResponse(cleanedText), // fallback to raw text if not valid JSON
    });
  } catch (error) {
    console.error("AI generate interview questions error:", error);

    // Handle specific quota exceeded errors
    if (error?.status === 429 || error?.message?.includes("quota") || error?.message?.includes("rate limit")) {
      return res.status(429).json({
        success: false,
        message: "AI service rate limit exceeded. Please try again later.",
        error: "RATE_LIMIT_EXCEEDED",
      });
    }

    // Handle model decommissioned errors
    if (error?.code === "model_decommissioned" || error?.message?.includes("decommissioned")) {
      return res.status(500).json({
        success: false,
        message: "AI model temporarily unavailable. Please try again later.",
        error: "MODEL_UNAVAILABLE",
      });
    }

    res.status(500).json({
      success: false,
      message: error?.message || "Failed to generate questions",
      error: error?.response ?? error,
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
    const response = await ai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });
    let rawText = extractGeneratedText(response);

    const cleanedText = rawText
      .replace(/^```(json)?\s*/i, "")
      .replace(/```$/, "")
      .trim();

    const data = safeJSONParse(cleanedText);

    // Clean code blocks from explanation if data is an object
    let cleanedData = data;
    if (data && typeof data === 'object' && data.explanation) {
      cleanedData = {
        ...data,
        explanation: cleanAIResponse(data.explanation)
      };
    }

    res.status(200).json({
      success: true,
      explanation: cleanedData ?? cleanAIResponse(cleanedText), // fallback to text if not valid JSON
    });
  } catch (error) {
    console.error("AI generate explanation error:", error);

    res.status(500).json({
      success: false,
      message: error?.message || "Failed to generate explanation",
      error: error?.response ?? error,
    });
  }
};

module.exports = { generateInterviewQuestions, generateConceptExplanation };
