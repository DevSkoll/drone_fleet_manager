/**
 * WebSocket channel constants
 */
export const CHANNELS = {
  DRONES: 'drones',
  TELEMETRY: 'telemetry',
  ALERTS: 'alerts',
  SYSTEM_STATS: 'system_stats'
};

export const MESSAGE_TYPES = {
  SNAPSHOT: 'SNAPSHOT',
  UPDATE: 'UPDATE'
};

export const UPDATE_TYPES = {
  DRONE_CREATED: 'DRONE_CREATED',
  DRONE_UPDATED: 'DRONE_UPDATED',
  DRONE_DELETED: 'DRONE_DELETED'
};
