const express = require("express");
const router = express.Router();
const { validationResult ,check } = require('express-validator');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const QRCode = require("qrcode");

const User = require('../models/userModel');
const Trail = require("../models/trailModel");
const Progress = require("../models/playerProgress");



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


//  CREATE QR CODE



router.post("/generate-qr", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Only admins can create trail." });
    }

    const { levelNumber, questionIndex } = req.body;

    if (levelNumber === undefined || questionIndex === undefined) {
      return res.status(400).json({
        message: "levelNumber and questionIndex are required."
      });
    }

    // 1️⃣ FIND THE LEVEL
    const level = await Trail.findOne({ levelNumber });
    if (!level) {
      return res.status(404).json({
        message: `Level ${levelNumber} not found in database.`
      });
    }

    // 2️⃣ VERIFY question exists
    if (!Number.isInteger(questionIndex) || questionIndex < 0 || questionIndex >= level.questions.length) {
      return res.status(400).json({
        message: `Question '${questionIndex}' does NOT exist in Level ${levelNumber}.`
      });
    }

    // 3️⃣ GET THE QUESTION
    const question = level.questions[questionIndex];

    // 4️⃣ GENERATE QR WITH ONLY THE ANSWER
    const qrPayload = question.answer; //  Only answer goes in QR
    const qrDataURL = await QRCode.toDataURL(qrPayload);

    return res.json({
      message: "QR generated successfully",
      levelNumber,
      questionIndex,
      
      qrCode: qrDataURL,
      answer: question.answer // optional, just for reference
    });
  } catch (error) {
    console.error("QR Generation Error:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});



// START GAME


router.post("/start-game/:playerId", verifyToken, async (req, res) => {
  try {
    const playerId = req.params.playerId;

    if (!playerId) {
      return res.status(400).json({ message: "playerId is required" });
    }

    const user = await User.findById(playerId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ message: "Admins cannot play the game." });
    }

    let progress = await Progress.findOne({ playerId });

    // 👉 GET TOTAL LEVELS
    const levels = await Trail.find().sort({ levelNumber: 1 });
    const totalLevels = levels.length;

    if (!levels.length) {
      return res.status(404).json({ message: "No trail levels found" });
    }

    // 🔁 RESUME GAME
    if (progress) {
      if (progress.completed) {
        //  Player already finished the game
        return res.json({
          message: "You have already completed the game!",
          completed: true,
          totalLevels,
          nextTarget: null
        });
      } else {
        // In-progress game
        const current = progress.path[progress.placeIndex];
        return res.json({
          message: "Resuming your game...",
          completed: false,
          nextTarget: current
            ? {
                levelNumber: current.levelNumber,
                Text: current.Text || "",
                file: current.file || current.image || null // Fallback for old data
              }
            : null,
          totalLevels
        });
      }
    }

    //  BUILD RANDOM PATH for new player
    const path = [];

    for (const level of levels) {
      if (!level.questions.length) {
        return res.status(400).json({
          message: `Level ${level.levelNumber} has no questions`
        });
      }

      const randomQuestion =
        level.questions[Math.floor(Math.random() * level.questions.length)];

      path.push({
        levelNumber: level.levelNumber,
        Text: randomQuestion.Text || "",
        answer: randomQuestion.answer,
        file: randomQuestion.file || null
      });
    }

    progress = await Progress.create({
      playerId,
      currentLevelNumber: 1,
      path,
      placeIndex: 0,
      completed: false,
      startTime: new Date(),
      endTime: null
    });

    return res.json({
      message: "Game Started!",
      completed: false,
      nextTarget: {
        levelNumber: path[0].levelNumber,
        Text: path[0].Text,
        file: path[0].file || null
      },
      totalLevels
    });
  } catch (error) {
    console.error("Start Game Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});





// VERIFY QR


router.post("/verify-qr/:playerId", verifyToken, async (req, res) => {
  try {
    const playerId = req.params.playerId;
    const { answer } = req.body;

    if (!playerId) return res.status(400).json({ message: "playerId is required" });
    if (!answer) return res.status(400).json({ message: "Answer is required" });

    const user = await User.findById(playerId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") return res.status(403).json({ message: "Admins cannot play" });

    let progress = await Progress.findOne({ playerId });
    if (!progress) return res.status(404).json({ message: "No active game" });
    if (progress.completed) {
      return res.json({
        message: "Game already completed!",
        completed: true,
        nextTarget: null,
        totalLevels: progress.path.length
      });
    }

    const currentIndex = progress.placeIndex;
    const currentTarget = progress.path[currentIndex];

    if (!currentTarget) {
      return res.status(400).json({ message: "Invalid game state - no current level" });
    }

    // Answer check (case-insensitive, trimmed)
    if (answer.trim().toLowerCase() !== currentTarget.answer.trim().toLowerCase()) {
      return res.status(400).json({ message: " Wrong answer. Try again!" });
    }

    // Log the successful scan
    progress.timeLog.push({
      levelNumber: currentTarget.levelNumber,
      Text: currentTarget.Text,
      scannedAt: new Date()
    });

    // Advance index
    progress.placeIndex += 1;

    let response = {
      message: " Correct! Next location unlocked.",
      completed: false,
      nextTarget: null,
      totalLevels: progress.path.length
    };

    if (progress.placeIndex < progress.path.length) {
      // Still levels left
      const next = progress.path[progress.placeIndex];
      response.nextTarget = {
        levelNumber: next.levelNumber,
        Text: next.Text || "",
        file: next.file || next.image || null
      };
      progress.currentLevelNumber = next.levelNumber;
    } else {
      // Game finished!
      progress.completed = true;
      progress.endTime = new Date();
      response.message = "🎉 Congratulations! You finished the entire trail!";
      response.completed = true;
      response.nextTarget = null;
      response.finalTime = ((progress.endTime - progress.startTime) / 1000) + " seconds";
    }

    // Save EVERY time
    await progress.save();

    return res.json(response);

  } catch (error) {
    console.error("Verify QR Error:", error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
});





// RESET GAME
router.post("/reset-game/:playerId", verifyToken, async (req, res) => {
  try {
    const playerId = req.params.playerId;

    if (!playerId) {
      return res.status(400).json({ message: "playerId is required" });
    }

    const result = await Progress.deleteOne({ playerId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No active game found to reset" });
    }

    return res.json({ message: "Game reset successfully! You can now start again." });
  } catch (error) {
    console.error("Reset Game Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;

