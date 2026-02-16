/**
 * Fleet management settings section
 */
import React from 'react';
import Card from '../../../components/Card';
import TagListEditor from '../../../components/TagListEditor';

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

        <div className="subsection">
          <h4 className="subsection-title">Drone Configuration Options</h4>
          <p className="form-hint" style={{ marginBottom: 'var(--space-md)' }}>
            Configure the available options for drone properties. These will appear as dropdown choices when adding or editing drones.
          </p>

          <div className="form-group">
            <TagListEditor
              label="Available Roles"
              items={settings.availableRoles || []}
              onChange={(items) => handleChange('availableRoles', items)}
              placeholder="Add role..."
            />
            <span className="form-hint">Fleet roles for drones (e.g., Controller, Worker, Relay)</span>
          </div>

          <div className="form-group">
            <TagListEditor
              label="Available Connection Types"
              items={settings.availableConnectionTypes || []}
              onChange={(items) => handleChange('availableConnectionTypes', items)}
              placeholder="Add connection type..."
            />
            <span className="form-hint">Network connection types (e.g., Starlink, Cellular, WiFi)</span>
          </div>

          <div className="form-group">
            <TagListEditor
              label="Available Capabilities"
              items={settings.availableCapabilities || []}
              onChange={(items) => handleChange('availableCapabilities', items)}
              placeholder="Add capability..."
            />
            <span className="form-hint">Drone capabilities (e.g., Video, Photo, Thermal, LiDAR)</span>
          </div>

          <div className="form-group">
            <TagListEditor
              label="Available Protocols"
              items={settings.availableProtocols || []}
              onChange={(items) => handleChange('availableProtocols', items)}
              placeholder="Add protocol..."
            />
            <span className="form-hint">Communication protocols (e.g., TCP, UDP, MAVLINK, ROS2)</span>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default FleetSection;
