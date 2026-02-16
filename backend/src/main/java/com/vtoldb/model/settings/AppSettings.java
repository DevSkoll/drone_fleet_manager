/**
 * Root settings model containing all configuration categories
 */
package com.vtoldb.model.settings;

public class AppSettings {
    private DatabaseSettings database;
    private BackupSettings backup;
    private SecuritySettings security;
    private WebSocketSettings websocket;
    private FleetSettings fleet;

    public AppSettings() {
        this.database = new DatabaseSettings();
        this.backup = new BackupSettings();
        this.security = new SecuritySettings();
        this.websocket = new WebSocketSettings();
        this.fleet = new FleetSettings();
    }

    public DatabaseSettings getDatabase() {
        return database;
    }

    public void setDatabase(DatabaseSettings database) {
        this.database = database;
    }

    public BackupSettings getBackup() {
        return backup;
    }

    public void setBackup(BackupSettings backup) {
        this.backup = backup;
    }

    public SecuritySettings getSecurity() {
        return security;
    }

    public void setSecurity(SecuritySettings security) {
        this.security = security;
    }

    public WebSocketSettings getWebsocket() {
        return websocket;
    }

    public void setWebsocket(WebSocketSettings websocket) {
        this.websocket = websocket;
    }

    public FleetSettings getFleet() {
        return fleet;
    }

    public void setFleet(FleetSettings fleet) {
        this.fleet = fleet;
    }
}
