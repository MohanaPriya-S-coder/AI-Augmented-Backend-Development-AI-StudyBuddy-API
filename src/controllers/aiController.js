const mongoose = require("mongoose");
const Material = require("../models/Material");
const Summary = require("../models/Summary");
const Flashcard = require("../models/Flashcard");
const Quiz = require("../models/Quiz");
const StudyPlan = require("../models/StudyPlan");
const { generateAIResponse } = require("../utils/gemini");

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Validate that req.params.id is a valid MongoDB ObjectId.
 * Returns true if valid; sends a 400 response and returns false if not.
 */
const isValidObjectId = (id, res) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: "Invalid resource ID" });
    return false;
  }
  return true;
};

/**
 * Extract a JSON array from Gemini text that may contain markdown fences.
 */
const extractJSON = (text) => {
  // Strip markdown code fences if present
  const cleaned = text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
  // Find the first [ ... ] block
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1) return null;
  return cleaned.slice(start, end + 1);
};

// ─── Summary ─────────────────────────────────────────────────────────────────

/**
 * POST /api/ai/summary/:id
 * Generate (or regenerate) a summary for a study material.
 * Enforces ONE-TO-ONE by using findOneAndUpdate with upsert.
 */
const generateSummary = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id, res)) return;

    const material = await Material.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Study material not found",
      });
    }

    const prompt = `
You are an AI study assistant.

Create a clear and useful summary of the following study material.

Subject: ${material.subject}
Title: ${material.title}

Study Material:
${material.content}

Requirements:
- Keep the important concepts.
- Use simple language.
- Organize the summary clearly.
- Do not add information that is not present in the study material.
`;

    const summaryText = await generateAIResponse(prompt);

    // Upsert: update existing summary or create if none exists (ONE-TO-ONE)
    const savedSummary = await Summary.findOneAndUpdate(
      { materialId: material._id },
      {
        userId: req.user.userId,
        materialId: material._id,
        summary: summaryText,
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Summary generated and saved successfully",
      summary: savedSummary,
    });
  } catch (error) {
    console.error("Generate summary error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while generating summary",
    });
  }
};

/**
 * GET /api/ai/summary/:id
 * Get the stored summary for a specific material.
 */
const getSummaryByMaterial = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id, res)) return;

    const material = await Material.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Study material not found",
      });
    }

    const summary = await Summary.findOne({
      materialId: material._id,
      userId: req.user.userId,
    });

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: "No summary found for this material. Generate one first.",
      });
    }

    return res.status(200).json({ success: true, summary });
  } catch (error) {
    console.error("Get summary error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving summary",
    });
  }
};

/**
 * GET /api/ai/summaries
 * Get all summaries belonging to the authenticated user.
 */
const getAllSummaries = async (req, res) => {
  try {
    const summaries = await Summary.find({ userId: req.user.userId })
      .populate("materialId", "title subject")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: summaries.length,
      summaries,
    });
  } catch (error) {
    console.error("Get all summaries error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving summaries",
    });
  }
};

// ─── Flashcards ───────────────────────────────────────────────────────────────

/**
 * POST /api/ai/flashcards/:id
 * Generate flashcards for a study material. Replaces existing flashcards.
 */
