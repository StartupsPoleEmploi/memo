package fr.gouv.motivaction.model;

/**
 * Created by Alan on 30/05/2016.
 */
public class CandidatureEvent {

    long id;
    long candidatureId;
    String comment;
    int eventType;
    int eventSubType;
    long creationTime;
    long eventTime;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public long getCandidatureId() {
        return candidatureId;
    }

    public void setCandidatureId(long candidatureId) {
        this.candidatureId = candidatureId;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public int getEventType() {
        return eventType;
    }

    public void setEventType(int eventType) {
        this.eventType = eventType;
    }

    public int getEventSubType() {
        return eventSubType;
    }

    public void setEventSubType(int eventSubType) {
        this.eventSubType = eventSubType;
    }


    public long getEventTime() { return eventTime; }

    public long getCreationTime() { return creationTime; }

    public void setCreationTime(long creationTime) { this.creationTime = creationTime; }

    public void setEventTime(long eventTime) { this.eventTime = eventTime; }


}
