/**
 * Form component for adding/editing drones
 */
import React, { useState, useEffect } from 'react';
import Button from '../../components/Button';
import './DroneForm.css';

const DRONE_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'OFFLINE', label: 'Offline' }
];

const initialFormState = {
  name: '',
  model: '',
  serialNumber: '',
  status: 'INACTIVE',
  latitude: '',
  longitude: '',
  altitude: '',
  batteryLevel: '',
  // Networking fields
  ipAddress: '',
  port: '',
  role: '',
  protocol: '',
  connectionType: '',
  capabilities: [],
  rtspEndpoint: ''
};

function DroneForm({ drone, onSubmit, onCancel, isSubmitting, error, fleetSettings }) {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  // Get available options from settings or use defaults
  const availableRoles = fleetSettings?.availableRoles || ['Controller', 'Worker', 'Relay', 'Observer'];
  const availableConnectionTypes = fleetSettings?.availableConnectionTypes || ['Starlink', 'Starshield', 'Cellular', 'WiFi', 'Ethernet'];
  const availableCapabilities = fleetSettings?.availableCapabilities || ['Video', 'Photo', 'Thermal', 'LiDAR', 'Multispectral'];
  const availableProtocols = fleetSettings?.availableProtocols || ['TCP', 'UDP', 'WebSocket', 'MAVLINK', 'ROS2'];

  useEffect(() => {
    if (drone) {
      setFormData({
        name: drone.name || '',
        model: drone.model || '',
        serialNumber: drone.serialNumber || '',
        status: drone.status || 'INACTIVE',
        latitude: drone.latitude ?? '',
        longitude: drone.longitude ?? '',
        altitude: drone.altitude ?? '',
        batteryLevel: drone.batteryLevel ?? '',
        // Networking fields
        ipAddress: drone.ipAddress || '',
        port: drone.port ?? '',
        role: drone.role || '',
        protocol: drone.protocol || '',
        connectionType: drone.connectionType || '',
        capabilities: drone.capabilities || [],
        rtspEndpoint: drone.rtspEndpoint || ''
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
  }, [drone]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = 'Serial number is required';
    }
    if (formData.latitude !== '' && (formData.latitude < -90 || formData.latitude > 90)) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }
    if (formData.longitude !== '' && (formData.longitude < -180 || formData.longitude > 180)) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }
    if (formData.batteryLevel !== '' && (formData.batteryLevel < 0 || formData.batteryLevel > 100)) {
      newErrors.batteryLevel = 'Battery must be between 0 and 100';
    }
    if (formData.port !== '' && (formData.port < 1 || formData.port > 65535)) {
      newErrors.port = 'Port must be between 1 and 65535';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const submitData = { ...formData };
      // Convert empty strings to null for optional numeric fields
      ['latitude', 'longitude', 'altitude', 'batteryLevel', 'port'].forEach(field => {
        if (submitData[field] === '') {
          submitData[field] = null;
        } else {
          submitData[field] = Number(submitData[field]);
        }
      });
      // Convert empty strings to null for optional string fields
      ['ipAddress', 'role', 'protocol', 'connectionType', 'rtspEndpoint'].forEach(field => {
        if (submitData[field] === '') {
          submitData[field] = null;
        }
      });
      // Keep capabilities as empty array if none selected
      if (submitData.capabilities.length === 0) {
        submitData.capabilities = null;
      }
      onSubmit(submitData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleCapabilityToggle = (capability) => {
    const current = formData.capabilities || [];
    if (current.includes(capability)) {
      handleChange('capabilities', current.filter(c => c !== capability));
    } else {
      handleChange('capabilities', [...current, capability]);
    }
  };

  return (
    <form className="drone-form" onSubmit={handleSubmit}>
      {error && (
        <div className="form-error-banner">
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="name">Name *</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={`form-input ${errors.name ? 'error' : ''}`}
          placeholder="Enter drone name"
          disabled={isSubmitting}
        />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="model">Model</label>
          <input
            id="model"
            type="text"
            value={formData.model}
            onChange={(e) => handleChange('model', e.target.value)}
            className="form-input"
            placeholder="e.g., DJI Mavic 3"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="serialNumber">Serial Number *</label>
          <input
            id="serialNumber"
            type="text"
            value={formData.serialNumber}
            onChange={(e) => handleChange('serialNumber', e.target.value)}
            className={`form-input ${errors.serialNumber ? 'error' : ''}`}
            placeholder="e.g., SN-001"
            disabled={isSubmitting}
          />
          {errors.serialNumber && <span className="form-error">{errors.serialNumber}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="form-select"
            disabled={isSubmitting}
          >
            {DRONE_STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            className="form-select"
            disabled={isSubmitting}
          >
            <option value="">Select role...</option>
            {availableRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-section-title">Networking</div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="ipAddress">IP Address</label>
          <input
            id="ipAddress"
            type="text"
            value={formData.ipAddress}
            onChange={(e) => handleChange('ipAddress', e.target.value)}
            className="form-input"
            placeholder="e.g., 192.168.1.100"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group form-group-small">
          <label htmlFor="port">Port</label>
          <input
            id="port"
            type="number"
            value={formData.port}
            onChange={(e) => handleChange('port', e.target.value)}
            className={`form-input ${errors.port ? 'error' : ''}`}
            placeholder="5600"
            min="1"
            max="65535"
            disabled={isSubmitting}
          />
          {errors.port && <span className="form-error">{errors.port}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="protocol">Protocol</label>
          <select
            id="protocol"
            value={formData.protocol}
            onChange={(e) => handleChange('protocol', e.target.value)}
            className="form-select"
            disabled={isSubmitting}
          >
            <option value="">Select protocol...</option>
            {availableProtocols.map(protocol => (
              <option key={protocol} value={protocol}>{protocol}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="connectionType">Connection Type</label>
          <select
            id="connectionType"
            value={formData.connectionType}
            onChange={(e) => handleChange('connectionType', e.target.value)}
            className="form-select"
            disabled={isSubmitting}
          >
            <option value="">Select connection...</option>
            {availableConnectionTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Capabilities</label>
        <div className="checkbox-group">
          {availableCapabilities.map(capability => (
            <label key={capability} className="checkbox-label">
              <input
                type="checkbox"
                checked={(formData.capabilities || []).includes(capability)}
                onChange={() => handleCapabilityToggle(capability)}
                disabled={isSubmitting}
              />
              <span>{capability}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-section-title">Video Feed</div>

      <div className="form-group">
        <label htmlFor="rtspEndpoint">RTSP Endpoint</label>
        <input
          id="rtspEndpoint"
          type="text"
          value={formData.rtspEndpoint}
          onChange={(e) => handleChange('rtspEndpoint', e.target.value)}
          className="form-input"
          placeholder="rtsp://192.168.1.100:8554/stream"
          disabled={isSubmitting}
        />
        <span className="form-hint">RTSP URL for video stream from this drone</span>
      </div>

      <div className="form-section-title">Location (Optional)</div>

      <div className="form-row form-row-thirds">
        <div className="form-group">
          <label htmlFor="latitude">Latitude</label>
          <input
            id="latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => handleChange('latitude', e.target.value)}
            className={`form-input ${errors.latitude ? 'error' : ''}`}
            placeholder="-90 to 90"
            disabled={isSubmitting}
          />
          {errors.latitude && <span className="form-error">{errors.latitude}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="longitude">Longitude</label>
          <input
            id="longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) => handleChange('longitude', e.target.value)}
            className={`form-input ${errors.longitude ? 'error' : ''}`}
            placeholder="-180 to 180"
            disabled={isSubmitting}
          />
          {errors.longitude && <span className="form-error">{errors.longitude}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="altitude">Altitude (m)</label>
          <input
            id="altitude"
            type="number"
            step="any"
            value={formData.altitude}
            onChange={(e) => handleChange('altitude', e.target.value)}
            className="form-input"
            placeholder="0"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="batteryLevel">Battery Level (%)</label>
        <input
          id="batteryLevel"
          type="number"
          min="0"
          max="100"
          value={formData.batteryLevel}
          onChange={(e) => handleChange('batteryLevel', e.target.value)}
          className={`form-input ${errors.batteryLevel ? 'error' : ''}`}
          placeholder="0-100"
          disabled={isSubmitting}
        />
        {errors.batteryLevel && <span className="form-error">{errors.batteryLevel}</span>}
      </div>

      <div className="form-actions">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (drone ? 'Save Changes' : 'Add Drone')}
        </Button>
      </div>
    </form>
  );
}

export default DroneForm;
