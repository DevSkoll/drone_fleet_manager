/**
 * Fleet view - displays all drones in list/grid format
 * Uses FleetContext for real-time updates
 */
import React, { useState, useMemo } from 'react';
import { useFleet } from '../../contexts/FleetContext';

function FleetView() {
  const { drones, isConnected, useFallback } = useFleet();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

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
            <p>Try adjusting your search or filters</p>
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default FleetView;
