/**
 * Main dashboard view - modular widget-based layout
 */
import React, { useEffect, useState } from 'react';
import { droneAPI } from '../../services/api';

function Dashboard() {
  const [drones, setDrones] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, offline: 0 });

  useEffect(() => {
    fetchDrones();
  }, []);

  const fetchDrones = async () => {
    try {
      const response = await droneAPI.getAll();
      const droneData = response.data;
      setDrones(droneData);
      
      const active = droneData.filter(d => d.status === 'ACTIVE').length;
      const offline = droneData.filter(d => d.status === 'OFFLINE').length;
      setStats({ total: droneData.length, active, offline });
    } catch (error) {
      console.error('Failed to fetch drones:', error);
    }
  };

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Drones</h3>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="stat-card">
          <h3>Active</h3>
          <p className="stat-value">{stats.active}</p>
        </div>
        <div className="stat-card">
          <h3>Offline</h3>
          <p className="stat-value">{stats.offline}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
