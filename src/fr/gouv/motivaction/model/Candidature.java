package fr.gouv.motivaction.model;

public class Candidature {

    long id ;
    long userId;
    String nomCandidature;
    String numSiret; // En string car à l'étranger, il peut se composer d'alphanumerique
    String nomSociete;
    String description;
    String note;
    long creationDate;
    long lastUpdate;
    int etat;
    String ville;
    String pays;
    String nomContact;
    String logoUrl;

    String emailContact;
    String telContact;
    String urlSource;

    String sourceId;
    String jobBoard;
    int isButton; // lorsque l'offre est importé depuis le bouton MEMO de PE.FR (0 ou 1)

    int rating;
    int type;       // 1 candidature spontanée, 2 offre, 3 réseau, 0 historique avant le typage
    int archived;
    int expired;    // 0 non, 1 oui
    
    long dateCandidature;
    long dateRelance;
    long dateEntretien;

    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    public String getUrlSource() {
        return urlSource;
    }

    public void setUrlSource(String urlSource) {
        this.urlSource = urlSource;
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

    public String getNomContact() {
        return nomContact;
    }

    public void setNomContact(String nomContact) {
        this.nomContact = nomContact;
    }

    public String getPays() {
        return pays;
    }

    public void setPays(String pays) {
        this.pays = pays;
    }

    public String getVille() {
        return ville;
    }

    public void setVille(String ville) {
        this.ville = ville;
    }

    public int getEtat() {
        return etat;
    }

    public void setEtat(int etat) {
        this.etat = etat;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getNomSociete() {
        return nomSociete;
    }

    public void setNomSociete(String nomSociete) {
        this.nomSociete = nomSociete;
    }

    public String getNomCandidature() {
        return nomCandidature;
    }

    public void setNomCandidature(String nomCandidature) {
        this.nomCandidature = nomCandidature;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getNote() { return note; }

    public void setNote(String note) { this.note = note; }

    public int getArchived() {
        return archived;
    }

    public void setArchived(int archived) {
        this.archived = archived;
    }

    public String getSourceId() { return sourceId; }

    public void setSourceId(String sourceId) { this.sourceId = sourceId; }

    public int getType() { return type; }

    public void setType(int type) { this.type = type; }

    public int getRating() { return rating; }

    public void setRating(int rating) { this.rating = rating; }

    public int getExpired() { return expired; }

    public void setExpired(int expired) { this.expired = expired; }

    public String getLogoUrl() { return logoUrl; }

    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getJobBoard() { return jobBoard; }

    public void setJobBoard(String jobBoard) { this.jobBoard = jobBoard; }

	public int getIsButton() {
		return isButton;
	}

	public void setIsButton(int isButton) {
		this.isButton = isButton;
	}

    public long getCreationDate() { return creationDate; }

    public void setCreationDate(long creationDate) { this.creationDate = creationDate; }

    public long getLastUpdate() { return lastUpdate; }

    public void setLastUpdate(long lastUpdate) { this.lastUpdate = lastUpdate; }

	public String getNumSiret() {
		return numSiret;
	}

	public void setNumSiret(String numSiret) {
		this.numSiret = numSiret;
	}

	public long getDateCandidature() {
		return dateCandidature;
	}

	public void setDateCandidature(long dateCandidature) {
		this.dateCandidature = dateCandidature;
	}

	public long getDateRelance() {
		return dateRelance;
	}

	public void setDateRelance(long dateRelance) {
		this.dateRelance = dateRelance;
	}

	public long getDateEntretien() {
		return dateEntretien;
	}

	public void setDateEntretien(long dateEntretien) {
		this.dateEntretien = dateEntretien;
	}

}
