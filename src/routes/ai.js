const express = require("express");
const { authenticate } = require("../middleware/auth");
const {
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
} = require("../controllers/aiController");

const router = express.Router();

// All AI routes require authentication
router.use(authenticate);

// ── Summary ──────────────────────────────────────────────────────────────────
// POST /api/ai/summary/:id   — generate (or regenerate) summary for a material
router.post("/summary/:id", generateSummary);

// GET  /api/ai/summary/:id   — get stored summary for a material
router.get("/summary/:id", getSummaryByMaterial);

// GET  /api/ai/summaries     — get all summaries for the authenticated user
router.get("/summaries", getAllSummaries);

// ── Flashcards ────────────────────────────────────────────────────────────────
// POST /api/ai/flashcards/:id — generate flashcards for a material
router.post("/flashcards/:id", generateFlashcards);

// GET  /api/ai/flashcards/:id — get flashcards for a specific material
router.get("/flashcards/:id", getFlashcardsByMaterial);

// GET  /api/ai/flashcards     — get all flashcards for the authenticated user
router.get("/flashcards", getAllFlashcards);

// ── Quiz ──────────────────────────────────────────────────────────────────────
// POST /api/ai/quiz/:id — generate (or regenerate) quiz for a material
router.post("/quiz/:id", generateQuiz);

// GET  /api/ai/quiz/:id — get stored quiz for a material
router.get("/quiz/:id", getQuizByMaterial);

// GET  /api/ai/quizzes  — get all quizzes for the authenticated user
router.get("/quizzes", getAllQuizzes);

// ── Study Plan ────────────────────────────────────────────────────────────────
// POST /api/ai/study-plan  — generate a new study plan
router.post("/study-plan", generateStudyPlan);

// GET  /api/ai/study-plans — get all study plans for the authenticated user
router.get("/study-plans", getAllStudyPlans);

module.exports = router;