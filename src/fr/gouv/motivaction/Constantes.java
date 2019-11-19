package fr.gouv.motivaction;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;


import org.apache.commons.net.util.SubnetUtils;
import org.apache.log4j.Logger;

import com.mchange.v1.util.StringTokenizerUtils;

import fr.gouv.motivaction.service.MailService;

public class Constantes {
	
    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "006";
    
    public static String env;
    public static boolean jobsMails;
    public static boolean jobsAdmins;
    public static boolean jobsCalculs;
    public static String pathCSV;
    //public static String[] tabIpConseiller;
	public static SubnetUtils.SubnetInfo tabIpConseiller;
    
    static Properties prop;
    
    static {
        loadProperties();
    }
    
    private static void loadProperties() {
	    prop = new Properties();
	    InputStream in = null;

	    try {
	    	in = MailService.class.getResourceAsStream("/fr/gouv/motivaction/properties/memo.properties");
	    	prop.load(in);
	    	
	    	env = prop.getProperty("env");
	    	jobsMails = Boolean.valueOf(prop.getProperty("jobsMails"));
	    	jobsAdmins = Boolean.valueOf(prop.getProperty("jobsAdmins"));
	    	jobsCalculs = Boolean.valueOf(prop.getProperty("jobsCalculs"));
    		pathCSV = prop.getProperty("pathCSV");
    		log.info("IPs Conseiller : "+prop.getProperty("ipsConseiller"));
    		tabIpConseiller = (new SubnetUtils(prop.getProperty("ipsConseiller"))).getInfo();
    		
            in.close();
            
        } catch (IOException e) {
            log.error(logCode + "-001 Constantes properties error=" + e);
	    }
    }

    public static String testIpRange()
	{

		log.info("testIPRange : "+tabIpConseiller.getAddressCountLong()+" / "+tabIpConseiller.getCidrSignature());
		String res = "<ul><li>Test de 185.215.64.0 : "+tabIpConseiller.isInRange("185.215.64.0")+"</li>";
		res += "<li>Test de 185.215.64.1 : "+tabIpConseiller.isInRange("185.215.64.1")+"</li>";

		res += "<li>185.215.65.34 (PE belfort) : "+tabIpConseiller.isInRange("185.215.65.34")+"</li>";
		res += "<li>185.215.65.35 (PE Aix) : "+tabIpConseiller.isInRange("185.215.65.35")+"</li>";
		res += "<li>Test de 185.215.67.255 : "+tabIpConseiller.isInRange("185.215.67.255")+"</li>";
		res += "<li>Test de 185.215.68.0 : "+tabIpConseiller.isInRange("185.215.68.0")+"</li>";
		res += "<li>Test de 185.215.63.255 : "+tabIpConseiller.isInRange("185.215.63.255")+"</li>";
		res += "<li>Test de 10.10.10.10 : "+tabIpConseiller.isInRange("10.10.10.10")+"</li>";
		res += "<li>Test de 109.26.209.86 : "+tabIpConseiller.isInRange("109.26.209.86")+"</li>";
		res += "</ul>";


		return res;
	}
    
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
	// TODO - A supprimer car en doublon avec JobBoard
	public static enum JobBoardUrl {
		POLE_EMPLOI("candidat.pole-emploi.fr"), LEBONCOIN("leboncoin.fr"), INDEED("indeed.fr"), VIVASTREET("vivastreet.com"), MONSTER("monster.fr"),
			KELJOB("keljob.com"), CADREMPLOI("cadremploi.fr"), LINKEDIN("linkedin.com"), ENVIROJOB("envirojob.fr"), APEC("apec.fr"), METEOJOB("meteojob.com"),
			OUESTJOB("ouestjob.com"), PARISJOB("parisjob.com"), NORDJOB("nordjob.com"), CENTREJOB("centrejob.com"), ESTJOB("estjob.com"),
			RHONEALPESJOB("rhonealpesjob.com"), SUDOUESTJOB("sudouestjob.com"), PACAJOB("pacajob.com"), LABONNEBOITE("labonneboite"), REGIONSJOB("parisjob.com"),
			JOBALIMVITIJOB("vitijob"), GENERIQUE("generique"), STEPSTONE("stepstone"), MARKETVENTE("marketvente"), ADECCO("adecco."), MANPOWER("manpower."), RANDSTAD("randstad."), QAPA("qapa"),JOBIJOBA("jobijoba.com");
		
		private String domaine;
		
		JobBoardUrl(String domaine) {
			 this.domaine = domaine;
		}
		
		public String getDomaine() {
			return this.domaine;
		}
	}
	
	public static enum JobBoard {
		POLE_EMPLOI("pole-emploi", "Pôle Emploi", "candidat.pole-emploi.fr"), LABONNEBOITE("labonneboite", "La Bonne Boîte", "labonneboite"), 
		EMPLOI_STORE("emploistore", "Emploi store", "emploistore"), LEBONCOIN("leboncoin", "Leboncoin", "leboncoin.fr"), INDEED("indeed", "Indeed", "indeed.fr"), 
		VIVASTREET("vivastreet", "", "vivastreet.com"), MONSTER("monster", "Monster", "monster.fr"),
		KELJOB("keljob", "Keljob", "keljob.com"), CADREMPLOI("cadremploi", "Cadremploi", "cadremploi.fr"), LINKEDIN("linkedin", "LinkedIn", "linkedin.com"), 
		ENVIROJOB("envirojob", "Envirojob", "envirojob.fr"), APEC("apec", "APEC", "apec.fr"), METEOJOB("meteojob", "MeteoJob", "meteojob.com"),
		OUESTJOB("ouestjob", "RegionsJob", "ouestjob.com"), PARISJOB("parisjob", "RegionsJob", "parisjob.com"), NORDJOB("nordjob", "RegionsJob", "nordjob.com"), 
		CENTREJOB("centrejob", "RegionsJob", "centrejob.com"), ESTJOB("estjob", "RegionsJob", "estjob.com"),
		RHONEALPESJOB("rhonealpesjob", "RegionsJob", "rhonealpesjob.com"), SUDOUESTJOB("sudouestjob", "RegionsJob", "sudouestjob.com"), PACAJOB("pacajob", "RegionsJob", "pacajob.com"),
		JOBALIMVITIJOB("vitijob", "Vitijob", "vitijob.com"), GENERIQUE("generique", "Generique", ""), STEPSTONE("stepstone", "StepStone", "stepstone"), 
		MARKETVENTE("marketvente", "marketvente", "marketvente.fr"), ADECCO("adecco", "Adecco", "adecco."), MANPOWER("manpower", "Manpower", "manpower."), RANDSTAD("randstad", "randstad", "randstad."), 
		QAPA("qapa", "QAPA", "qapa"), JOBIJOBA("jobijoba", "JobiJoba", "jobijoba.com");
		
		private String nom;
		private String libelle;
		private String domaine; 
		
		JobBoard(String nom, String libelle, String domaine) {
			this.nom = nom; 
			this.libelle = libelle;
			this.domaine = domaine;
		}
		
		public String getLibelle() {
			return this.libelle;
		}
		
		public String getNom() {
			return this.nom;
		}
		
		
		public String getDomaine() {
			return this.domaine;
		}
	}
        	
}