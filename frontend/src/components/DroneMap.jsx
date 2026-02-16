/**
 * Interactive map component displaying drone locations
 * Color-coded markers based on drone status
 */
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './DroneMap.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom colored markers for different drone statuses
const createDroneIcon = (status) => {
  let color;
  switch (status) {
    case 'ACTIVE':
      color = '#4ECDC4'; // Success color
      break;
    case 'OFFLINE':
      color = '#6B8A9C'; // Muted gray
      break;
    case 'MAINTENANCE':
      color = '#FFE66D'; // Warning yellow
      break;
    case 'INACTIVE':
      color = '#FF6B6B'; // Danger red
      break;
    default:
      color = '#71C9CE'; // Primary color
  }

  const svgIcon = `
    <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 8.837 16 24 16 24s16-15.163 16-24c0-8.837-7.163-16-16-16z" 
            fill="${color}" 
            stroke="#0A1F2E" 
            stroke-width="2"/>
      <circle cx="16" cy="16" r="6" fill="#E3FDFD"/>
      <text x="16" y="20" font-size="10" text-anchor="middle" fill="${color}" font-weight="bold">🚁</text>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-drone-marker',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40]
  });
};

// Component to auto-fit map bounds to show all drones
function MapBounds({ drones }) {
  const map = useMap();

  useEffect(() => {
    if (drones.length > 0) {
      const validDrones = drones.filter(d => d.latitude && d.longitude);
      if (validDrones.length > 0) {
        const bounds = validDrones.map(d => [d.latitude, d.longitude]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [drones, map]);

  return null;
}

function DroneMap({ drones }) {
  const dronesWithLocation = drones.filter(d => d.latitude && d.longitude);
  
  // Default center (San Francisco)
  const defaultCenter = [37.7749, -122.4194];
  const center = dronesWithLocation.length > 0
    ? [dronesWithLocation[0].latitude, dronesWithLocation[0].longitude]
    : defaultCenter;

  if (dronesWithLocation.length === 0) {
    return (
      <div className="map-container">
        <div className="map-empty-state">
          <div className="map-empty-icon">🗺️</div>
          <h3>No Drone Locations Available</h3>
          <p>Drone positions will appear here once location data is received</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container">
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBounds drones={dronesWithLocation} />
        
        {dronesWithLocation.map((drone) => (
          <Marker
            key={drone.id}
            position={[drone.latitude, drone.longitude]}
            icon={createDroneIcon(drone.status)}
          >
            <Popup>
              <div className="drone-popup">
                <div className="drone-popup-header">
                  <h4>{drone.name || 'Unnamed Drone'}</h4>
                  <span className={`status-badge status-${drone.status?.toLowerCase()}`}>
                    {drone.status}
                  </span>
                </div>
                <div className="drone-popup-body">
                  <div className="popup-row">
                    <span className="popup-label">Model:</span>
                    <span>{drone.model || 'N/A'}</span>
                  </div>
                  <div className="popup-row">
                    <span className="popup-label">Serial:</span>
                    <code className="mono">{drone.serialNumber || 'N/A'}</code>
                  </div>
                  <div className="popup-row">
                    <span className="popup-label">Battery:</span>
                    <span style={{ 
                      color: drone.batteryLevel >= 70 ? '#4ECDC4' : 
                             drone.batteryLevel >= 30 ? '#FFE66D' : '#FF6B6B',
                      fontWeight: 'bold'
                    }}>
                      {drone.batteryLevel !== null ? `${drone.batteryLevel}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="popup-row">
                    <span className="popup-label">Altitude:</span>
                    <span>{drone.altitude ? `${drone.altitude}m` : 'N/A'}</span>
                  </div>
                  <div className="popup-row">
                    <span className="popup-label">Location:</span>
                    <span className="location-coords">
                      {drone.latitude.toFixed(6)}, {drone.longitude.toFixed(6)}
                    </span>
                  </div>
                  <div className="popup-row">
                    <span className="popup-label">Last Seen:</span>
                    <span className="text-muted">
                      {drone.lastSeen ? new Date(drone.lastSeen).toLocaleString() : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default DroneMap;
