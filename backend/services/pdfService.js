const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<{success, text, pageCount, error?}>}
 */
async function extractTextFromPDF(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        error: "File not found",
      };
    }

    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    return {
      success: true,
      text: data.text,
      pageCount: data.numpages,
      metadata: data.metadata,
    };
  } catch (error) {
    console.error("PDF Extraction Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Clean and normalize extracted text
 * Removes excessive whitespace and special characters
 */
function cleanExtractedText(text) {
  if (!text) return "";

  return text
    .replace(/\s+/g, " ") // Multiple spaces to single space
    .replace(/\n\n+/g, "\n") // Multiple newlines to single
    .trim();
}

/**
 * Chunk text for AI processing
 * OpenAI has token limits, so we may need to split large documents
 */
function chunkTextForAI(text, maxChunkSize = 4000) {
  const chunks = [];
  let currentChunk = "";

  const paragraphs = text.split("\n");

  for (const para of paragraphs) {
    if ((currentChunk + para).length > maxChunkSize) {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = para;
    } else {
      currentChunk += (currentChunk ? "\n" : "") + para;
    }
  }

  if (currentChunk) chunks.push(currentChunk);

  return chunks;
}

/**
 * Save uploaded file to disk
 */
function saveUploadedFile(file, uploadDir = process.env.UPLOAD_DIR || "./uploads") {
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    const filename = `${timestamp}_${file.originalname}`;
    const filepath = path.join(uploadDir, filename);

    fs.writeFileSync(filepath, file.buffer);

    return {
      success: true,
      filename: filename,
      filepath: filepath,
      originalName: file.originalname,
      size: file.size,
    };
  } catch (error) {
    console.error("File Save Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Delete file from disk
 */
function deleteFile(filepath) {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return { success: true };
    }
    return { success: false, error: "File not found" };
  } catch (error) {
    console.error("File Delete Error:", error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  extractTextFromPDF,
  cleanExtractedText,
  chunkTextForAI,
  saveUploadedFile,
  deleteFile,
};
