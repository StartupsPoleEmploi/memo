package fr.gouv.motivaction.model;

import java.sql.Timestamp;

/**
 * Created by Alan on 04/05/2016.
 */
public class UserInterview {

    private String email;
    private long userId;
    private String title;
    private long candidatureId;
    private boolean archived;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public long getCandidatureId() {
        return candidatureId;
    }

    public void setCandidatureId(long candidatureId) {
        this.candidatureId = candidatureId;
    }

    public boolean isArchived() {
        return archived;
    }

    public void setArchived(boolean archived) {
        this.archived = archived;
    }
}
