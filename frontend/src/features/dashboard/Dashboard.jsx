/**
 * Main dashboard view - modular widget-based layout
 */
import React, { useEffect, useState } from 'react';
import { droneAPI } from '../../services/api';
import DroneMap from '../../components/DroneMap';

function Dashboard() {
  const [drones, setDrones] = useState([]);
  const [stats, setStats] = useState({ 
    total: 0, 
    active: 0, 
    offline: 0, 
    maintenance: 0,
    avgBattery: 0 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrones();
    const interval = setInterval(fetchDrones, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchDrones = async () => {
    try {
      const response = await droneAPI.getAll();
      const droneData = response.data;
      setDrones(droneData);
      
      const active = droneData.filter(d => d.status === 'ACTIVE').length;
      const offline = droneData.filter(d => d.status === 'OFFLINE').length;
      const maintenance = droneData.filter(d => d.status === 'MAINTENANCE').length;
      
      const dronesWithBattery = droneData.filter(d => d.batteryLevel !== null && d.batteryLevel !== undefined);
      const avgBattery = dronesWithBattery.length > 0
        ? dronesWithBattery.reduce((sum, d) => sum + d.batteryLevel, 0) / dronesWithBattery.length
        : 0;
      
      setStats({ 
        total: droneData.length, 
        active, 
        offline, 
        maintenance,
        avgBattery: Math.round(avgBattery)
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch drones:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="page-header">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-text"></div>
        </div>
        <div className="stats-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="stat-card skeleton-card">
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-value"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Real-time fleet monitoring and analytics</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <h3>Total Fleet</h3>
            <div className="stat-icon">🚁</div>
          </div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-change">
            <span>↗</span>
            <span>All registered drones</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <h3>Active</h3>
            <div className="stat-icon">✓</div>
          </div>
          <div className="stat-value">{stats.active}</div>
          <div className="stat-change">
            <span>↗</span>
            <span>{stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of fleet</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <h3>Offline</h3>
            <div className="stat-icon">○</div>
          </div>
          <div className="stat-value">{stats.offline}</div>
          <div className="stat-change negative">
            <span>↓</span>
            <span>{stats.total > 0 ? Math.round((stats.offline / stats.total) * 100) : 0}% unavailable</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <h3>Avg Battery</h3>
            <div className="stat-icon">⚡</div>
          </div>
          <div className="stat-value">{stats.avgBattery}%</div>
          <div className="stat-change">
            <span>~</span>
            <span>Fleet average</span>
          </div>
        </div>
      </div>

      {stats.maintenance > 0 && (
        <div className="alert-banner">
          <span className="alert-icon">⚠️</span>
          <span>{stats.maintenance} drone{stats.maintenance > 1 ? 's' : ''} in maintenance mode</span>
        </div>
      )}

      <div className="map-section">
        <div className="section-header">
          <h2 className="section-title">Fleet Location</h2>
          <p className="section-subtitle">
            {drones.filter(d => d.latitude && d.longitude).length} drone{drones.filter(d => d.latitude && d.longitude).length !== 1 ? 's' : ''} with location data
          </p>
        </div>
        <DroneMap drones={drones} />
      </div>
    </div>
  );
}

export default Dashboard;
