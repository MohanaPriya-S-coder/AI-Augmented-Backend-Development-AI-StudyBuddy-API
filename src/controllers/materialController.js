const mongoose = require("mongoose");
const Material = require("../models/Material");

const isValidObjectId = (id, res) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: "Invalid material ID" });
    return false;
  }
  return true;
};

const createMaterial = async (req, res) => {
  try {
    const { title, subject, content } = req.body;

    // Validate required fields
    if (!title || !subject || !content) {
      return res.status(400).json({
        success: false,
        message: "Title, subject and content are required",
      });
    }

    // Create material for the authenticated user
    const material = await Material.create({
      userId: req.user.userId,
      title,
      subject,
      content,
    });

    return res.status(201).json({
      success: true,
      message: "Study material created successfully",
      material,
    });
  } catch (error) {
    console.error("Create material error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating study material",
    });
  }
};

const getMyMaterials = async (req, res) => {
  try {
    const materials = await Material.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: materials.length,
      materials,
    });
  } catch (error) {
    console.error("Get materials error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while retrieving study materials",
    });
  }
};

const getMaterialById = async (req, res) => {
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

    return res.status(200).json({
      success: true,
      material,
    });
  } catch (error) {
    console.error("Get material error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while retrieving study material",
    });
  }
};

const updateMaterial = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id, res)) return;

    const { title, subject, content } = req.body;

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

    if (title !== undefined) material.title = title;
    if (subject !== undefined) material.subject = subject;
    if (content !== undefined) material.content = content;

    await material.save();

    return res.status(200).json({
      success: true,
      message: "Study material updated successfully",
      material,
    });
  } catch (error) {
    console.error("Update material error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating study material",
    });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id, res)) return;

    const material = await Material.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Study material not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Study material deleted successfully",
    });
  } catch (error) {
    console.error("Delete material error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting study material",
    });
  }
};

module.exports = {
  createMaterial,
  getMyMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
};