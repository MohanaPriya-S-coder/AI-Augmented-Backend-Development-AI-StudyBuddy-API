const mongoose = require("mongoose");

const studyPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    studyPlan: {
      type: String,
      required: true,
    },

    examDate: {
      type: Date,
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },

    learningGoal: {
      type: String,
    },

    availableHoursPerDay: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// ONE-TO-MANY: a user can have multiple study plans
studyPlanSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("StudyPlan", studyPlanSchema);
