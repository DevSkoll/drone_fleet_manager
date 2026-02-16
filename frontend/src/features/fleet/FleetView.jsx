/**
 * Fleet view - displays all drones in list/grid format
 * Uses FleetContext for real-time updates
 */
import React, { useState, useMemo, useEffect } from 'react';
import { useFleet } from '../../contexts/FleetContext';
import { droneAPI, settingsAPI } from '../../services/api';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import DroneForm from './DroneForm';
import './FleetView.css';

function FleetView() {
  const { drones, isConnected, useFallback, refresh } = useFleet();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDrone, setSelectedDrone] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fleet settings for form dropdowns
  const [fleetSettings, setFleetSettings] = useState(null);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsAPI.get();
        setFleetSettings(response.data?.fleet);
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const filteredDrones = useMemo(() => {
    let filtered = drones;

    if (searchTerm) {
      filtered = filtered.filter(drone =>
        drone.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drone.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drone.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(drone => drone.status === statusFilter);
    }

    return filtered;
  }, [drones, searchTerm, statusFilter]);

  const getBatteryColor = (level) => {
    if (level >= 70) return 'var(--color-success)';
    if (level >= 30) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  // CRUD Handlers
  const handleAddDrone = () => {
    setSelectedDrone(null);
    setError(null);
    setIsFormModalOpen(true);
  };

  const handleEditDrone = (drone) => {
    setSelectedDrone(drone);
    setError(null);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (drone) => {
    setSelectedDrone(drone);
    setError(null);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (droneData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (selectedDrone) {
        await droneAPI.update(selectedDrone.id, droneData);
      } else {
        await droneAPI.create(droneData);
      }
      setIsFormModalOpen(false);
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Operation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await droneAPI.delete(selectedDrone.id);
      setIsDeleteModalOpen(false);
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to delete drone.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseFormModal = () => {
    if (!isSubmitting) {
      setIsFormModalOpen(false);
      setError(null);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!isSubmitting) {
      setIsDeleteModalOpen(false);
      setError(null);
    }
  };

  return (
    <div className="fleet-view">
      <div className="page-header">
        <div>
          <h1 className="page-title">Fleet Management</h1>
          <p className="page-subtitle">
            {filteredDrones.length} drone{filteredDrones.length !== 1 ? 's' : ''} in fleet
            {isConnected && <span className="connection-badge connected"> Live</span>}
            {!isConnected && useFallback && <span className="connection-badge polling"> Polling</span>}
          </p>
        </div>
        <Button variant="primary" onClick={handleAddDrone}>
          + Add Drone
        </Button>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2 className="table-title">Active Drones</h2>
          <div className="table-controls">
            <input
              type="text"
              className="search-input"
              placeholder="Search drones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="OFFLINE">Offline</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {filteredDrones.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No drones found</h3>
            <p>Try adjusting your search or filters, or add a new drone.</p>
            <Button variant="primary" onClick={handleAddDrone}>
              + Add Drone
            </Button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Drone</th>
                <th>Model</th>
                <th>Serial Number</th>
                <th>Status</th>
                <th>Battery</th>
                <th>Location</th>
                <th>Last Seen</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrones.map((drone) => (
                <tr key={drone.id}>
                  <td>
                    <div className="drone-cell">
                      <div className="drone-avatar">🚁</div>
                      <strong>{drone.name || 'Unnamed'}</strong>
                    </div>
                  </td>
                  <td>{drone.model || 'N/A'}</td>
                  <td><code className="mono">{drone.serialNumber || 'N/A'}</code></td>
                  <td>
                    <span className={`status-badge status-${drone.status?.toLowerCase() || 'offline'}`}>
                      {drone.status || 'OFFLINE'}
                    </span>
                  </td>
                  <td>
                    {drone.batteryLevel !== null && drone.batteryLevel !== undefined ? (
                      <div className="battery-cell">
                        <div className="battery-bar">
                          <div
                            className="battery-fill"
                            style={{
                              width: `${drone.batteryLevel}%`,
                              background: getBatteryColor(drone.batteryLevel)
                            }}
                          />
                        </div>
                        <span style={{ color: getBatteryColor(drone.batteryLevel) }}>
                          {drone.batteryLevel}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </td>
                  <td>
                    {drone.latitude && drone.longitude ? (
                      <span className="location-cell">
                        📍 {drone.latitude.toFixed(4)}, {drone.longitude.toFixed(4)}
                      </span>
                    ) : (
                      <span className="text-muted">Unknown</span>
                    )}
                  </td>
                  <td className="text-muted">
                    {drone.lastSeen ? new Date(drone.lastSeen).toLocaleString() : 'Never'}
                  </td>
                  <td>
                    <div className="actions-cell">
                      <Button variant="ghost" size="sm" onClick={() => handleEditDrone(drone)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(drone)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Drone Modal */}
      <Modal isOpen={isFormModalOpen} onClose={handleCloseFormModal} size="lg">
        <Modal.Header onClose={handleCloseFormModal}>
          {selectedDrone ? 'Edit Drone' : 'Add Drone'}
        </Modal.Header>
        <Modal.Body>
          <DroneForm
            drone={selectedDrone}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseFormModal}
            isSubmitting={isSubmitting}
            error={error}
            fleetSettings={fleetSettings}
          />
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} size="sm">
        <Modal.Header onClose={handleCloseDeleteModal}>Delete Drone</Modal.Header>
        <Modal.Body>
          {error && (
            <div className="delete-error">
              {error}
            </div>
          )}
          <p>
            Are you sure you want to delete <strong>"{selectedDrone?.name || 'this drone'}"</strong>?
            This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="ghost" onClick={handleCloseDeleteModal} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete} disabled={isSubmitting}>
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default FleetView;
