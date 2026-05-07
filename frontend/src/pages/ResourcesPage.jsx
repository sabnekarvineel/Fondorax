import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ResourceFilters from '../components/ResourceFilters';
import ResourceCard from '../components/ResourceCard';
import EligibilityChecker from '../components/EligibilityChecker';
import ResourceDetailsModal from '../components/ResourceDetailsModal';
import './ResourcesPage.css';

const ResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    stage: 'all',
    sector: 'all',
    location: 'all',
    search: '',
    sort: 'featured',
  });
  const [selectedResource, setSelectedResource] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEligibility, setShowEligibility] = useState(false);
  const [eligibilityData, setEligibilityData] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: filters.type,
        stage: filters.stage,
        sector: filters.sector,
        location: filters.location,
        search: filters.search,
        sort: filters.sort,
        page: pagination.page,
        limit: pagination.limit,
      });

      const response = await axios.get(`${API_URL}/resources?${params}`);

      if (response.data.success) {
        setResources(response.data.resources);
        setPagination({
          ...pagination,
          total: response.data.total,
          pages: response.data.pages,
        });
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch resources on filter or pagination change
  useEffect(() => {
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination({ ...pagination, page: 1 });
  };

  const handleResourceClick = (resource) => {
    setSelectedResource(resource);
    setShowModal(true);
  };

  const handleEligibilitySubmit = async (profileData) => {
    try {
      const response = await axios.post(`${API_URL}/resources/eligibility/check`, profileData);
      if (response.data.success) {
        setEligibilityData(response.data);
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
    }
  };

  return (
    <div className="resources-page">
      {/* Header */}
      <section className="resources-header">
        <div className="header-content">
          <h1>Resources</h1>
          <p>Discover funding opportunities, grants, accelerators, and support programs</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="resources-container">
        {/* Sidebar Filters */}
        <aside className="resources-sidebar">
          <ResourceFilters filters={filters} onFilterChange={handleFilterChange} />
          
          <button 
            className="eligibility-btn"
            onClick={() => setShowEligibility(!showEligibility)}
          >
            {showEligibility ? '✕ Close' : '✓ Check Eligibility'}
          </button>

          {showEligibility && (
            <EligibilityChecker onSubmit={handleEligibilitySubmit} />
          )}
        </aside>

        {/* Resources Grid */}
        <main className="resources-main">
          {/* Results Info */}
          <div className="resources-info">
            <h2>
              Available Resources
              <span className="result-count">
                {pagination.total} found
              </span>
            </h2>
            <div className="pagination-info">
              Page {pagination.page} of {pagination.pages}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading resources...</p>
            </div>
          )}

          {/* Resources Grid */}
          {!loading && resources.length > 0 && (
            <>
              <div className="resources-grid">
                {resources.map((resource) => (
                  <ResourceCard
                    key={resource._id}
                    resource={resource}
                    onClick={() => handleResourceClick(resource)}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                >
                  ← Previous
                </button>

                <div className="page-numbers">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`page-number ${page === pagination.page ? 'active' : ''}`}
                      onClick={() => setPagination({ ...pagination, page })}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  className="page-btn"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                >
                  Next →
                </button>
              </div>
            </>
          )}

          {/* No Results */}
          {!loading && resources.length === 0 && (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No resources found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          )}

          {/* Eligibility Results */}
          {eligibilityData && (
            <div className="eligibility-results">
              <div className="eligibility-header">
                <h3>Your Matching Resources</h3>
                <p>Based on your profile</p>
              </div>
              
              <div className="eligibility-stats">
                <div className="stat-card">
                  <div className="stat-value">{eligibilityData.eligibilityScore}</div>
                  <div className="stat-label">Eligibility Score</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{eligibilityData.matchingResources.length}</div>
                  <div className="stat-label">Matching Resources</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {eligibilityData.matchingResources.filter(r => r.eligible).length}
                  </div>
                  <div className="stat-label">Highly Eligible</div>
                </div>
              </div>

              <div className="matching-resources">
                {eligibilityData.matchingResources.slice(0, 6).map((resource) => (
                  <div key={resource._id} className="matching-resource-item">
                    <div className="match-badge">{resource.matchScore}% Match</div>
                    <h4>{resource.title}</h4>
                    <div className="match-reasons">
                      {resource.matchReasons.map((reason, idx) => (
                        <span key={idx} className="reason-tag">✓ {reason}</span>
                      ))}
                    </div>
                    <button
                      className="view-btn"
                      onClick={() => handleResourceClick(resource)}
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Resource Details Modal */}
      {showModal && selectedResource && (
        <ResourceDetailsModal
          resource={selectedResource}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default ResourcesPage;
