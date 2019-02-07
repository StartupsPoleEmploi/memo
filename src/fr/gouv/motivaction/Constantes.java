package fr.gouv.motivaction;

public class Constantes {
	// les status d'une candidature
	public static enum Statut { 
		ACTIVE("EN_COURS"), ARCHIVEE("TERMINEE");
		
		private String libelle;
		
		Statut(String libelle) {
			this.libelle = libelle;
		}
		
		public String getLibelle() {
			return this.libelle;
		}
	};
	
	// Les états d'une candidature
	public static enum Etat { 
		VA_POSTULER("A_POSTULER"), A_POSTULE("POSTULE"), A_RELANCE("A_RELANCER"), ENTRETIEN("ENTRETIEN");
		
		private String libelle;
		
		Etat(String libelle) {
			this.libelle = libelle;
		}
		
		public String getLibelle() {
			return this.libelle;
		}
	};
	// Les types de candature
	public static enum TypeOffre { 
		ZERO("NULL"), SPONT("SPONTANEE"), OFFRE("OFFRE_EN_LIGNE"), RESEAU("RESEAU"), AUTRE("AUTRE");
		
		private String libelle;
		
		TypeOffre(String libelle) {
			this.libelle = libelle;
		}
		
		public String getLibelle() {
			return this.libelle;
		}
	};
	
	// les index des types d'événements de candidatures
	public static enum TypeEvt {NULL, DOIS_RELANCER, ECHANGE_MAIL, ENTRETIEN, AI_POSTULE, AI_RELANCE, ARCHIVER, RAPPEL, NOTE, MAINTENIR, AI_PREPARE, AI_REMERCIE} 
	
	public static enum TypeSubEvt {NULL, ENTRETIEN_PHYSIQUE, ENTRETIEN_TEL, ENTRETIEN_VIDEO, REPONSE_NEG, PAS_REPONSE, OFFRE_POURVUE, OFFRE_HORS_LIGNE, INTERESSE_PLUS, 
									AI_POSTE, TROUVE_AUTRE_POSTE, AUTRE, RAPPEL_POSTULE_RELANCE, RAPPEL_ENTRETIEN_RELANCE, RAPPEL_ENTRETIEN_REMERCIER}
	
	// liste des jobboards
	public static enum JobBoardUrl {
		POLE_EMPLOI("candidat.pole-emploi.fr"), LEBONCOIN("leboncoin.fr"), INDEED("indeed.fr"), VIVASTREET("vivastreet.com"), MONSTER("monster.fr"),
			KELJOB("keljob.com"), CADREMPLOI("cadremploi.fr"), LINKEDIN("linkedin.com"), ENVIROJOB("envirojob.fr"), APEC("apec.fr"), METEOJOB("meteojob.com"),
			OUESTJOB("ouestjob.com"), PARISJOB("parisjob.com"), NORDJOB("nordjob.com"), CENTREJOB("centrejob.com"), ESTJOB("estjob.com"),
			RHONEALPESJOB("rhonealpesjob.com"), SUDOUESTJOB("sudouestjob.com"), PACAJOB("pacajob.com"), LABONNEBOITE("labonneboite"), REGIONSJOB("parisjob.com"),
			JOBALIMVITIJOB("vitijob"), GENERIQUE("generique"), STEPSTONE("stepstone"), MARKETVENTE("marketvente"), ADECCO("adecco."), MANPOWER("manpower."), RANDSTAD("randstad."), QAPA("qapa");
		
		private String domaine;
		
		JobBoardUrl(String domaine) {
			 this.domaine = domaine;
		}
		
		public String getDomaine() {
			return this.domaine;
		}
	}
	
	public static enum JobBoard {
		POLE_EMPLOI("pole-emploi", "Pôle Emploi"), LABONNEBOITE("labonneboite", "La Bonne Boîte"), EMPLOI_STORE("emploistore", "Emploi store");
		
		private String nom;
		private String libelle; 
		
		JobBoard(String nom, String libelle) {
			this.nom = nom; 
			this.libelle = libelle;
		}
		
		public String getLibelle() {
			return this.libelle;
		}
		
		public String getNom() {
			return this.nom;
		}
	}
        	
}