/**
 * Security settings section
 */
import React, { useState } from 'react';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { settingsAPI } from '../../../services/api';

function SecuritySection({ settings, onChange, onAuthKeyGenerated }) {
  const [generating, setGenerating] = useState(false);
  const [newKey, setNewKey] = useState(null);

  const handleChange = (field, value) => {
    onChange({ ...settings, [field]: value });
  };

  const handleGenerateKey = async () => {
    try {
      setGenerating(true);
      const response = await settingsAPI.generateAuthKey();
      setNewKey(response.data.authKey);
      onAuthKeyGenerated(response.data.authKey);
    } catch (err) {
      console.error('Failed to generate auth key:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(newKey);
  };

  return (
    <Card className="settings-section">
      <Card.Header>
        <div className="section-header-content">
          <span className="section-icon">🔐</span>
          <div>
            <h3>Security</h3>
            <p className="section-description">Authentication and access control</p>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="toggle-container">
          <div className="toggle-label">
            <span>Enable Worker Authentication</span>
            <span>Require fleet workers to authenticate with auth key</span>
          </div>
          <div
            className={`toggle-switch ${settings.authenticationEnabled ? 'active' : ''}`}
            onClick={() => handleChange('authenticationEnabled', !settings.authenticationEnabled)}
          />
        </div>

        <div className="form-group">
          <label>Worker Authentication Key</label>
          <div className="input-with-button">
            <input
              type="text"
              value={newKey || (settings.hasAuthKey ? '••••••••••••••••' : '')}
              className="form-input"
              placeholder="No key configured"
              readOnly
            />
            <Button
              variant="secondary"
              onClick={handleGenerateKey}
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Generate New Key'}
            </Button>
          </div>
          <span className="form-hint">
            {settings.hasAuthKey
              ? 'A key is configured. Generate a new one to replace it.'
              : 'Generate a key to enable worker authentication'}
          </span>
        </div>

        {newKey && (
          <div className="alert-banner success" style={{ marginTop: 'var(--space-md)' }}>
            <div style={{ flex: 1 }}>
              <strong>New Key Generated!</strong>
              <p style={{ margin: 'var(--space-xs) 0 0 0', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                {newKey}
              </p>
              <p style={{ margin: 'var(--space-xs) 0 0 0', fontSize: '0.75rem', opacity: 0.8 }}>
                Copy this key now. It won't be shown again.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCopyKey}>
              Copy
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default SecuritySection;
