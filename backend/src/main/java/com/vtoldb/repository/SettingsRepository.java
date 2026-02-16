/**
 * Repository interface for Settings persistence
 */
package com.vtoldb.repository;

import com.vtoldb.model.settings.AppSettings;

public interface SettingsRepository {
    AppSettings get();
    AppSettings save(AppSettings settings);
    void reload();
}
