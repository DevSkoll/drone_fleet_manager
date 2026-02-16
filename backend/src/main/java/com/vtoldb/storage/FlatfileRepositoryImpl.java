/**
 * Flatfile (JSON) implementation of DroneRepository
 * Stores drone data in local JSON file for development and small deployments
 * Thread-safe file operations with basic error handling
 */
package com.vtoldb.storage;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.vtoldb.model.Drone;
import com.vtoldb.repository.DroneRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class FlatfileRepositoryImpl implements DroneRepository {
    private final String dataFilePath;
    private final ObjectMapper objectMapper;
    private final Map<String, Drone> droneCache;

    public FlatfileRepositoryImpl(@Value("${storage.flatfile.path:./data/drones.json}") String dataFilePath) {
        this.dataFilePath = dataFilePath;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.droneCache = new ConcurrentHashMap<>();
        
        initializeStorage();
        loadFromFile();
    }

    // Ensures data directory and file exist
    private void initializeStorage() {
        try {
            File dataFile = new File(dataFilePath);
            File parentDir = dataFile.getParentFile();
            
            if (parentDir != null && !parentDir.exists()) {
                parentDir.mkdirs();
            }
            
            if (!dataFile.exists()) {
                dataFile.createNewFile();
                objectMapper.writeValue(dataFile, new ArrayList<Drone>());
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to initialize flatfile storage", e);
        }
    }

    // Loads all drones from JSON file into memory cache
    private synchronized void loadFromFile() {
        try {
            File dataFile = new File(dataFilePath);
            if (dataFile.length() > 0) {
                List<Drone> drones = objectMapper.readValue(dataFile, new TypeReference<List<Drone>>() {});
                droneCache.clear();
                drones.forEach(drone -> droneCache.put(drone.getId(), drone));
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to load data from flatfile", e);
        }
    }

    // Persists current cache to JSON file
    private synchronized void saveToFile() {
        try {
            File dataFile = new File(dataFilePath);
            objectMapper.writerWithDefaultPrettyPrinter()
                       .writeValue(dataFile, new ArrayList<>(droneCache.values()));
        } catch (IOException e) {
            throw new RuntimeException("Failed to save data to flatfile", e);
        }
    }

    @Override
    public Drone save(Drone drone) {
        if (drone.getId() == null || drone.getId().isEmpty()) {
            drone.setId(UUID.randomUUID().toString());
        }
        droneCache.put(drone.getId(), drone);
        saveToFile();
        return drone;
    }

    @Override
    public Optional<Drone> findById(String id) {
        return Optional.ofNullable(droneCache.get(id));
    }

    @Override
    public List<Drone> findAll() {
        return new ArrayList<>(droneCache.values());
    }

    @Override
    public void deleteById(String id) {
        droneCache.remove(id);
        saveToFile();
    }

    @Override
    public boolean existsById(String id) {
        return droneCache.containsKey(id);
    }
}
