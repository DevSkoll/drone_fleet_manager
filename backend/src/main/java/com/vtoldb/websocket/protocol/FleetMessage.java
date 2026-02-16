package com.vtoldb.websocket.protocol;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class FleetMessage<T> {
    private MessageType type;
    private String channel;
    private String correlationId;
    private Instant timestamp;
    private T payload;

    public FleetMessage() {
        this.timestamp = Instant.now();
    }

    public FleetMessage(MessageType type, T payload) {
        this.type = type;
        this.payload = payload;
        this.timestamp = Instant.now();
    }

    public FleetMessage(MessageType type, String channel, T payload) {
        this.type = type;
        this.channel = channel;
        this.payload = payload;
        this.timestamp = Instant.now();
    }

    public static <T> FleetMessage<T> of(MessageType type, T payload) {
        return new FleetMessage<>(type, payload);
    }

    public static <T> FleetMessage<T> of(MessageType type, String channel, T payload) {
        return new FleetMessage<>(type, channel, payload);
    }

    public FleetMessage<T> withCorrelationId(String correlationId) {
        this.correlationId = correlationId;
        return this;
    }

    // Getters and setters
    public MessageType getType() {
        return type;
    }

    public void setType(MessageType type) {
        this.type = type;
    }

    public String getChannel() {
        return channel;
    }

    public void setChannel(String channel) {
        this.channel = channel;
    }

    public String getCorrelationId() {
        return correlationId;
    }

    public void setCorrelationId(String correlationId) {
        this.correlationId = correlationId;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public T getPayload() {
        return payload;
    }

    public void setPayload(T payload) {
        this.payload = payload;
    }
}
