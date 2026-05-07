import React, { useState } from 'react';
import './ResourceFilters.css';

const ResourceFilters = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [expanded, setExpanded] = useState({
    type: true,
    stage: true,
    sector: true,
    location: false,
  });

  const resourceTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'government', label: 'Government Schemes' },
    { value: 'private', label: 'Private Grants' },
    { value: 'accelerator', label: 'Accelerators' },
    { value: 'loan', label: 'Loans' },
  ];

  const stages = [
    { value: 'all', label: 'All Stages' },
    { value: 'Idea', label: 'Idea' },
    { value: 'MVP', label: 'MVP' },
    { value: 'Early Revenue', label: 'Early Revenue' },
    { value: 'Growth', label: 'Growth' },
    { value: 'Scale', label: 'Scale' },
  ];

  const sectors = [
    { value: 'all', label: 'All Sectors' },
    { value: 'Tech', label: 'Tech' },
    { value: 'EdTech', label: 'EdTech' },
    { value: 'AgriTech', label: 'AgriTech' },
    { value: 'FinTech', label: 'FinTech' },
    { value: 'HealthTech', label: 'HealthTech' },
    { value: 'Deeptech', label: 'Deeptech' },
    { value: 'SaaS', label: 'SaaS' },
  ];

  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'India', label: 'Pan India' },
    { value: 'Telangana', label: 'Telangana' },
    { value: 'Karnataka', label: 'Karnataka' },
    { value: 'Maharashtra', label: 'Maharashtra' },
    { value: 'Delhi', label: 'Delhi' },
    { value: 'Tamil Nadu', label: 'Tamil Nadu' },
    { value: 'Gujarat', label: 'Gujarat' },
  ];

  const sorts = [
    { value: 'featured', label: 'Featured First' },
    { value: 'deadline', label: 'Deadline Soon' },
    { value: 'recent', label: 'Recently Added' },
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearchChange = (e) => {
    const newFilters = { ...localFilters, search: e.target.value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleExpanded = (key) => {
    setExpanded({ ...expanded, [key]: !expanded[key] });
  };

  const resetFilters = () => {
    const defaultFilters = {
      type: 'all',
      stage: 'all',
      sector: 'all',
      location: 'all',
      search: '',
      sort: 'featured',
    };
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="resource-filters">
      {/* Search */}
      <div className="filter-group search-group">
        <input
          type="text"
          placeholder="Search resources..."
          value={localFilters.search}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      {/* Sort */}
      <div className="filter-group sort-group">
        <label className="filter-label">Sort By</label>
        <select
          value={localFilters.sort}
          onChange={(e) => handleFilterChange('sort', e.target.value)}
          className="filter-select"
        >
          {sorts.map((sort) => (
            <option key={sort.value} value={sort.value}>
              {sort.label}
            </option>
          ))}
        </select>
      </div>

      {/* Type Filter */}
      <div className="filter-group">
        <button
          className="filter-header"
          onClick={() => toggleExpanded('type')}
        >
          <span>Resource Type</span>
          <span className="toggle-icon">{expanded.type ? '▼' : '▶'}</span>
        </button>
        {expanded.type && (
          <div className="filter-options">
            {resourceTypes.map((type) => (
              <label key={type.value} className="filter-option">
                <input
                  type="radio"
                  name="type"
                  value={type.value}
                  checked={localFilters.type === type.value}
                  onChange={() => handleFilterChange('type', type.value)}
                />
                <span>{type.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Stage Filter */}
      <div className="filter-group">
        <button
          className="filter-header"
          onClick={() => toggleExpanded('stage')}
        >
          <span>Startup Stage</span>
          <span className="toggle-icon">{expanded.stage ? '▼' : '▶'}</span>
        </button>
        {expanded.stage && (
          <div className="filter-options">
            {stages.map((stage) => (
              <label key={stage.value} className="filter-option">
                <input
                  type="radio"
                  name="stage"
                  value={stage.value}
                  checked={localFilters.stage === stage.value}
                  onChange={() => handleFilterChange('stage', stage.value)}
                />
                <span>{stage.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Sector Filter */}
      <div className="filter-group">
        <button
          className="filter-header"
          onClick={() => toggleExpanded('sector')}
        >
          <span>Sector</span>
          <span className="toggle-icon">{expanded.sector ? '▼' : '▶'}</span>
        </button>
        {expanded.sector && (
          <div className="filter-options">
            {sectors.map((sector) => (
              <label key={sector.value} className="filter-option">
                <input
                  type="radio"
                  name="sector"
                  value={sector.value}
                  checked={localFilters.sector === sector.value}
                  onChange={() => handleFilterChange('sector', sector.value)}
                />
                <span>{sector.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Location Filter */}
      <div className="filter-group">
        <button
          className="filter-header"
          onClick={() => toggleExpanded('location')}
        >
          <span>Location</span>
          <span className="toggle-icon">{expanded.location ? '▼' : '▶'}</span>
        </button>
        {expanded.location && (
          <div className="filter-options">
            {locations.map((location) => (
              <label key={location.value} className="filter-option">
                <input
                  type="radio"
                  name="location"
                  value={location.value}
                  checked={localFilters.location === location.value}
                  onChange={() => handleFilterChange('location', location.value)}
                />
                <span>{location.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Reset Button */}
      <button className="reset-btn" onClick={resetFilters}>
        ↺ Reset Filters
      </button>
    </div>
  );
};

export default ResourceFilters;
