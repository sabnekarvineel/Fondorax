import React, { useState } from 'react';
import './ResourceDetailsModal.css';

const ResourceDetailsModal = ({ resource, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(resource.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTypeColor = (type) => {
    const colors = {
      government: '#3b82f6',
      private: '#8b5cf6',
      accelerator: '#ec4899',
      loan: '#f59e0b',
    };
    return colors[type] || '#6b7280';
  };

  const getTypeLabel = (type) => {
    const labels = {
      government: '🏛️ Government Scheme',
      private: '💼 Private Grant',
      accelerator: '🚀 Accelerator',
      loan: '💰 Loan Program',
    };
    return labels[type] || 'Resource';
  };

  const formatDeadline = (date) => {
    if (!date) return 'No deadline';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Header */}
        <div className="modal-header" style={{ borderColor: getTypeColor(resource.type) }}>
          <div className="type-badge" style={{ background: getTypeColor(resource.type) }}>
            {getTypeLabel(resource.type)}
          </div>
          <h2>{resource.title}</h2>
          <p className="organization">{resource.organization}</p>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Description */}
          <section className="modal-section">
            <h3>📝 Overview</h3>
            <p className="description">{resource.description}</p>
          </section>

          {/* Key Details Grid */}
          <section className="modal-section">
            <h3>💡 Key Details</h3>
            <div className="details-grid">
              {resource.fundingAmount && (
                <div className="detail-item">
                  <span className="detail-label">Funding Amount</span>
                  <span className="detail-value">{resource.fundingAmount}</span>
                </div>
              )}

              {resource.deadline && (
                <div className="detail-item">
                  <span className="detail-label">Application Deadline</span>
                  <span className="detail-value">{formatDeadline(resource.deadline)}</span>
                </div>
              )}

              {resource.location && resource.location.length > 0 && (
                <div className="detail-item">
                  <span className="detail-label">Available In</span>
                  <span className="detail-value">{resource.location.join(', ')}</span>
                </div>
              )}

              {resource.stage && resource.stage.length > 0 && (
                <div className="detail-item">
                  <span className="detail-label">Startup Stages</span>
                  <span className="detail-value">{resource.stage.join(', ')}</span>
                </div>
              )}
            </div>
          </section>

          {/* Eligibility */}
          <section className="modal-section">
            <h3>✓ Eligibility Criteria</h3>
            <div className="eligibility-box">
              <p>{resource.eligibility}</p>
            </div>
          </section>

          {/* Requirements */}
          {resource.requirements && resource.requirements.length > 0 && (
            <section className="modal-section">
              <h3>📋 Requirements</h3>
              <ul className="requirements-list">
                {resource.requirements.map((req, idx) => (
                  <li key={idx}>✓ {req}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Tags */}
          {(resource.sector?.length > 0 || resource.stage?.length > 0) && (
            <section className="modal-section">
              <h3>🏷️ Categories</h3>
              <div className="tags-container">
                {resource.sector?.map((s) => (
                  <span key={s} className="tag sector-tag">{s}</span>
                ))}
                {resource.stage?.map((st) => (
                  <span key={st} className="tag stage-tag">{st}</span>
                ))}
              </div>
            </section>
          )}

          {/* Contact Info */}
          <section className="modal-section">
            <h3>📞 Contact Information</h3>
            <div className="contact-info">
              {resource.contactEmail && (
                <div className="contact-item">
                  <span className="contact-label">Email:</span>
                  <a href={`mailto:${resource.contactEmail}`} className="contact-value">
                    {resource.contactEmail}
                  </a>
                </div>
              )}
              {resource.link && (
                <div className="contact-item">
                  <span className="contact-label">Website:</span>
                  <a href={resource.link} target="_blank" rel="noopener noreferrer" className="contact-value">
                    Visit Website →
                  </a>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={handleCopyLink}
            title="Copy link to clipboard"
          >
            {copied ? '✓ Copied' : '📋 Copy Link'}
          </button>
          <a
            href={resource.link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Apply Now →
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetailsModal;
