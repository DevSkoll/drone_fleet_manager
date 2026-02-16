package com.vtoldb.service;

import com.vtoldb.websocket.handler.FleetWebSocketHandler;
import com.vtoldb.websocket.protocol.CommandPayload;
import com.vtoldb.websocket.protocol.FleetMessage;
import com.vtoldb.websocket.protocol.MessageType;
import com.vtoldb.websocket.session.FleetSessionManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CommandService {
    private static final Logger log = LoggerFactory.getLogger(CommandService.class);

    private final FleetSessionManager sessionManager;
    private final FleetWebSocketHandler webSocketHandler;

    // Track pending commands for ACK matching
    private final ConcurrentHashMap<String, PendingCommand> pendingCommands = new ConcurrentHashMap<>();

    public CommandService(FleetSessionManager sessionManager,
                          @Lazy FleetWebSocketHandler webSocketHandler) {
        this.sessionManager = sessionManager;
        this.webSocketHandler = webSocketHandler;
    }

    public String sendCommand(String droneId, String command, Map<String, Object> parameters) {
        if (!sessionManager.hasDroneSession(droneId)) {
            throw new IllegalStateException("No active connection for drone: " + droneId);
        }

        String correlationId = UUID.randomUUID().toString();

        CommandPayload payload = new CommandPayload(droneId, command, parameters);
        FleetMessage<CommandPayload> message = FleetMessage.of(MessageType.COMMAND, payload)
                .withCorrelationId(correlationId);

        // Track the pending command
        pendingCommands.put(correlationId, new PendingCommand(droneId, command, System.currentTimeMillis()));

        // Send to the worker
        webSocketHandler.sendCommand(droneId, message);

        log.info("Sent command {} to drone {}: correlationId={}", command, droneId, correlationId);

        return correlationId;
    }

    public void acknowledgeCommand(String correlationId, String status, String message) {
        PendingCommand pending = pendingCommands.remove(correlationId);
        if (pending != null) {
            long duration = System.currentTimeMillis() - pending.sentAt;
            log.info("Command {} acknowledged by drone {}: status={}, duration={}ms",
                    pending.command, pending.droneId, status, duration);
        } else {
            log.warn("Received ACK for unknown command: {}", correlationId);
        }
    }

    public boolean isCommandPending(String correlationId) {
        return pendingCommands.containsKey(correlationId);
    }

    private static class PendingCommand {
        final String droneId;
        final String command;
        final long sentAt;

        PendingCommand(String droneId, String command, long sentAt) {
            this.droneId = droneId;
            this.command = command;
            this.sentAt = sentAt;
        }
    }
}
