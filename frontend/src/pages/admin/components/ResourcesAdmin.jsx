import React, { useState, useEffect } from 'react';
import './ResourcesAdmin.css';

const ResourcesAdmin = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Government',
    organization: '',
    description: '',
    fundingAmount: '',
    stage: ['MVP'],
    sector: ['Tech'],
    eligibility: '',
    requirements: [],
    location: ['Pan-India'],
    deadline: '',
    link: '',
    applicationUrl: '',
    contactEmail: '',
    isFeatured: false,
  });

  const token = localStorage.getItem('token');

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/resources?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
         throw new Error(`Failed to fetch resources: ${response.status}`);
       }

      const data = await response.json();
      setResources(Array.isArray(data.resources) ? data.resources : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError(err.message);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchResources();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayInputChange = (e, field) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      [field]: value.split(',').map(item => item.trim()).filter(Boolean)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const url = editingId 
        ? `http://localhost:5000/api/resources/${editingId}`
        : 'http://localhost:5000/api/resources';

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save resource');

      const data = await response.json();
      
      if (editingId) {
        setResources(resources.map(r => r._id === editingId ? data.resource : r));
      } else {
        setResources([...resources, data.resource]);
      }

      resetForm();
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (resource) => {
    setFormData(resource);
    setEditingId(resource._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/resources/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete resource');

      setResources(resources.filter(r => r._id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'Government',
      organization: '',
      description: '',
      fundingAmount: '',
      stage: ['MVP'],
      sector: ['Tech'],
      eligibility: '',
      requirements: [],
      location: ['Pan-India'],
      deadline: '',
      link: '',
      applicationUrl: '',
      contactEmail: '',
      isFeatured: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="resources-admin">
      <div className="resources-header">
        <h2>Resources Management</h2>
        <button 
          className="btn-add-resource"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add Resource'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="resource-form-container">
          <h3>{editingId ? 'Edit Resource' : 'Create New Resource'}</h3>
          <form onSubmit={handleSubmit} className="resource-form">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Resource title"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Type *</label>
                <select name="type" value={formData.type} onChange={handleInputChange} required>
                  <option>Government</option>
                  <option>Private</option>
                  <option>Accelerator</option>
                  <option>Loan</option>
                </select>
              </div>

              <div className="form-group">
                <label>Organization *</label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  required
                  placeholder="Organization name"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Resource description"
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Funding Amount</label>
                <input
                  type="text"
                  name="fundingAmount"
                  value={formData.fundingAmount}
                  onChange={handleInputChange}
                  placeholder="e.g., Up to ₹10 Lakhs"
                />
              </div>

              <div className="form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Stages (comma separated)</label>
                <input
                  type="text"
                  value={formData.stage.join(', ')}
                  onChange={(e) => handleArrayInputChange(e, 'stage')}
                  placeholder="MVP, Early Revenue, Growth"
                />
              </div>

              <div className="form-group">
                <label>Sectors (comma separated)</label>
                <input
                  type="text"
                  value={formData.sector.join(', ')}
                  onChange={(e) => handleArrayInputChange(e, 'sector')}
                  placeholder="Tech, EdTech, FinTech"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Locations (comma separated)</label>
                <input
                  type="text"
                  value={formData.location.join(', ')}
                  onChange={(e) => handleArrayInputChange(e, 'location')}
                  placeholder="Pan-India, Delhi, Bangalore"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Eligibility Criteria *</label>
              <textarea
                name="eligibility"
                value={formData.eligibility}
                onChange={handleInputChange}
                required
                placeholder="Who is eligible for this resource?"
                rows="2"
              />
            </div>

            <div className="form-group">
              <label>Requirements (comma separated)</label>
              <textarea
                value={formData.requirements.join(', ')}
                onChange={(e) => handleArrayInputChange(e, 'requirements')}
                placeholder="Required documents, registrations, etc."
                rows="2"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Website Link *</label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  required
                  placeholder="https://..."
                />
              </div>

              <div className="form-group">
                <label>Application URL</label>
                <input
                  type="url"
                  name="applicationUrl"
                  value={formData.applicationUrl}
                  onChange={handleInputChange}
                  placeholder="https://apply..."
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  placeholder="contact@example.com"
                />
              </div>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                  />
                  Feature this resource
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update Resource' : 'Create Resource'}
              </button>
              <button type="button" className="btn-cancel" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="resources-list">
        {loading && !showForm ? <p className="loading">Loading resources...</p> : null}
        
        {resources.length === 0 && !loading ? (
          <p className="no-resources">No resources found. Create one to get started!</p>
        ) : (
          <div className="resources-table-wrapper">
            <table className="resources-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Organization</th>
                  <th>Deadline</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {resources.map(resource => (
                  <tr key={resource._id}>
                    <td className="title-cell">{resource.title}</td>
                    <td>
                      <span className={`type-badge type-${resource.type.toLowerCase()}`}>
                        {resource.type}
                      </span>
                    </td>
                    <td>{resource.organization}</td>
                    <td>
                      {resource.deadline 
                        ? new Date(resource.deadline).toLocaleDateString()
                        : 'No deadline'
                      }
                    </td>
                    <td>
                      {resource.isFeatured ? (
                        <span className="featured-badge">Featured</span>
                      ) : (
                        <span className="not-featured">-</span>
                      )}
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEdit(resource)}
                        title="Edit resource"
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(resource._id)}
                        title="Delete resource"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="resources-stats">
        <p>Total Resources: <strong>{resources.length}</strong></p>
        <p>Featured: <strong>{resources.filter(r => r.isFeatured).length}</strong></p>
      </div>
    </div>
  );
};

export default ResourcesAdmin;
