package fr.gouv.motivaction.model;

public class AttachmentFile {

    public AttachmentFile(long userId, String md5, byte[] fileData)
    {
        this.userId = userId;
        this.md5 = md5;
        this.fileData = fileData;
    }

    public AttachmentFile()
    {

    }

    long id;
    long userId;
    byte[] fileData;
    String md5;

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

    public String getMd5() {
        return md5;
    }
    public void setMd5(String md5) {
        this.md5 = md5;
    }

    public byte[] getFileData() { return fileData; }
    public void setFileData(byte[] fileData) { this.fileData = fileData; }
}
