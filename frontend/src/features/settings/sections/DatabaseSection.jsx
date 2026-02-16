/**
 * Database settings section
 */
import React from 'react';
import Card from '../../../components/Card';

function DatabaseSection({ settings, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...settings, [field]: value });
  };

  const handlePostgresChange = (field, value) => {
    onChange({
      ...settings,
      postgresql: { ...settings.postgresql, [field]: value }
    });
  };

  return (
    <Card className="settings-section">
      <Card.Header>
        <div className="section-header-content">
          <span className="section-icon">💾</span>
          <div>
            <h3>Database / Storage</h3>
            <p className="section-description">Configure data persistence</p>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="form-group">
          <label>Storage Type</label>
          <select
            value={settings.storageType}
            onChange={(e) => handleChange('storageType', e.target.value)}
            className="form-select"
          >
            <option value="flatfile">Flatfile (JSON)</option>
            <option value="postgresql" disabled>PostgreSQL (Coming Soon)</option>
          </select>
          <span className="form-hint">Select how drone data is stored</span>
        </div>

        {settings.storageType === 'flatfile' && (
          <div className="form-group">
            <label>Data File Path</label>
            <input
              type="text"
              value={settings.flatfilePath}
              onChange={(e) => handleChange('flatfilePath', e.target.value)}
              className="form-input"
              placeholder="./data/drones.json"
            />
            <span className="form-hint">Path to JSON storage file (relative to backend)</span>
          </div>
        )}

        {settings.storageType === 'postgresql' && (
          <div className="subsection">
            <h4 className="subsection-title">PostgreSQL Configuration</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Host</label>
                <input
                  type="text"
                  value={settings.postgresql?.host || ''}
                  onChange={(e) => handlePostgresChange('host', e.target.value)}
                  className="form-input"
                  placeholder="localhost"
                />
              </div>
              <div className="form-group form-group-small">
                <label>Port</label>
                <input
                  type="number"
                  value={settings.postgresql?.port || 5432}
                  onChange={(e) => handlePostgresChange('port', parseInt(e.target.value))}
                  className="form-input"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Database Name</label>
              <input
                type="text"
                value={settings.postgresql?.database || ''}
                onChange={(e) => handlePostgresChange('database', e.target.value)}
                className="form-input"
                placeholder="vtoldb"
              />
            </div>
            <div className="form-row-equal">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={settings.postgresql?.username || ''}
                  onChange={(e) => handlePostgresChange('username', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={settings.postgresql?.password || ''}
                  onChange={(e) => handlePostgresChange('password', e.target.value)}
                  className="form-input"
                  placeholder={settings.postgresql?.hasPassword ? '••••••••' : ''}
                />
                {settings.postgresql?.hasPassword && (
                  <span className="form-hint">Leave blank to keep existing password</span>
                )}
              </div>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default DatabaseSection;
