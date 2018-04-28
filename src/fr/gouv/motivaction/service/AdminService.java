package fr.gouv.motivaction.service;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import org.apache.log4j.Logger;

import fr.gouv.motivaction.dao.AdminDAO;
import fr.gouv.motivaction.mails.MailTools;
import fr.gouv.motivaction.model.UserActivity;
import fr.gouv.motivaction.utils.Utils;


/**
 * Created by Alan on 03/05/2016.
 */
public class AdminService {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "010";

    public static long getUserCount(String cohorte) throws Exception
    {
        return AdminDAO.getUserCount(cohorte);
    }

    public static long getCandidatureCount(String cohorte) throws Exception
    {
        return AdminDAO.getCandidatureCount(cohorte);
    }

    public static double getCandidaturePerUser(String cohorte) throws Exception
    {
        return AdminDAO.getCandidaturePerUser(cohorte);
    }

    public static long [] getCandidatureAndUserCount(int d, String cohorte) throws Exception
    {
        return AdminDAO.getCandidatureAndUserCount(d, cohorte);
    }

    public static Object [] getUserActivities(String cohorte, String limit) throws Exception
    {
        Object []  list = AdminDAO.getUserActivities(cohorte, limit);

        /*for(int i=0; i<list.length; ++i)
        {
            UserActivity ua = (UserActivity)list[i];
            ua.setVisitorLink(UserService.getVisitorLinkForUser(ua.getUserId()));
        }*/
        
        return list;
    }
    
    public static boolean getExtractUserActivities(long nbUser) throws Exception
    {
        boolean isExtract = false;
        long nbPaquet = 0;
        long idMin = 0;
        long idMax = 50000;
        List<String> lstFilePathCreated = null;
        String fileName = null;
        
        if(nbUser>0)
        {
            try
            {           	
        		lstFilePathCreated = new ArrayList<String>();
        		nbPaquet = nbUser/50000;
        		for (int i=0; i<=nbPaquet && idMin < nbUser; i++) {
	            	// Récupération de tous les états des utilisateurs
	                Object [] activities = AdminDAO.getExtractUserActivities(idMin, idMax);
	                fileName = MailTools.pathCSV+"extract-userActivities-"+i+".csv";
	                // Ecriture du fichier CSV sur le serveur
	                AdminService.writeUserActivitiesInCSV(activities, i, fileName);
	                lstFilePathCreated.add(fileName);
	                idMin += 50000;
	                idMax += 50000;
        		}
        		// On zip les fichiers créés
        		if (lstFilePathCreated != null)
        			isExtract = AdminService.zipFiles(lstFilePathCreated.toArray(new String[lstFilePathCreated.size()]));
            } catch (Exception e) {
            	log.error(logCode+"-010 UTILS Erreur lors de l'écriture du fichier d'extract. error=" + e);
            }
        }       
        return isExtract;
    }
    
    public static Object [] getUserActivities(String email) throws Exception
    {
        Object []  list = AdminDAO.getUserActivities(email);

        /*for(int i=0; i<list.length; ++i)
        {
            UserActivity ua = (UserActivity)list[i];
            ua.setVisitorLink(UserService.getVisitorLinkForUser(ua.getUserId()));
        }*/
        
        return list;
    }
    
    private static void writeUserActivitiesInCSV(Object [] lstUserActivities, int i, String fileName) {
    	File f = new File (fileName);
    	UserActivity a;
    	
    	try
    	{
    	    FileWriter fw = new FileWriter (f);
    	    StringBuilder sb = new StringBuilder();
    	    fw.write("userId;visitorLink;email;je_vais_postule;j_ai_postule;j_ai_relance;j_ai_un_entretien;nbConnexion;nbConnexionFacebook;dateCreation;dateLastActivity;receivedEmail;assiduLastMonth;assiduLastTrimestre");
    	    fw.write("\n");
    	    for(Object o : lstUserActivities)
    	    {
    	    	a = (UserActivity) o;
    	    	// Réinitialise la String
    	    	sb.delete(0, sb.length());
    	    	sb.append(String.valueOf(a.getUserId()+";"+MailTools.url+"/?link="+a.getVisitorLink()+";"+a.getEmail()+";"+a.getTodos()+";"+a.getCandidatures()+";"+a.getRelances()+";"+a.getEntretiens()+";"+a.getConns()+";"+a.getFbConns()+";"+a.getDateCreation()+";"+a.getLastActivity()+";"+a.getReceiveEmail()+";"));
    	        // Assidu le mois dernier
    	        if(a.getNbConnLastMonth()>=4 && a.getNbActLastMonth()>=8) {
    	        	// assidu = au moins 4 connexions et 8 activités
    	        	sb.append("1;");
    	        } else {
    	        	sb.append("0;");
    	        }
    	        // Assidu le trimestre dernier
    	        if(a.getNbConnLastTrim()>=4 && a.getNbActLastTrim()>=8) {
    	        	// assidu = au moins 4 connexions et 8 activités
    	        	sb.append("1;");
    	        } else {
    	        	sb.append("0;");
    	        }
    	        sb.append("\n");
    	        fw.write(sb.toString());
    	    }
    	    fw.close();
    	}
    	catch (IOException exception)
    	{
			log.error(logCode+"-007 UTILS Erreur lors de l'écriture du fichier d'activités user. error="+exception);
    	}
	}

    private static boolean zipFiles(String[] filePaths) {
    	boolean isZipped = false;
    	String zipFileName = MailTools.pathCSV+"extract-userActivities.zip";
    	
    	try {
            
 
            FileOutputStream fos = new FileOutputStream(zipFileName);
            ZipOutputStream zos = new ZipOutputStream(fos);
 
            for (String aFile : filePaths) {
                zos.putNextEntry(new ZipEntry(new File(aFile).getName()));
 
                byte[] bytes = Files.readAllBytes(Paths.get(aFile));
                zos.write(bytes, 0, bytes.length);
                zos.closeEntry();
            }
            zos.close();
            // Modification des droits du fichier pr le rendre telechargeable
            File f = new File(zipFileName);
            if (f!=null)
            	f.setExecutable(true);
            isZipped = true;
 
        } catch (FileNotFoundException ex) {
        	log.error(logCode+"-008 A file does not exist: " + ex);
        } catch (IOException ex) {
        	log.error(logCode+"-009 I/O error: " + ex);
        }
    	return isZipped;
    }
    
    public static Object [] getUserActions(long userId) throws Exception
    {
        Object []  list = AdminDAO.getUserActions(userId);

        return list;
    }

    public static Object [] getUserInterviews(String cohorte) throws Exception
    {
        Object []  list = AdminDAO.getUserInterviews(cohorte);

        return list;
    }
    
    public static String getHealthCheck() {
        String res = null;
        
        try {
        	AdminDAO.getHealthCheck();
        } catch (Exception e) {
        	res = "Service BDD KO : " + e;
        	log.error(logCode + "-001 Error DAO getting healthCheck. error=" + Utils.getStackTraceIntoString(e));
        }

        return res;
    }

}
