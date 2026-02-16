/**
 * Core Drone entity representing a single drone in the fleet
 * Bryce at JCU//JEDI
 * arctek.us
 */
package com.vtoldb.model;

import java.time.LocalDateTime;

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
}
