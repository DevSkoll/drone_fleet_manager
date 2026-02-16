/**
 * Fleet management settings
 */
package com.vtoldb.model.settings;

public class FleetSettings {
    private long defaultTelemetryInterval = 5000;
    private long offlineThreshold = 30000;
    private int maxConcurrentWorkers = 50;

    public long getDefaultTelemetryInterval() {
        return defaultTelemetryInterval;
    }

    public void setDefaultTelemetryInterval(long defaultTelemetryInterval) {
        this.defaultTelemetryInterval = defaultTelemetryInterval;
    }

    public long getOfflineThreshold() {
        return offlineThreshold;
    }

    public void setOfflineThreshold(long offlineThreshold) {
        this.offlineThreshold = offlineThreshold;
    }

    public int getMaxConcurrentWorkers() {
        return maxConcurrentWorkers;
    }

    public void setMaxConcurrentWorkers(int maxConcurrentWorkers) {
        this.maxConcurrentWorkers = maxConcurrentWorkers;
    }
}
