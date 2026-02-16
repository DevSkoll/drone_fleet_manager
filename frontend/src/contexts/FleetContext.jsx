/**
 * Fleet Context - Global fleet state provider
 * Provides real-time drone data to all components
 */
import React, { createContext, useContext, useMemo } from 'react';
import { useFleetSocket } from '../hooks/useFleetSocket';

const FleetContext = createContext(null);

export function FleetProvider({ children }) {
  const {
    drones,
    dronesMap,
    isConnected,
    useFallback,
    error,
    refresh
  } = useFleetSocket();

  // Compute fleet statistics
  const stats = useMemo(() => {
    const total = drones.length;
    const active = drones.filter(d => d.status === 'ACTIVE').length;
    const offline = drones.filter(d => d.status === 'OFFLINE').length;
    const maintenance = drones.filter(d => d.status === 'MAINTENANCE').length;
    const inactive = drones.filter(d => d.status === 'INACTIVE').length;

    const dronesWithBattery = drones.filter(d => d.batteryLevel != null);
    const avgBattery = dronesWithBattery.length > 0
      ? Math.round(dronesWithBattery.reduce((sum, d) => sum + d.batteryLevel, 0) / dronesWithBattery.length)
      : 0;

    const lowBattery = drones.filter(d => d.batteryLevel != null && d.batteryLevel < 20);

    return {
      total,
      active,
      offline,
      maintenance,
      inactive,
      avgBattery,
      lowBattery: lowBattery.length
    };
  }, [drones]);

  const value = {
    drones,
    dronesMap,
    stats,
    isConnected,
    useFallback,
    error,
    refresh,
    getDrone: (id) => dronesMap.get(id)
  };

  return (
    <FleetContext.Provider value={value}>
      {children}
    </FleetContext.Provider>
  );
}

export function useFleet() {
  const context = useContext(FleetContext);
  if (!context) {
    throw new Error('useFleet must be used within a FleetProvider');
  }
  return context;
}

export default FleetContext;
