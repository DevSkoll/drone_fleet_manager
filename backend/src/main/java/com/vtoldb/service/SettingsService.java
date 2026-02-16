/**
 * Service layer for Settings management
 * Handles DTO conversion, validation, and business logic
 */
package com.vtoldb.service;

import com.vtoldb.dto.SettingsDTO;
import com.vtoldb.dto.SettingsDTO.*;
import com.vtoldb.model.settings.*;
import com.vtoldb.repository.SettingsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;

@Service
public class SettingsService {
    private static final Logger logger = LoggerFactory.getLogger(SettingsService.class);
    private static final SecureRandom secureRandom = new SecureRandom();

    private final SettingsRepository settingsRepository;

    public SettingsService(SettingsRepository settingsRepository) {
        this.settingsRepository = settingsRepository;
    }

    public SettingsDTO getSettings() {
        AppSettings settings = settingsRepository.get();
        return toDTO(settings);
    }

    public SettingsDTO updateSettings(SettingsDTO dto) {
        AppSettings current = settingsRepository.get();
        AppSettings updated = mergeFromDTO(current, dto);
        AppSettings saved = settingsRepository.save(updated);
        logger.info("Settings updated");
        return toDTO(saved);
    }

    public SettingsDTO resetToDefaults() {
        AppSettings defaults = new AppSettings();
        settingsRepository.save(defaults);
        logger.info("Settings reset to defaults");
        return toDTO(defaults);
    }

    public String generateAuthKey() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        String key = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        AppSettings settings = settingsRepository.get();
        settings.getSecurity().setWorkerAuthKey(key);
        settingsRepository.save(settings);

