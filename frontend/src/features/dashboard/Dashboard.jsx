/**
 * Main dashboard view - real-time fleet monitoring
 * Uses FleetContext for WebSocket-powered updates
 */
import React from 'react';
import { useFleet } from '../../contexts/FleetContext';
import DroneMap from '../../components/DroneMap';

function Dashboard() {
  const { drones, stats, isConnected, useFallback } = useFleet();

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Real-time fleet monitoring and analytics
          {isConnected && <span className="connection-badge connected"> Live</span>}
          {!isConnected && useFallback && <span className="connection-badge polling"> Polling</span>}
        </p>
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
