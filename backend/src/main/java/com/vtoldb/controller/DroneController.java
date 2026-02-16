/**
 * REST controller exposing drone management endpoints
 * Handles HTTP requests and delegates to service layer
 */
package com.vtoldb.controller;

import com.vtoldb.dto.DroneDTO;
import com.vtoldb.service.DroneService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drones")
@CrossOrigin(origins = "*")
public class DroneController {
    private final DroneService droneService;

    public DroneController(DroneService droneService) {
        this.droneService = droneService;
    }

    @PostMapping
    public ResponseEntity<DroneDTO> createDrone(@RequestBody DroneDTO droneDTO) {
        try {
            DroneDTO created = droneService.createDrone(droneDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<DroneDTO>> getAllDrones() {
        List<DroneDTO> drones = droneService.getAllDrones();
        return ResponseEntity.ok(drones);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DroneDTO> getDroneById(@PathVariable String id) {
        DroneDTO drone = droneService.getDroneById(id);
        if (drone == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(drone);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DroneDTO> updateDrone(@PathVariable String id, @RequestBody DroneDTO droneDTO) {
        try {
            DroneDTO updated = droneService.updateDrone(id, droneDTO);
            if (updated == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDrone(@PathVariable String id) {
        boolean deleted = droneService.deleteDrone(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