const generateFlashcards = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id, res)) return;

    const material = await Material.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Study material not found",
      });
    }

    const prompt = `
You are an AI study assistant. Generate useful flashcards from the study material below.

Subject: ${material.subject}
Title: ${material.title}

Study Material:
${material.content}

Return ONLY a valid JSON array (no markdown, no explanation) in this exact format:
[
  { "question": "...", "answer": "..." },
  { "question": "...", "answer": "..." }
]

Requirements:
- Generate between 5 and 10 flashcards.
- Each question must be specific and clear.
- Each answer must be concise and accurate.
- Cover the most important concepts in the material.
- Output ONLY the JSON array, nothing else.
`;

    const aiText = await generateAIResponse(prompt);

    const jsonStr = extractJSON(aiText);
    if (!jsonStr) {
      return res.status(500).json({
        success: false,
        message: "AI returned malformed flashcard data. Please try again.",
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return res.status(500).json({
        success: false,
        message: "AI returned invalid JSON for flashcards. Please try again.",
      });
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return res.status(500).json({
        success: false,
        message: "AI returned no flashcards. Please try again.",
      });
    }

    // Validate each flashcard
    const valid = parsed.filter(
      (fc) =>
        fc &&
        typeof fc.question === "string" &&
        fc.question.trim() &&
        typeof fc.answer === "string" &&
        fc.answer.trim()
    );

    if (valid.length === 0) {
      return res.status(500).json({
        success: false,
        message: "AI returned no valid flashcards. Please try again.",
      });
    }

    // Delete existing flashcards for this material, then insert new ones
    await Flashcard.deleteMany({
      materialId: material._id,
      userId: req.user.userId,
    });

    const flashcardDocs = valid.map((fc) => ({
      userId: req.user.userId,
      materialId: material._id,
      question: fc.question.trim(),
      answer: fc.answer.trim(),
    }));

    const savedFlashcards = await Flashcard.insertMany(flashcardDocs);

    return res.status(200).json({
      success: true,
      message: `${savedFlashcards.length} flashcards generated and saved successfully`,
      flashcards: savedFlashcards,
    });
  } catch (error) {
    console.error("Generate flashcards error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while generating flashcards",
    });
  }
};

/**
 * GET /api/ai/flashcards/:id
 * Get flashcards for a specific material.
 */
const getFlashcardsByMaterial = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id, res)) return;

    const material = await Material.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Study material not found",
      });
    }

    const flashcards = await Flashcard.find({
      materialId: material._id,
      userId: req.user.userId,
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: flashcards.length,
      flashcards,
    });
  } catch (error) {
    console.error("Get flashcards error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving flashcards",
    });
  }
};

/**
 * GET /api/ai/flashcards
 * Get all flashcards belonging to the authenticated user.
 */
const getAllFlashcards = async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ userId: req.user.userId })
      .populate("materialId", "title subject")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: flashcards.length,
      flashcards,
    });
  } catch (error) {
    console.error("Get all flashcards error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving flashcards",
    });
  }
};

// ─── Quiz ─────────────────────────────────────────────────────────────────────

/**
 * POST /api/ai/quiz/:id
 * Generate (or regenerate) a quiz for a study material. ONE-TO-ONE via upsert.
 */
const generateQuiz = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id, res)) return;

    const material = await Material.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Study material not found",
      });
    }

    const prompt = `
You are an AI study assistant. Generate a multiple-choice quiz from the study material below.

Subject: ${material.subject}
Title: ${material.title}

Study Material:
${material.content}

Return ONLY a valid JSON array (no markdown, no explanation) in this exact format:
[
  {
    "question": "...",
    "options": ["option A", "option B", "option C", "option D"],
    "correctAnswer": "option A"
  }
]

Requirements:
- Generate between 5 and 10 questions.
- Each question must have exactly 4 options.
- The correctAnswer must be one of the options (exact text match).
- Cover the most important concepts.
- Output ONLY the JSON array, nothing else.
`;

    const aiText = await generateAIResponse(prompt);

    const jsonStr = extractJSON(aiText);
    if (!jsonStr) {
      return res.status(500).json({
        success: false,
        message: "AI returned malformed quiz data. Please try again.",
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return res.status(500).json({
        success: false,
        message: "AI returned invalid JSON for quiz. Please try again.",
      });
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return res.status(500).json({
        success: false,
        message: "AI returned no quiz questions. Please try again.",
      });
    }

    // Validate each question
    const valid = parsed.filter(
      (q) =>
        q &&
        typeof q.question === "string" &&
        q.question.trim() &&
        Array.isArray(q.options) &&
        q.options.length >= 2 &&
        typeof q.correctAnswer === "string" &&
        q.correctAnswer.trim() &&
        q.options.includes(q.correctAnswer)
    );

    if (valid.length === 0) {
      return res.status(500).json({
        success: false,
        message: "AI returned no valid quiz questions. Please try again.",
      });
    }

    // Upsert: ONE-TO-ONE per material
    const savedQuiz = await Quiz.findOneAndUpdate(
      { materialId: material._id },
      {
        userId: req.user.userId,
        materialId: material._id,
        questions: valid,
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Quiz generated and saved successfully",
      quiz: savedQuiz,
    });
  } catch (error) {
    console.error("Generate quiz error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while generating quiz",
    });
  }
};

