/**
 * Data Transfer Object for Settings API
 * Handles masking of sensitive fields in responses
 */
package com.vtoldb.dto;

public class SettingsDTO {
    private DatabaseSettingsDTO database;
    private BackupSettingsDTO backup;
    private SecuritySettingsDTO security;
    private WebSocketSettingsDTO websocket;
    private FleetSettingsDTO fleet;

    public static class DatabaseSettingsDTO {
        private String storageType;
        private String flatfilePath;
        private PostgresSettingsDTO postgresql;

        public static class PostgresSettingsDTO {
            private String host;
            private Integer port;
            private String database;
            private String username;
            private String password;
            private boolean hasPassword;

            public String getHost() { return host; }
            public void setHost(String host) { this.host = host; }
            public Integer getPort() { return port; }
            public void setPort(Integer port) { this.port = port; }
            public String getDatabase() { return database; }
            public void setDatabase(String database) { this.database = database; }
            public String getUsername() { return username; }
            public void setUsername(String username) { this.username = username; }
            public String getPassword() { return password; }
            public void setPassword(String password) { this.password = password; }
            public boolean isHasPassword() { return hasPassword; }
            public void setHasPassword(boolean hasPassword) { this.hasPassword = hasPassword; }
        }

        public String getStorageType() { return storageType; }
        public void setStorageType(String storageType) { this.storageType = storageType; }
        public String getFlatfilePath() { return flatfilePath; }
        public void setFlatfilePath(String flatfilePath) { this.flatfilePath = flatfilePath; }
        public PostgresSettingsDTO getPostgresql() { return postgresql; }
        public void setPostgresql(PostgresSettingsDTO postgresql) { this.postgresql = postgresql; }
    }

    public static class BackupSettingsDTO {
        private Boolean enabled;
        private Integer intervalHours;
        private Integer retentionCount;
        private String directoryPath;

        public Boolean getEnabled() { return enabled; }
        public void setEnabled(Boolean enabled) { this.enabled = enabled; }
        public Integer getIntervalHours() { return intervalHours; }
        public void setIntervalHours(Integer intervalHours) { this.intervalHours = intervalHours; }
        public Integer getRetentionCount() { return retentionCount; }
        public void setRetentionCount(Integer retentionCount) { this.retentionCount = retentionCount; }
        public String getDirectoryPath() { return directoryPath; }
        public void setDirectoryPath(String directoryPath) { this.directoryPath = directoryPath; }
    }

    public static class SecuritySettingsDTO {
        private String workerAuthKey;
        private boolean hasAuthKey;
        private Boolean authenticationEnabled;

        public String getWorkerAuthKey() { return workerAuthKey; }
        public void setWorkerAuthKey(String workerAuthKey) { this.workerAuthKey = workerAuthKey; }
        public boolean isHasAuthKey() { return hasAuthKey; }
        public void setHasAuthKey(boolean hasAuthKey) { this.hasAuthKey = hasAuthKey; }
        public Boolean getAuthenticationEnabled() { return authenticationEnabled; }
        public void setAuthenticationEnabled(Boolean authenticationEnabled) { this.authenticationEnabled = authenticationEnabled; }
    }

    public static class WebSocketSettingsDTO {
        private Long heartbeatInterval;
        private Long idleTimeout;
        private Long healthCheckInterval;

        public Long getHeartbeatInterval() { return heartbeatInterval; }
        public void setHeartbeatInterval(Long heartbeatInterval) { this.heartbeatInterval = heartbeatInterval; }
        public Long getIdleTimeout() { return idleTimeout; }
        public void setIdleTimeout(Long idleTimeout) { this.idleTimeout = idleTimeout; }
        public Long getHealthCheckInterval() { return healthCheckInterval; }
        public void setHealthCheckInterval(Long healthCheckInterval) { this.healthCheckInterval = healthCheckInterval; }
    }

    public static class FleetSettingsDTO {
        private Long defaultTelemetryInterval;
        private Long offlineThreshold;
        private Integer maxConcurrentWorkers;

        public Long getDefaultTelemetryInterval() { return defaultTelemetryInterval; }
        public void setDefaultTelemetryInterval(Long defaultTelemetryInterval) { this.defaultTelemetryInterval = defaultTelemetryInterval; }
        public Long getOfflineThreshold() { return offlineThreshold; }
        public void setOfflineThreshold(Long offlineThreshold) { this.offlineThreshold = offlineThreshold; }
        public Integer getMaxConcurrentWorkers() { return maxConcurrentWorkers; }
        public void setMaxConcurrentWorkers(Integer maxConcurrentWorkers) { this.maxConcurrentWorkers = maxConcurrentWorkers; }
    }

    public DatabaseSettingsDTO getDatabase() { return database; }
    public void setDatabase(DatabaseSettingsDTO database) { this.database = database; }
    public BackupSettingsDTO getBackup() { return backup; }
    public void setBackup(BackupSettingsDTO backup) { this.backup = backup; }
    public SecuritySettingsDTO getSecurity() { return security; }
    public void setSecurity(SecuritySettingsDTO security) { this.security = security; }
    public WebSocketSettingsDTO getWebsocket() { return websocket; }
    public void setWebsocket(WebSocketSettingsDTO websocket) { this.websocket = websocket; }
    public FleetSettingsDTO getFleet() { return fleet; }
    public void setFleet(FleetSettingsDTO fleet) { this.fleet = fleet; }
}
