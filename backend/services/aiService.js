const axios = require("axios");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

/**
 * Clean and parse JSON response from AI
 * Handles markdown code fences and extra whitespace
 */
function cleanAndParseJSON(text) {
  try {
    // Remove ```json ``` wrappers
    let cleaned = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Try to extract JSON if wrapped in other text
    // Match from first { to last }
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }

    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (err) {
    console.error("JSON Parse Error:", err.message);
    console.error("Text attempted to parse:", text.substring(0, 500));
    throw new Error("Failed to parse AI response as JSON");
  }
}

/**
 * Sanitize numeric fields from AI response
 * Converts strings with numbers to actual numbers, null for non-numeric
 */
function sanitizeNumericFields(data) {
  if (!data || !data.traction) return data;

  const sanitizeField = (value) => {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      // Extract first number from string (e.g., "100K+" -> 100, "18–22" -> 18)
      const match = value.match(/(\d+(?:[.,]\d+)?)/);
      return match ? parseFloat(match[1].replace(",", "")) : null;
    }
    return null;
  };

  return {
    ...data,
    traction: {
      revenue: sanitizeField(data.traction.revenue),
      growth_rate: sanitizeField(data.traction.growth_rate),
      users: sanitizeField(data.traction.users),
      runway: sanitizeField(data.traction.runway),
      burn_rate: sanitizeField(data.traction.burn_rate),
    },
  };
}
// Use FREE models from OpenRouter - best available
const MODEL = process.env.OPENROUTER_MODEL || "mistralai/mistral-small-3.1-24b-instruct:free";
const FALLBACK_MODELS = [
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "venice/dolphin-mistral-24b:free",
  "meta-llama/llama-2-7b-chat:free",
  "openrouter/auto"  // Use OpenRouter's auto-selection
];

// Validate API key on module load
if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === "undefined" || OPENROUTER_API_KEY.includes("YOUR_ACTUAL")) {
  console.error("❌ CRITICAL: OPENROUTER_API_KEY is not set in .env file");
  console.error("   Please create a .env file with your actual API key");
  console.error("   Reference: .env.example");
}

/**
 * Analyze pitch deck text using OpenAI
 * Extracts structured insights from pitch content
 */
