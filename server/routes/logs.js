const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const { logger } = require('../index');

const router = express.Router();

// Get all logs
router.get('/', async (req, res) => {
  try {
    const logsDir = path.join(__dirname, '../logs');
    const logFiles = ['combined.log', 'error.log'];
    const allLogs = [];

    for (const logFile of logFiles) {
      const logPath = path.join(logsDir, logFile);
      if (await fs.pathExists(logPath)) {
        const content = await fs.readFile(logPath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        
        lines.forEach(line => {
          try {
            const logEntry = JSON.parse(line);
            allLogs.push({
              ...logEntry,
              source: logFile,
              timestamp: logEntry.timestamp || new Date().toISOString()
            });
          } catch (e) {
            // Handle non-JSON log lines
            allLogs.push({
              message: line,
              level: 'info',
              source: logFile,
              timestamp: new Date().toISOString()
            });
          }
        });
      }
    }

    // Sort by timestamp (newest first)
    allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedLogs = allLogs.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedLogs,
      pagination: {
        page,
        limit,
        total: allLogs.length,
        totalPages: Math.ceil(allLogs.length / limit)
      }
    });

  } catch (error) {
    logger.error('Failed to get logs', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve logs' });
  }
});

// Get logs by level
router.get('/level/:level', async (req, res) => {
  try {
    const level = req.params.level.toLowerCase();
    const logsDir = path.join(__dirname, '../logs');
    const logFiles = level === 'error' ? ['error.log'] : ['combined.log'];
    const filteredLogs = [];

    for (const logFile of logFiles) {
      const logPath = path.join(logsDir, logFile);
      if (await fs.pathExists(logPath)) {
        const content = await fs.readFile(logPath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        
        lines.forEach(line => {
          try {
            const logEntry = JSON.parse(line);
            if (logEntry.level === level) {
              filteredLogs.push({
                ...logEntry,
                source: logFile,
                timestamp: logEntry.timestamp || new Date().toISOString()
              });
            }
          } catch (e) {
            // Handle non-JSON log lines
            if (level === 'info') {
              filteredLogs.push({
                message: line,
                level: 'info',
                source: logFile,
                timestamp: new Date().toISOString()
              });
            }
          }
        });
      }
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({ success: true, data: filteredLogs });
  } catch (error) {
    logger.error('Failed to get logs by level', { error: error.message, level: req.params.level });
    res.status(500).json({ error: 'Failed to retrieve logs' });
  }
});

// Clear logs
router.delete('/', async (req, res) => {
  try {
    const logsDir = path.join(__dirname, '../logs');
    const logFiles = ['combined.log', 'error.log'];

    for (const logFile of logFiles) {
      const logPath = path.join(logsDir, logFile);
      if (await fs.pathExists(logPath)) {
        await fs.writeFile(logPath, '');
      }
    }

    logger.info('Logs cleared successfully');
    res.json({ success: true, message: 'Logs cleared successfully' });
  } catch (error) {
    logger.error('Failed to clear logs', { error: error.message });
    res.status(500).json({ error: 'Failed to clear logs' });
  }
});

// Create a test log entry
router.post('/test', (req, res) => {
  try {
    const { message, level = 'info' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    logger.log(level, message, { 
      test: true, 
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent')
    });

    res.json({ 
      success: true, 
      message: 'Test log entry created successfully' 
    });
  } catch (error) {
    logger.error('Failed to create test log', { error: error.message });
    res.status(500).json({ error: 'Failed to create test log' });
  }
});

module.exports = router;