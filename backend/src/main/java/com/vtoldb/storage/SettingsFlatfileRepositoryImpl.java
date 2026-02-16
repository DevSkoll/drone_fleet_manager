/**
 * Flatfile (JSON) implementation of SettingsRepository
 * Stores settings in local JSON file with in-memory caching
 * Thread-safe file operations
 */
package com.vtoldb.storage;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.vtoldb.model.settings.AppSettings;
import com.vtoldb.repository.SettingsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.io.IOException;

@Repository
public class SettingsFlatfileRepositoryImpl implements SettingsRepository {
    private static final Logger logger = LoggerFactory.getLogger(SettingsFlatfileRepositoryImpl.class);

    private final String settingsFilePath;
    private final ObjectMapper objectMapper;
    private AppSettings cachedSettings;

    public SettingsFlatfileRepositoryImpl(
            @Value("${storage.settings.path:./data/settings.json}") String settingsFilePath) {
        this.settingsFilePath = settingsFilePath;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.enable(SerializationFeature.INDENT_OUTPUT);

        initializeStorage();
        loadFromFile();
    }

    private void initializeStorage() {
        try {
            File settingsFile = new File(settingsFilePath);
            File parentDir = settingsFile.getParentFile();

            if (parentDir != null && !parentDir.exists()) {
                parentDir.mkdirs();
                logger.info("Created settings directory: {}", parentDir.getAbsolutePath());
            }

            if (!settingsFile.exists()) {
                settingsFile.createNewFile();
                AppSettings defaults = new AppSettings();
                objectMapper.writeValue(settingsFile, defaults);
                logger.info("Created default settings file: {}", settingsFile.getAbsolutePath());
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to initialize settings storage", e);
        }
    }

    private synchronized void loadFromFile() {
        try {
            File settingsFile = new File(settingsFilePath);
            if (settingsFile.length() > 0) {
                cachedSettings = objectMapper.readValue(settingsFile, AppSettings.class);
                logger.info("Loaded settings from: {}", settingsFilePath);
            } else {
                cachedSettings = new AppSettings();
                saveToFile();
                logger.info("Initialized with default settings");
            }
        } catch (IOException e) {
            logger.error("Failed to load settings, using defaults", e);
            cachedSettings = new AppSettings();
        }
    }

    private synchronized void saveToFile() {
        try {
            File settingsFile = new File(settingsFilePath);
            objectMapper.writeValue(settingsFile, cachedSettings);
            logger.debug("Saved settings to: {}", settingsFilePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save settings to file", e);
        }
    }

    @Override
    public synchronized AppSettings get() {
        return cachedSettings;
    }

    @Override
    public synchronized AppSettings save(AppSettings settings) {
        this.cachedSettings = settings;
        saveToFile();
        return settings;
    }

    @Override
    public void reload() {
        loadFromFile();
    }
}