async function analyzePitchContent(text) {
  try {
    // Validate API key before making request
    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.includes("YOUR_ACTUAL")) {
      console.error("❌ CRITICAL: Missing or invalid OPENROUTER_API_KEY");
      return {
        success: false,
        error: "API key not configured. Please check .env file.",
      };
    }

    console.log("📊 Starting pitch analysis with AI...");
    
    // Truncate text to reduce token usage (first 5000 chars = ~1250 tokens)
    const truncatedText = text.substring(0, 5000);
    
    const prompt = `Extract startup pitch info into JSON. Return ONLY this JSON, no markdown:
{
  "problem": "main problem",
  "market_size": "TAM if mentioned",
  "revenue_model": "revenue approach",
  "stage": "funding stage",
  "funding_ask": "amount",
  "team": "founders",
  "traction": {"revenue": null, "growth_rate": null, "users": null, "runway": null, "burn_rate": null},
  "competition": "competitors",
  "risks": [],
  "strengths": []
}

PITCH:
${truncatedText}

Return ONLY the JSON object. No explanation, no additional text.`;

    let response;
    let modelIndex = 0;
    let modelToUse = MODEL;
    const modelsToTry = [MODEL, ...FALLBACK_MODELS];

    // Try with primary model, fallback to others if needed
    for (modelIndex = 0; modelIndex < modelsToTry.length; modelIndex++) {
      modelToUse = modelsToTry[modelIndex];
      
      try {
        console.log(`Attempting API call with model (${modelIndex + 1}/${modelsToTry.length}): ${modelToUse}`);
        
        response = await axios.post(
          `${OPENROUTER_BASE_URL}/chat/completions`,
          {
            model: modelToUse,
            messages: [
              {
                role: "system",
                content: "You are a venture capital analyst. Extract ONLY ACTUAL information from pitch decks. Return ONLY valid JSON with actual data, not generated or assumed data. Do NOT include markdown code fences. No explanation, only JSON.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            max_tokens: 700,
            temperature: 0.3, // Lower temperature for factual extraction
          },
          {
            headers: {
              "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "http://localhost:3000",
              "X-Title": "Fondorax Pitch Analyzer",
            },
            timeout: 30000,
          }
        );

        console.log(`✅ Model ${modelToUse} succeeded`);
        // Success - break out of retry loop
        break;
      } catch (error) {
        console.warn(`Model ${modelToUse} failed (${error.response?.status}): ${error.message}`);
        
        // Try next fallback model
        if (modelIndex < modelsToTry.length - 1) {
          console.log(`Retrying with next model...`);
          continue;
        } else {
          console.error(`All models failed. Last error: ${error.message}`);
          throw error;
        }
      }
    }

    if (!response.data.choices[0].message.content) {
      throw new Error("Empty response from API");
    }

    console.log(`✅ AI Analysis successful with model: ${modelToUse}`);
    
    let extractedData;
    try {
      extractedData = cleanAndParseJSON(response.data.choices[0].message.content);
      // Sanitize numeric fields to ensure they can be saved to MongoDB
      extractedData = sanitizeNumericFields(extractedData);
    } catch (parseError) {
      console.error("Failed to parse AI response:", response.data.choices[0].message.content);
      return {
        success: false,
        error: "Failed to parse API response",
      };
    }

    return {
      success: true,
      data: extractedData,
      tokens_used: response.data.usage.total_tokens,
      model_used: modelToUse,
    };
  } catch (error) {
    console.error("❌ AI Analysis Error:", error.message);
    if (error.response?.data) {
      console.error("API Error Details:", error.response.data);
    }
    return {
      success: false,
      error: error.message || "Failed to analyze pitch deck",
    };
  }
}

/**
 * Fallback analysis using local text processing
 * Extracts information from pitch content without API calls
 */
function generateFallbackAnalysis(text) {
  try {
    const lowerText = text.toLowerCase();
    
    // Extract problem statement
    const problemMatch = text.match(/(?:problem[:\s]+|challenges?[:\s]+|issues?[:\s]+)(.*?)(?=\n\n|\n[A-Z]|market|solution)/i);
    const problem = problemMatch ? problemMatch[1].trim().substring(0, 200) : "Solves challenges faced by early-stage entrepreneurs and investors";
    
    // Extract market size
    const marketMatch = text.match(/(?:market\s+(?:size|opportunity|TAM)[:\s]+|TAM[:\s]+|market[:\s]+)([\d\.\s$MB]+)/i);
    const marketSize = marketMatch ? marketMatch[1].trim() : "Market size not explicitly mentioned";
    
    // Extract revenue model
    const revenueMatch = text.match(/(?:revenue\s+model[:\s]+|monetization[:\s]+|pricing[:\s]+)(.*?)(?=\n\n|\n[A-Z]|traction|financial)/i);
    const revenueModel = revenueMatch ? revenueMatch[1].trim().substring(0, 150) : "Subscription-based with value-added services";
    
    // Extract traction indicators
    const tractionIndicators = [];
    if (lowerText.includes("users")) tractionIndicators.push("Active user base");
    if (lowerText.includes("revenue") || lowerText.includes("mrr") || lowerText.includes("arr")) tractionIndicators.push("Revenue generation");
    if (lowerText.includes("partnership")) tractionIndicators.push("Strategic partnerships");
    if (lowerText.includes("growth") || lowerText.includes("scaling")) tractionIndicators.push("Growth trajectory");
    if (tractionIndicators.length === 0) tractionIndicators.push("Early-stage validation");
    
    // Identify risks
    const risks = [
      "Early-stage market validation",
      "Competitive landscape challenges",
      "Scalability and execution risk",
      "Team and talent retention",
      "Market adoption timeline"
    ];
    
    // Identify strengths
    const strengths = [
      "Clear problem-solution fit",
      "Innovative approach to market gap",
      "Focused on scalable business model",
      "Addressing underserved market",
      "Strong value proposition"
    ];
    
    const data = {
      problem,
      market_size: marketSize,
      revenue_model: revenueModel,
      traction: {
        indicators: tractionIndicators,
        stage: "early"
      },
      team: "Founding team with startup experience",
      competition: "Operating in emerging market with limited direct competition",
      risks,
      strengths,
      stage: "Seed",
      funding_ask: "Early-stage funding round"
    };
    
    console.log("✅ Fallback Analysis generated successfully");
    return {
      success: true,
      data,
      source: "local_analysis"
    };
  } catch (error) {
    console.error("Fallback Analysis Error:", error);
    return {
      success: false,
      error: "Unable to process pitch content",
    };
  }
}

/**
 * Generate fallback executive summary
 */
function generateFallbackSummary(pitchData, analysisScores) {
  const stage = pitchData.stage || "Early-stage";
  const problem = pitchData.problem || "Not specified";
  const market = pitchData.market_size || "Not disclosed";
  const revenue = pitchData.revenue_model || "Not specified";
  const overallScore = analysisScores.totalScore || 50;
  
  let investmentThesis = "N/A";
  if (overallScore >= 75) {
    investmentThesis = "Strong investment opportunity with solid fundamentals and market potential.";
  } else if (overallScore >= 60) {
    investmentThesis = "Moderate investment opportunity with potential but requiring validation on key metrics.";
  } else if (overallScore >= 45) {
    investmentThesis = "Early-stage opportunity with significant potential but notable execution risks.";
  } else {
    investmentThesis = "Requires further development and validation before serious investment consideration.";
  }

  return `${stage} startup addressing: "${problem.substring(0, 100)}...". Market opportunity: ${market}. Revenue model: ${revenue}. ` +
         `Overall investment score: ${overallScore}/100. Key thesis: ${investmentThesis} ` +
         `Founder strength (${analysisScores.founderScore}/100), Market attractiveness (${analysisScores.marketScore}/100), ` +
         `and Traction (${analysisScores.tractionScore}/100) are key evaluation factors. Recommend detailed due diligence on identified risk areas.`;
}

/**
 * Generate executive summary from pitch analysis
 */
async function generateExecutiveSummary(pitchData, analysisScores) {
  try {
    const summaryPrompt = `Based on the following pitch analysis data, generate a professional executive summary for investors (150-200 words):

Pitch Data:
- Problem: ${pitchData.problem}
- Market Size: ${pitchData.market_size}
- Revenue Model: ${pitchData.revenue_model}
- Traction: ${JSON.stringify(pitchData.traction)}
- Stage: ${pitchData.stage}

Analysis Scores:
- Founder Score: ${analysisScores.founderScore}/100
- Market Score: ${analysisScores.marketScore}/100
- Traction Score: ${analysisScores.tractionScore}/100
- Overall Score: ${analysisScores.totalScore}/100

Generate a concise, professional summary highlighting key investment thesis and risks.`;

    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      {
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "You are a professional VC analyst. Write clear, compelling executive summaries.",
          },
          {
            role: "user",
            content: summaryPrompt,
          },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Fondorax Pitch Analyzer",
        },
        timeout: 30000,
      }
    );

    return {
      success: true,
      summary: response.data.choices[0].message.content,
    };
  } catch (error) {
    console.error("Summary Generation Error:", error.message);
    console.log("Using fallback summary...");
    return {
      success: true,
      summary: generateFallbackSummary(pitchData, analysisScores),
      source: "fallback"
    };
  }
}

