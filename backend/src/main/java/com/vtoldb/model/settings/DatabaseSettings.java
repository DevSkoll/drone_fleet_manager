/**
 * Database/storage configuration settings
 */
package com.vtoldb.model.settings;

public class DatabaseSettings {
    private String storageType = "flatfile";
    private String flatfilePath = "./data/drones.json";
    private PostgresSettings postgresql = new PostgresSettings();

    public static class PostgresSettings {
        private String host = "localhost";
        private int port = 5432;
        private String database = "vtoldb";
        private String username = "";
        private String password = "";

        public String getHost() {
            return host;
        }

        public void setHost(String host) {
            this.host = host;
        }

        public int getPort() {
            return port;
        }

        public void setPort(int port) {
            this.port = port;
        }

        public String getDatabase() {
            return database;
        }

        public void setDatabase(String database) {
            this.database = database;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public String getStorageType() {
        return storageType;
    }

    public void setStorageType(String storageType) {
        this.storageType = storageType;
    }

    public String getFlatfilePath() {
        return flatfilePath;
    }

    public void setFlatfilePath(String flatfilePath) {
        this.flatfilePath = flatfilePath;
    }

    public PostgresSettings getPostgresql() {
        return postgresql;
    }

    public void setPostgresql(PostgresSettings postgresql) {
        this.postgresql = postgresql;
    }
}
