/**
 * Repository interface for Drone data access
 * Abstracts storage implementation (flatfile/PostgreSQL) from business logic
 */
package com.vtoldb.repository;

import com.vtoldb.model.Drone;
import java.util.List;
import java.util.Optional;

public interface DroneRepository {
    Drone save(Drone drone);
    Optional<Drone> findById(String id);
    List<Drone> findAll();
    void deleteById(String id);
    boolean existsById(String id);
}
