/**
 * WebSocket service for real-time fleet updates
 * Uses STOMP over SockJS for dashboard communication
 */
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws/dashboard';

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = new Map();
    this.listeners = new Map();
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
  }

  connect() {
    if (this.client?.connected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        debug: (str) => {
          if (import.meta.env.DEV) {
            console.log('[STOMP]', str);
          }
        },
        onConnect: () => {
          console.log('WebSocket connected');
          this.connected = true;
          this.reconnectAttempts = 0;
          this.notifyListeners('connection', { connected: true });
          resolve();
        },
        onDisconnect: () => {
          console.log('WebSocket disconnected');
          this.connected = false;
          this.notifyListeners('connection', { connected: false });
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame.headers['message']);
          reject(new Error(frame.headers['message']));
        },
        onWebSocketError: (event) => {
          console.error('WebSocket error:', event);
          this.reconnectAttempts++;
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.notifyListeners('connection', { connected: false, fallback: true });
          }
        }
      });

      this.client.activate();
    });
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.subscriptions.clear();
      this.connected = false;
    }
  }

  subscribe(channel, callback) {
    const topic = `/topic/${channel}`;

    if (!this.client?.connected) {
      console.warn('WebSocket not connected, queuing subscription:', channel);
      return null;
    }

    const subscription = this.client.subscribe(topic, (message) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    });

    this.subscriptions.set(channel, subscription);
    return subscription;
  }

  unsubscribe(channel) {
    const subscription = this.subscriptions.get(channel);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(channel);
    }
  }

  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  notifyListeners(event, data) {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }

  isConnected() {
    return this.connected;
  }
}

// Singleton instance
export const wsService = new WebSocketService();
export default wsService;
