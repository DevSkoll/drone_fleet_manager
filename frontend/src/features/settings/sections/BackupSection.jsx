/**
 * Backup settings section
 */
import React from 'react';
import Card from '../../../components/Card';

function BackupSection({ settings, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <Card className="settings-section">
      <Card.Header>
        <div className="section-header-content">
          <span className="section-icon">💿</span>
          <div>
            <h3>Backup</h3>
            <p className="section-description">Configure automatic data backups</p>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="toggle-container">
          <div className="toggle-label">
            <span>Enable Automatic Backups</span>
            <span>Periodically backup drone data to prevent data loss</span>
          </div>
          <div
            className={`toggle-switch ${settings.enabled ? 'active' : ''}`}
            onClick={() => handleChange('enabled', !settings.enabled)}
          />
        </div>

        <div className="form-row-equal">
          <div className="form-group">
            <label>Backup Interval</label>
            <div className="input-with-unit">
              <input
                type="number"
                value={settings.intervalHours}
                onChange={(e) => handleChange('intervalHours', parseInt(e.target.value))}
                className="form-input"
                min="1"
                max="168"
                disabled={!settings.enabled}
              />
              <span className="input-unit">hours</span>
            </div>
            <span className="form-hint">1-168 hours (max 1 week)</span>
          </div>
          <div className="form-group">
            <label>Retention Count</label>
            <div className="input-with-unit">
              <input
                type="number"
                value={settings.retentionCount}
                onChange={(e) => handleChange('retentionCount', parseInt(e.target.value))}
                className="form-input"
                min="1"
                max="100"
                disabled={!settings.enabled}
              />
              <span className="input-unit">backups</span>
            </div>
            <span className="form-hint">Number of backups to keep (1-100)</span>
          </div>
        </div>

        <div className="form-group">
          <label>Backup Directory</label>
          <input
            type="text"
            value={settings.directoryPath}
            onChange={(e) => handleChange('directoryPath', e.target.value)}
            className="form-input"
            placeholder="./backups"
            disabled={!settings.enabled}
          />
          <span className="form-hint">Directory where backups will be stored</span>
        </div>
      </Card.Body>
    </Card>
  );
}

export default BackupSection;
