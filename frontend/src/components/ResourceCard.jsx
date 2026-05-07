import React, { useState } from 'react';
import './ResourceCard.css';

const ResourceCard = ({ resource, onClick }) => {
  const [bookmarked, setBookmarked] = useState(false);

  const getTypeIcon = (type) => {
    const icons = {
      government: '🏛️',
      private: '💼',
      accelerator: '🚀',
      loan: '💰',
    };
    return icons[type] || '📚';
  };

  const getTypeColor = (type) => {
     const colors = {
       government: '#3b82f6',
       private: '#0F766E',
       accelerator: '#ec4899',
       loan: '#f59e0b',
     };
     return colors[type] || '#6b7280';
   };

  const formatDeadline = (date) => {
    if (!date) return 'No deadline';
    const deadline = new Date(date);
    const today = new Date();
    const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return 'Expired';
    if (daysLeft === 0) return 'Expires today';
    if (daysLeft === 1) return 'Expires tomorrow';
    if (daysLeft <= 7) return `${daysLeft} days left`;
    return deadline.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const getUrgencyLevel = (date) => {
    if (!date) return 'normal';
    const deadline = new Date(date);
    const today = new Date();
    const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return 'expired';
    if (daysLeft <= 7) return 'urgent';
    if (daysLeft <= 30) return 'soon';
    return 'normal';
  };

  const urgency = getUrgencyLevel(resource.deadline);

  return (
    <div className={`resource-card urgency-${urgency}`}>
      {/* Featured Badge */}
      {resource.isFeatured && (
        <div className="featured-badge">⭐ Featured</div>
      )}

      {/* Type Icon */}
      <div
        className="type-icon"
        style={{ background: getTypeColor(resource.type) }}
      >
        {getTypeIcon(resource.type)}
      </div>

      {/* Type Label */}
      <div className="type-label" style={{ color: getTypeColor(resource.type) }}>
        {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
      </div>

      {/* Title */}
      <h3 className="resource-title">{resource.title}</h3>

      {/* Organization */}
      <p className="organization">{resource.organization}</p>

      {/* Description */}
      <p className="description">
        {resource.description.substring(0, 100)}
        {resource.description.length > 100 ? '...' : ''}
      </p>

      {/* Funding Amount */}
      {resource.fundingAmount && (
        <div className="funding-amount">
          <span className="label">Funding:</span>
          <span className="amount">{resource.fundingAmount}</span>
        </div>
      )}

      {/* Tags */}
      <div className="tags">
        {resource.stage?.slice(0, 2).map((s) => (
          <span key={s} className="tag stage-tag">{s}</span>
        ))}
        {resource.sector?.slice(0, 1).map((sec) => (
          <span key={sec} className="tag sector-tag">{sec}</span>
        ))}
      </div>

      {/* Footer */}
      <div className="card-footer">
        <div className={`deadline deadline-${urgency}`}>
          ⏰ {formatDeadline(resource.deadline)}
        </div>

        <button
          className="bookmark-btn"
          onClick={(e) => {
            e.stopPropagation();
            setBookmarked(!bookmarked);
          }}
        >
          {bookmarked ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Action Button */}
      <button className="view-details-btn" onClick={onClick}>
        View Details →
      </button>
    </div>
  );
};

export default ResourceCard;
