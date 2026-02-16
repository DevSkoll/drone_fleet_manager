/**
 * Fleet view - displays all drones in list/grid format
 * Future: map integration
 */
import React, { useEffect, useState } from 'react';
import { droneAPI } from '../../services/api';

function FleetView() {
  const [drones, setDrones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrones();
  }, []);

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

  if (loading) return <div>Loading fleet...</div>;

  return (
    <div className="fleet-view">
      <h2>Fleet Management</h2>
      <div className="drone-list">
        {drones.length === 0 ? (
          <p>No drones registered</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Model</th>
                <th>Serial Number</th>
                <th>Status</th>
                <th>Battery</th>
                <th>Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {drones.map((drone) => (
                <tr key={drone.id}>
                  <td>{drone.name}</td>
                  <td>{drone.model}</td>
                  <td>{drone.serialNumber}</td>
                  <td><span className={`status-badge status-${drone.status.toLowerCase()}`}>{drone.status}</span></td>
                  <td>{drone.batteryLevel ? `${drone.batteryLevel}%` : 'N/A'}</td>
                  <td>{drone.lastSeen ? new Date(drone.lastSeen).toLocaleString() : 'Never'}</td>
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
