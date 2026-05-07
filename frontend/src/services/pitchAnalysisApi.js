import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Upload pitch deck and start analysis
 */
export const uploadPitchDeck = async (formData) => {
  try {
    const response = await api.post("/pitch-analysis/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get detailed analysis report
 */
export const getAnalysisReport = async (analysisId) => {
  try {
    const response = await api.get(`/pitch-analysis/${analysisId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get all analyses for a startup
 */
export const getStartupAnalyses = async (startupId, limit = 10, skip = 0) => {
  try {
    const response = await api.get(
      `/pitch-analysis/startup/${startupId}?limit=${limit}&skip=${skip}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get top-ranked startups
 */
export const getTopStartups = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.limit) queryParams.append("limit", filters.limit);
    if (filters.industry) queryParams.append("industry", filters.industry);
    if (filters.stage) queryParams.append("stage", filters.stage);
    if (filters.minScore) queryParams.append("minScore", filters.minScore);

    const response = await api.get(`/pitch-analysis/top-startups?${queryParams}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete analysis
 */
export const deleteAnalysis = async (analysisId) => {
  try {
    const response = await api.delete(`/pitch-analysis/${analysisId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Export analysis as PDF
 */
export const exportAnalysisPDF = async (analysisId) => {
  try {
    const response = await api.get(`/pitch-analysis/${analysisId}/export/pdf`, {
      responseType: "blob",
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `analysis_${analysisId}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default api;
