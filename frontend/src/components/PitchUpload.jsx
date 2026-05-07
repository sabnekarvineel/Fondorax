import React, { useState } from "react";
import { FiUpload, FiLoader } from "react-icons/fi";
import { uploadPitchDeck } from "../services/pitchAnalysisApi";
import "../styles/PitchUpload.css";

export default function PitchUpload({ onAnalysisComplete }) {
    const [formData, setFormData] = useState({
        startupName: "",
        founderId: "",
        industry: "",
        stage: "Seed",
        file: null,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fileName, setFileName] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const maxSize = 50 * 1024 * 1024; // 50MB

            if (file.type !== "application/pdf") {
                setError("Invalid file. Please upload a Pitch Deck PDF only (not resume, cover letter, or other documents).");
                setFileName(null);
                return;
            }

            if (file.size > maxSize) {
                setError(`Invalid file. File size exceeds 50MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`);
                setFileName(null);
                return;
            }

            setFormData((prev) => ({
                ...prev,
                file: file,
            }));
            setFileName(file.name);
            setError(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.target.classList.add("drag-over");
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.target.classList.remove("drag-over");
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.target.classList.remove("drag-over");

        const file = e.dataTransfer.files[0];
        const maxSize = 50 * 1024 * 1024; // 50MB

        if (!file) {
            setError("Invalid file. Please try again.");
            return;
        }

        if (file.type !== "application/pdf") {
            setError("Invalid file. Please drop a Pitch Deck PDF only (not resume, cover letter, or other documents).");
            setFileName(null);
            return;
        }

        if (file.size > maxSize) {
            setError(`Invalid file. File size exceeds 50MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`);
            setFileName(null);
            return;
        }

        setFormData((prev) => ({
            ...prev,
            file: file,
        }));
        setFileName(file.name);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.startupName || !formData.founderId || !formData.file || !formData.industry) {
            setError("Please fill all required fields");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload = new FormData();
            payload.append("startupName", formData.startupName);
            payload.append("founderId", formData.founderId);
            payload.append("industry", formData.industry);
            payload.append("stage", formData.stage);
            payload.append("file", formData.file);

            const result = await uploadPitchDeck(payload);

            if (result.success) {
                onAnalysisComplete(result.data);
                // Reset form
                setFormData({
                    startupName: "",
                    founderId: "",
                    industry: "",
                    stage: "Seed",
                    file: null,
                });
                setFileName(null);
            } else {
                setError(result.message || "Analysis failed");
            }
        } catch (err) {
            setError(err.message || "Error uploading file");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pitch-upload-container">
            <div className="upload-card">
                <h2>Upload Pitch Deck</h2>
                <form onSubmit={handleSubmit}>
                    {/* Startup Information */}
                    <div className="form-section">
                        <h3>Startup Information</h3>

                        <div className="form-group">
                            <label htmlFor="startupName">Startup Name *</label>
                            <input
                                type="text"
                                id="startupName"
                                name="startupName"
                                value={formData.startupName}
                                onChange={handleInputChange}
                                placeholder="e.g., TechStartup Inc"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="founderId">Founder ID *</label>
                                <input
                                    type="text"
                                    id="founderId"
                                    name="founderId"
                                    value={formData.founderId}
                                    onChange={handleInputChange}
                                    placeholder="Founder identifier"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="industry">Industry *</label>
                                <select
                                    id="industry"
                                    name="industry"
                                    value={formData.industry}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Industry</option>
                                    <option value="SaaS">SaaS</option>
                                    <option value="FinTech">FinTech</option>
                                    <option value="HealthTech">HealthTech</option>
                                    <option value="E-commerce">E-commerce</option>
                                    <option value="EdTech">EdTech</option>
                                    <option value="AI/ML">AI/ML</option>
                                    <option value="ClimaTech">ClimateTech</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="stage">Stage</label>
                                <select
                                    id="stage"
                                    name="stage"
                                    value={formData.stage}
                                    onChange={handleInputChange}
                                >
                                    <option value="Seed">Seed</option>
                                    <option value="Series A">Series A</option>
                                    <option value="Series B">Series B</option>
                                    <option value="Series C">Series C+</option>
                                    <option value="Growth">Growth</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="form-section">
                        <h3>Upload Pitch Deck</h3>
                        <div
                            className="file-upload-area"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className="upload-icon">
                                <FiUpload size={40} />
                            </div>
                            <p>Drag and drop your Pitch Deck PDF here or</p>
                            <label className="file-label">
                                <span>Choose File</span>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    hidden
                                />
                            </label>
                            <p className="file-info">Pitch Deck PDF only • Max 50MB</p>
                            {fileName && <p className="selected-file">✓ {fileName}</p>}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && <div className="error-message">{error}</div>}

                    {/* Submit Button */}
                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? (
                            <>
                                <FiLoader className="spinner" /> Analyzing Pitch...
                            </>
                        ) : (
                            "Analyze Pitch Deck"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
