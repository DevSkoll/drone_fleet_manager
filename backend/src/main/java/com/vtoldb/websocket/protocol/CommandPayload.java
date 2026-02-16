package com.vtoldb.websocket.protocol;

import java.util.Map;

public class CommandPayload {
    private String droneId;
    private String command;
    private Map<String, Object> parameters;
    private String priority;
    private Long timeout;

    public CommandPayload() {}

    public CommandPayload(String droneId, String command, Map<String, Object> parameters) {
        this.droneId = droneId;
        this.command = command;
        this.parameters = parameters;
        this.priority = "NORMAL";
        this.timeout = 30000L;
    }

    // Getters and setters
    public String getDroneId() {
        return droneId;
    }

    public void setDroneId(String droneId) {
        this.droneId = droneId;
    }

    public String getCommand() {
        return command;
    }

    public void setCommand(String command) {
        this.command = command;
    }

    public Map<String, Object> getParameters() {
        return parameters;
    }

    public void setParameters(Map<String, Object> parameters) {
        this.parameters = parameters;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public Long getTimeout() {
        return timeout;
    }

    public void setTimeout(Long timeout) {
        this.timeout = timeout;
    }
}
