import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [socket, setSocket] = useState(null);

  // 1. Connect to Socket.io when page loads
  useEffect(() => {
    const newSocket = io("http://localhost:5001");
    setSocket(newSocket);

    // Fetch existing videos
    fetchVideos();

    return () => newSocket.close(); // Cleanup when leaving page
  }, []);

  // 2. Listen for Real-Time Updates from Backend
  useEffect(() => {
    if (!socket) return;

    // Listen for "Progress" events (e.g., "50% done")
    socket.on("videoProgress", ({ videoId, progress }) => {
      setVideos((prevVideos) =>
        prevVideos.map((v) =>
          v._id === videoId ? { ...v, processingProgress: progress } : v
        )
      );
    });

    // Listen for "Status" events (e.g., "Flagged")
    socket.on("videoStatus", ({ videoId, status }) => {
      setVideos((prevVideos) =>
        prevVideos.map((v) =>
          v._id === videoId ? { ...v, sensitivity: status } : v
        )
      );
    });

    return () => {
      socket.off("videoProgress");
      socket.off("videoStatus");
    };
  }, [socket]);

  // Helper: Fetch Videos from API
  const fetchVideos = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/videos");
      // Sort: Newest first
      setVideos(res.data.reverse());
    } catch (err) {
      console.error("Error fetching videos:", err);
    }
  };

  // 3. Handle File Upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file!");

    setUploading(true);
    const formData = new FormData();
    formData.append("video", file);
    formData.append("title", title);
    
    // Get User ID from local storage
    const user = JSON.parse(localStorage.getItem("user"));
    formData.append("userId", user._id);

    try {
      const res = await axios.post("http://localhost:5001/api/videos/upload", formData);
      
      // Add the new "pending" video to the list immediately
      setVideos([res.data, ...videos]);
      
      // Reset Form
      setFile(null);
      setTitle("");
      setUploading(false);
      alert("Upload started! Watch the progress bar.");
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* --- UPLOAD SECTION --- */}
      <div className="bg-gray-800 p-6 rounded-lg mb-8 shadow-lg mt-6">
        <h2 className="text-xl font-bold mb-4">Upload New Video</h2>
        <form onSubmit={handleUpload} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-gray-400 text-sm mb-1">Video Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-700 p-2 rounded text-white outline-none"
              placeholder="e.g. My Vacation"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-400 text-sm mb-1">Select File</label>
            <input 
              type="file" 
              accept="video/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full bg-gray-700 p-1 rounded text-white text-sm"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={uploading}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-bold disabled:bg-gray-600"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>

      {/* --- VIDEO LIST SECTION --- */}
      <h2 className="text-2xl font-bold mb-4">Your Feed</h2>
      <div className="grid gap-6">
        {videos.map((video) => (
          <div key={video._id} className="bg-gray-800 p-4 rounded-lg flex gap-4 items-start shadow-md animate-fade-in">
            
            {/* THUMBNAIL / VIDEO PLAYER */}
            <div className="w-64 h-36 bg-black rounded overflow-hidden flex-shrink-0 relative">
              {video.sensitivity === "flagged" ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-red-900/50 text-red-200">
                  <span className="text-3xl">⚠️</span>
                  <span className="font-bold">Content Flagged</span>
                </div>
              ) : video.processingProgress < 100 ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-700">
                  <span className="text-blue-400 font-bold mb-2">Processing...</span>
                  <div className="w-3/4 h-2 bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${video.processingProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 mt-1">{video.processingProgress}%</span>
                </div>
              ) : (
                <video 
                  controls 
                  className="w-full h-full object-cover"
                  src={`http://localhost:5001/api/videos/stream/${video.videoUrl}`}
                />
              )}
            </div>

            {/* VIDEO DETAILS */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">{video.title}</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-1 rounded font-bold uppercase
                  ${video.sensitivity === 'safe' ? 'bg-green-900 text-green-300' : 
                    video.sensitivity === 'flagged' ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'}`}>
                  {video.sensitivity}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(video.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <p className="text-gray-400 text-sm">
                User ID: <span className="text-gray-500">{video.userId}</span>
              </p>
            </div>
          </div>
        ))}
        
        {videos.length === 0 && (
          <p className="text-gray-500 text-center py-10">No videos yet. Upload one!</p>
        )}
      </div>
    </div>
  );
};

export default Home;