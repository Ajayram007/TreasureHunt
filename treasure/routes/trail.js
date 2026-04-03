const express = require("express");
const router = express.Router();
const Trail = require("../models/trailModel");

const { validationResult ,check } = require('express-validator');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');

const fs = require("fs");
const path = require("path");


const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });



//  VERIFY TOKEN MIDDLEWARE

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(404).json({ message: 'User not found.' });

    req.user = { id: user._id, role: user.role };
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};




//CRUD


//  CREATE A TRAIL

router.post("/trailCreate",verifyToken,upload.single("file"),async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({
          message: "Access denied. Only admins can create trail."
        });
      }

      const { levelNumber, Text, answer, questionIndex } = req.body;
      const file = req.file ? req.file.filename : null;

      //  Validation
      if (!levelNumber || !answer) {
        return res.status(400).json({
          message: "levelNumber and answer are required"
        });
      }

      const level = Number(levelNumber);
      if (level < 1 || level > 5) {
        return res.status(400).json({
          message: "Level number must be from 1 to 5"
        });
      }

      let trail = await Trail.findOne({ levelNumber: level });

      if (!trail) {
        trail = new Trail({
          levelNumber: level,
          questions: []
        });
      }

      if (trail.questions.length >= 5) {
        return res.status(400).json({
          message: `Level ${level} already has 5 questions`
        });
      }

      const newQuestion = {
        Text: Text || "", // Ensure Text is at least an empty string
        answer,
        file
      };

      //  FIX questionIndex handling
      const index =
        questionIndex !== undefined && questionIndex !== ""
          ? Number(questionIndex)
          : null;

      if (
        Number.isInteger(index) &&
        index >= 0 &&
        index <= trail.questions.length
      ) {
        trail.questions.splice(index, 0, newQuestion);
      } else {
        trail.questions.push(newQuestion);
      }

      await trail.save();

      res.status(201).json({
        message: "Question added successfully",
        trail
      });
    } catch (error) {
      console.error("trailCreate Error:", error);
      const status = error.name === "ValidationError" ? 400 : 500;
      res.status(status).json({
        message: status === 400 ? "Validation Error" : "Server Error",
        error: error.message
      });
    }
  }
);




//  RETRIEVE ALL TRAIL

router.get("/All_trail", verifyToken, async (req, res) => {
  try {
     if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can retrieve trail.' });
    }
    const levels = await Trail.find().sort({ levelNumber: 1 });

    res.status(200).json({
      message: "All levels retrieved",
      levels
    });

  } catch (error) {
    console.error("Retrieve Error:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});


//  RETRIEVE TRAIL by levelnumber

router.get("/trail/:levelNumber/:questionIndex", verifyToken, async (req, res) => {
  try {
    //  Admin only
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Only admins can retrieve trail."
      });
    }

    //  Extract params
    const levelNumber = Number(req.params.levelNumber);
    const questionIndex = Number(req.params.questionIndex);

    //  Validate levelNumber
    if (Number.isNaN(levelNumber)) {
      return res.status(400).json({
        message: "levelNumber must be a number"
      });
    }

    //  Validate questionIndex
    if (!Number.isInteger(questionIndex) || questionIndex < 0) {
      return res.status(400).json({
        message: "questionIndex must be a valid non-negative integer"
      });
    }

    // 🔍 Find level (FIXED)
    const level = await Trail.findOne({ levelNumber });

    if (!level) {
      return res.status(404).json({
        message: `Trail for level ${levelNumber} not found`
      });
    }

    // 🔍 Validate question index exists
    if (questionIndex >= level.questions.length) {
      return res.status(404).json({
        message: `Question ${questionIndex} does not exist in level ${levelNumber}`
      });
    }

    //  Get question
    const question = level.questions[questionIndex];

    //  Correct response
    return res.status(200).json({
      message: "Question retrieved successfully",
      levelNumber,
      questionIndex,
      question
    });

  } catch (error) {
    console.error("Retrieve Error:", error.message);
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
});


//  UPDATE questionIndex by levelNumber

router.put("/trailUpdate/:levelNumber/:questionIndex",verifyToken,upload.single("file"),async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admins only" });
      }

      const level = Number(req.params.levelNumber);
      const index = Number(req.params.questionIndex);
      const { Text, answer, removeFile } = req.body;

      if (!Number.isInteger(level) || level < 1 || level > 5) {
        return res.status(400).json({ message: "Invalid level number (1-5)" });
      }

      const trail = await Trail.findOne({ levelNumber: level });
      if (!trail) {
        return res.status(404).json({ message: "Level not found" });
      }

      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= trail.questions.length
      ) {
        return res.status(400).json({ message: "Invalid question index" });
      }

      const question = trail.questions[index];

      // ✏️ Update text fields
      if (Text !== undefined) question.Text = Text;
      if (answer !== undefined) question.answer = answer;

      // 🗑 Remove old file explicitly
      if (removeFile === "true" && question.file) {
        const filePath = path.join(__dirname, "..", "uploads", question.file);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        question.file = null;
      }

      // 📥 Replace with new file
      if (req.file) {
        if (question.file) {
          const oldPath = path.join(__dirname, "..", "uploads", question.file);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        question.file = req.file.filename;
      }

      await trail.save();

      res.status(200).json({
        message: "Question updated successfully",
        question
      });
    } catch (err) {
      console.error("trailUpdate Error:", err);
      const status = err.name === "ValidationError" ? 400 : 500;
      res.status(status).json({ 
        message: status === 400 ? "Validation Error" : "Server error", 
        error: err.message 
      });
    }
  }
);



//  DELETE Level by levelNumber


router.delete("/trailDelete/:levelNumber/:questionIndex",verifyToken,async (req, res) => {
    try {
      //  Admin only
      if (req.user.role !== "admin") {
        return res.status(403).json({
          message: "Access denied. Only admins can delete trail questions."
        });
      }

      const { levelNumber: levelParam, questionIndex: indexParam } = req.params;
      const levelNumber = Number(levelParam);
      const questionIndex = Number(indexParam);

      //  Validate level
      if (levelNumber < 1 || levelNumber > 5) {
        return res.status(400).json({
          message: "Level number must be from 1 to 5"
        });
      }

      // 🔍 Find level
      const trail = await Trail.findOne({ levelNumber });

      if (!trail) {
        return res.status(404).json({
          message: "Level not found"
        });
      }

      //  Validate index
      if (
        questionIndex < 0 ||
        questionIndex >= trail.questions.length
      ) {
        return res.status(400).json({
          message: "Invalid question index"
        });
      }

      // 🗑️ Remove question
      const removedQuestion = trail.questions.splice(questionIndex, 1);

      // 💾 Save changes
      await trail.save();

      return res.status(200).json({
        message: "Question deleted successfully",
        deletedQuestion: removedQuestion[0],
        remainingQuestions: trail.questions
      });

    } catch (error) {
      console.error("trailDelete Error:", error);
      const status = error.name === "ValidationError" ? 400 : 500;
      res.status(status).json({
        message: status === 400 ? "Validation Error" : "Server Error",
        error: error.message
      });
    }
  }
);
module.exports = router;
