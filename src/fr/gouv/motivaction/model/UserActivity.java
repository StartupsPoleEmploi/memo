package fr.gouv.motivaction.model;

import java.sql.Timestamp;

/**
 * Created by Alan on 04/05/2016.
 */
public class UserActivity {

    private String email;
    private int receiveEmail;
    private int todos;
    private int candidatures;
    private int relances;
    private int entretiens;
    private Timestamp lastActivity;
    private Timestamp dateCreation;
    private int conns;
    private int fbConns;
    private long userId;
    private String visitorLink;
    private int nbConnLastMonth;
    private int nbActLastMonth;
    private int nbConnLastTrim;
    private int nbActLastTrim;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public int getTodos() {
        return todos;
    }

    public void setTodos(int todos) {
        this.todos = todos;
    }

    public int getCandidatures() {
        return candidatures;
    }

    public void setCandidatures(int candidatures) {
        this.candidatures = candidatures;
    }

    public int getRelances() {
        return relances;
    }

    public void setRelances(int relances) {
        this.relances = relances;
    }

    public int getEntretiens() {
        return entretiens;
    }

    public void setEntretiens(int entretiens) {
        this.entretiens = entretiens;
    }

    public int getConns() {
        return conns;
    }

    public void setConns(int conns) {
        this.conns = conns;
    }

    public Timestamp getLastActivity() {
        return lastActivity;
    }

    public void setLastActivity(Timestamp lastActivity) {
        this.lastActivity = lastActivity;
    }

    public int getFbConns() {
        return fbConns;
    }

    public void setFbConns(int fbConns) {
        this.fbConns = fbConns;
    }

    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    public String getVisitorLink() {
        return visitorLink;
    }

    public void setVisitorLink(String visitorLink) {
        this.visitorLink = visitorLink;
    }

	public int getReceiveEmail() {
		return receiveEmail;
	}

	public void setReceiveEmail(int receiveEmail) {
		this.receiveEmail = receiveEmail;
	}

	public Timestamp getDateCreation() {
		return dateCreation;
	}

	public void setDateCreation(Timestamp dateCreation) {
		this.dateCreation = dateCreation;
	}

	public int getNbConnLastMonth() {
		return nbConnLastMonth;
	}

	public void setNbConnLastMonth(int nbConnLastMonth) {
		this.nbConnLastMonth = nbConnLastMonth;
	}

	public int getNbActLastMonth() {
		return nbActLastMonth;
	}

	public void setNbActLastMonth(int nbActLastMonth) {
		this.nbActLastMonth = nbActLastMonth;
	}

	public int getNbConnLastTrim() {
		return nbConnLastTrim;
	}

	public void setNbConnLastTrim(int nbConnLastTrim) {
		this.nbConnLastTrim = nbConnLastTrim;
	}

	public int getNbActLastTrim() {
		return nbActLastTrim;
	}

	public void setNbActLastTrim(int nbActLastTrim) {
		this.nbActLastTrim = nbActLastTrim;
	}
}
