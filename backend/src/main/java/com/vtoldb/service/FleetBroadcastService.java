package com.vtoldb.service;

import com.vtoldb.dto.DroneDTO;
import com.vtoldb.websocket.protocol.FleetMessage;
import com.vtoldb.websocket.protocol.MessageType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class FleetBroadcastService {
    private static final Logger log = LoggerFactory.getLogger(FleetBroadcastService.class);

    private static final String TOPIC_DRONES = "/topic/drones";
    private static final String TOPIC_TELEMETRY = "/topic/telemetry";
    private static final String TOPIC_ALERTS = "/topic/alerts";

    private final SimpMessagingTemplate messagingTemplate;

    public FleetBroadcastService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void broadcastDroneUpdate(DroneDTO drone) {
        Map<String, Object> payload = Map.of(
            "updateType", "DRONE_UPDATED",
            "droneId", drone.getId(),
            "data", drone
        );

        FleetMessage<Map<String, Object>> message = FleetMessage.of(MessageType.UPDATE, "drones", payload);
        messagingTemplate.convertAndSend(TOPIC_DRONES, message);

        log.debug("Broadcast drone update for: {}", drone.getId());
    }

    public void broadcastDroneCreated(DroneDTO drone) {
        Map<String, Object> payload = Map.of(
            "updateType", "DRONE_CREATED",
            "droneId", drone.getId(),
            "data", drone
        );

        FleetMessage<Map<String, Object>> message = FleetMessage.of(MessageType.UPDATE, "drones", payload);
        messagingTemplate.convertAndSend(TOPIC_DRONES, message);

        log.debug("Broadcast drone created: {}", drone.getId());
    }

    public void broadcastDroneDeleted(String droneId) {
        Map<String, Object> payload = Map.of(
            "updateType", "DRONE_DELETED",
            "droneId", droneId
        );

        FleetMessage<Map<String, Object>> message = FleetMessage.of(MessageType.UPDATE, "drones", payload);
        messagingTemplate.convertAndSend(TOPIC_DRONES, message);

        log.debug("Broadcast drone deleted: {}", droneId);
    }

    public void broadcastFleetSnapshot(List<DroneDTO> drones) {
        Map<String, Object> payload = Map.of("drones", drones);

        FleetMessage<Map<String, Object>> message = FleetMessage.of(MessageType.SNAPSHOT, "drones", payload);
        messagingTemplate.convertAndSend(TOPIC_DRONES, message);

        log.debug("Broadcast fleet snapshot with {} drones", drones.size());
    }

    public void broadcastAlert(String droneId, String alertType, String message) {
        Map<String, Object> payload = Map.of(
            "droneId", droneId,
            "alertType", alertType,
            "message", message
        );

        FleetMessage<Map<String, Object>> alert = FleetMessage.of(MessageType.UPDATE, "alerts", payload);
        messagingTemplate.convertAndSend(TOPIC_ALERTS, alert);

        log.info("Broadcast alert for drone {}: {} - {}", droneId, alertType, message);
    }
}
