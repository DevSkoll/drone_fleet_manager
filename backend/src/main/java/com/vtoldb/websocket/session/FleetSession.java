package com.vtoldb.websocket.session;

import org.springframework.web.socket.WebSocketSession;
import java.time.Instant;
import java.util.List;

public class FleetSession {
    private final String sessionId;
    private final String workerId;
    private final String droneId;
    private final WebSocketSession webSocketSession;
    private final Instant connectedAt;
    private Instant lastActivity;
    private List<String> capabilities;

    public FleetSession(String sessionId, String workerId, String droneId,
                        WebSocketSession webSocketSession) {
        this.sessionId = sessionId;
        this.workerId = workerId;
        this.droneId = droneId;
        this.webSocketSession = webSocketSession;
        this.connectedAt = Instant.now();
        this.lastActivity = Instant.now();
    }

    public void updateLastActivity() {
        this.lastActivity = Instant.now();
    }

    public boolean isExpired(long timeoutMillis) {
        return Instant.now().toEpochMilli() - lastActivity.toEpochMilli() > timeoutMillis;
    }

    public boolean isOpen() {
        return webSocketSession != null && webSocketSession.isOpen();
    }

    // Getters
    public String getSessionId() {
        return sessionId;
    }

    public String getWorkerId() {
        return workerId;
    }

    public String getDroneId() {
        return droneId;
    }

    public WebSocketSession getWebSocketSession() {
        return webSocketSession;
    }

    public Instant getConnectedAt() {
        return connectedAt;
    }

    public Instant getLastActivity() {
        return lastActivity;
    }

    public List<String> getCapabilities() {
        return capabilities;
    }

    public void setCapabilities(List<String> capabilities) {
        this.capabilities = capabilities;
    }
}
