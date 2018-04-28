package fr.gouv.motivaction.model;

import java.time.LocalDateTime;

/**
 * Created by Alan on 22/07/2016.
 */
public class CandidatureReport extends Candidature {

    private String userEmail;
    private LocalDateTime lastActivity;
    private LocalDateTime lastCandidature;
    private LocalDateTime lastRelance;
    private LocalDateTime lastEntretien;
    private LocalDateTime lastEntretienCree;
    private LocalDateTime nextEntretien;
    private LocalDateTime lastPreparation;
    private LocalDateTime lastMerci;
    private LocalDateTime lastRappelCandidatureRelance;
    private LocalDateTime lastRappelEntretienRelance;
    private LocalDateTime lastRappelEntretienRemercier;

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    public LocalDateTime getLastActivity() {
        return lastActivity;
    }

    public void setLastActivity(LocalDateTime lastActivity) {
        this.lastActivity = lastActivity;
    }

    public LocalDateTime getLastCandidature() {
        return lastCandidature;
    }

    public void setLastCandidature(LocalDateTime lastCandidature) {
        this.lastCandidature = lastCandidature;
    }

    public LocalDateTime getLastRelance() {
        return lastRelance;
    }

    public void setLastRelance(LocalDateTime lastRelance) {
        this.lastRelance = lastRelance;
    }

    public LocalDateTime getLastEntretien() {
        return lastEntretien;
    }

    public void setLastEntretien(LocalDateTime lastEntretien) {
        this.lastEntretien = lastEntretien;
    }

    public LocalDateTime getNextEntretien() {
        return nextEntretien;
    }

    public void setNextEntretien(LocalDateTime nextEntretien) {
        this.nextEntretien = nextEntretien;
    }

    public LocalDateTime getLastPreparation() {
        return lastPreparation;
    }

    public void setLastPreparation(LocalDateTime lastPreparation) {
        this.lastPreparation = lastPreparation;
    }

    public LocalDateTime getLastMerci() {
        return lastMerci;
    }

    public void setLastMerci(LocalDateTime lastMerci) {
        this.lastMerci = lastMerci;
    }

    public int getType() {
        return type;
    }

    public void setType(int type) {
        this.type = type;
    }

    public String getUrlSource() {
        return urlSource;
    }

    public void setUrlSource(String urlSource) {
        this.urlSource = urlSource;
    }

    public int getEtat() {
        return etat;
    }

    public void setEtat(int etat) {
        this.etat = etat;
    }
    
    public LocalDateTime getLastRappelEntretienRelance() {
		return lastRappelEntretienRelance;
	}

	public void setLastRappelEntretienRelance(LocalDateTime lastRappelEntretienRelance) {
		this.lastRappelEntretienRelance = lastRappelEntretienRelance;
	}
	public LocalDateTime getLastRappelEntretienRemercier() {
		return lastRappelEntretienRemercier;
	}

	public void setLastRappelEntretienRemercier(LocalDateTime lastRappelEntretienRemercier) {
		this.lastRappelEntretienRemercier = lastRappelEntretienRemercier;
	}

	public LocalDateTime getLastRappelCandidatureRelance() {
		return lastRappelCandidatureRelance;
	}

	public void setLastRappelCandidatureRelance(LocalDateTime lastRappelCandidatureRelance) {
		this.lastRappelCandidatureRelance = lastRappelCandidatureRelance;
	}
	
	public String getNomContact() {
		return nomContact;
	}

	public void setNomContact(String nomContact) {
		this.nomContact = nomContact;
	}

	public String getTelContact() {
		return telContact;
	}

	public void setTelContact(String telContact) {
		this.telContact = telContact;
	}

	public String getEmailContact() {
		return emailContact;
	}

	public void setEmailContact(String emailContact) {
		this.emailContact = emailContact;
	}

	public LocalDateTime getLastEntretienCree() {
		return lastEntretienCree;
	}

	public void setLastEntretienCree(LocalDateTime lastEntretienCree) {
		this.lastEntretienCree = lastEntretienCree;
	}
	
}
