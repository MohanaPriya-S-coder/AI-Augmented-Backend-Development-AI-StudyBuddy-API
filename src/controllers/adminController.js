const User = require("../models/User");
const Material = require("../models/Material");
const Summary = require("../models/Summary");
const Flashcard = require("../models/Flashcard");
const Quiz = require("../models/Quiz");
const StudyPlan = require("../models/StudyPlan");
const mongoose = require("mongoose");

/**
 * GET /api/admin/users
 * List all users (passwords excluded).
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Admin get all users error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving users",
    });
  }
};

/**
 * GET /api/admin/users/:id
 * Get a single user by ID (password excluded).
 */
const getUserById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(req.params.id, "-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Admin get user error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving user",
    });
  }
};

/**
 * DELETE /api/admin/users/:id
 * Delete a user and all their associated resources.
 */
const deleteUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const userId = user._id;

    // Delete all user resources in parallel
    await Promise.all([
      Material.deleteMany({ userId }),
      Summary.deleteMany({ userId }),
      Flashcard.deleteMany({ userId }),
      Quiz.deleteMany({ userId }),
      StudyPlan.deleteMany({ userId }),
      User.findByIdAndDelete(userId),
    ]);

    return res.status(200).json({
      success: true,
      message: "User and all associated resources deleted successfully",
    });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting user",
    });
  }
};

/**
 * GET /api/admin/stats
 * Return platform-wide usage statistics.
 */
const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalAdmins,
      totalMaterials,
      totalSummaries,
      totalFlashcards,
      totalQuizzes,
      totalStudyPlans,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "Student" }),
      User.countDocuments({ role: "Admin" }),
      Material.countDocuments(),
      Summary.countDocuments(),
      Flashcard.countDocuments(),
      Quiz.countDocuments(),
      StudyPlan.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          students: totalStudents,
          admins: totalAdmins,
        },
        content: {
          materials: totalMaterials,
          summaries: totalSummaries,
          flashcards: totalFlashcards,
          quizzes: totalQuizzes,
          studyPlans: totalStudyPlans,
        },
      },
    });
  } catch (error) {
    console.error("Admin get stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving stats",
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  deleteUser,
  getStats,
};
