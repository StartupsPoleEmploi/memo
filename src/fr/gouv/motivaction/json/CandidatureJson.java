package fr.gouv.motivaction.json;

public class CandidatureJson {

	String nomUtilisateur;
	String prenomUtilisateur;
	String emailUtilisateur;
	String telUtilisateur;
	String adresseUtilisateur;
	String peId;
	String romeRecherche;
	String lettreMotivation;
	String numSiret; // En string car à l'étranger, il peut se composer d'alphanumerique
	
	public String getNomUtilisateur() {
		return nomUtilisateur;
	}
	public void setNomUtilisateur(String nomUtilisateur) {
		this.nomUtilisateur = nomUtilisateur;
	}
	public String getPrenomUtilisateur() {
		return prenomUtilisateur;
	}
	public void setPrenomUtilisateur(String prenomUtilisateur) {
		this.prenomUtilisateur = prenomUtilisateur;
	}
	public String getEmailUtilisateur() {
		return emailUtilisateur;
	}
	public void setEmailUtilisateur(String emailUtilisateur) {
		this.emailUtilisateur = emailUtilisateur;
	}
	public String getNumSiret() {
		return numSiret;
	}
	public void setNumSiret(String numSiret) {
		this.numSiret = numSiret;
	}
	public String getTelUtilisateur() {
		return telUtilisateur;
	}
	public void setTelUtilisateur(String telUtilisateur) {
		this.telUtilisateur = telUtilisateur;
	}
	public String getAdresseUtilisateur() {
		return adresseUtilisateur;
	}
	public void setAdresseUtilisateur(String adresseUtilisateur) {
		this.adresseUtilisateur = adresseUtilisateur;
	}
	public String getPeId() {
		return peId;
	}
	public void setPeId(String peId) {
		this.peId = peId;
	}
	public String getRomeRecherche() {
		return romeRecherche;
	}
	public void setRomeRecherche(String romeRecherche) {
		this.romeRecherche = romeRecherche;
	}
	public String getLettreMotivation() {
		return lettreMotivation;
	}
	public void setLettreMotivation(String lettreMotivation) {
		this.lettreMotivation = lettreMotivation;
	}
	
}
