package fr.gouv.motivaction.model;


import java.sql.Timestamp;

/**
 * Created by Alan on 28/04/2016.
 */
public class UserLog {

	private long id;
	private long userId;
    private long candidatureId;
    private String domaine;
    private String action;
    private Timestamp creationTime;
    
    private String login;
    private String peId;
    private String peEmail;

    public UserLog()
    {

    }

    public UserLog(long userId, String domaine, String action, long candidatureId)
    {
        this.userId = userId;
        this.candidatureId = candidatureId;
        this.domaine = domaine;
        this.action = action;
    }

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

    public String getDomaine() {
        return domaine;
    }

    public void setDomaine(String domaine) {
        this.domaine = domaine;
    }

    public long getCandidatureId() {
        return candidatureId;
    }

    public void setCandidatureId(long candidatureId) {
        this.candidatureId = candidatureId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public Timestamp getCreationTime() {
        return creationTime;
    }

    public void setCreationTime(Timestamp creationTime) {
        this.creationTime = creationTime;
    }

	public String getLogin() {
		return login;
	}

	public void setLogin(String login) {
		this.login = login;
	}

	public String getPeId() {
		return peId;
	}

	public void setPeId(String peId) {
		this.peId = peId;
	}

	public String getPeEmail() {
		return peEmail;
	}

	public void setPeEmail(String peEmail) {
		this.peEmail = peEmail;
	}
    
    
}