        logger.info("Generated new worker auth key");
        return key;
    }

    // Convert model to DTO, masking sensitive fields
    private SettingsDTO toDTO(AppSettings settings) {
        SettingsDTO dto = new SettingsDTO();

        // Database settings
        DatabaseSettingsDTO dbDto = new DatabaseSettingsDTO();
        dbDto.setStorageType(settings.getDatabase().getStorageType());
        dbDto.setFlatfilePath(settings.getDatabase().getFlatfilePath());

        DatabaseSettingsDTO.PostgresSettingsDTO pgDto = new DatabaseSettingsDTO.PostgresSettingsDTO();
        pgDto.setHost(settings.getDatabase().getPostgresql().getHost());
        pgDto.setPort(settings.getDatabase().getPostgresql().getPort());
        pgDto.setDatabase(settings.getDatabase().getPostgresql().getDatabase());
        pgDto.setUsername(settings.getDatabase().getPostgresql().getUsername());
        pgDto.setPassword(null); // Mask password in responses
        pgDto.setHasPassword(settings.getDatabase().getPostgresql().getPassword() != null
                && !settings.getDatabase().getPostgresql().getPassword().isEmpty());
        dbDto.setPostgresql(pgDto);
        dto.setDatabase(dbDto);

        // Backup settings
        BackupSettingsDTO backupDto = new BackupSettingsDTO();
        backupDto.setEnabled(settings.getBackup().isEnabled());
        backupDto.setIntervalHours(settings.getBackup().getIntervalHours());
        backupDto.setRetentionCount(settings.getBackup().getRetentionCount());
        backupDto.setDirectoryPath(settings.getBackup().getDirectoryPath());
        dto.setBackup(backupDto);

        // Security settings
        SecuritySettingsDTO secDto = new SecuritySettingsDTO();
        secDto.setWorkerAuthKey(null); // Mask auth key in responses
        secDto.setHasAuthKey(settings.getSecurity().getWorkerAuthKey() != null
                && !settings.getSecurity().getWorkerAuthKey().isEmpty());
        secDto.setAuthenticationEnabled(settings.getSecurity().isAuthenticationEnabled());
        dto.setSecurity(secDto);

        // WebSocket settings
        WebSocketSettingsDTO wsDto = new WebSocketSettingsDTO();
        wsDto.setHeartbeatInterval(settings.getWebsocket().getHeartbeatInterval());
        wsDto.setIdleTimeout(settings.getWebsocket().getIdleTimeout());
        wsDto.setHealthCheckInterval(settings.getWebsocket().getHealthCheckInterval());
        dto.setWebsocket(wsDto);

        // Fleet settings
        FleetSettingsDTO fleetDto = new FleetSettingsDTO();
        fleetDto.setDefaultTelemetryInterval(settings.getFleet().getDefaultTelemetryInterval());
        fleetDto.setOfflineThreshold(settings.getFleet().getOfflineThreshold());
        fleetDto.setMaxConcurrentWorkers(settings.getFleet().getMaxConcurrentWorkers());
        dto.setFleet(fleetDto);

        return dto;
    }

    // Merge DTO changes into existing settings (null means no change)
    private AppSettings mergeFromDTO(AppSettings current, SettingsDTO dto) {
        if (dto.getDatabase() != null) {
            mergeDatabaseSettings(current.getDatabase(), dto.getDatabase());
        }
        if (dto.getBackup() != null) {
            mergeBackupSettings(current.getBackup(), dto.getBackup());
        }
        if (dto.getSecurity() != null) {
            mergeSecuritySettings(current.getSecurity(), dto.getSecurity());
        }
        if (dto.getWebsocket() != null) {
            mergeWebSocketSettings(current.getWebsocket(), dto.getWebsocket());
        }
        if (dto.getFleet() != null) {
            mergeFleetSettings(current.getFleet(), dto.getFleet());
        }
        return current;
    }

    private void mergeDatabaseSettings(DatabaseSettings target, DatabaseSettingsDTO source) {
        if (source.getStorageType() != null) {
            target.setStorageType(source.getStorageType());
        }
        if (source.getFlatfilePath() != null) {
            target.setFlatfilePath(source.getFlatfilePath());
        }
        if (source.getPostgresql() != null) {
            var pg = source.getPostgresql();
            if (pg.getHost() != null) target.getPostgresql().setHost(pg.getHost());
            if (pg.getPort() != null) target.getPostgresql().setPort(pg.getPort());
            if (pg.getDatabase() != null) target.getPostgresql().setDatabase(pg.getDatabase());
            if (pg.getUsername() != null) target.getPostgresql().setUsername(pg.getUsername());
            if (pg.getPassword() != null) target.getPostgresql().setPassword(pg.getPassword());
        }
    }

    private void mergeBackupSettings(BackupSettings target, BackupSettingsDTO source) {
        if (source.getEnabled() != null) target.setEnabled(source.getEnabled());
        if (source.getIntervalHours() != null) {
            validateRange(source.getIntervalHours(), 1, 168, "intervalHours");
            target.setIntervalHours(source.getIntervalHours());
        }
        if (source.getRetentionCount() != null) {
            validateRange(source.getRetentionCount(), 1, 100, "retentionCount");
            target.setRetentionCount(source.getRetentionCount());
        }
        if (source.getDirectoryPath() != null) target.setDirectoryPath(source.getDirectoryPath());
    }

    private void mergeSecuritySettings(SecuritySettings target, SecuritySettingsDTO source) {
        if (source.getWorkerAuthKey() != null) {
            if (!source.getWorkerAuthKey().isEmpty() && source.getWorkerAuthKey().length() < 16) {
                throw new IllegalArgumentException("workerAuthKey must be at least 16 characters");
            }
            target.setWorkerAuthKey(source.getWorkerAuthKey());
        }
        if (source.getAuthenticationEnabled() != null) {
            target.setAuthenticationEnabled(source.getAuthenticationEnabled());
        }
    }

    private void mergeWebSocketSettings(WebSocketSettings target, WebSocketSettingsDTO source) {
        if (source.getHeartbeatInterval() != null) {
            validateRange(source.getHeartbeatInterval(), 1000, 300000, "heartbeatInterval");
            target.setHeartbeatInterval(source.getHeartbeatInterval());
        }
        if (source.getIdleTimeout() != null) {
            validateRange(source.getIdleTimeout(), 10000, 600000, "idleTimeout");
            target.setIdleTimeout(source.getIdleTimeout());
        }
        if (source.getHealthCheckInterval() != null) {
            validateRange(source.getHealthCheckInterval(), 1000, 60000, "healthCheckInterval");
            target.setHealthCheckInterval(source.getHealthCheckInterval());
        }
    }

    private void mergeFleetSettings(FleetSettings target, FleetSettingsDTO source) {
        if (source.getDefaultTelemetryInterval() != null) {
            validateRange(source.getDefaultTelemetryInterval(), 1000, 60000, "defaultTelemetryInterval");
            target.setDefaultTelemetryInterval(source.getDefaultTelemetryInterval());
        }
        if (source.getOfflineThreshold() != null) {
            validateRange(source.getOfflineThreshold(), 5000, 300000, "offlineThreshold");
            target.setOfflineThreshold(source.getOfflineThreshold());
        }
        if (source.getMaxConcurrentWorkers() != null) {
            validateRange(source.getMaxConcurrentWorkers(), 1, 1000, "maxConcurrentWorkers");
            target.setMaxConcurrentWorkers(source.getMaxConcurrentWorkers());
        }
    }

    private void validateRange(long value, long min, long max, String fieldName) {
        if (value < min || value > max) {
            throw new IllegalArgumentException(
                    String.format("%s must be between %d and %d", fieldName, min, max));
        }
    }

    private void validateRange(int value, int min, int max, String fieldName) {
        validateRange((long) value, min, max, fieldName);
    }
}