/**
 * Identify red flags and risk indicators
 */
async function identifyRisks(pitchData) {
  try {
    const riskPrompt = `Identify risks in: Problem: ${pitchData.problem?.substring(0, 200) || 'N/A'}. Market: ${pitchData.market_size?.substring(0, 100) || 'N/A'}. Traction: ${pitchData.traction?.users || 0} users.

Return JSON:
{
  "red_flags": ["flag1", "flag2"],
  "green_flags": ["positive1", "positive2"],
  "risk_level": "Low|Medium|High",
  "risk_summary": "brief"
}`;

    let response;
    let modelIndex = 0;
    let modelToUse = MODEL;
    const modelsToTry = [MODEL, ...FALLBACK_MODELS];

    // Try with primary model, fallback to others if needed
    for (modelIndex = 0; modelIndex < modelsToTry.length; modelIndex++) {
      modelToUse = modelsToTry[modelIndex];
      
      try {
        console.log(`Risk analysis attempting model (${modelIndex + 1}/${modelsToTry.length}): ${modelToUse}`);
        
        response = await axios.post(
          `${OPENROUTER_BASE_URL}/chat/completions`,
          {
            model: modelToUse,
            messages: [
              {
                role: "system",
                content: "You are an expert in startup risk assessment. Identify real, specific risks. Return ONLY valid JSON, no markdown, no code fences, no explanation.",
              },
              {
                role: "user",
                content: riskPrompt,
              },
            ],
            max_tokens: 700,
            temperature: 0.7,
          },
          {
            headers: {
              "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "http://localhost:3000",
              "X-Title": "Fondorax Pitch Analyzer",
            },
            timeout: 30000,
          }
        );

        console.log(`✅ Risk analysis model ${modelToUse} succeeded`);
        // Success - break out of retry loop
        break;
      } catch (error) {
        console.warn(`Risk analysis with ${modelToUse} failed: ${error.message}`);
        
        // Try next fallback model
        if (modelIndex < modelsToTry.length - 1) {
          console.log(`Risk analysis retrying with next model...`);
          continue;
        } else {
          console.error(`All risk analysis models failed`);
          throw error;
        }
      }
    }

    const riskAnalysis = cleanAndParseJSON(response.data.choices[0].message.content);
    return {
      success: true,
      risks: riskAnalysis,
    };
  } catch (error) {
    console.error("Risk Analysis Error:", error.message);
    // Return fallback risk analysis instead of failing
    return {
      success: true,
      risks: {
        red_flags: ["Early-stage market validation required", "Team execution risk", "Market adoption timeline"],
        green_flags: ["Clear problem statement", "Identified market opportunity"],
        risk_level: "Medium",
        risk_summary: "Typical early-stage startup risks requiring standard due diligence"
      }
    };
  }
}

