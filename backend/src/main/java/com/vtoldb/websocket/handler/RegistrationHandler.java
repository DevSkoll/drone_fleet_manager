package com.vtoldb.websocket.handler;

import com.vtoldb.model.Drone;
import com.vtoldb.model.DroneStatus;
import com.vtoldb.service.DroneService;
import com.vtoldb.websocket.protocol.*;
import com.vtoldb.websocket.session.FleetSession;
import com.vtoldb.websocket.session.FleetSessionManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import java.util.List;

@Component
public class RegistrationHandler {
    private static final Logger log = LoggerFactory.getLogger(RegistrationHandler.class);

    private final FleetSessionManager sessionManager;
    private final DroneService droneService;

    @Value("${websocket.fleet.heartbeat-interval:15000}")
    private long heartbeatInterval;

    public RegistrationHandler(FleetSessionManager sessionManager, DroneService droneService) {
        this.sessionManager = sessionManager;
        this.droneService = droneService;
    }

    public FleetMessage<RegistrationAck> handle(WorkerRegistration registration, WebSocketSession wsSession) {
        String workerId = registration.getWorkerId();
        String droneId = registration.getDroneId();

        log.info("Processing registration for worker: {} drone: {}", workerId, droneId);

        // Check if drone already has an active session
        if (sessionManager.hasDroneSession(droneId)) {
            log.warn("Drone {} already has an active session, rejecting new registration", droneId);
            return FleetMessage.of(MessageType.REGISTER_ACK, RegistrationAck.rejected("Drone already registered"));
        }

        // Create the fleet session
        FleetSession session = sessionManager.createSession(workerId, droneId, wsSession);
        session.setCapabilities(registration.getCapabilities());

        // Update or create drone in database
        ensureDroneExists(registration);

        // Update drone status to ACTIVE
        droneService.updateDroneStatus(droneId, DroneStatus.ACTIVE);

        // Build acknowledgment
        RegistrationAck ack = RegistrationAck.accepted(session.getSessionId(), heartbeatInterval);
        ack.setConfiguredChannels(List.of("telemetry", "commands"));

        log.info("Registration successful for worker: {} session: {}", workerId, session.getSessionId());

        return FleetMessage.of(MessageType.REGISTER_ACK, ack);
    }

    private void ensureDroneExists(WorkerRegistration registration) {
        var existing = droneService.getDroneById(registration.getDroneId());
        if (existing == null) {
            // Drone doesn't exist, create it
            log.info("Creating new drone record for: {}", registration.getDroneId());
            Drone drone = new Drone();
            drone.setId(registration.getDroneId());
            drone.setName("Worker-" + registration.getWorkerId());
            drone.setSerialNumber(registration.getSerialNumber());
            drone.setStatus(DroneStatus.ACTIVE);
            droneService.createDrone(drone);
        } else {
            log.info("Drone already exists: {}", registration.getDroneId());
        }
    }
}
