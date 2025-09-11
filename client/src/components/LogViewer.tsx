import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  source?: string;
  [key: string]: any;
}

const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async (level: string = 'all', pageNum: number = 1) => {
    try {
      setLoading(true);
      const url = level === 'all' 
        ? `/api/logs?page=${pageNum}&limit=50`
        : `/api/logs/level/${level}`;
      
      const response = await axios.get(url);
      if (response.data.success) {
        setLogs(response.data.data);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTestLog = async () => {
    try {
      const response = await axios.post('/api/logs/test', {
        message: 'Test log entry created from frontend',
        level: 'info'
      });
      if (response.data.success) {
        fetchLogs(filter, page);
      }
    } catch (error) {
      console.error('Failed to create test log:', error);
    }
  };

  const clearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all logs?')) {
      return;
    }

    try {
      const response = await axios.delete('/api/logs');
      if (response.data.success) {
        setLogs([]);
      }
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getLogLevelColor = (level: string): string => {
    switch (level.toLowerCase()) {
      case 'error': return 'error';
      case 'warn': return 'warn';
      case 'info': return 'info';
      default: return 'info';
    }
  };

  useEffect(() => {
    fetchLogs(filter, page);
  }, [filter, page]);

  if (loading) {
    return (
      <div className="log-viewer">
        <h2 className="section-title">System Logs</h2>
        <div className="loading">Loading logs...</div>
      </div>
    );
  }

  return (
    <div className="log-viewer">
      <h2 className="section-title">System Logs</h2>
      
      <div className="log-controls">
        <select
          className="log-filter"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All Logs</option>
          <option value="error">Errors Only</option>
          <option value="warn">Warnings Only</option>
          <option value="info">Info Only</option>
        </select>
        
        <button className="btn btn-primary" onClick={createTestLog}>
          Create Test Log
        </button>
        
        <button className="btn btn-danger" onClick={clearLogs}>
          Clear All Logs
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div>No logs available</div>
          <div>Create a test log or perform some actions to see logs here</div>
        </div>
      ) : (
        <>
          <div className="log-entries">
            {logs.map((log, index) => (
              <div key={index} className={`log-entry ${getLogLevelColor(log.level)}`}>
                <span className="log-timestamp">
                  {formatTimestamp(log.timestamp)}
                </span>
                <span className={`log-level ${log.level.toLowerCase()}`}>
                  {log.level.toUpperCase()}
                </span>
                <span className="log-message">
                  {log.message}
                </span>
                {log.source && (
                  <span style={{ color: '#666', fontSize: '0.8rem', marginLeft: '1rem' }}>
                    [{log.source}]
                  </span>
                )}
              </div>
            ))}
          </div>

          {filter === 'all' && totalPages > 1 && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                className="btn"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span style={{ margin: '0 1rem' }}>
                Page {page} of {totalPages}
              </span>
              <button
                className="btn"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LogViewer;