import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.post("/api/upload-image", (req, res) => {
  const { fileName, base64 } = req.body;
  if (!base64) {
    return res.status(400).json({ error: "No image content provided" });
  }
  
  try {
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let extension = "png";
    
    if (matches && matches.length === 3) {
      const mimeType = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
      extension = mimeType.split('/')[1] || "png";
    } else {
      buffer = Buffer.from(base64, 'base64');
    }

    const safeFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;
    const filePath = path.join(uploadsDir, safeFileName);
    
    fs.writeFileSync(filePath, buffer);
    
    res.json({ url: `/uploads/${safeFileName}` });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to save image" });
  }
});

// Initialize server-side Gemini client with system rules and User-Agent telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API endpoint to generate high-quality customized coral love poems
app.post("/api/sea-poem", async (req, res) => {
  const { partner1, partner2, anniversaryDate, memoriesCount } = req.body;
  if (!partner1 || !partner2) {
    return res.status(400).json({ error: "Both partner names are required." });
  }

  try {
    const prompt = `Write a cute, short, highly romantic love poem for a couple named ${partner1} and ${partner2}. 
They started dating on ${anniversaryDate || 'June 12, 2025'}. 
Write it in a warm, affectionate, and deeply comforting voice (like a cozy, warm handwritten note from a partner).
Use beautiful, gentle sea or beach metaphors, like soft sand underfoot, warm coastal waves, glowing evening tides, and sailing side-by-side. 
Do NOT include technical phrases like "logged milestones", "digital ocean", "timeline", "statistics", or "memory count".
Keep it short (approx. 4 to 8 lines) with elegant line breaks. Do not include markdown formatting, headers, or introductory text.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ poem: response.text });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.json({ 
      poem: `Upon the tides of life we drift, hand in hand, a perfect gift.\nNo wave can wash our bond away, we grow much deeper day by day.\n${partner1} and ${partner2}, two stars of the sea,\nForever together, forever to be.` 
    });
  }
});

// GET route to serve the .lrc lyrics file directly from the project root
app.get("/api/lyrics", (req, res) => {
  const lyricsPath = path.join(process.cwd(), "lyrics.lrc");
  fs.readFile(lyricsPath, "utf8", (err, data) => {
    if (err) {
      console.warn("Could not read lyrics.lrc from project root:", err);
      return res.status(404).json({ error: "Lyrics file not found or unreadable." });
    }
    res.setHeader("Content-Type", "text/plain");
    res.send(data);
  });
});

// GET route to serve local audio (MP3, FLAC) files directly from the project root
const serveLocalAudio = (req: express.Request, res: express.Response) => {
  const rootDir = process.cwd();
  
  // 1. Check if direct 'song.flac' exists
  const primaryFlacPath = path.join(rootDir, "song.flac");
  if (fs.existsSync(primaryFlacPath)) {
    console.log("Serving primary local audio file: song.flac");
    return res.sendFile(primaryFlacPath);
  }

  // 2. Check if a direct 'song.mp3' file exists in the root
  const primarySongPath = path.join(rootDir, "song.mp3");
  if (fs.existsSync(primarySongPath)) {
    console.log("Serving primary local audio file: song.mp3");
    return res.sendFile(primarySongPath);
  }

  // 3. Scan the root folder for any valid .flac or .mp3 file
  try {
    const files = fs.readdirSync(rootDir);
    const audioFile = files.find(file => {
      const lower = file.toLowerCase();
      return lower.endsWith(".flac") || lower.endsWith(".mp3");
    });
    if (audioFile) {
      const detectedSongPath = path.join(rootDir, audioFile);
      console.log(`Serving auto-detected local audio file: ${audioFile}`);
      return res.sendFile(detectedSongPath);
    }
  } catch (err) {
    console.warn("Error scanning root folder for audio files:", err);
  }

  // 4. Fall back to the default romantic piano theme url if no local audio files are present
  console.log("No local MP3 or FLAC files detected. Falling back to default online symphony...");
  res.redirect("https://assets.codepen.io/151167/Clair_de_Lune_Debussy.mp3");
};

// GET route to retrieve metadata dynamically based on the served file
app.get("/api/song-metadata", (req, res) => {
  const rootDir = process.cwd();

  // 1. Check if direct 'song.flac' exists
  const primaryFlacPath = path.join(rootDir, "song.flac");
  if (fs.existsSync(primaryFlacPath)) {
    return res.json({
      title: "song.flac",
      artist: "Local High-Fidelity Audio",
      isLocal: true,
      format: "FLAC"
    });
  }

  // 2. Check if a direct 'song.mp3' file exists in the root
  const primarySongPath = path.join(rootDir, "song.mp3");
  if (fs.existsSync(primarySongPath)) {
    return res.json({
      title: "song.mp3",
      artist: "Local Audio Stream",
      isLocal: true,
      format: "MP3"
    });
  }

  // 3. Scan the root folder for any valid .flac or .mp3 file
  try {
    const files = fs.readdirSync(rootDir);
    const audioFile = files.find(file => {
      const lower = file.toLowerCase();
      return lower.endsWith(".flac") || lower.endsWith(".mp3");
    });
    if (audioFile) {
      const extIndex = audioFile.lastIndexOf('.');
      const cleanName = extIndex !== -1 ? audioFile.substring(0, extIndex) : audioFile;
      const format = audioFile.substring(extIndex + 1).toUpperCase();
      
      const parts = cleanName.split('-');
      let artist = "Local Sea Captain";
      let title = cleanName;
      if (parts.length > 1) {
        artist = parts[0].trim();
        title = parts.slice(1).join('-').trim();
      }
      return res.json({
        title: title,
        artist: artist + ` (${format})`,
        isLocal: true,
        format: format
      });
    }
  } catch (err) {
    console.warn("Error scanning root folder for audio files metadata:", err);
  }

  // 4. Default fallback metadata
  res.json({
    title: "Clair de Lune (Moonlight Voyage Accent)",
    artist: "Claude Debussy • Anniversary Symphony",
    isLocal: false,
    format: "MP3"
  });
});

app.get("/api/audio", serveLocalAudio);
app.get("/api/song.mp3", serveLocalAudio);

// Start integration with Vite asset serving layer
async function bootServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Full-stack app in development mode: Vite middleware attached.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Full-stack app in production mode: static dist serving activated.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully listening on port ${PORT}`);
  });
}

bootServer();
