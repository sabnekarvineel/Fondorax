import React, { useState } from 'react';
import ComprehensiveAnalysisReport from '../../../components/ComprehensiveAnalysisReport';
import './PitchAnalysis.css';

function PitchAnalysis({ user }) {
  const [pitchUrl, setPitchUrl] = useState('');
  const [pitchFile, setPitchFile] = useState(null);
  const [startupName, setStartupName] = useState('');
  const [industry, setIndustry] = useState('');
  const [stage, setStage] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file extension
      const validExtensions = ['.pdf', '.ppt', '.pptx'];
      const fileName = file.name.toLowerCase();
      const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
      
      // Validate file type (MIME type)
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-powerpoint',
        'application/x-mspowerpoint',
        'application/x-powerpoint',
        'application/vnd.ms-office'
      ];
      const hasValidType = validTypes.includes(file.type);
      
      // Check file size (max 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        setError(`Invalid file. File size exceeds 50MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`);
        setPitchFile(null);
        return;
      }

      // Validate: must be PDF or PowerPoint by extension AND type
      if (!hasValidExtension) {
        setError(`Invalid file. Please upload a Pitch Deck PDF or PowerPoint only (not resume, cover letter, or other documents).\n\nAccepted formats: .pdf, .ppt, .pptx`);
        setPitchFile(null);
        return;
      }

      if (!hasValidType) {
        setError(`Invalid file. Please ensure you're uploading a valid Pitch Deck PDF or PowerPoint file (not resume, cover letter, or other documents).`);
        setPitchFile(null);
        return;
      }

      setPitchFile(file);
      setError('');
    }
  };

  const handleAnalyze = async () => {
    if (!pitchUrl.trim() && !pitchFile) {
      setError('Please enter a URL or upload a file');
      return;
    }

    if (pitchFile && (!startupName.trim() || !industry.trim() || !stage.trim())) {
      setError('Missing required fields: Startup Name, Industry, and Stage');
      return;
    }

    setLoading(true);
    setError('');
    try {
      let response;
      const token = localStorage.getItem('token');
      
      if (pitchFile) {
        // Upload file
        const formData = new FormData();
        formData.append('file', pitchFile);
        formData.append('startupName', startupName);
        formData.append('founderId', user?.id || 'unknown');
        formData.append('industry', industry);
        formData.append('stage', stage);

        console.log('Uploading file with data:', {
          filename: pitchFile.name,
          startupName,
          founderId: user?.id,
          industry,
          stage
        });

        response = await fetch('http://localhost:5000/api/pitch-analysis/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
      } else {
        // Analyze URL
        response = await fetch('http://localhost:5000/api/pitch-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ pitchUrl })
        });
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Analysis failed');
      }
      const data = await response.json();
      console.log('Received analysis response:', data);
      const analysisToSet = data.data || data;
      console.log('Setting analysis data:', analysisToSet);
      setAnalysisData(analysisToSet);
    } catch (err) {
      setError(err.message || 'Failed to analyze pitch deck');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pitch-analysis-page">
      <div className="pitch-analysis-header">
        <h1>Pitch Deck Analysis</h1>
        <p>Analyze pitch decks using AI to get detailed insights and scoring</p>
      </div>

      <div className="pitch-analysis-container">
        <div className="input-section">
          <div className="input-tabs">
            <button
              className={`tab-button ${!pitchFile ? 'active' : ''}`}
              onClick={() => {
                setPitchFile(null);
                setError('');
              }}
            >
              Analyze by URL
            </button>
            <button
              className={`tab-button ${pitchFile ? 'active' : ''}`}
              onClick={() => {
                setPitchUrl('');
                setError('');
              }}
            >
              Upload File
            </button>
          </div>

          {!pitchFile ? (
            <div className="input-group">
              <label>Pitch Deck URL</label>
              <input
                type="text"
                value={pitchUrl}
                onChange={(e) => setPitchUrl(e.target.value)}
                placeholder="https://example.com/pitch-deck.pdf"
                className="pitch-input"
              />
            </div>
          ) : (
            <>
              <div className="input-group">
                <label>Selected File: {pitchFile.name}</label>
                <div className="file-upload-area">
                  <div className="file-info">
                    <span>📄 {pitchFile.name}</span>
                    <span className="file-size">({(pitchFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPitchFile(null)}
                    className="remove-file-btn"
                  >
                    ✕ Remove
                  </button>
                </div>
              </div>

              <div className="form-section">
                <h4>Startup Information</h4>
                <div className="form-group">
                  <label>Startup Name *</label>
                  <input
                    type="text"
                    value={startupName}
                    onChange={(e) => setStartupName(e.target.value)}
                    placeholder="Enter startup name"
                    className="pitch-input"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Industry *</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="pitch-input"
                    >
                      <option value="">Select industry</option>
                      <option value="Technology">Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Finance">Finance</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="SaaS">SaaS</option>
                      <option value="Education">Education</option>
                      <option value="Energy">Energy</option>
                      <option value="Logistics">Logistics</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Stage *</label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      className="pitch-input"
                    >
                      <option value="">Select stage</option>
                      <option value="Idea">Idea</option>
                      <option value="Pre-seed">Pre-seed</option>
                      <option value="Seed">Seed</option>
                      <option value="Series A">Series A</option>
                      <option value="Series B">Series B</option>
                      <option value="Series C">Series C</option>
                      <option value="Growth">Growth</option>
                      <option value="Mature">Mature</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {!pitchFile && (
            <div className="file-upload-section">
              <label className="file-upload-label">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.ppt,.pptx"
                  className="file-input"
                />
                <div className="file-upload-box">
                   <span className="upload-icon">📤</span>
                   <p>Click to upload or drag and drop</p>
                   <p className="file-types">Pitch Deck only - PDF or PowerPoint (max 50MB)</p>
                </div>
              </label>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="analyze-btn"
          >
            {loading ? 'Analyzing...' : 'Analyze Pitch Deck'}
          </button>

          {error && <div className="error-message">{error}</div>}
        </div>

        {analysisData && (
          <ComprehensiveAnalysisReport analysisData={analysisData} />
        )}

        {!analysisData && !loading && (
          <div className="no-data">
            <p>Enter a pitch deck URL to get started with analysis</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PitchAnalysis;
