package com.vtoldb.websocket.protocol;

import java.util.List;

public class RegistrationAck {
    private String status;
    private String sessionId;
    private long heartbeatInterval;
    private List<String> configuredChannels;

    public RegistrationAck() {}

    public RegistrationAck(String status, String sessionId, long heartbeatInterval) {
        this.status = status;
        this.sessionId = sessionId;
        this.heartbeatInterval = heartbeatInterval;
    }

    public static RegistrationAck accepted(String sessionId, long heartbeatInterval) {
        return new RegistrationAck("ACCEPTED", sessionId, heartbeatInterval);
    }

    public static RegistrationAck rejected(String reason) {
        RegistrationAck ack = new RegistrationAck();
        ack.setStatus("REJECTED");
        return ack;
    }

    // Getters and setters
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public long getHeartbeatInterval() {
        return heartbeatInterval;
    }

    public void setHeartbeatInterval(long heartbeatInterval) {
        this.heartbeatInterval = heartbeatInterval;
    }

    public List<String> getConfiguredChannels() {
        return configuredChannels;
    }

    public void setConfiguredChannels(List<String> configuredChannels) {
        this.configuredChannels = configuredChannels;
    }
}
