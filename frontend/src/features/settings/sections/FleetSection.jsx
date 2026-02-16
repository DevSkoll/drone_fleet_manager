/**
 * Fleet management settings section
 */
import React from 'react';
import Card from '../../../components/Card';

function FleetSection({ settings, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <Card className="settings-section">
      <Card.Header>
        <div className="section-header-content">
          <span className="section-icon">🚁</span>
          <div>
            <h3>Fleet Management</h3>
            <p className="section-description">Drone fleet configuration</p>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="form-group">
          <label>Default Telemetry Interval</label>
          <div className="input-with-unit">
            <input
              type="number"
              value={settings.defaultTelemetryInterval}
              onChange={(e) => handleChange('defaultTelemetryInterval', parseInt(e.target.value))}
              className="form-input"
              min="1000"
              max="60000"
              step="1000"
            />
            <span className="input-unit">ms</span>
          </div>
          <span className="form-hint">
            Expected telemetry update frequency from workers (1,000-60,000 ms).
            Current: {(settings.defaultTelemetryInterval / 1000).toFixed(0)}s
          </span>
        </div>

        <div className="form-group">
          <label>Offline Threshold</label>
          <div className="input-with-unit">
            <input
              type="number"
              value={settings.offlineThreshold}
              onChange={(e) => handleChange('offlineThreshold', parseInt(e.target.value))}
              className="form-input"
              min="5000"
              max="300000"
              step="1000"
            />
            <span className="input-unit">ms</span>
          </div>
          <span className="form-hint">
            Time without updates before marking drone as offline (5,000-300,000 ms).
            Current: {(settings.offlineThreshold / 1000).toFixed(0)}s
          </span>
        </div>

        <div className="form-group">
          <label>Max Concurrent Workers</label>
          <input
            type="number"
            value={settings.maxConcurrentWorkers}
            onChange={(e) => handleChange('maxConcurrentWorkers', parseInt(e.target.value))}
            className="form-input"
            min="1"
            max="1000"
          />
          <span className="form-hint">
            Maximum number of fleet workers that can connect simultaneously (1-1,000)
          </span>
        </div>
      </Card.Body>
    </Card>
  );
}

export default FleetSection;
