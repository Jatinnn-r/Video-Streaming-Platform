// server/routes/video.js
const fs = require("fs");
const router = require("express").Router();
const Video = require("../models/Video");
const multer = require("multer");
const path = require("path");

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "files/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});
const upload = multer({ storage: storage });

// --- THE MOCK AI ENGINE ---
// This function runs in the background (does not stop the server)
const runSensitivityAnalysis = async (video, io) => {
  const videoId = video._id;
  const sensitiveKeywords = ["bomb", "attack", "kill", "gun"];
  
  // Helper to update progress
  const updateProgress = async (progress) => {
    // 1. Update Database
    await Video.findByIdAndUpdate(videoId, { processingProgress: progress });
    // 2. Send Real-Time Message to Frontend
    io.emit("videoProgress", { videoId, progress });
  };

  try {
    // Step 1: Start (0%)
    await updateProgress(0);

    // Step 2: Simulate Processing (Wait 2 seconds)
    setTimeout(async () => {
      await updateProgress(25);
      
      // Step 3: Wait another 2 seconds
      setTimeout(async () => {
        await updateProgress(50);

        // Step 4: Wait another 2 seconds
        setTimeout(async () => {
          await updateProgress(75);

          // Step 5: Finalize (100% and Decision)
          setTimeout(async () => {
            const isUnsafe = sensitiveKeywords.some(word => 
              video.title.toLowerCase().includes(word)
            );
            
            const finalStatus = isUnsafe ? "flagged" : "safe";
            
            await Video.findByIdAndUpdate(videoId, { 
              processingProgress: 100,
              sensitivity: finalStatus
            });
            
            // Notify Frontend: "DONE!"
            io.emit("videoStatus", { videoId, status: finalStatus });
            io.emit("videoProgress", { videoId, progress: 100 });
            
            console.log(`Video ${videoId} processed. Status: ${finalStatus}`);
          }, 2000);
        }, 2000);
      }, 2000);
    }, 2000);

  } catch (err) {
    console.log("Analysis Error:", err);
  }
};

// --- ROUTES ---

// Upload Route
router.post("/upload", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json("No file uploaded");

    const newVideo = new Video({
      userId: req.body.userId || "anonymous",
      title: req.body.title || "Untitled",
      videoUrl: req.file.filename,
    });

    const savedVideo = await newVideo.save();
    
    // START THE BACKGROUND PROCESS
    // We pass 'req.io' so the function can talk to the frontend
    runSensitivityAnalysis(savedVideo, req.io);

    res.status(200).json(savedVideo);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get All Videos Route (We will need this for the frontend later)
router.get("/", async (req, res) => {
  try {
    const videos = await Video.find();
    res.status(200).json(videos);
  } catch (err) {
    res.status(500).json(err);
  }
});
// STREAMING ROUTE (HTTP Range Requests)
router.get("/stream/:filename", (req, res) => {
    const filePath = path.join(__dirname, "../files", req.params.filename);
    
    // 1. Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json("File not found");
    }
  
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;
  
    // 2. If browser sends a Range header (e.g., "bytes=0-")
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      };
  
      // Status 206 = Partial Content (Standard for streaming)
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // Fallback: Send whole file if no range requested
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  });

module.exports = router;