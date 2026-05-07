const express = require("express");
const multer = require("multer");
const pitchAnalysisController = require("../controllers/pitchAnalysisController");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: process.env.MAX_FILE_SIZE || 50000000 }, // 50MB default
  fileFilter: (req, file, cb) => {
    // Accept PDF and PowerPoint files by extension
    const filename = file.originalname.toLowerCase();
    const validExtensions = ['.pdf', '.ppt', '.pptx'];
    const isValid = validExtensions.some(ext => filename.endsWith(ext));
    
    if (isValid) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and PowerPoint files (.pdf, .ppt, .pptx) are allowed"));
    }
  },
});

/**
 * POST /api/pitch-analysis
 * Analyze pitch from URL
 * Body: {pitchUrl}
 */
router.post("/", pitchAnalysisController.analyzeFromUrl);

/**
 * POST /api/pitch-analysis/upload
 * Upload and analyze pitch deck
 * Body: {startupName, founderId, industry, stage}
 * File: PDF or PowerPoint pitch deck
 */
router.post(
  "/upload",
  upload.single("file"),
  pitchAnalysisController.uploadAndAnalyzePitch
);

/**
 * GET /api/pitch-analysis/:analysisId
 * Get detailed analysis report
 */
router.get("/:analysisId", pitchAnalysisController.getAnalysisReport);

/**
 * GET /api/pitch-analysis/startup/:startupId
 * Get all analyses for a startup
 */
router.get(
  "/startup/:startupId",
  pitchAnalysisController.getStartupAnalyses
);

/**
 * GET /api/pitch-analysis/top-startups
 * Get top-ranked startups
 * Query: limit, industry, stage, minScore
 */
router.get("/top-startups", pitchAnalysisController.getTopStartups);

/**
 * DELETE /api/pitch-analysis/:analysisId
 * Delete an analysis
 */
router.delete("/:analysisId", pitchAnalysisController.deleteAnalysis);

/**
 * GET /api/pitch-analysis/:analysisId/export/pdf
 * Export analysis as PDF
 */
router.get("/:analysisId/export/pdf", pitchAnalysisController.exportAnalysisPDF);

module.exports = router;
