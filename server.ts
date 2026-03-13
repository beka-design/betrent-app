import 'dotenv/config';
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import admin from "firebase-admin";
import multer from "multer";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Force development mode if not specified
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize Firebase Admin
const serviceAccountJSON = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (serviceAccountJSON) {
  try {
    const serviceAccount = JSON.parse(serviceAccountJSON);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin initialized from environment variable");
  } catch (e) {
    console.error("Failed to initialize Firebase Admin from environment variable:", e);
  }
} else {
  // Fallback for development if you haven't set the environment variable yet
  console.warn("FIREBASE_SERVICE_ACCOUNT_JSON not found. Admin features will be disabled until configured.");
}

// Initialize Cloudinary
const cloudinaryConfig = {
  cloud_name: (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME.trim()) || "dqtpp0how",
  api_key: (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY.trim()) || "585394796774815",
  api_secret: (process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_API_SECRET.trim()) || "zV7Dfhna4ynyM6cptnUgyznknuE"
};

cloudinary.config(cloudinaryConfig);
console.log("Cloudinary initialized with cloud_name:", cloudinaryConfig.cloud_name);

// Ensure uploads directory exists - use /tmp/uploads for better compatibility
const uploadsDir = path.join(os.tmpdir(), "bete_uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({ 
  dest: uploadsDir,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

app.use(express.json());
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  frameguard: false, // Allow iframes
}));
app.use(compression());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API Routes - Registered immediately for Vercel
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Bete API is running", env: process.env.NODE_ENV });
});

app.post("/api/test", (req, res) => {
  res.json({ message: "Test POST successful", body: req.body });
});

// Image Upload Endpoint
app.post(["/api/upload", "/api/upload/"], (req, res, next) => {
  upload.array("images", 10)(req, res, (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ 
        error: "File upload error", 
        details: err.message 
      });
    }
    next();
  });
}, async (req: any, res: any) => {
  console.log("Upload request received. Files:", req.files?.length);
  if (!req.files || req.files.length === 0) {
    console.log("No files received in req.files");
    return res.status(400).json({ error: "No files uploaded" });
  }
  
  try {
    const files = req.files as any[];
    console.log("Starting Cloudinary uploads for", files.length, "files");
    
    const uploadPromises = files.map((file, index) => {
      console.log(`Uploading file ${index + 1}/${files.length} to Cloudinary:`, file.path, "Original name:", file.originalname);
      return cloudinary.uploader.upload(file.path, { 
        folder: "bete_properties",
        resource_type: "auto"
      }).then(result => {
        console.log(`File ${index + 1} uploaded successfully:`, result.secure_url);
        return result;
      }).catch(err => {
        console.error(`Single file upload failed (${file.originalname}):`, err);
        throw err;
      });
    });
    
    const results = await Promise.all(uploadPromises);
    const urls = results.map(r => r.secure_url);
    console.log("All uploads successful. Total URLs:", urls.length);
    
    // Cleanup local files
    files.forEach(file => {
      try { 
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path); 
          console.log("Deleted temp file:", file.path);
        }
      } catch (e) { 
        console.error("Failed to delete temp file:", file.path, e); 
      }
    });

    res.json({ urls });
  } catch (error) {
    console.error("Cloudinary upload error details:", error);
    res.status(500).json({ 
      error: "Upload failed", 
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// SEO Routes
app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send("User-agent: *\nAllow: /\nSitemap: /sitemap.xml");
});

app.get("/sitemap.xml", async (req, res) => {
  res.type("application/xml");
  const appUrl = process.env.APP_URL || `http://localhost:3000`;
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${appUrl}/</loc></url>
  <url><loc>${appUrl}/browse</loc></url>
</urlset>`);
});

async function startServer() {
  const PORT = 3000;

  // Global Error Handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Global error handler caught:", err);
    res.status(err.status || 500).json({
      error: "Internal Server Error",
      message: err.message || "An unexpected error occurred",
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production" || !fs.existsSync(path.join(__dirname, "dist"))) {
    console.log("Starting in development mode...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in production mode...");
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});

export default app;
