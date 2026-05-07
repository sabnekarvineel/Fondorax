import React, { useState } from 'react';
import './EligibilityChecker.css';

const EligibilityChecker = ({ onSubmit }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    startupName: '',
    isRegistered: false,
    registrationType: 'None',
    stage: 'Idea',
    monthlyRevenue: 0,
    sector: '',
    teamSize: 1,
    isFemaleFounder: false,
    isFirstTimeFounder: true,
    isSCSTStartup: false,
    hasPatent: false,
    headquarterState: '',
    hasRevenue: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="eligibility-checker">
      <div className="checker-header">
        <h3>🧠 Eligibility Checker</h3>
        <p>Find schemes you're eligible for</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Startup Info */}
        {step === 1 && (
          <div className="form-step">
            <h4>Step 1: Startup Info</h4>

            <div className="form-group">
              <label>Startup Name</label>
              <input
                type="text"
                name="startupName"
                placeholder="Your startup name"
                value={formData.startupName}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isRegistered"
                  checked={formData.isRegistered}
                  onChange={handleInputChange}
                />
                <span>Registered as Startup?</span>
              </label>
            </div>

            {formData.isRegistered && (
              <div className="form-group">
                <label>Registration Type</label>
                <select
                  name="registrationType"
                  value={formData.registrationType}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="None">Select Type</option>
                  <option value="DPIIT">DPIIT (Startup India)</option>
                  <option value="MSME">MSME</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Stage & Sector */}
        {step === 2 && (
          <div className="form-step">
            <h4>Step 2: Stage & Sector</h4>

            <div className="form-group">
              <label>Current Stage</label>
              <select
                name="stage"
                value={formData.stage}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="Idea">Idea</option>
                <option value="MVP">MVP</option>
                <option value="Early Revenue">Early Revenue</option>
                <option value="Growth">Growth</option>
                <option value="Scale">Scale</option>
              </select>
            </div>

            <div className="form-group">
              <label>Sector</label>
              <select
                name="sector"
                value={formData.sector}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Select Sector</option>
                <option value="Tech">Tech</option>
                <option value="EdTech">EdTech</option>
                <option value="AgriTech">AgriTech</option>
                <option value="FinTech">FinTech</option>
                <option value="HealthTech">HealthTech</option>
                <option value="Deeptech">Deeptech</option>
                <option value="SaaS">SaaS</option>
              </select>
            </div>

            <div className="form-group">
              <label>Team Size</label>
              <input
                type="number"
                name="teamSize"
                min="1"
                max="100"
                value={formData.teamSize}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>
        )}

        {/* Step 3: Revenue & Location */}
        {step === 3 && (
          <div className="form-step">
            <h4>Step 3: Revenue & Location</h4>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="hasRevenue"
                  checked={formData.hasRevenue}
                  onChange={handleInputChange}
                />
                <span>Already generating revenue?</span>
              </label>
            </div>

            {formData.hasRevenue && (
              <div className="form-group">
                <label>Monthly Revenue (₹)</label>
                <input
                  type="number"
                  name="monthlyRevenue"
                  min="0"
                  value={formData.monthlyRevenue}
                  onChange={handleInputChange}
                  placeholder="Enter monthly revenue"
                  className="form-input"
                />
              </div>
            )}

            <div className="form-group">
              <label>Headquarters State</label>
              <select
                name="headquarterState"
                value={formData.headquarterState}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Select State</option>
                <option value="Telangana">Telangana</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Delhi">Delhi</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 4: Demographics & IP */}
        {step === 4 && (
          <div className="form-step">
            <h4>Step 4: Demographics & IP</h4>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isFemaleFounder"
                  checked={formData.isFemaleFounder}
                  onChange={handleInputChange}
                />
                <span>Female Founder/Co-founder</span>
              </label>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isFirstTimeFounder"
                  checked={formData.isFirstTimeFounder}
                  onChange={handleInputChange}
                />
                <span>First Time Founder</span>
              </label>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isSCSTStartup"
                  checked={formData.isSCSTStartup}
                  onChange={handleInputChange}
                />
                <span>SC/ST Startup</span>
              </label>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="hasPatent"
                  checked={formData.hasPatent}
                  onChange={handleInputChange}
                />
                <span>Have Patent/IP</span>
              </label>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="form-navigation">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={prevStep}
            disabled={step === 1}
          >
            ← Back
          </button>

          {step < 4 ? (
            <button type="button" className="btn btn-primary" onClick={nextStep}>
              Next →
            </button>
          ) : (
            <button type="submit" className="btn btn-success">
              Check Eligibility ✓
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="form-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
          <p className="progress-text">Step {step} of 4</p>
        </div>
      </form>
    </div>
  );
};

export default EligibilityChecker;
