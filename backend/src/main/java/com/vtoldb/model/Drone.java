/**
 * Core Drone entity representing a single drone in the fleet
 * Bryce at JCU//JEDI
 * arctek.us
 */
package com.vtoldb.model;

import java.time.LocalDateTime;
import java.util.List;

public class Drone {
    private String id;
    private String name;
    private String model;
    private String serialNumber;
    private DroneStatus status;
    private LocalDateTime lastSeen;
    private Double latitude;
    private Double longitude;
    private Double altitude;
    private Double batteryLevel;

    // Networking fields
    private String ipAddress;
    private Integer port;
    private String role;
    private String protocol;
    private String connectionType;
    private List<String> capabilities;
    private String rtspEndpoint;

    // Constructors
    public Drone() {
        this.status = DroneStatus.OFFLINE;
        this.lastSeen = LocalDateTime.now();
    }

    public Drone(String id, String name, String model, String serialNumber) {
        this();
        this.id = id;
        this.name = name;
        this.model = model;
        this.serialNumber = serialNumber;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }

    public DroneStatus getStatus() { return status; }
    public void setStatus(DroneStatus status) { this.status = status; }

    public LocalDateTime getLastSeen() { return lastSeen; }
    public void setLastSeen(LocalDateTime lastSeen) { this.lastSeen = lastSeen; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Double getAltitude() { return altitude; }
    public void setAltitude(Double altitude) { this.altitude = altitude; }

    public Double getBatteryLevel() { return batteryLevel; }
    public void setBatteryLevel(Double batteryLevel) { this.batteryLevel = batteryLevel; }

    // Networking getters and setters
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public Integer getPort() { return port; }
    public void setPort(Integer port) { this.port = port; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getProtocol() { return protocol; }
    public void setProtocol(String protocol) { this.protocol = protocol; }

    public String getConnectionType() { return connectionType; }
    public void setConnectionType(String connectionType) { this.connectionType = connectionType; }

    public List<String> getCapabilities() { return capabilities; }
    public void setCapabilities(List<String> capabilities) { this.capabilities = capabilities; }

    public String getRtspEndpoint() { return rtspEndpoint; }
    public void setRtspEndpoint(String rtspEndpoint) { this.rtspEndpoint = rtspEndpoint; }
}
