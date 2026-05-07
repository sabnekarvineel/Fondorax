import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PitchUpload from "./components/PitchUpload";
import AnalysisDashboard from "./components/AnalysisDashboard";
import "./App.css";

function App() {
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);

  const handleAnalysisComplete = (analysisData) => {
    setCurrentAnalysis(analysisData);
    setShowDashboard(true);
  };

  const handleBackToUpload = () => {
    setShowDashboard(false);
    setCurrentAnalysis(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="logo">Fondorax</h1>
          <p className="tagline">AI-Powered Pitch Desk Analysis</p>
        </div>
      </header>

      <main className="app-main">
        {!showDashboard ? (
          <PitchUpload onAnalysisComplete={handleAnalysisComplete} />
        ) : (
          <div>
            <button className="back-button" onClick={handleBackToUpload}>
              ← Upload New Pitch
            </button>
            <AnalysisDashboard analysis={currentAnalysis} />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 Fondorax. AI-powered investment analysis platform.</p>
      </footer>
    </div>
  );
}

export default App;
