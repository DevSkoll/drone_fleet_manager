/**
 * Settings page - Application configuration management
 */
import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import DatabaseSection from './sections/DatabaseSection';
import BackupSection from './sections/BackupSection';
import SecuritySection from './sections/SecuritySection';
import WebSocketSection from './sections/WebSocketSection';
import FleetSection from './sections/FleetSection';
import { settingsAPI } from '../../services/api';
import './SettingsView.css';

function SettingsView() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await settingsAPI.get();
      setSettings(response.data);
    } catch (err) {
      setError('Failed to load settings');
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionUpdate = (section, data) => {
    setSettings(prev => ({ ...prev, [section]: data }));
    setHasChanges(true);
    setSuccessMessage(null);
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      setError(null);
      const response = await settingsAPI.update(settings);
      setSettings(response.data);
      setHasChanges(false);
      setSuccessMessage('Settings saved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to save settings';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset all settings to defaults? This cannot be undone.')) {
      try {
        setSaving(true);
        setError(null);
        const response = await settingsAPI.reset();
        setSettings(response.data);
        setHasChanges(false);
        setSuccessMessage('Settings reset to defaults');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        setError('Failed to reset settings');
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="settings-view">
        <div className="settings-loading">
          <div className="loading-spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="settings-view">
        <div className="settings-error">
          <p>Failed to load settings. Please try again.</p>
          <Button variant="primary" onClick={fetchSettings}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-view">
      <div className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure your VTOL-DB instance</p>
        </div>
        <div className="settings-actions">
          <Button variant="ghost" onClick={handleReset} disabled={saving}>
            Reset to Defaults
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveAll}
            disabled={!hasChanges || saving}
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="alert-banner error">
          <span className="alert-icon">!</span>
          {error}
          <button className="alert-close" onClick={() => setError(null)}>x</button>
        </div>
      )}

      {successMessage && (
        <div className="alert-banner success">
          <span className="alert-icon">*</span>
          {successMessage}
        </div>
      )}

      {hasChanges && (
        <div className="alert-banner warning">
          <span className="alert-icon">!</span>
          You have unsaved changes
        </div>
      )}

      <div className="settings-grid">
        <DatabaseSection
          settings={settings.database}
          onChange={(data) => handleSectionUpdate('database', data)}
        />
        <BackupSection
          settings={settings.backup}
          onChange={(data) => handleSectionUpdate('backup', data)}
        />
        <SecuritySection
          settings={settings.security}
          onChange={(data) => handleSectionUpdate('security', data)}
          onAuthKeyGenerated={(key) => {
            setSettings(prev => ({
              ...prev,
              security: { ...prev.security, hasAuthKey: true }
            }));
            setSuccessMessage('New auth key generated');
            setTimeout(() => setSuccessMessage(null), 3000);
          }}
        />
        <WebSocketSection
          settings={settings.websocket}
          onChange={(data) => handleSectionUpdate('websocket', data)}
        />
        <FleetSection
          settings={settings.fleet}
          onChange={(data) => handleSectionUpdate('fleet', data)}
        />
      </div>
    </div>
  );
}

export default SettingsView;
