const aiService = require("../services/aiService");
const pdfService = require("../services/pdfService");
const { generatePitchAnalysisPDF } = require("../services/pdfExportService");
const scoringEngine = require("../services/scoringEngine");
const comprehensiveEngine = require("../services/comprehensiveAnalysisEngine");
const axios = require("axios");
const Startup = require("../models/Startup");
const Document = require("../models/Document");
const Analysis = require("../models/Analysis");
const fs = require("fs");

/**
 * POST /api/pitch-analysis
 * Analyze pitch from URL
 */
exports.analyzeFromUrl = async (req, res) => {
  try {
    const { pitchUrl, startupName = "URL Analysis", founderId = "unknown", industry = "Other", stage = "Seed" } = req.body;

    if (!pitchUrl) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: pitchUrl",
      });
    }

    // Try to fetch and process the URL
    let pitchContent = "";
    
    try {
      const response = await axios.get(pitchUrl, { timeout: 5000 });
      pitchContent = response.data;
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Unable to fetch pitch from URL. Please try uploading a file instead.",
        error: err.message,
      });
    }

    if (!pitchContent) {
      return res.status(400).json({
        success: false,
        message: "Unable to extract content from URL",
      });
    }

    // Analyze the content using OpenRouter AI
    const aiResult = await aiService.analyzePitchContent(pitchContent);
    if (!aiResult.success) {
      return res.status(500).json({
        success: false,
        message: "AI analysis failed",
        error: aiResult.error,
      });
    }

    // Step 5: Identify risks (with fallback)
    let risksResult;
    try {
      risksResult = await aiService.identifyRisks(aiResult.data);
    } catch (error) {
      console.log("Risk Analysis Error: " + error.message);
      risksResult = {
        success: true,
        risks: {
          red_flags: ["Early-stage validation required"],
          green_flags: ["Clear problem identified"],
          risk_level: "Medium",
          risk_summary: "Standard startup risks"
        }
      };
    }

    // Step 6: Comprehensive scoring
    const metrics = {
      revenue: aiResult.data.traction?.revenue || 0,
      growth_rate: aiResult.data.traction?.growth_rate || 0,
      users: aiResult.data.traction?.users || 0,
      runway: aiResult.data.traction?.runway || 0,
      burn: aiResult.data.traction?.burn_rate || 0,
    };

    const comprehensiveReport = comprehensiveEngine.generateComprehensiveReport(aiResult.data, metrics);
    
    const scores = {
      founderScore: comprehensiveReport.scores.founder,
      marketScore: comprehensiveReport.scores.market,
      tractionScore: comprehensiveReport.scores.traction,
      totalScore: comprehensiveReport.overallScore,
      riskLevel: comprehensiveReport.riskLevel,
      recommendation: comprehensiveReport.recommendation,
    };

    // Step 7: Generate summary
    let summaryResult;
    try {
      summaryResult = await aiService.generateExecutiveSummary(
        aiResult.data,
        scores
      );
    } catch (error) {
      console.log("Summary Error: " + error.message);
      summaryResult = {
        success: true,
        summary: `Analysis for ${startupName} in ${industry}. Review detailed scores below.`
      };
    }

    // Return comprehensive analysis without database storage
    res.status(200).json({
      success: true,
      message: "Pitch analysis completed successfully",
      data: {
        _id: null,  // No database ID for URL analysis
        startup: {
          id: null,
          name: startupName,
          industry: industry,
          stage: stage,
        },
        analysis: {
          id: null,
          summary: summaryResult.summary || comprehensiveReport.summary || "",
          overallScore: comprehensiveReport.overallScore,
          riskLevel: comprehensiveReport.riskLevel,
          recommendation: comprehensiveReport.recommendation,
          
          // All 8 dimensions
          dimensions: {
            founder: {
              score: comprehensiveReport.scores?.founder || 0,
              strengths: comprehensiveReport.analyses?.founder?.strengths || [],
              weaknesses: comprehensiveReport.analyses?.founder?.weaknesses || [],
            },
            problem: {
              score: comprehensiveReport.scores?.problem || 0,
              strengths: comprehensiveReport.analyses?.problem?.strengths || [],
              weaknesses: comprehensiveReport.analyses?.problem?.weaknesses || [],
            },
            market: {
              score: comprehensiveReport.scores?.market || 0,
              strengths: comprehensiveReport.analyses?.market?.strengths || [],
              weaknesses: comprehensiveReport.analyses?.market?.weaknesses || [],
            },
            product: {
              score: comprehensiveReport.scores?.product || 0,
              strengths: comprehensiveReport.analyses?.product?.strengths || [],
              weaknesses: comprehensiveReport.analyses?.product?.weaknesses || [],
            },
            traction: {
              score: comprehensiveReport.scores?.traction || 0,
              strengths: comprehensiveReport.analyses?.traction?.strengths || [],
              weaknesses: comprehensiveReport.analyses?.traction?.weaknesses || [],
            },
            businessModel: {
              score: comprehensiveReport.scores?.businessModel || 0,
              strengths: comprehensiveReport.analyses?.businessModel?.strengths || [],
              weaknesses: comprehensiveReport.analyses?.businessModel?.weaknesses || [],
            },
            financial: {
              score: comprehensiveReport.scores?.financial || 0,
              strengths: comprehensiveReport.analyses?.financial?.strengths || [],
              weaknesses: comprehensiveReport.analyses?.financial?.weaknesses || [],
            },
            competitive: {
              score: comprehensiveReport.scores?.competitive || 0,
              strengths: comprehensiveReport.analyses?.competitive?.strengths || [],
              weaknesses: comprehensiveReport.analyses?.competitive?.weaknesses || [],
            },
          },
          
          // Key insights
          strengths: comprehensiveReport.strengths || [],
          weaknesses: comprehensiveReport.weaknesses || [],
          redFlags: comprehensiveReport.redFlags || risksResult.risks?.red_flags || [],
          greenFlags: comprehensiveReport.greenFlags || risksResult.risks?.green_flags || [],
          
          // Original data
          problemStatement: aiResult.data?.problem,
          marketSize: aiResult.data?.market_size,
          revenueModel: aiResult.data?.revenue_model,
          
          // Metrics
          metrics: {
            revenue: metrics.revenue,
            growthRate: metrics.growth_rate,
            activeUsers: metrics.users,
            runway: metrics.runway,
            burn: metrics.burn,
          },
        },
      },
    });
  } catch (error) {
    console.error("Pitch analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during pitch analysis",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * POST /api/pitch-analysis/upload
 * Upload and analyze a pitch deck
 */
exports.uploadAndAnalyzePitch = async (req, res) => {
  try {
    const { startupName, founderId, industry, stage } = req.body;

    console.log("Upload request received:", { startupName, founderId, industry, stage, file: req.file?.originalname });

    // Validate required fields
    if (!startupName || !founderId || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: startupName, founderId, file",
        received: { startupName, founderId, hasFile: !!req.file, industry, stage }
      });
    }

    // Validate file type
    const validExtensions = ['.pdf', '.ppt', '.pptx'];
    const fileName = req.file.originalname.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

    const validMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint',
      'application/x-mspowerpoint',
      'application/x-powerpoint'
    ];
    const hasValidMimeType = validMimeTypes.includes(req.file.mimetype);

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: "File size exceeds 50MB limit",
        fileSize: `${(req.file.size / 1024 / 1024).toFixed(2)}MB`
      });
    }

    // Validate file type
    if (!hasValidExtension || !hasValidMimeType) {
      console.warn("Invalid file uploaded:", {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        hasValidExtension,
        hasValidMimeType
      });
      return res.status(400).json({
        success: false,
        message: `Invalid file type. Only PDF and PowerPoint files are accepted.`,
        received: {
          filename: req.file.originalname,
          type: req.file.mimetype,
          acceptedFormats: ['PDF (.pdf)', 'PowerPoint (.ppt, .pptx)']
        }
      });
    }

    // Step 1: Save uploaded file
    console.log("Saving file...");
    const saveResult = pdfService.saveUploadedFile(req.file);
    if (!saveResult.success) {
      console.error("File save failed:", saveResult.error);
      return res.status(500).json({
        success: false,
        message: "File save failed",
        error: saveResult.error,
      });
    }
    console.log("File saved successfully:", saveResult.filepath);

    // Step 2: Extract text from PDF
    console.log("Extracting text from PDF...");
    const extractionResult = await pdfService.extractTextFromPDF(saveResult.filepath);
    if (!extractionResult.success) {
      console.error("PDF extraction failed:", extractionResult.error);
      pdfService.deleteFile(saveResult.filepath);
      return res.status(500).json({
        success: false,
        message: "PDF text extraction failed",
        error: extractionResult.error,
      });
    }
    console.log("Text extracted successfully, pages:", extractionResult.pageCount);

    // Step 3: Clean extracted text
    console.log("Cleaning extracted text...");
    const cleanedText = pdfService.cleanExtractedText(extractionResult.text);
    console.log("Text length after cleaning:", cleanedText.length);

    // Step 3.5: Validate that this is actually a pitch deck (not resume, cover letter, etc)
    console.log("Validating document type...");
    const validationResult = await aiService.validatePitchDeck(cleanedText);
    console.log("Validation result:", validationResult);
    
    if (!validationResult.success) {
      console.error("Document validation failed:", validationResult.error);
      pdfService.deleteFile(saveResult.filepath);
      return res.status(400).json({
        success: false,
        message: "Invalid file. Please upload a Pitch Deck PDF only (not resume, cover letter, or other documents).",
        error: validationResult.error,
      });
    }

    if (!validationResult.isPitchDeck) {
      console.warn("Non-pitch-deck document uploaded:", validationResult.reason);
      pdfService.deleteFile(saveResult.filepath);
      return res.status(400).json({
        success: false,
        message: "Invalid file. Please upload a Pitch Deck PDF only (not resume, cover letter, or other documents).",
        details: validationResult.reason,
      });
    }

    // Step 4: Send to AI for analysis
    console.log("Sending to AI for analysis...");
    const aiResult = await aiService.analyzePitchContent(cleanedText);
    if (!aiResult.success) {
      console.error("AI analysis failed:", aiResult.error);
      pdfService.deleteFile(saveResult.filepath);
      return res.status(400).json({
        success: false,
        message: "Analysis failed: " + aiResult.error,
        error: aiResult.error,
      });
    }
    
    // Verify we got actual data, not generic/random data
    if (!aiResult.data || typeof aiResult.data !== 'object') {
      console.error("Invalid data received from AI analysis");
      pdfService.deleteFile(saveResult.filepath);
      return res.status(400).json({
        success: false,
        message: "Failed to extract valid information from pitch deck",
      });
    }
    
    console.log("AI analysis completed successfully");

    // Step 5: Identify risks (with fallback)
    console.log("Identifying risks...");
    let risksResult;
    try {
      risksResult = await aiService.identifyRisks(aiResult.data);
    } catch (error) {
      console.log("Risk Analysis Error: " + error.message);
      console.log("Using fallback risk analysis...");
      risksResult = {
        success: true,
        risks: {
          red_flags: ["Early-stage validation required", "Market adoption timeline"],
          green_flags: ["Clear problem statement", "Identified market opportunity"],
          risk_level: "Medium",
          risk_summary: "Standard early-stage startup risks"
        }
      };
    }
    console.log("Risk identification completed");

    // Step 6: Comprehensive scoring using 10-dimension analysis
    const metrics = {
     revenue: aiResult.data.traction?.revenue || 0,
     growth_rate: aiResult.data.traction?.growth_rate || 0,
     users: aiResult.data.traction?.users || 0,
     runway: aiResult.data.traction?.runway || 0,
     burn: aiResult.data.traction?.burn_rate || 0,
    };

    console.log("📊 Generating comprehensive report with data:", {
     problem: aiResult.data.problem,
     market: aiResult.data.market_size,
     revenue: aiResult.data.revenue_model,
     stage: aiResult.data.stage,
     metrics
    });

    const comprehensiveReport = comprehensiveEngine.generateComprehensiveReport(aiResult.data, metrics);
    
    console.log("✅ Comprehensive report generated:", {
     overallScore: comprehensiveReport.overallScore,
     riskLevel: comprehensiveReport.riskLevel,
     founderScore: comprehensiveReport.scores.founder,
     marketScore: comprehensiveReport.scores.market,
     tractionScore: comprehensiveReport.scores.traction
    });
    const scores = {
      founderScore: comprehensiveReport.scores.founder,
      marketScore: comprehensiveReport.scores.market,
      tractionScore: comprehensiveReport.scores.traction,
      totalScore: comprehensiveReport.overallScore,
      riskLevel: comprehensiveReport.riskLevel,
      recommendation: comprehensiveReport.recommendation,
    };

    // Step 7: Create or update startup in database
    let startup = await Startup.findOneAndUpdate(
      { name: startupName },
      {
        name: startupName,
        founderId,
        industry,
        stage,
      },
      { upsert: true, new: true }
    );

    // Step 8: Save document record
    const document = await Document.create({
      startupId: startup._id,
      filename: saveResult.filename,
      originalName: saveResult.originalName,
      fileSize: req.file.size,
      pages: extractionResult.pageCount,
      content: cleanedText,
    });

    // Step 9: Generate executive summary (with fallback)
    let summaryResult;
    try {
      summaryResult = await aiService.generateExecutiveSummary(
        aiResult.data,
        scores
      );
    } catch (error) {
      console.log("Summary Generation Error: " + error.message);
      console.log("Using fallback summary...");
      summaryResult = {
        success: true,
        summary: `Strong pitch for ${startupName} in ${industry}. Key metrics show potential in the ${stage} stage.`
      };
    }

    // Step 10: Save pitch analysis to database
    const analysis = await Analysis.create({
      documentId: document._id,
      startupId: startup._id,
      pitchData: aiResult.data,
      scores,
      executiveSummary: summaryResult.summary || "Analysis completed. Review detailed scores and insights below.",
        riskAnalysis: {
          red_flags: risksResult.success ? risksResult.risks.red_flags || [] : [],
          green_flags: risksResult.success ? risksResult.risks.green_flags || [] : [],
          risk_level: scores.riskLevel,
          risk_summary: risksResult.success ? risksResult.risks.risk_summary : "",
        },
        });

    // Build dimensions safely with fallback values
    const buildDimension = (key) => {
      const analysis = comprehensiveReport.analyses?.[key];
      return {
        score: comprehensiveReport.scores?.[key] || 0,
        strengths: analysis?.strengths || [],
        weaknesses: analysis?.weaknesses || [],
      };
    };

    // Return comprehensive investor-grade analysis report
    res.status(201).json({
      success: true,
      message: "Comprehensive pitch analysis completed successfully",
      data: {
        startup: {
          id: startup._id,
          name: startup.name,
          industry: startup.industry,
          stage: startup.stage,
        },
        analysis: {
          id: analysis._id,
          summary: analysis.executiveSummary,
          overallScore: comprehensiveReport.overallScore,
          riskLevel: comprehensiveReport.riskLevel,
          recommendation: comprehensiveReport.recommendation,
          
          // All 10 dimensions
          dimensions: {
            founder: buildDimension('founder'),
            problem: buildDimension('problem'),
            market: buildDimension('market'),
            product: buildDimension('product'),
            traction: buildDimension('traction'),
            businessModel: buildDimension('businessModel'),
            financial: buildDimension('financial'),
            competitive: buildDimension('competitive'),
          },
          
          // Key insights
          strengths: comprehensiveReport.strengths,
          weaknesses: comprehensiveReport.weaknesses,
          redFlags: comprehensiveReport.redFlags,
          greenFlags: comprehensiveReport.greenFlags,
          
          // Original data
          problemStatement: analysis.pitchData?.problem,
          marketSize: analysis.pitchData?.market_size,
          revenueModel: analysis.pitchData?.revenue_model,
          
          // Metrics
          metrics: {
            revenue: metrics.revenue,
            growthRate: metrics.growth_rate,
            activeUsers: metrics.users,
            runway: metrics.runway,
            burn: metrics.burn,
          },
        },
        document: {
          id: document._id,
          filename: document.originalName,
          pageCount: document.pages,
          createdAt: document.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Pitch analysis error:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({
      success: false,
      message: "Internal server error during pitch analysis",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

/**
 * GET /api/pitch-analysis/:analysisId
 * Get detailed analysis report
 */
exports.getAnalysisReport = async (req, res) => {
  try {
    const { analysisId } = req.params;

    const analysis = await prisma.pitchAnalysis.findUnique({
      where: { id: parseInt(analysisId) },
      include: {
        startup: true,
      },
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    const metrics = await prisma.financialMetrics.findFirst({
      where: { startupId: analysis.startupId },
      orderBy: { createdAt: "desc" },
    });

    const document = await prisma.document.findFirst({
      where: { startupId: analysis.startupId },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: {
        startup: analysis.startup,
        analysis: {
          id: analysis.id,
          summary: analysis.aiSummary,
          problemStatement: analysis.problemStatement,
          marketSize: analysis.marketSize,
          revenueModel: analysis.revenueModel,
          scores: {
            founder: analysis.founderScore,
            market: analysis.marketScore,
            traction: analysis.tractionScore,
            finance: analysis.financeScore,
            risk: analysis.riskScore,
            total: analysis.totalScore,
          },
          riskLevel: analysis.riskLevel,
          riskDetails: analysis.riskDetails,
          risks: analysis.redFlags,
          strengths: analysis.greenFlags,
          analyzedAt: analysis.analyzedAt,
        },
        metrics,
        document,
      },
    });
  } catch (error) {
    console.error("Get analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving analysis",
    });
  }
};

/**
 * GET /api/pitch-analysis/startup/:startupId
 * Get all analyses for a startup
 */
exports.getStartupAnalyses = async (req, res) => {
  try {
    const { startupId } = req.params;
    const { limit = 10, skip = 0 } = req.query;

    const analyses = await prisma.pitchAnalysis.findMany({
      where: { startupId: parseInt(startupId) },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
      skip: parseInt(skip),
    });

    const total = await prisma.pitchAnalysis.count({
      where: { startupId: parseInt(startupId) },
    });

    res.json({
      success: true,
      data: analyses,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    });
  } catch (error) {
    console.error("Get startup analyses error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving analyses",
    });
  }
};

/**
 * GET /api/pitch-analysis/top-startups
 * Get top-ranked startups by score
 */
exports.getTopStartups = async (req, res) => {
  try {
    const { limit = 20, industry, stage, minScore = 60 } = req.query;

    const analyses = await prisma.pitchAnalysis.findMany({
      where: {
        totalScore: { gte: parseInt(minScore) },
        startup: {
          ...(industry && { industry }),
          ...(stage && { stage }),
        },
      },
      include: { startup: true },
      orderBy: { totalScore: "desc" },
      take: parseInt(limit),
    });

    res.json({
      success: true,
      data: analyses,
      count: analyses.length,
    });
  } catch (error) {
    console.error("Get top startups error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving top startups",
    });
  }
};

/**
 * DELETE /api/pitch-analysis/:analysisId
 * Delete an analysis
 */
exports.deleteAnalysis = async (req, res) => {
  try {
    const { analysisId } = req.params;

    const analysis = await prisma.pitchAnalysis.findUnique({
      where: { id: parseInt(analysisId) },
      include: {
        startup: {
          include: { documents: true },
        },
      },
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    // Delete associated documents from disk
    for (const doc of analysis.startup.documents) {
      pdfService.deleteFile(doc.storageUrl);
    }

    // Delete from database
    await prisma.pitchAnalysis.delete({
      where: { id: parseInt(analysisId) },
    });

    await prisma.document.deleteMany({
      where: { startupId: analysis.startupId },
    });

    res.json({
      success: true,
      message: "Analysis deleted successfully",
    });
  } catch (error) {
    console.error("Delete analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting analysis",
    });
  }
};

/**
 * GET /api/pitch-analysis/:analysisId/export/pdf
 * Export analysis as PDF
 */
exports.exportAnalysisPDF = async (req, res) => {
  try {
    const { analysisId } = req.params;

    // Find analysis in MongoDB
    const analysis = await Analysis.findById(analysisId).populate("startupId");

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    const startupData = {
      startupName: analysis.startupId?.name || "Unknown Startup",
      industry: analysis.industry || "N/A",
      stage: analysis.stage || "N/A",
      founderId: analysis.startupId?.founderId || "N/A",
    };

    // Generate PDF
    const pdfResult = await generatePitchAnalysisPDF(analysis, startupData);

    if (!pdfResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate PDF",
      });
    }

    // Read the file and send it
    const filePath = pdfResult.filePath;
    const fileName = pdfResult.fileName;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Clean up file after sending (optional)
    fileStream.on("end", () => {
      setTimeout(() => {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.log("Could not delete temporary PDF file:", filePath);
        }
      }, 1000);
    });
  } catch (error) {
    console.error("Export PDF error:", error);
    res.status(500).json({
      success: false,
      message: "Error exporting analysis to PDF",
      error: error.message,
    });
  }
};
