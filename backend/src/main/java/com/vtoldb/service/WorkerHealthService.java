package com.vtoldb.service;

import com.vtoldb.model.DroneStatus;
import com.vtoldb.websocket.session.FleetSession;
import com.vtoldb.websocket.session.FleetSessionManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
@EnableScheduling
public class WorkerHealthService {
    private static final Logger log = LoggerFactory.getLogger(WorkerHealthService.class);

    private final FleetSessionManager sessionManager;
    private final DroneService droneService;
    private final FleetBroadcastService broadcastService;

    @Value("${websocket.fleet.idle-timeout:60000}")
    private long idleTimeout;

    public WorkerHealthService(FleetSessionManager sessionManager,
                                DroneService droneService,
                                FleetBroadcastService broadcastService) {
        this.sessionManager = sessionManager;
        this.droneService = droneService;
        this.broadcastService = broadcastService;
    }

    @Scheduled(fixedRateString = "${websocket.fleet.health-check-interval:10000}")
    public void checkWorkerHealth() {
        List<FleetSession> expiredSessions = sessionManager.getExpiredSessions(idleTimeout);

        for (FleetSession session : expiredSessions) {
            log.warn("Worker session expired due to inactivity: {} (drone: {})",
                    session.getSessionId(), session.getDroneId());

            // Close the WebSocket connection if still open
            if (session.isOpen()) {
                try {
                    session.getWebSocketSession().close();
                } catch (IOException e) {
                    log.error("Error closing expired session", e);
                }
            }

            // Mark drone as offline
            String droneId = session.getDroneId();
            droneService.updateDroneStatus(droneId, DroneStatus.OFFLINE);

            // Remove the session
            sessionManager.removeSession(session.getSessionId());

            // Broadcast the status change
            try {
                broadcastService.broadcastAlert(droneId, "CONNECTION_LOST",
                        "Worker connection timed out");
            } catch (Exception e) {
                log.error("Failed to broadcast offline alert for drone: {}", droneId, e);
            }
        }

        if (!expiredSessions.isEmpty()) {
            log.info("Cleaned up {} expired worker sessions", expiredSessions.size());
        }
    }

    public int getActiveWorkerCount() {
        return sessionManager.getActiveSessionCount();
    }

    public boolean isWorkerConnected(String droneId) {
        return sessionManager.hasDroneSession(droneId);
    }
}
