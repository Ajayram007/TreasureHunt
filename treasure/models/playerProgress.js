const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  path: [
    {
      
      Text: String,
      answer:String,
      levelNumber: { type: Number, required: true },
      name: { type: String, required: false },
      answer: { type: String, required: true }, // stored internally
      file: { type: String } // matches Trail model
    }
  ],
  placeIndex: { type: Number, default: 0 },
  currentLevelNumber: { type: Number, default: 1 },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, default: null },
  timeLog: [
    { level: Number, place: String, scannedAt: { type: Date }, timeTakenMs: Number }
  ]
});


module.exports = mongoose.model("Progress", progressSchema);
