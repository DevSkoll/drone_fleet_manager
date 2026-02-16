/**
 * Fleet view - displays all drones in list/grid format
 * Future: map integration
 */
import React, { useEffect, useState } from 'react';
import { droneAPI } from '../../services/api';

function FleetView() {
  const [drones, setDrones] = useState([]);
  const [filteredDrones, setFilteredDrones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchDrones();
    const interval = setInterval(fetchDrones, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterDrones();
  }, [drones, searchTerm, statusFilter]);

  const fetchDrones = async () => {
    try {
      const response = await droneAPI.getAll();
      setDrones(response.data);
    } catch (error) {
      console.error('Failed to fetch drones:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDrones = () => {
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

    setFilteredDrones(filtered);
  };

  const getBatteryColor = (level) => {
    if (level >= 70) return 'var(--color-success)';
    if (level >= 30) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  if (loading) {
    return (
      <div className="fleet-view">
        <div className="page-header">
          <div className="skeleton skeleton-title"></div>
        </div>
        <div className="table-container">
          <div className="skeleton skeleton-table"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fleet-view">
      <div className="page-header">
        <div>
          <h1 className="page-title">Fleet Management</h1>
          <p className="page-subtitle">{filteredDrones.length} drone{filteredDrones.length !== 1 ? 's' : ''} in fleet</p>
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
