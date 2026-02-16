package com.vtoldb.websocket.protocol;

public enum MessageType {
    // Worker -> Server
    REGISTER,
    HEARTBEAT,
    TELEMETRY,
    COMMAND_ACK,
    ALERT,

    // Server -> Worker
    REGISTER_ACK,
    COMMAND,

    // Server -> Dashboard
    SNAPSHOT,
    UPDATE
}
