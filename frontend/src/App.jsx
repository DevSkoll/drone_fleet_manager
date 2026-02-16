/**
 * Main application component with routing
 * Bryce at JCU//JEDI - arctek.us
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
        <nav className="nav-bar">
          <h1>VTOL-DB Drone Management</h1>
          <ul>
            <li><a href="/">Dashboard</a></li>
            <li><a href="/fleet">Fleet</a></li>
            <li><a href="/telemetry">Telemetry</a></li>
            <li><a href="/logs">Logs</a></li>
            <li><a href="/sensor">Sensor Data</a></li>
          </ul>
        </nav>
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
    </Router>
  );
}

export default App;
