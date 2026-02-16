package com.vtoldb.websocket.protocol;

public class CommandAck {
    private String status;
    private String message;

    public CommandAck() {}

    public CommandAck(String status, String message) {
        this.status = status;
        this.message = message;
    }

    public static CommandAck success() {
        return new CommandAck("SUCCESS", null);
    }

    public static CommandAck success(String message) {
        return new CommandAck("SUCCESS", message);
    }

    public static CommandAck failed(String message) {
        return new CommandAck("FAILED", message);
    }

    // Getters and setters
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
