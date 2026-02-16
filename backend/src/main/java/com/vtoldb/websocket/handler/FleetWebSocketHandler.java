package com.vtoldb.websocket.handler;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vtoldb.websocket.protocol.*;
import com.vtoldb.websocket.session.FleetSession;
import com.vtoldb.websocket.session.FleetSessionManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;

@Component
public class FleetWebSocketHandler extends TextWebSocketHandler {
    private static final Logger log = LoggerFactory.getLogger(FleetWebSocketHandler.class);

    private final ObjectMapper objectMapper;
    private final FleetSessionManager sessionManager;
    private final RegistrationHandler registrationHandler;
    private final TelemetryHandler telemetryHandler;

    public FleetWebSocketHandler(ObjectMapper objectMapper,
                                  FleetSessionManager sessionManager,
                                  RegistrationHandler registrationHandler,
                                  TelemetryHandler telemetryHandler) {
        this.objectMapper = objectMapper;
        this.sessionManager = sessionManager;
        this.registrationHandler = registrationHandler;
        this.telemetryHandler = telemetryHandler;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        log.info("New WebSocket connection established: {}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        String payload = message.getPayload();
        log.debug("Received message from {}: {}", session.getId(), payload);

        try {
            JsonNode root = objectMapper.readTree(payload);
            String typeStr = root.path("type").asText();
            MessageType type = MessageType.valueOf(typeStr);

            switch (type) {
                case REGISTER -> handleRegister(session, root);
                case HEARTBEAT -> handleHeartbeat(session);
                case TELEMETRY -> handleTelemetry(session, root);
                case COMMAND_ACK -> handleCommandAck(session, root);
                case ALERT -> handleAlert(session, root);
                default -> log.warn("Unknown message type: {}", type);
            }
        } catch (IllegalArgumentException e) {
            log.error("Invalid message type in message: {}", payload);
            sendError(session, "Invalid message type");
        } catch (JsonProcessingException e) {
            log.error("Failed to parse message: {}", payload, e);
            sendError(session, "Invalid JSON format");
        } catch (Exception e) {
            log.error("Error processing message", e);
            sendError(session, "Internal error");
        }
    }

    private void handleRegister(WebSocketSession wsSession, JsonNode root) {
        try {
            JsonNode payloadNode = root.path("payload");
            WorkerRegistration registration = objectMapper.treeToValue(payloadNode, WorkerRegistration.class);

            FleetMessage<RegistrationAck> response = registrationHandler.handle(registration, wsSession);
            sendMessage(wsSession, response);
        } catch (Exception e) {
            log.error("Failed to handle registration", e);
            sendError(wsSession, "Registration failed: " + e.getMessage());
        }
    }

    private void handleHeartbeat(WebSocketSession wsSession) {
        sessionManager.getSessionByWsSession(wsSession).ifPresent(session -> {
            session.updateLastActivity();
            log.debug("Heartbeat received from worker: {}", session.getWorkerId());

            // Send heartbeat response
            FleetMessage<Void> response = new FleetMessage<>(MessageType.HEARTBEAT, null);
            sendMessage(wsSession, response);
        });
    }

    private void handleTelemetry(WebSocketSession wsSession, JsonNode root) {
        sessionManager.getSessionByWsSession(wsSession).ifPresent(session -> {
            session.updateLastActivity();

            try {
                JsonNode payloadNode = root.path("payload");
                TelemetryPayload telemetry = objectMapper.treeToValue(payloadNode, TelemetryPayload.class);
                telemetryHandler.handle(telemetry, session);
            } catch (Exception e) {
                log.error("Failed to handle telemetry", e);
            }
        });
    }

    private void handleCommandAck(WebSocketSession wsSession, JsonNode root) {
        sessionManager.getSessionByWsSession(wsSession).ifPresent(session -> {
            session.updateLastActivity();

            String correlationId = root.path("correlationId").asText();
            JsonNode payloadNode = root.path("payload");
            String status = payloadNode.path("status").asText();

            log.info("Command ACK received: correlationId={}, status={}", correlationId, status);
            // TODO: Update command status tracking
        });
    }

    private void handleAlert(WebSocketSession wsSession, JsonNode root) {
        sessionManager.getSessionByWsSession(wsSession).ifPresent(session -> {
            session.updateLastActivity();

            JsonNode payloadNode = root.path("payload");
            log.warn("Alert from drone {}: {}", session.getDroneId(), payloadNode);
            // TODO: Broadcast alert to dashboard
        });
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        log.info("WebSocket connection closed: {} with status: {}", session.getId(), status);

        sessionManager.getSessionByWsSession(session).ifPresent(fleetSession -> {
            String droneId = fleetSession.getDroneId();
            sessionManager.removeSessionByWsSession(session);

            // Notify that drone is now offline
            telemetryHandler.markDroneOffline(droneId);
        });
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.error("Transport error for session {}: {}", session.getId(), exception.getMessage());
    }

    public void sendCommand(String droneId, FleetMessage<CommandPayload> command) {
        sessionManager.getSessionByDroneId(droneId).ifPresentOrElse(
            session -> sendMessage(session.getWebSocketSession(), command),
            () -> log.warn("No active session for drone: {}", droneId)
        );
    }

    private <T> void sendMessage(WebSocketSession session, FleetMessage<T> message) {
        try {
            String json = objectMapper.writeValueAsString(message);
            session.sendMessage(new TextMessage(json));
        } catch (IOException e) {
            log.error("Failed to send message to session: {}", session.getId(), e);
        }
    }

    private void sendError(WebSocketSession session, String error) {
        try {
            String json = objectMapper.writeValueAsString(
                java.util.Map.of("error", error)
            );
            session.sendMessage(new TextMessage(json));
        } catch (IOException e) {
            log.error("Failed to send error message", e);
        }
    }
}
