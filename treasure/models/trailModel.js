const mongoose = require("mongoose");

const trailSchema = new mongoose.Schema({
  levelNumber: {
    type: Number,
    required: true,
    unique: true,
    min: 1,
    max: 5
  },
  questions: {
    type: [
      {
        Text: {
          type: String,
          required: false
        },
        answer: {
          type: String,
          required: true
        },
        file: {
          type: String, // image / video / pdf path or URL
          required: false
        }
      }
    ],
    default: [],
    validate: {
      validator: arr => arr.length <= 5,
      message: "Each level can have max 5 questions"
    }
  }
});

module.exports = mongoose.model("Trail", trailSchema);
