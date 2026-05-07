import React, { useState } from 'react';
import axios from 'axios';

function CreateListingForm({ onSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        description: '',
        industry: 'Other',
        location: '',
        revenue: '',
        growthRate: '',
        askingValuation: '',
        listingType: 'startup_exit',
        assetType: 'Equity',
        exitType: 'partial',
        equityOffered: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const assetTypes = [
        { value: 'Equity', label: 'Equity (Startup Exit)' },
        { value: 'Whole Company', label: 'Whole Company (Full Sale)' },
        { value: 'IP/Patents', label: 'IP/Patents' },
        { value: 'Domain', label: 'Domain' },
        { value: 'SaaS Product', label: 'SaaS Product' },
        { value: 'Code/Framework', label: 'Code/Framework' },
        { value: 'Design System', label: 'Design System' },
        { value: 'Database', label: 'Database' },
        { value: 'API', label: 'API' },
        { value: 'Brand/Trademark', label: 'Brand/Trademark' },
        { value: 'Other', label: 'Other' }
    ];

    const industries = [
        'SaaS',
        'FinTech',
        'HealthTech',
        'E-commerce',
        'EdTech',
        'AI/ML',
        'MarTech',
        'Other'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleAssetTypeChange = (e) => {
        const selectedType = e.target.value;
        setFormData(prev => ({
            ...prev,
            assetType: selectedType,
            listingType: selectedType === 'Equity' ? 'startup_exit' : 'asset'
        }));
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            setError('Title is required');
            return false;
        }
        if (!formData.askingValuation || parseFloat(formData.askingValuation) <= 0) {
            setError('Asking valuation/price must be greater than 0');
            return false;
        }
        if (formData.assetType === 'Equity') {
            if (!formData.exitType) {
                setError('Exit type is required for equity listings');
                return false;
            }
            if (!formData.equityOffered || parseFloat(formData.equityOffered) <= 0 || parseFloat(formData.equityOffered) > 100) {
                setError('Equity offered must be between 1 and 100%');
                return false;
            }
        }
        if (formData.assetType === 'Whole Company') {
            if (!formData.askingValuation || parseFloat(formData.askingValuation) <= 0) {
                setError('Sale price is required for whole company listings');
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const payload = {
                title: formData.title,
                description: formData.description,
                industry: formData.industry,
                location: formData.location,
                monthlyRevenue: parseFloat(formData.revenue) || 0,
                growthRate: parseFloat(formData.growthRate) || 0,
                askingPrice: parseFloat(formData.askingValuation),
                assetType: formData.assetType
            };

            if (formData.assetType === 'Equity') {
                payload.exitType = formData.exitType;
                payload.equityOffered = parseFloat(formData.equityOffered);
            } else if (formData.assetType === 'Whole Company') {
                payload.exitType = 'full';
            } else {
                payload.exitType = 'full';
            }

            await axios.post(
                'http://localhost:5000/api/marketplace/listings',
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setFormData({
                title: '',
                company: '',
                description: '',
                industry: 'Other',
                location: '',
                revenue: '',
                growthRate: '',
                askingValuation: '',
                listingType: 'startup_exit',
                assetType: 'Equity',
                exitType: 'partial',
                equityOffered: ''
            });

            onSuccess?.();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
            <h2 style={{ margin: '0 0 24px 0', color: '#1e293b', fontSize: '28px' }}>
                Create New Listing
            </h2>

            {error && (
                <div style={{
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    fontSize: '14px'
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    {/* Title */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#1e293b', fontWeight: '600' }}>
                            Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="e.g., AI-Powered Analytics Platform"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Company */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#1e293b', fontWeight: '600' }}>
                            Company Name
                        </label>
                        <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            placeholder="Optional - defaults to title"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Type of Asset */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#1e293b', fontWeight: '600' }}>
                            Type of Asset *
                        </label>
                        <select
                            name="assetType"
                            value={formData.assetType}
                            onChange={handleAssetTypeChange}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                backgroundColor: 'white'
                            }}
                        >
                            {assetTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Industry */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#1e293b', fontWeight: '600' }}>
                            Industry
                        </label>
                        <select
                            name="industry"
                            value={formData.industry}
                            onChange={handleInputChange}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                backgroundColor: 'white'
                            }}
                        >
                            {industries.map(ind => (
                                <option key={ind} value={ind}>
                                    {ind}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Location */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#1e293b', fontWeight: '600' }}>
                            Location
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="e.g., San Francisco, CA"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Asking Valuation */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#1e293b', fontWeight: '600' }}>
                            Asking Valuation ($) *
                        </label>
                        <input
                            type="number"
                            name="askingValuation"
                            value={formData.askingValuation}
                            onChange={handleInputChange}
                            placeholder="e.g., 500000"
                            min="1"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Revenue */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#1e293b', fontWeight: '600' }}>
                            Annual Revenue ($)
                        </label>
                        <input
                            type="number"
                            name="revenue"
                            value={formData.revenue}
                            onChange={handleInputChange}
                            placeholder="e.g., 100000"
                            min="0"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Growth Rate */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#1e293b', fontWeight: '600' }}>
                            Growth Rate (%)
                        </label>
                        <input
                            type="number"
                            name="growthRate"
                            value={formData.growthRate}
                            onChange={handleInputChange}
                            placeholder="e.g., 25"
                            min="0"
                            max="500"
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Conditional Fields for Equity */}
                    {formData.assetType === 'Equity' && (
                        <>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#1e293b', fontWeight: '600' }}>
                                    Exit Type *
                                </label>
                                <select
                                    name="exitType"
                                    value={formData.exitType}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    <option value="partial">Partial Exit</option>
                                    <option value="full">Full Exit</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#1e293b', fontWeight: '600' }}>
                                    Equity Offered (%) *
                                </label>
                                <input
                                    type="number"
                                    name="equityOffered"
                                    value={formData.equityOffered}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 10"
                                    min="0.1"
                                    max="100"
                                    step="0.1"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </>
                    )}

                    {/* Conditional Fields for Whole Company Sale */}
                    {formData.assetType === 'Whole Company' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#1e293b', fontWeight: '600' }}>
                                Sale Price ($) *
                            </label>
                            <input
                                type="number"
                                name="askingValuation"
                                value={formData.askingValuation}
                                onChange={handleInputChange}
                                placeholder="e.g., 5000000"
                                min="1"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Description */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#1e293b', fontWeight: '600' }}>
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Provide details about the listing..."
                        rows="4"
                        style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            fontSize: '14px',
                            boxSizing: 'border-box',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={onCancel}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#f1f5f9',
                            color: '#1e293b',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#e2e8f0';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f1f5f9';
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '10px 24px',
                            backgroundColor: loading ? '#cbd5e1' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.currentTarget.style.backgroundColor = '#059669';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) {
                                e.currentTarget.style.backgroundColor = '#10b981';
                            }
                        }}
                    >
                        {loading ? 'Creating...' : 'Create Listing'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateListingForm;
