package com.vtoldb.config;

import com.vtoldb.websocket.handler.FleetWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class FleetWebSocketConfig implements WebSocketConfigurer {

    private final FleetWebSocketHandler fleetWebSocketHandler;

    public FleetWebSocketConfig(@Lazy FleetWebSocketHandler fleetWebSocketHandler) {
        this.fleetWebSocketHandler = fleetWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(fleetWebSocketHandler, "/ws/fleet")
                .setAllowedOriginPatterns("*");
    }
}
