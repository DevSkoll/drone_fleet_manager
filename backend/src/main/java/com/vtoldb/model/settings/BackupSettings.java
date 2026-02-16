/**
 * Backup configuration settings
 */
package com.vtoldb.model.settings;

public class BackupSettings {
    private boolean enabled = false;
    private int intervalHours = 24;
    private int retentionCount = 7;
    private String directoryPath = "./backups";

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public int getIntervalHours() {
        return intervalHours;
    }

    public void setIntervalHours(int intervalHours) {
        this.intervalHours = intervalHours;
    }

    public int getRetentionCount() {
        return retentionCount;
    }

    public void setRetentionCount(int retentionCount) {
        this.retentionCount = retentionCount;
    }

    public String getDirectoryPath() {
        return directoryPath;
    }

    public void setDirectoryPath(String directoryPath) {
        this.directoryPath = directoryPath;
    }
}
