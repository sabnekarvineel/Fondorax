const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/**
 * Generate a professional PDF report for pitch deck analysis
 */
function generatePitchAnalysisPDF(analysis, startupData) {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `${startupData.startupName}_Analysis_${Date.now()}.pdf`;
      const filePath = path.join(__dirname, "../exports", fileName);

      // Create exports directory if it doesn't exist
      const exportsDir = path.join(__dirname, "../exports");
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      const doc = new PDFDocument({
        margin: 40,
        size: "A4",
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Color scheme
      const primaryColor = "#1e40af";
      const accentColor = "#0891b2";
      const successColor = "#059669";
      const warningColor = "#d97706";
      const dangerColor = "#dc2626";
      const lightGray = "#f3f4f6";
      const darkGray = "#374151";

      // Header
      doc
        .fontSize(28)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text("Pitch Deck Analysis Report", { align: "center" })
        .fontSize(12)
        .fillColor(darkGray)
        .text(startupData.startupName, { align: "center" })
        .text(`Generated: ${new Date().toLocaleDateString()}`, {
          align: "center",
          fontSize: 10,
          color: "#6b7280",
        });

      doc.moveTo(40, doc.y + 10).lineTo(550, doc.y + 10).stroke(primaryColor);
      doc.moveDown(2);

      // Overall Score Card
      const overallScore = analysis.overallScore || 0;
      const scoreColor =
        overallScore >= 70 ? successColor : overallScore >= 50 ? warningColor : dangerColor;

      doc.fontSize(14).font("Helvetica-Bold").fillColor(primaryColor).text("Overall Score");

      doc.rect(40, doc.y, 520, 100).fillAndStroke(lightGray, "#e5e7eb");
      doc.font("Helvetica-Bold");

      doc.fontSize(48).fillColor(scoreColor).text(overallScore, 80, doc.y + 25, {
        align: "left",
      });

      doc
        .fontSize(16)
        .fillColor(darkGray)
        .text(getRiskLevel(overallScore), 200, doc.y - 48, { align: "left" });

      doc.fontSize(11).fillColor("#6b7280");
      const scoreWidth = 250;
      doc
        .rect(200, doc.y - 48 + 30, scoreWidth, 12)
        .fillAndStroke("#e5e7eb", "#d1d5db");

      const filledWidth = (overallScore / 100) * scoreWidth;
      doc.rect(200, doc.y - 48 + 30, filledWidth, 12).fill(scoreColor);

      doc.moveDown(5);

      // Startup Information
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text("Startup Information");
      doc.moveDown(0.5);

      const infoData = [
        ["Startup Name", startupData.startupName],
        ["Industry", startupData.industry],
        ["Stage", startupData.stage],
        ["Founder", startupData.founderId],
      ];

      infoData.forEach((row, index) => {
        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor(primaryColor)
          .text(row[0] + ":", 40, doc.y);
        doc
          .fontSize(11)
          .font("Helvetica")
          .fillColor(darkGray)
          .text(row[1], 150, doc.y - 16);
      });

      doc.moveDown(2);

      // Dimension Scores
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text("Dimension Analysis");
      doc.moveDown(1);

      const dimensions = [
        ["Founder Quality", analysis.founderScore || 0],
        ["Problem Definition", analysis.problemScore || 0],
        ["Market Opportunity", analysis.marketScore || 0],
        ["Product Solution", analysis.productScore || 0],
        ["Traction & Growth", analysis.tractionScore || 0],
        ["Business Model", analysis.businessModelScore || 0],
        ["Financial Health", analysis.financialScore || 0],
        ["Competitive Position", analysis.competitiveScore || 0],
      ];

      dimensions.forEach((dim) => {
        doc.fontSize(10).fillColor(darkGray).text(dim[0]);

        doc
          .rect(150, doc.y - 14, 350, 14)
          .fillAndStroke(lightGray, "#d1d5db");
        const barWidth = (dim[1] / 100) * 350;
        const barColor =
          dim[1] >= 70 ? successColor : dim[1] >= 50 ? warningColor : dangerColor;
        doc.rect(150, doc.y - 14, barWidth, 14).fill(barColor);

        doc.fontSize(10).fillColor("#ffffff").text(dim[1], 155, doc.y - 12, {
          align: "left",
        });
      });

      doc.moveDown(2);

      // Key Insights
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text("Key Insights");
      doc.moveDown(1);

      if (analysis.data) {
        const data = analysis.data;

        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor(accentColor)
          .text("Problem Statement");
        doc.fontSize(10).fillColor(darkGray).text(data.problem || "Not specified", {
          align: "left",
          width: 460,
        });
        doc.moveDown(1);

        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor(accentColor)
          .text("Market Opportunity");
        doc
          .fontSize(10)
          .fillColor(darkGray)
          .text(data.market_size || "Not specified", {
            align: "left",
            width: 460,
          });
        doc.moveDown(1);

        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor(accentColor)
          .text("Revenue Model");
        doc
          .fontSize(10)
          .fillColor(darkGray)
          .text(data.revenue_model || "Not specified", {
            align: "left",
            width: 460,
          });
        doc.moveDown(1);

        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor(accentColor)
          .text("Strengths");
        if (data.strengths && Array.isArray(data.strengths)) {
          data.strengths.slice(0, 3).forEach((strength) => {
            doc.fontSize(10).fillColor(successColor).text("• " + strength, {
              align: "left",
              width: 460,
            });
          });
        } else {
          doc.fontSize(10).fillColor(darkGray).text("Not specified");
        }
        doc.moveDown(1);
      }

      // Risk Assessment
      if (analysis.risks) {
        doc
          .fontSize(14)
          .font("Helvetica-Bold")
          .fillColor(primaryColor)
          .text("Risk Assessment");
        doc.moveDown(1);

        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor(accentColor)
          .text("Red Flags");
        if (analysis.risks.red_flags && Array.isArray(analysis.risks.red_flags)) {
          analysis.risks.red_flags.slice(0, 3).forEach((flag) => {
            doc.fontSize(10).fillColor(dangerColor).text("⚠ " + flag, {
              align: "left",
              width: 460,
            });
          });
        }
        doc.moveDown(0.5);

        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .fillColor(accentColor)
          .text("Green Flags");
        if (analysis.risks.green_flags && Array.isArray(analysis.risks.green_flags)) {
          analysis.risks.green_flags.slice(0, 3).forEach((flag) => {
            doc.fontSize(10).fillColor(successColor).text("✓ " + flag, {
              align: "left",
              width: 460,
            });
          });
        }
        doc.moveDown(1);
      }

      // Recommendations
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text("Recommendations");
      doc.moveDown(1);

      const recommendations = getRecommendations(analysis);
      recommendations.forEach((rec) => {
        doc.fontSize(10).fillColor(darkGray).text("• " + rec, {
          align: "left",
          width: 460,
        });
      });

      doc.moveDown(2);

      // Footer
      doc
        .fontSize(9)
        .fillColor("#9ca3af")
        .text(
          "This report was generated by Fondora-X AI Analysis Platform. Results are based on pitch deck content analysis.",
          { align: "center", width: 460 }
        );

      doc.end();

      stream.on("finish", () => {
        resolve({
          success: true,
          fileName,
          filePath,
          url: `/exports/${fileName}`,
        });
      });

      stream.on("error", (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get risk level based on score
 */
function getRiskLevel(score) {
  if (score >= 70) return "Low Risk";
  if (score >= 50) return "Medium Risk";
  return "High Risk";
}

/**
 * Get recommendations based on analysis
 */
function getRecommendations(analysis) {
  const recommendations = [];

  if ((analysis.founderScore || 0) < 50) {
    recommendations.push(
      "Strengthen founder credibility and track record visibility in the pitch"
    );
  }

  if ((analysis.problemScore || 0) < 50) {
    recommendations.push(
      "Better articulate the problem and its impact on target market"
    );
  }

  if ((analysis.marketScore || 0) < 50) {
    recommendations.push("Provide clearer market size and TAM/SAM/SOM analysis");
  }

  if ((analysis.tractionScore || 0) < 50) {
    recommendations.push("Demonstrate more traction through users, revenue, or partnerships");
  }

  if ((analysis.businessModelScore || 0) < 50) {
    recommendations.push("Clarify revenue model and unit economics");
  }

  if ((analysis.financialScore || 0) < 50) {
    recommendations.push("Improve financial projections and funding ask clarity");
  }

  if ((analysis.competitiveScore || 0) < 50) {
    recommendations.push("Better highlight competitive advantages and differentiation");
  }

  if (recommendations.length === 0) {
    recommendations.push("Pitch is well-structured. Minor refinements in data clarity recommended.");
  }

  return recommendations;
}

module.exports = {
  generatePitchAnalysisPDF,
};