/**
 * GET /api/ai/quiz/:id
 * Get the stored quiz for a specific material.
 */
const getQuizByMaterial = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id, res)) return;

    const material = await Material.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Study material not found",
      });
    }

    const quiz = await Quiz.findOne({
      materialId: material._id,
      userId: req.user.userId,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "No quiz found for this material. Generate one first.",
      });
    }

    return res.status(200).json({ success: true, quiz });
  } catch (error) {
    console.error("Get quiz error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving quiz",
    });
  }
};

/**
 * GET /api/ai/quizzes
 * Get all quizzes belonging to the authenticated user.
 */
const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user.userId })
      .populate("materialId", "title subject")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: quizzes.length,
      quizzes,
    });
  } catch (error) {
    console.error("Get all quizzes error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving quizzes",
    });
  }
};

// ─── Study Plan ───────────────────────────────────────────────────────────────

/**
 * POST /api/ai/study-plan
 * Generate a personalized study plan. ONE-TO-MANY: each call creates a new plan.
 */
const generateStudyPlan = async (req, res) => {
  try {
    const { subject, examDate, availableHoursPerDay, learningGoal } = req.body;

    if (!subject || !examDate) {
      return res.status(400).json({
        success: false,
        message: "subject and examDate are required",
      });
    }

    const parsedDate = new Date(examDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "examDate must be a valid date (YYYY-MM-DD)",
      });
    }

    const today = new Date();
    const daysUntilExam = Math.ceil(
      (parsedDate - today) / (1000 * 60 * 60 * 24)
    );

    const prompt = `
You are an AI study assistant. Create a detailed, practical study plan for a student.

Subject: ${subject}
Exam Date: ${examDate} (${daysUntilExam > 0 ? daysUntilExam + " days from today" : "already passed or today"})
Available Hours Per Day: ${availableHoursPerDay || 2}
Learning Goal: ${learningGoal || "Achieve a good understanding of the subject"}

Create a day-by-day study plan that:
- Is realistic and achievable.
- Breaks down the subject into manageable topics.
- Includes revision time before the exam.
- Specifies what to study each day or each week.
- Is formatted clearly with headings or numbered lists.

Write the study plan in plain text format (no JSON needed, just a clear readable plan).
`;

    const studyPlanText = await generateAIResponse(prompt);

    const savedPlan = await StudyPlan.create({
      userId: req.user.userId,
      studyPlan: studyPlanText,
      examDate: parsedDate,
      subject,
      learningGoal: learningGoal || "",
      availableHoursPerDay: availableHoursPerDay || 2,
    });

    return res.status(200).json({
      success: true,
      message: "Study plan generated and saved successfully",
      studyPlan: savedPlan,
    });
  } catch (error) {
    console.error("Generate study plan error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while generating study plan",
    });
  }
};

/**
 * GET /api/ai/study-plans
 * Get all study plans belonging to the authenticated user.
 */
const getAllStudyPlans = async (req, res) => {
  try {
    const plans = await StudyPlan.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: plans.length,
      studyPlans: plans,
    });
  } catch (error) {
    console.error("Get all study plans error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving study plans",
    });
  }
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  generateSummary,
  getSummaryByMaterial,
  getAllSummaries,
  generateFlashcards,
  getFlashcardsByMaterial,
  getAllFlashcards,
  generateQuiz,
  getQuizByMaterial,
  getAllQuizzes,
  generateStudyPlan,
  getAllStudyPlans,
};