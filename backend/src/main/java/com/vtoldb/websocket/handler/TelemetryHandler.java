package com.vtoldb.websocket.handler;

import com.vtoldb.dto.DroneDTO;
import com.vtoldb.model.DroneStatus;
import com.vtoldb.service.DroneService;
import com.vtoldb.service.FleetBroadcastService;
import com.vtoldb.websocket.protocol.TelemetryPayload;
import com.vtoldb.websocket.session.FleetSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class TelemetryHandler {
    private static final Logger log = LoggerFactory.getLogger(TelemetryHandler.class);

    private final DroneService droneService;
    private final FleetBroadcastService broadcastService;

    public TelemetryHandler(DroneService droneService, FleetBroadcastService broadcastService) {
        this.droneService = droneService;
        this.broadcastService = broadcastService;
    }

    public void handle(TelemetryPayload telemetry, FleetSession session) {
        String droneId = telemetry.getDroneId();
        log.debug("Processing telemetry for drone: {}", droneId);

        try {
            // Get current drone
            DroneDTO drone = droneService.getDroneById(droneId);
            if (drone == null) {
                log.warn("Drone not found for telemetry: {}", droneId);
                return;
            }

            // Update drone with telemetry data
            boolean updated = false;

            if (telemetry.getPosition() != null) {
                TelemetryPayload.Position pos = telemetry.getPosition();
                if (pos.getLatitude() != null) {
                    drone.setLatitude(pos.getLatitude());
                    updated = true;
                }
                if (pos.getLongitude() != null) {
                    drone.setLongitude(pos.getLongitude());
                    updated = true;
                }
                if (pos.getAltitude() != null) {
                    drone.setAltitude(pos.getAltitude());
                    updated = true;
                }
            }

            if (telemetry.getBattery() != null && telemetry.getBattery().getLevel() != null) {
                drone.setBatteryLevel(telemetry.getBattery().getLevel());
                updated = true;
            }

            if (telemetry.getStatus() != null) {
                try {
                    DroneStatus status = DroneStatus.valueOf(telemetry.getStatus());
                    drone.setStatus(status);
                    updated = true;
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid status in telemetry: {}", telemetry.getStatus());
                }
            }

            if (updated) {
                // Update drone in database
                droneService.updateDrone(droneId, drone);

                // Broadcast update to dashboard clients
                broadcastService.broadcastDroneUpdate(drone);
            }
        } catch (Exception e) {
            log.error("Failed to process telemetry for drone: {}", droneId, e);
        }
    }

    public void markDroneOffline(String droneId) {
        try {
            droneService.updateDroneStatus(droneId, DroneStatus.OFFLINE);

            DroneDTO drone = droneService.getDroneById(droneId);
            if (drone != null) {
                broadcastService.broadcastDroneUpdate(drone);
                log.info("Marked drone {} as OFFLINE", droneId);
            } else {
                log.warn("Cannot broadcast offline status - drone not found: {}", droneId);
            }
        } catch (Exception e) {
            log.error("Failed to mark drone offline: {}", droneId, e);
        }
    }
}
