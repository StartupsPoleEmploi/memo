package fr.gouv.motivaction.model;

public class Attachment {

    public Attachment()
    {

    }

    public Attachment(long userId, long candidatureId, String fileName, String type, String md5)
    {
        this.userId = userId;
        this.candidatureId = candidatureId;
        this.fileName = fileName;
        this.type = type;
        this.md5 = md5;
    }

    public Attachment(long id, long userId, long candidatureId, String fileName, String type, String md5, int virusChecked) {
        this(userId, candidatureId, fileName, type, md5);
        this.setVirusChecked(virusChecked);
        this.setId(id);
    }

    long id;
    long userId;
    long candidatureId;
    String fileName;
    String type;
    String md5;
    int virusChecked;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    public long getCandidatureId() {
        return candidatureId;
    }

    public void setCandidatureId(long candidatureId) {
        this.candidatureId = candidatureId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMd5() {
        return md5;
    }

    public void setMd5(String md5) {
        this.md5 = md5;
    }

    public int getVirusChecked() { return virusChecked; }

    public void setVirusChecked(int virusChecked) { this.virusChecked = virusChecked; }
}
