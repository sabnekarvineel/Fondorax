import React, { useState, useEffect } from 'react';
import './AuditLogs.css';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const query = filter !== 'all' ? `?action=${filter}` : '';
      const response = await fetch(`http://localhost:5000/api/admin-v2/logs${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch logs');

      const data = await response.json();
      setLogs(data.logs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="logs-loading">Loading audit logs...</div>;
  if (error) return <div className="logs-error">Error: {error}</div>;

  const actionColors = {
    approve_founder: '#10b981',
    reject_founder: '#ef4444',
    suspend_user: '#ef4444',
    approve_listing: '#10b981',
    freeze_listing: '#f59e0b',
    handle_dispute: '#f59e0b',
    default: '#60a5fa'
  };

  const getActionColor = (action) => actionColors[action] || actionColors.default;

  return (
    <div className="audit-logs">
      <h2>📋 Audit Logs</h2>

      <div className="logs-controls">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Actions</option>
          <option value="approve_founder">Approve Founder</option>
          <option value="reject_founder">Reject Founder</option>
          <option value="suspend_user">Suspend User</option>
          <option value="approve_listing">Approve Listing</option>
          <option value="freeze_listing">Freeze Listing</option>
        </select>
      </div>

      <div className="logs-table-wrapper">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Admin</th>
              <th>Action</th>
              <th>Target User</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-logs">No logs found</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id}>
                  <td className="timestamp">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="admin-name">
                    {log.adminId?.firstName} {log.adminId?.lastName}
                  </td>
                  <td>
                    <span
                      className="action-badge"
                      style={{ color: getActionColor(log.action) }}
                    >
                      {log.action.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {log.targetUser?.firstName || 'N/A'} {log.targetUser?.lastName || ''}
                  </td>
                  <td>
                    <span className={`status-badge ${log.status}`}>
                      {log.status === 'success' ? '✅' : '❌'} {log.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="details">
                    {log.details && Object.keys(log.details).length > 0
                      ? JSON.stringify(log.details).substring(0, 50) + '...'
                      : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;
