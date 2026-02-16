/**
 * WebSocket settings section
 */
import React from 'react';
import Card from '../../../components/Card';

function WebSocketSection({ settings, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <Card className="settings-section">
      <Card.Header>
        <div className="section-header-content">
          <span className="section-icon">🔌</span>
          <div>
            <h3>WebSocket</h3>
            <p className="section-description">Real-time connection parameters</p>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="form-group">
          <label>Heartbeat Interval</label>
          <div className="input-with-unit">
            <input
              type="number"
              value={settings.heartbeatInterval}
              onChange={(e) => handleChange('heartbeatInterval', parseInt(e.target.value))}
              className="form-input"
              min="1000"
              max="300000"
              step="1000"
            />
            <span className="input-unit">ms</span>
          </div>
          <span className="form-hint">
            Time between heartbeat messages (1,000-300,000 ms).
            Current: {(settings.heartbeatInterval / 1000).toFixed(0)}s
          </span>
        </div>

        <div className="form-group">
          <label>Idle Timeout</label>
          <div className="input-with-unit">
            <input
              type="number"
              value={settings.idleTimeout}
              onChange={(e) => handleChange('idleTimeout', parseInt(e.target.value))}
              className="form-input"
              min="10000"
              max="600000"
              step="1000"
            />
            <span className="input-unit">ms</span>
          </div>
          <span className="form-hint">
            Time before marking a worker as disconnected (10,000-600,000 ms).
            Current: {(settings.idleTimeout / 1000).toFixed(0)}s
          </span>
        </div>

        <div className="form-group">
          <label>Health Check Interval</label>
          <div className="input-with-unit">
            <input
              type="number"
              value={settings.healthCheckInterval}
              onChange={(e) => handleChange('healthCheckInterval', parseInt(e.target.value))}
              className="form-input"
              min="1000"
              max="60000"
              step="1000"
            />
            <span className="input-unit">ms</span>
          </div>
          <span className="form-hint">
            Frequency of worker health checks (1,000-60,000 ms).
            Current: {(settings.healthCheckInterval / 1000).toFixed(0)}s
          </span>
        </div>
      </Card.Body>
    </Card>
  );
}

export default WebSocketSection;
