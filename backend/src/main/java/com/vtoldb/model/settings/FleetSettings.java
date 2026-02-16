/**
 * Fleet management settings
 */
package com.vtoldb.model.settings;

import java.util.Arrays;
import java.util.List;

public class FleetSettings {
    private long defaultTelemetryInterval = 5000;
    private long offlineThreshold = 30000;
    private int maxConcurrentWorkers = 50;

    // Configurable option lists for drone properties
    private List<String> availableRoles = Arrays.asList("Controller", "Worker", "Relay", "Observer");
    private List<String> availableConnectionTypes = Arrays.asList("Starlink", "Starshield", "Cellular", "WiFi", "Ethernet");
    private List<String> availableCapabilities = Arrays.asList("Video", "Photo", "Thermal", "LiDAR", "Multispectral");
    private List<String> availableProtocols = Arrays.asList("TCP", "UDP", "WebSocket", "MAVLINK", "ROS2");

    public long getDefaultTelemetryInterval() {
        return defaultTelemetryInterval;
    }

    public void setDefaultTelemetryInterval(long defaultTelemetryInterval) {
        this.defaultTelemetryInterval = defaultTelemetryInterval;
    }

    public long getOfflineThreshold() {
        return offlineThreshold;
    }

    public void setOfflineThreshold(long offlineThreshold) {
        this.offlineThreshold = offlineThreshold;
    }

    public int getMaxConcurrentWorkers() {
        return maxConcurrentWorkers;
    }

    public void setMaxConcurrentWorkers(int maxConcurrentWorkers) {
        this.maxConcurrentWorkers = maxConcurrentWorkers;
    }

    public List<String> getAvailableRoles() {
        return availableRoles;
    }

    public void setAvailableRoles(List<String> availableRoles) {
        this.availableRoles = availableRoles;
    }

    public List<String> getAvailableConnectionTypes() {
        return availableConnectionTypes;
    }

    public void setAvailableConnectionTypes(List<String> availableConnectionTypes) {
        this.availableConnectionTypes = availableConnectionTypes;
    }

    public List<String> getAvailableCapabilities() {
        return availableCapabilities;
    }

    public void setAvailableCapabilities(List<String> availableCapabilities) {
        this.availableCapabilities = availableCapabilities;
    }

    public List<String> getAvailableProtocols() {
        return availableProtocols;
    }

    public void setAvailableProtocols(List<String> availableProtocols) {
        this.availableProtocols = availableProtocols;
    }
}
