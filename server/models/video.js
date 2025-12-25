// server/models/Video.js
const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Who uploaded it?
  title:  { type: String, required: true },
  desc:   { type: String },
  videoUrl: { type: String, required: true }, // Where is the file stored?
  
  // For the Assignment Requirements:
  sensitivity: { 
    type: String, 
    enum: ['pending', 'safe', 'flagged'], 
    default: 'pending' 
  },
  processingProgress: { type: Number, default: 0 }, // 0 to 100%
  
  views: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Video", VideoSchema);