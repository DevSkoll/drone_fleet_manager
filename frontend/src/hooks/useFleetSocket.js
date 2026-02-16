/**
 * React hook for real-time fleet data via WebSocket
 * Provides drone list with automatic updates
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { wsService, CHANNELS, MESSAGE_TYPES, UPDATE_TYPES } from '../services/websocket';
import { droneAPI } from '../services/api';

export function useFleetSocket() {
  const [drones, setDrones] = useState(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [error, setError] = useState(null);
  const pollingRef = useRef(null);

  // Handle incoming WebSocket messages
  const handleMessage = useCallback((message) => {
    const { type, payload } = message;

    switch (type) {
      case MESSAGE_TYPES.SNAPSHOT:
        // Replace entire state with snapshot
        if (payload.drones) {
          const droneMap = new Map(payload.drones.map(d => [d.id, d]));
          setDrones(droneMap);
        }
        break;

      case MESSAGE_TYPES.UPDATE:
        setDrones(prev => {
          const updated = new Map(prev);
          const { updateType, droneId, data } = payload;

          switch (updateType) {
            case UPDATE_TYPES.DRONE_CREATED:
            case UPDATE_TYPES.DRONE_UPDATED:
              if (data) {
                updated.set(droneId, data);
              }
              break;
            case UPDATE_TYPES.DRONE_DELETED:
              updated.delete(droneId);
              break;
            default:
              // Handle generic updates with changes object
              if (payload.changes && droneId) {
                const existing = updated.get(droneId) || {};
                updated.set(droneId, { ...existing, ...payload.changes });
              }
          }
          return updated;
        });
        break;

      default:
        console.log('Unknown message type:', type);
    }
  }, []);

  // Fallback: REST polling
  const fetchDronesREST = useCallback(async () => {
    try {
      const response = await droneAPI.getAll();
      const droneMap = new Map(response.data.map(d => [d.id, d]));
      setDrones(droneMap);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch drones:', err);
      setError(err);
    }
  }, []);

  // Connection status listener
  useEffect(() => {
    const removeListener = wsService.addListener('connection', ({ connected, fallback }) => {
      setIsConnected(connected);
      if (fallback) {
        setUseFallback(true);
      }
    });

    return removeListener;
  }, []);

  // Connect and subscribe
  useEffect(() => {
    let mounted = true;

    const connect = async () => {
      try {
        await wsService.connect();
        if (mounted && wsService.isConnected()) {
          wsService.subscribe(CHANNELS.DRONES, handleMessage);
        }
      } catch (err) {
        console.error('WebSocket connection failed:', err);
        if (mounted) {
          setUseFallback(true);
        }
      }
    };

    connect();

    // Initial fetch via REST (WebSocket will update with real-time data)
    fetchDronesREST();

    return () => {
      mounted = false;
      wsService.unsubscribe(CHANNELS.DRONES);
    };
  }, [handleMessage, fetchDronesREST]);

  // Fallback polling when WebSocket unavailable
  useEffect(() => {
    if (useFallback && !isConnected) {
      console.log('Using REST polling fallback');
      pollingRef.current = setInterval(fetchDronesREST, 30000);
      return () => clearInterval(pollingRef.current);
    } else if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
  }, [useFallback, isConnected, fetchDronesREST]);

  return {
    drones: Array.from(drones.values()),
    dronesMap: drones,
    isConnected,
    useFallback,
    error,
    refresh: fetchDronesREST
  };
}

export default useFleetSocket;