/**
 * Validate that uploaded document is actually a pitch deck
 * STRICT MODE: Only accepts documents with clear pitch deck indicators
 * Rejects: resumes, cover letters, reports, articles, and any non-pitch documents
 */
async function validatePitchDeck(text) {
  try {
    const lowerText = text.toLowerCase();
    
    // REJECT: Red flags that indicate a resume/CV
    const resumeIndicators = [
      /professional summary/i,
      /work experience/i,
      /employment history/i,
      /skills & expertise/i,
      /certifications?/i,
      /education:/i,
      /years? of experience/i,
      /resume|curriculum vitae|cv\b/i,
      /previous (employer|position|role)/i,
      /technical skills/i,
      /languages?:/i,
      /phone:|email:|linkedin/i,
      /objective:|career summary/i
    ];
    
    // REJECT: Red flags that indicate a cover letter
    const coverLetterIndicators = [
      /dear (hiring|selection|recruiting)/i,
      /i am writing to express/i,
      /i am interested in/i,
      /sincerely|regards,|best regards/i,
      /cover letter/i,
      /thank you for considering/i,
      /i look forward to hearing/i,
      /closing|yours truly/i
    ];
    
    // REJECT: Red flags for other documents (reports, articles, etc)
    const otherDocIndicators = [
      /annual report/i,
      /financial statement/i,
      /white paper/i,
      /research paper/i,
      /case study/i,
      /table of contents/i,
      /abstract:/i,
      /introduction:/i,
      /conclusion:/i,
      /references:/i,
      /executive summary:/i,
      /department of|ministry of|government/i
    ];
    
    const resumeMatches = resumeIndicators.filter(regex => regex.test(lowerText)).length;
    const coverLetterMatches = coverLetterIndicators.filter(regex => regex.test(lowerText)).length;
    const otherDocMatches = otherDocIndicators.filter(regex => regex.test(lowerText)).length;
    
    // STRICT: Reject any document with resume/CV patterns
    if (resumeMatches >= 2) {
      return {
        success: true,
        isPitchDeck: false,
        reason: "Detected resume/CV document - Please upload a Pitch Deck PDF only"
      };
    }
    
    // STRICT: Reject any document with cover letter patterns
    if (coverLetterMatches >= 1) {
      return {
        success: true,
        isPitchDeck: false,
        reason: "Detected cover letter document - Please upload a Pitch Deck PDF only"
      };
    }
    
    // STRICT: Reject any document with other document patterns
    if (otherDocMatches >= 2) {
      return {
        success: true,
        isPitchDeck: false,
        reason: "Detected non-pitch document - Please upload a Pitch Deck PDF only"
      };
    }
    
    // REQUIRED: Green flags that MUST indicate a pitch deck
    const pitchDeckRequiredIndicators = [
      /problem|solution/i,
      /market (opportunity|size|addressable|tam)/i,
      /business model|revenue model|monetization/i,
      /team|founders?|leadership/i,
      /investment ask|funding|raise|valuation/i
    ];
    
    // OPTIONAL: Additional pitch deck indicators
    const pitchDecksOptionalIndicators = [
      /pitch|deck|presentation/i,
      /traction|metrics|growth|scale/i,
      /competitive (advantage|landscape|analysis)/i,
      /go.?to.?market|distribution/i,
      /roadmap|vision|mission|strategy/i,
      /use of funds|capital allocation/i
    ];
    
    const requiredMatches = pitchDeckRequiredIndicators.filter(regex => regex.test(lowerText)).length;
    const optionalMatches = pitchDecksOptionalIndicators.filter(regex => regex.test(lowerText)).length;
    
    console.log("Pitch deck validation:", { requiredMatches, optionalMatches, resumeMatches, coverLetterMatches, otherDocMatches });
    
    // STRICT: Must have at least 3 required pitch indicators + 2 optional
    if (requiredMatches >= 3 && optionalMatches >= 2) {
      console.log("✅ Document validated as Pitch Deck");
      return {
        success: true,
        isPitchDeck: true,
      };
    }
    
    // If AI key is available, do deeper validation for borderline cases
    if (OPENROUTER_API_KEY && !OPENROUTER_API_KEY.includes("YOUR_ACTUAL") && requiredMatches >= 2) {
      try {
        console.log("Running AI validation for document classification...");
        const response = await axios.post(
          `${OPENROUTER_BASE_URL}/chat/completions`,
          {
            model: MODEL,
            messages: [
              {
                role: "system",
                content: "You are a strict document classifier. ONLY return true for startup pitch decks. Return false for anything else (resume, cover letter, report, article, etc). Return ONLY valid JSON: {\"isPitchDeck\": boolean, \"confidence\": 0-100, \"reason\": \"explanation\"}. No markdown. No code fences. Only JSON."
              },
              {
                role: "user",
                content: `Is this document a startup pitch deck? Be STRICT - only return true for actual pitch decks.\n\nDocument preview (first 1000 chars):\n${text.substring(0, 1000)}\n\nRespond with JSON only: {"isPitchDeck": boolean, "confidence": number, "reason": "string"}`
              }
            ],
            max_tokens: 300,
            temperature: 0.2,
          },
          {
            headers: {
              Authorization: `Bearer ${OPENROUTER_API_KEY}`,
              "HTTP-Referer": "https://fondorax.com",
              "X-Title": "Fondorax Pitch Analysis",
            },
          }
        );

        const aiResult = cleanAndParseJSON(response.data.choices[0].message.content);
        console.log("AI classification result:", aiResult);
        
        if (aiResult.isPitchDeck && aiResult.confidence >= 70) {
          console.log("✅ AI validated as Pitch Deck");
          return {
            success: true,
            isPitchDeck: true,
          };
        }
        
        return {
          success: true,
          isPitchDeck: false,
          reason: aiResult.reason || "AI determined this is not a pitch deck"
        };
      } catch (aiError) {
        console.warn("AI validation error, using pattern-based decision:", aiError.message);
      }
    }
    
    // STRICT: Reject if doesn't meet minimum criteria
    return {
      success: true,
      isPitchDeck: false,
      reason: "Document does not appear to be a Pitch Deck - Please ensure your PDF contains business model, market opportunity, team info, and funding ask"
    };
  } catch (error) {
    console.error("Pitch deck validation error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  analyzePitchContent,
  generateExecutiveSummary,
  identifyRisks,
  validatePitchDeck,
};
