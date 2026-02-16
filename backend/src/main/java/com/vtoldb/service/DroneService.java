/**
 * Drone service layer handling business logic
 * Coordinates between controllers and data repositories
 */
package com.vtoldb.service;

import com.vtoldb.dto.DroneDTO;
import com.vtoldb.model.Drone;
import com.vtoldb.repository.DroneRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DroneService {
    private final DroneRepository droneRepository;
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public DroneService(DroneRepository droneRepository) {
        this.droneRepository = droneRepository;
    }

    // Converts Drone entity to DTO for API response
    private DroneDTO toDTO(Drone drone) {
        DroneDTO dto = new DroneDTO();
        dto.setId(drone.getId());
        dto.setName(drone.getName());
        dto.setModel(drone.getModel());
        dto.setSerialNumber(drone.getSerialNumber());
        dto.setStatus(drone.getStatus());
        dto.setLastSeen(drone.getLastSeen() != null ? drone.getLastSeen().format(dateFormatter) : null);
        dto.setLatitude(drone.getLatitude());
        dto.setLongitude(drone.getLongitude());
        dto.setAltitude(drone.getAltitude());
        dto.setBatteryLevel(drone.getBatteryLevel());
        return dto;
    }

    // Converts DTO to Drone entity for persistence
    private Drone toEntity(DroneDTO dto) {
        Drone drone = new Drone();
        drone.setId(dto.getId());
        drone.setName(dto.getName());
        drone.setModel(dto.getModel());
        drone.setSerialNumber(dto.getSerialNumber());
        drone.setStatus(dto.getStatus() != null ? dto.getStatus() : Drone.DroneStatus.OFFLINE);
        drone.setLastSeen(dto.getLastSeen() != null ? 
            LocalDateTime.parse(dto.getLastSeen(), dateFormatter) : LocalDateTime.now());
        drone.setLatitude(dto.getLatitude());
        drone.setLongitude(dto.getLongitude());
        drone.setAltitude(dto.getAltitude());
        drone.setBatteryLevel(dto.getBatteryLevel());
        return drone;
    }

    public DroneDTO createDrone(DroneDTO droneDTO) {
        Drone drone = toEntity(droneDTO);
        Drone saved = droneRepository.save(drone);
        return toDTO(saved);
    }

    public List<DroneDTO> getAllDrones() {
        return droneRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public DroneDTO getDroneById(String id) {
        return droneRepository.findById(id)
                .map(this::toDTO)
                .orElse(null);
    }

    public DroneDTO updateDrone(String id, DroneDTO droneDTO) {
        if (!droneRepository.existsById(id)) {
            return null;
        }
        droneDTO.setId(id);
        Drone drone = toEntity(droneDTO);
        Drone updated = droneRepository.save(drone);
        return toDTO(updated);
    }

    public boolean deleteDrone(String id) {
        if (!droneRepository.existsById(id)) {
            return false;
        }
        droneRepository.deleteById(id);
        return true;
    }
}
