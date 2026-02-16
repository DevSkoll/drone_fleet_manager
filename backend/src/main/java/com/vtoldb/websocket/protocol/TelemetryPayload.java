package com.vtoldb.websocket.protocol;

public class TelemetryPayload {
    private String droneId;
    private Position position;
    private Battery battery;
    private String status;
    private String flightMode;
    private Sensors sensors;

    public TelemetryPayload() {}

    // Nested classes
    public static class Position {
        private Double latitude;
        private Double longitude;
        private Double altitude;
        private Double heading;
        private Double speed;

        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
        public Double getAltitude() { return altitude; }
        public void setAltitude(Double altitude) { this.altitude = altitude; }
        public Double getHeading() { return heading; }
        public void setHeading(Double heading) { this.heading = heading; }
        public Double getSpeed() { return speed; }
        public void setSpeed(Double speed) { this.speed = speed; }
    }

    public static class Battery {
        private Double level;
        private Double voltage;
        private Double current;
        private Double temperature;

        public Double getLevel() { return level; }
        public void setLevel(Double level) { this.level = level; }
        public Double getVoltage() { return voltage; }
        public void setVoltage(Double voltage) { this.voltage = voltage; }
        public Double getCurrent() { return current; }
        public void setCurrent(Double current) { this.current = current; }
        public Double getTemperature() { return temperature; }
        public void setTemperature(Double temperature) { this.temperature = temperature; }
    }

    public static class Sensors {
        private Integer gpsFixType;
        private Integer satelliteCount;
        private Integer signalStrength;

        public Integer getGpsFixType() { return gpsFixType; }
        public void setGpsFixType(Integer gpsFixType) { this.gpsFixType = gpsFixType; }
        public Integer getSatelliteCount() { return satelliteCount; }
        public void setSatelliteCount(Integer satelliteCount) { this.satelliteCount = satelliteCount; }
        public Integer getSignalStrength() { return signalStrength; }
        public void setSignalStrength(Integer signalStrength) { this.signalStrength = signalStrength; }
    }

    // Getters and setters
    public String getDroneId() { return droneId; }
    public void setDroneId(String droneId) { this.droneId = droneId; }
    public Position getPosition() { return position; }
    public void setPosition(Position position) { this.position = position; }
    public Battery getBattery() { return battery; }
    public void setBattery(Battery battery) { this.battery = battery; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getFlightMode() { return flightMode; }
    public void setFlightMode(String flightMode) { this.flightMode = flightMode; }
    public Sensors getSensors() { return sensors; }
    public void setSensors(Sensors sensors) { this.sensors = sensors; }
}
