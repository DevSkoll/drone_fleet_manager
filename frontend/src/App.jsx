/**
 * Main application component with routing
 * Bryce at JCU//JEDI - arctek.us
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './features/dashboard/Dashboard';
import FleetView from './features/fleet/FleetView';
import TelemetryView from './features/telemetry/TelemetryView';
import LogsView from './features/logs/LogsView';
import SensorView from './features/sensor/SensorView';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        {/* Sidebar Navigation */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h1>VTOL-DB</h1>
            <p>Drone Fleet Manager</p>
          </div>
          
          <nav className="nav-menu">
            <ul>
              <li className="nav-item">
                <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <span className="nav-icon">📊</span>
                  <span>Dashboard</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/fleet" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <span className="nav-icon">🚁</span>
                  <span>Fleet</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/telemetry" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <span className="nav-icon">📡</span>
                  <span>Telemetry</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/logs" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <span className="nav-icon">📋</span>
                  <span>Logs</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/sensor" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  <span className="nav-icon">📷</span>
                  <span>Sensor Data</span>
                </NavLink>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="main-wrapper">
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/fleet" element={<FleetView />} />
              <Route path="/telemetry" element={<TelemetryView />} />
              <Route path="/logs" element={<LogsView />} />
              <Route path="/sensor" element={<SensorView />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
