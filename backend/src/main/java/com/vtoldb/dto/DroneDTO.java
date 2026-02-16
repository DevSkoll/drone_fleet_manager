/**
 * Data Transfer Object for Drone API requests/responses
 * Provides clean API contract separation from internal models
 */
package com.vtoldb.dto;

import com.vtoldb.model.DroneStatus;
import java.util.List;

public class DroneDTO {
    private String id;
    private String name;
    private String model;
    private String serialNumber;
    private DroneStatus status;
    private String lastSeen;
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

    public String getLastSeen() { return lastSeen; }
    public void setLastSeen(String lastSeen) { this.lastSeen = lastSeen; }

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
