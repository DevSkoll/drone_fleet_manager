/**
 * REST controller for Settings API
 */
package com.vtoldb.controller;

import com.vtoldb.dto.SettingsDTO;
import com.vtoldb.service.SettingsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
public class SettingsController {
    private static final Logger logger = LoggerFactory.getLogger(SettingsController.class);

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    public ResponseEntity<SettingsDTO> getSettings() {
        SettingsDTO settings = settingsService.getSettings();
        return ResponseEntity.ok(settings);
    }

    @PutMapping
    public ResponseEntity<?> updateSettings(@RequestBody SettingsDTO settingsDTO) {
        try {
            SettingsDTO updated = settingsService.updateSettings(settingsDTO);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            logger.warn("Settings validation failed: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Failed to update settings", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update settings"));
        }
    }

    @PostMapping("/reset")
    public ResponseEntity<SettingsDTO> resetToDefaults() {
        try {
            SettingsDTO settings = settingsService.resetToDefaults();
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            logger.error("Failed to reset settings", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/generate-auth-key")
    public ResponseEntity<?> generateAuthKey() {
        try {
            String key = settingsService.generateAuthKey();
            return ResponseEntity.ok(Map.of("authKey", key));
        } catch (Exception e) {
            logger.error("Failed to generate auth key", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to generate auth key"));
        }
    }
}
