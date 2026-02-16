package com.vtoldb.websocket.session;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class FleetSessionManager {
    private static final Logger log = LoggerFactory.getLogger(FleetSessionManager.class);

    // Map sessionId -> FleetSession
    private final ConcurrentHashMap<String, FleetSession> sessions = new ConcurrentHashMap<>();

    // Map droneId -> sessionId (for quick lookup by drone)
    private final ConcurrentHashMap<String, String> droneToSession = new ConcurrentHashMap<>();

    // Map WebSocketSession.id -> sessionId
    private final ConcurrentHashMap<String, String> wsSessionToFleetSession = new ConcurrentHashMap<>();

    public FleetSession createSession(String workerId, String droneId, WebSocketSession wsSession) {
        String sessionId = UUID.randomUUID().toString();
        FleetSession session = new FleetSession(sessionId, workerId, droneId, wsSession);

        sessions.put(sessionId, session);
        droneToSession.put(droneId, sessionId);
        wsSessionToFleetSession.put(wsSession.getId(), sessionId);

        log.info("Created fleet session: {} for worker: {} drone: {}", sessionId, workerId, droneId);
        return session;
    }

    public Optional<FleetSession> getSession(String sessionId) {
        return Optional.ofNullable(sessions.get(sessionId));
    }

    public Optional<FleetSession> getSessionByWsSession(WebSocketSession wsSession) {
        String sessionId = wsSessionToFleetSession.get(wsSession.getId());
        if (sessionId == null) {
            return Optional.empty();
        }
        return getSession(sessionId);
    }

    public Optional<FleetSession> getSessionByDroneId(String droneId) {
        String sessionId = droneToSession.get(droneId);
        if (sessionId == null) {
            return Optional.empty();
        }
        return getSession(sessionId);
    }

    public void removeSession(String sessionId) {
        FleetSession session = sessions.remove(sessionId);
        if (session != null) {
            droneToSession.remove(session.getDroneId());
            if (session.getWebSocketSession() != null) {
                wsSessionToFleetSession.remove(session.getWebSocketSession().getId());
            }
            log.info("Removed fleet session: {} for drone: {}", sessionId, session.getDroneId());
        }
    }

    public void removeSessionByWsSession(WebSocketSession wsSession) {
        String sessionId = wsSessionToFleetSession.get(wsSession.getId());
        if (sessionId != null) {
            removeSession(sessionId);
        }
    }

    public Collection<FleetSession> getAllSessions() {
        return Collections.unmodifiableCollection(sessions.values());
    }

    public List<FleetSession> getExpiredSessions(long timeoutMillis) {
        return sessions.values().stream()
                .filter(session -> session.isExpired(timeoutMillis))
                .collect(Collectors.toList());
    }

    public int getActiveSessionCount() {
        return sessions.size();
    }

    public boolean hasDroneSession(String droneId) {
        return droneToSession.containsKey(droneId);
    }
}
