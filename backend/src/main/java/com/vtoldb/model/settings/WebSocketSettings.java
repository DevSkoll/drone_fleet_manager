/**
 * WebSocket connection settings
 */
package com.vtoldb.model.settings;

public class WebSocketSettings {
    private long heartbeatInterval = 15000;
    private long idleTimeout = 60000;
    private long healthCheckInterval = 10000;

    public long getHeartbeatInterval() {
        return heartbeatInterval;
    }

    public void setHeartbeatInterval(long heartbeatInterval) {
        this.heartbeatInterval = heartbeatInterval;
    }

    public long getIdleTimeout() {
        return idleTimeout;
    }

    public void setIdleTimeout(long idleTimeout) {
        this.idleTimeout = idleTimeout;
    }

    public long getHealthCheckInterval() {
        return healthCheckInterval;
    }

    public void setHealthCheckInterval(long healthCheckInterval) {
        this.healthCheckInterval = healthCheckInterval;
    }
}
