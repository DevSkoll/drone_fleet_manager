/**
 * Security and authentication settings
 */
package com.vtoldb.model.settings;

public class SecuritySettings {
    private String workerAuthKey = "";
    private boolean authenticationEnabled = false;

    public String getWorkerAuthKey() {
        return workerAuthKey;
    }

    public void setWorkerAuthKey(String workerAuthKey) {
        this.workerAuthKey = workerAuthKey;
    }

    public boolean isAuthenticationEnabled() {
        return authenticationEnabled;
    }

    public void setAuthenticationEnabled(boolean authenticationEnabled) {
        this.authenticationEnabled = authenticationEnabled;
    }
}
