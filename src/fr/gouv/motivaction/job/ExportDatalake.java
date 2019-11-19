package fr.gouv.motivaction.job;

import java.io.File;
import java.io.FileWriter;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;
import org.json.simple.JSONObject;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import com.codahale.metrics.Timer;

import fr.gouv.motivaction.Constantes;
import fr.gouv.motivaction.Constantes.Etat;
import fr.gouv.motivaction.Constantes.TypeEvt;
import fr.gouv.motivaction.Constantes.TypeOffre;
import fr.gouv.motivaction.dao.AdminDAO;
import fr.gouv.motivaction.dao.CandidatureDAO;
import fr.gouv.motivaction.dao.CandidatureEventDAO;
import fr.gouv.motivaction.dao.UserLogDAO;
import fr.gouv.motivaction.mails.MailTools;
import fr.gouv.motivaction.model.Candidature;
import fr.gouv.motivaction.model.CandidatureEvent;
import fr.gouv.motivaction.model.UserLog;
import fr.gouv.motivaction.service.MailService;
import fr.gouv.motivaction.service.UserService;
import fr.gouv.motivaction.utils.Utils;

/**
 * Created by Julien on 21/12/2018.
 */
public class ExportDatalake implements Job {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "048";

    public static Timer exportDatalakeTimer = Utils.metricRegistry.timer("exportDatalakeTimer");

    private static String filenamePattern;
    private static String pathExportJSON;
    private static int version;
    
    static Properties prop;
    
    static {
        loadProperties();
    }
    
    private static void loadProperties() {
	    prop = new Properties();
	    InputStream in = null;

	    try {
	    	in = ExportDatalake.class.getResourceAsStream("/fr/gouv/motivaction/properties/datalake.properties");
	    	prop.load(in);
	    	
	    	filenamePattern = prop.getProperty("filenamePattern");
	    	pathExportJSON = prop.getProperty("pathExportJSON");
	    	version = Integer.parseInt(prop.getProperty("version"));

            in.close();
            
        } catch (Exception e) {
            log.error(logCode + "-001 ExportDatalake properties error=" + e);
	    }
    }
    
    public void execute(JobExecutionContext context) throws JobExecutionException
    {
        boolean isOk = false;
        
    	log.info(logCode + "-002 JOB Executing ExportDatalake job");
        
        try {
            // génération de l'export
        	isOk = this.buildAndWriteExport();

            // envoi du mail de rapport d'execution aux intras, devs et extra
            MailService.sendMailReport(Utils.concatArrayString(MailTools.tabEmailIntra, MailTools.tabEmailDev, MailTools.tabEmailExtra), "Rapport - construction de la liste des utilisateurs", "");
            
        	if(!isOk)
        		log.error(logCode+"-011 JOB Error executing ExportMaintenance job.");
        }
        catch (Exception e)
        {
            log.error(logCode+"-003 JOB Error executing ExportMaintenance job. error="+e);
            throw new JobExecutionException(e);
        }
    }

    private boolean buildAndWriteExport() throws Exception
    {
        boolean isOk = false;
    	log.info(logCode+"-004 JOB Started ExportDatalake");

        try
        {
            // Ecriture des fichiers sur le serveur
            ExportDatalake.writeUserLogsIntoLog(null);
            ExportDatalake.writeCandidaturesIntoLog(null);
            ExportDatalake.writeCandidatureEventsIntoLog(null);
            ExportDatalake.writeRefEtatCandidatureIntoLog();
            ExportDatalake.writeRefTypeCandidatureIntoLog();
            ExportDatalake.writeRefTypeCandidatureEventIntoLog();
            ExportDatalake.writeRefSubTypeCandidatureEventIntoLog();
            isOk = true;
            log.info(logCode+"-005 JOB End Datalake Export");

        } catch (Exception e) {
            log.error(logCode+"-006 JOB Erreur lors de l'écriture du fichier d'export. error=" + e);
        } 
        return isOk;
    }

    /**
     * En cas de plantage de l'export automatique, on tente un nouvel export manuel via testMail.jsp
     * @param request
     * @param date
     * @return
     * @throws Exception
     */
    public static void buildAndWriteExportRetry(HttpServletRequest request, String strDate) throws Exception
    {
    	log.info(logCode+"-007 JOB Started ExportDatalakeRetry");

        long userId = UserService.checkAdminUserAuth(request);
        
        if(userId>0)
        {
        	log.info(logCode+"-008 JOB launched by userId=" + userId);
            try
            {
                // Ecriture des fichiers sur le serveur
                ExportDatalake.writeUserLogsIntoLog(strDate);
                ExportDatalake.writeCandidaturesIntoLog(strDate);
                ExportDatalake.writeCandidatureEventsIntoLog(strDate);
                ExportDatalake.writeRefEtatCandidatureIntoLog();
                ExportDatalake.writeRefTypeCandidatureIntoLog();
                ExportDatalake.writeRefTypeCandidatureEventIntoLog();
                ExportDatalake.writeRefSubTypeCandidatureEventIntoLog();
                
                log.info(logCode+"-009 JOB End ExportDatalakeRetry");

            } catch (Exception e) {
                log.error(logCode+"-010 JOB Erreur lors de l'écriture du fichier d'extract. error=" + e);
            }
        } else {
        	log.error(logCode+"-012 JOB User is not admin - userId=" + userId);
        }
    }
    
    private static JSONObject convertUserLogIntoJSON(UserLog a_userLog) {
    	JSONObject objJSON = new JSONObject();
        LocalDateTime currentTime = LocalDateTime.now();
        String strDateNow = currentTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd kk:mm:ss"));
        
        if(a_userLog != null) {
        	objJSON.put("version", version);
        	objJSON.put("env", Constantes.env);
        	objJSON.put("dateTime", strDateNow);
        	objJSON.put("id", a_userLog.getId());
        	objJSON.put("userId", a_userLog.getUserId());
        	objJSON.put("domaine", a_userLog.getDomaine());
        	objJSON.put("action", a_userLog.getAction());
        	objJSON.put("login", a_userLog.getLogin());
        	objJSON.put("peId", a_userLog.getPeId());
        	objJSON.put("peEmail", a_userLog.getPeEmail());
        	objJSON.put("candidatureId", a_userLog.getCandidatureId());
        	objJSON.put("creationTime", Utils.getStringFromTimestamp(a_userLog.getCreationTime(), "yyyy-MM-dd kk:mm:ss"));
        	
        }
        return objJSON; 
    }
    
    private static JSONObject convertCandidatureIntoJSON(Candidature a_candidature) {
    	JSONObject objJSON = new JSONObject();
        LocalDateTime currentTime = LocalDateTime.now();
        String strDateNow = currentTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd kk:mm:ss"));
        
        if(a_candidature != null) {
        	objJSON.put("version", version);
        	objJSON.put("env", Constantes.env);
        	objJSON.put("dateTime", strDateNow);
        	objJSON.put("id", a_candidature.getId());
        	objJSON.put("userId", a_candidature.getUserId());
        	objJSON.put("nomCandidature", a_candidature.getNomCandidature());
        	objJSON.put("nomSociete", a_candidature.getNomSociete());
        	objJSON.put("description", a_candidature.getDescription());
        	
        	objJSON.put("lastUpdate", Utils.getStringFromLong(a_candidature.getLastUpdate(), "yyyy-MM-dd kk:mm:ss"));
        	objJSON.put("etat", a_candidature.getEtat());
        	objJSON.put("ville", a_candidature.getVille());
        	objJSON.put("pays", a_candidature.getPays());
        	
        	if(a_candidature.getDateCandidature()!=0)
        		objJSON.put("dateCandidature", Utils.getStringFromLong(a_candidature.getDateCandidature(), "yyyy-MM-dd kk:mm:ss"));
        	else
        		objJSON.put("dateCandidature", null);
        	
        	if(a_candidature.getDateRelance()!=0)
        		objJSON.put("dateRelance", Utils.getStringFromLong(a_candidature.getDateRelance(), "yyyy-MM-dd kk:mm:ss"));
        	else
        		objJSON.put("dateRelance", null);
        	
        	if(a_candidature.getDateEntretien()!=0)
        		objJSON.put("dateEntretien", Utils.getStringFromLong(a_candidature.getDateEntretien(), "yyyy-MM-dd kk:mm:ss"));
        	else
        		objJSON.put("dateEntretien", null);
        	
        	objJSON.put("nomContact", a_candidature.getNomContact());
        	objJSON.put("emailContact", a_candidature.getEmailContact());
        	objJSON.put("telContact", a_candidature.getTelContact());
        	objJSON.put("urlSource", a_candidature.getUrlSource());
        	objJSON.put("note", a_candidature.getNote());
        	objJSON.put("archived", a_candidature.getArchived());
        	objJSON.put("type", a_candidature.getType());
        	objJSON.put("rating", a_candidature.getRating());
        	objJSON.put("sourceId", a_candidature.getSourceId());
        	objJSON.put("expired", a_candidature.getExpired());
        	objJSON.put("creationDate", Utils.getStringFromLong(a_candidature.getCreationDate(), "yyyy-MM-dd kk:mm:ss"));
        	objJSON.put("logoUrl", a_candidature.getLogoUrl());
        	objJSON.put("jobBoard", a_candidature.getJobBoard());
        	objJSON.put("isButton", a_candidature.getIsButton());
        	objJSON.put("numSiret", a_candidature.getNumSiret());
        	
        }
        return objJSON; 
    }
    
    private static JSONObject convertCandidatureEvtIntoJSON(CandidatureEvent a_candEvt) {
    	JSONObject objJSON = new JSONObject();
        LocalDateTime currentTime = LocalDateTime.now();
        String strDateNow = currentTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd kk:mm:ss"));
        
        if(a_candEvt != null) {
        	objJSON.put("version", version);
        	objJSON.put("env", Constantes.env);
        	objJSON.put("dateTime", strDateNow);
        	objJSON.put("id", a_candEvt.getId());
        	objJSON.put("candidatureId", a_candEvt.getCandidatureId());
        	objJSON.put("creationTime", Utils.getStringFromLong(a_candEvt.getCreationTime(), "yyyy-MM-dd kk:mm:ss"));
        	objJSON.put("eventTime", Utils.getStringFromLong(a_candEvt.getEventTime(), "yyyy-MM-dd kk:mm:ss"));
        	objJSON.put("eventType", a_candEvt.getEventType());
        	objJSON.put("eventSubType", a_candEvt.getEventSubType());
        	objJSON.put("comment", a_candEvt.getComment());   	
        }
        return objJSON; 
    }
   
    private static JSONObject convertRefEtatCandIntoJSON(Etat a_etat) {
    	JSONObject objJSON = new JSONObject();
        LocalDateTime currentTime = LocalDateTime.now();
        String strDateNow = currentTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd kk:mm:ss"));
        
        if(a_etat != null) {
        	objJSON.put("version", version);
        	objJSON.put("env", Constantes.env);
        	objJSON.put("dateTime", strDateNow);
        	objJSON.put("id", a_etat.ordinal());
        	objJSON.put("etat", a_etat.getLibelle());
        }
        return objJSON; 
    }
    
    private static JSONObject convertRefTypeCandIntoJSON(TypeOffre a_type) {
    	JSONObject objJSON = new JSONObject();
        LocalDateTime currentTime = LocalDateTime.now();
        String strDateNow = currentTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd kk:mm:ss"));
        
        if(a_type != null) {
        	objJSON.put("version", version);
        	objJSON.put("env", Constantes.env);
        	objJSON.put("dateTime", strDateNow);
        	objJSON.put("id", a_type.ordinal());
        	objJSON.put("type", a_type.getLibelle());
        }
        return objJSON; 
    }
    
    private static JSONObject convertRefTypeCandEvtIntoJSON(TypeEvt a_typeEvt) {
    	JSONObject objJSON = new JSONObject();
        LocalDateTime currentTime = LocalDateTime.now();
        String strDateNow = currentTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd kk:mm:ss"));
        
        if(a_typeEvt != null) {
        	objJSON.put("version", version);
        	objJSON.put("env", Constantes.env);
        	objJSON.put("dateTime", strDateNow);
        	objJSON.put("id", a_typeEvt.ordinal());
        	objJSON.put("type", a_typeEvt.name());
        }
        return objJSON; 
    }
    
    private static JSONObject convertRefSubTypeCandEvtIntoJSON(TypeEvt a_subTypeEvt) {
    	JSONObject objJSON = new JSONObject();
        LocalDateTime currentTime = LocalDateTime.now();
        String strDateNow = currentTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd kk:mm:ss"));
        
        if(a_subTypeEvt != null) {
        	objJSON.put("version", version);
        	objJSON.put("env", Constantes.env);
        	objJSON.put("dateTime", strDateNow);
        	objJSON.put("id", a_subTypeEvt.ordinal());
        	objJSON.put("subtype", a_subTypeEvt.name());
        }
        return objJSON; 
    }
    
    private static void writeUserLogsIntoLog(String strDate) {
    	File f = null;
    	FileWriter fw = null;
    	Object [] lstUserLog = null;
    	JSONObject b_objectJSON = null;
    	LocalDateTime currentTime = LocalDateTime.now();
        String strDateNow = null;
        long nbDaysDiff;
        LocalDateTime localDate = null;
        String fileName = null;
        long count = 0;
        
        try
        {
        	if (strDate != null) {
        		fileName = ExportDatalake.pathExportJSON+"/userLogs-"+strDate+".json";
        	} else { 
        		strDateNow = currentTime.format(DateTimeFormatter.ofPattern(ExportDatalake.filenamePattern));
        		fileName = ExportDatalake.pathExportJSON+"/userLogs-"+strDateNow+".json";
        	}
        	f = new File (fileName);       	
        	fw = new FileWriter (f);
            
        	log.debug(logCode+" - FICHIER =" + fileName);
        	if (strDate != null) {
        		localDate = LocalDateTime.ofInstant((new SimpleDateFormat("yyyy-MM-dd").parse(strDate)).toInstant(), ZoneId.systemDefault());        		
        		// +1 car on travaille sur les données de la veille par rapport à la date de l'export
        		nbDaysDiff = ChronoUnit.DAYS.between(localDate, currentTime)+1;
        	} else {
        		// En auto, on fait l'export sur les données de la veille dc J-1
        		nbDaysDiff = 1;
        	}
            lstUserLog = UserLogDAO.listUserLogsPerPreviousDay(nbDaysDiff);
            
			for(Object b_obj : lstUserLog)
            {
				b_objectJSON = convertUserLogIntoJSON((UserLog)b_obj);
				fw.write(b_objectJSON.toJSONString());
				fw.write("\n");
				count++;
            }
            fw.close();
            log.debug(logCode+" - FICHIER (nb lignes)=" + count);
        }
        catch (Exception exception)
        {
            log.error(logCode+"-006 JOB Erreur lors de l'écriture du fichier d'export datalake. error="+exception);
        }
    }
    
    private static void writeCandidaturesIntoLog(String strDate) {
    	File f = null;
    	FileWriter fw = null;
    	Object [] lstCandidature = null;
    	Candidature b_cand = null;
    	JSONObject b_objectJSON = null;
    	LocalDateTime currentTime = LocalDateTime.now();
        String strDateNow = null;
        long nbDaysDiff;
        LocalDateTime localDate = null;
        String fileName = null;
        long count = 0;
        
        try
        {
        	if (strDate != null) {
        		fileName = ExportDatalake.pathExportJSON+"/candidatures-"+strDate+".json";
        	} else { 
        		strDateNow = currentTime.format(DateTimeFormatter.ofPattern(ExportDatalake.filenamePattern));
        		fileName = ExportDatalake.pathExportJSON+"/candidatures-"+strDateNow+".json";
        	}
        	f = new File (fileName);       	
        	fw = new FileWriter (f);
            
        	log.debug(logCode+" - FICHIER =" + fileName);
        	if (strDate != null) {
        		localDate = LocalDateTime.ofInstant((new SimpleDateFormat("yyyy-MM-dd").parse(strDate)).toInstant(), ZoneId.systemDefault());        		
        		// +1 car on travaille sur les données de la veille par rapport à la date de l'export
        		nbDaysDiff = ChronoUnit.DAYS.between(localDate, currentTime)+1;
        	} else {
        		// En auto, on fait l'export sur les données de la veille dc J-1
        		nbDaysDiff = 1;
        	}
            lstCandidature = CandidatureDAO.listFromUserLogPerPreviousDay(nbDaysDiff);
            
			for(Object b_obj : lstCandidature)
            {
				b_cand = (Candidature)b_obj;
				b_objectJSON = convertCandidatureIntoJSON(b_cand);
				fw.write(b_objectJSON.toJSONString());
				fw.write("\n");
				count++;
            }
            fw.close();
            log.debug(logCode+" - FICHIER (nb lignes)=" + count);
        }
        catch (Exception exception)
        {
            log.error(logCode+"-006 JOB Erreur lors de l'écriture du fichier d'export datalake. error="+exception);
        }
    }
    
    private static void writeCandidatureEventsIntoLog(String strDate) {
    	File f = null;
    	FileWriter fw = null;
    	Object [] lstCandEvt = null;
    	CandidatureEvent b_candEvt = null;
    	JSONObject b_objectJSON = null;
    	LocalDateTime currentTime = LocalDateTime.now();
        String strDateNow = null;
        long nbDaysDiff;
        LocalDateTime localDate = null;
        String fileName = null;
        long count = 0;
        
        try
        {
        	if (strDate != null) {
        		fileName = ExportDatalake.pathExportJSON+"/candidatureEvents-"+strDate+".json";
        	} else { 
        		strDateNow = currentTime.format(DateTimeFormatter.ofPattern(ExportDatalake.filenamePattern));
        		fileName = ExportDatalake.pathExportJSON+"/candidatureEvents-"+strDateNow+".json";
        	}
        	f = new File (fileName);       	
        	fw = new FileWriter (f);
            
        	log.debug(logCode+" - FICHIER =" + fileName);
        	if (strDate != null) {
        		localDate = LocalDateTime.ofInstant((new SimpleDateFormat("yyyy-MM-dd").parse(strDate)).toInstant(), ZoneId.systemDefault());        		
        		// +1 car on travaille sur les données de la veille par rapport à la date de l'export
        		nbDaysDiff = ChronoUnit.DAYS.between(localDate, currentTime)+1;
        	} else {
        		// En auto, on fait l'export sur les données de la veille dc J-1
        		nbDaysDiff = 1;
        	}
        	lstCandEvt = CandidatureEventDAO.listFromUserLogPerPreviousDay(nbDaysDiff);
            
			for(Object b_obj : lstCandEvt)
            {
				b_candEvt = (CandidatureEvent)b_obj;
				b_objectJSON = convertCandidatureEvtIntoJSON(b_candEvt);
				fw.write(b_objectJSON.toJSONString());
				fw.write("\n");
				count++;
            }
            fw.close();
            log.debug(logCode+" - FICHIER (nb lignes)=" + count);
        }
        catch (Exception exception)
        {
            log.error(logCode+"-006 JOB Erreur lors de l'écriture du fichier d'export datalake. error="+exception);
        }
    }
    
    private static void writeRefEtatCandidatureIntoLog() {
    	File f = null;
    	FileWriter fw = null;
    	JSONObject b_objectJSON = null;
        
        try
        {
        	f = new File (ExportDatalake.pathExportJSON+"/refEtatCandidature.json");
        	fw = new FileWriter (f);
            
			for(Etat b_etat : Constantes.Etat.values())
            {
				b_objectJSON = convertRefEtatCandIntoJSON(b_etat);
				fw.write(b_objectJSON.toJSONString());
				fw.write("\n");
            }
            fw.close();
        }
        catch (Exception exception)
        {
            log.error(logCode+"-006 JOB Erreur lors de l'écriture du fichier d'export datalake. error="+exception);
        }
    }
    
    private static void writeRefTypeCandidatureIntoLog() {
    	File f = null;
    	FileWriter fw = null;
    	JSONObject b_objectJSON = null;
        
        try
        {
        	f = new File (ExportDatalake.pathExportJSON+"/refTypeCandidature.json");
        	fw = new FileWriter (f);
            
			for(TypeOffre b_type : Constantes.TypeOffre.values())
            {
				b_objectJSON = convertRefTypeCandIntoJSON(b_type);
				fw.write(b_objectJSON.toJSONString());
				fw.write("\n");
            }
            fw.close();
        }
        catch (Exception exception)
        {
            log.error(logCode+"-006 JOB Erreur lors de l'écriture du fichier d'export datalake. error="+exception);
        }
    }
    
    private static void writeRefTypeCandidatureEventIntoLog() {
    	File f = null;
    	FileWriter fw = null;
    	JSONObject b_objectJSON = null;
        
        try
        {
        	f = new File (ExportDatalake.pathExportJSON+"/refTypeCandidatureEvent.json");
        	fw = new FileWriter (f);
            
			for(TypeEvt b_type : Constantes.TypeEvt.values())
            {
				b_objectJSON = convertRefTypeCandEvtIntoJSON(b_type);
				fw.write(b_objectJSON.toJSONString());
				fw.write("\n");
            }
            fw.close();
        }
        catch (Exception exception)
        {
            log.error(logCode+"-006 JOB Erreur lors de l'écriture du fichier d'export datalake. error="+exception);
        }
    }
    
    private static void writeRefSubTypeCandidatureEventIntoLog() {
    	File f = null;
    	FileWriter fw = null;
    	JSONObject b_objectJSON = null;
        
        try
        {
        	f = new File (ExportDatalake.pathExportJSON+"/refSubTypeCandidatureEvent.json");
        	fw = new FileWriter (f);
            
			for(TypeEvt b_type : Constantes.TypeEvt.values())
            {
				b_objectJSON = convertRefSubTypeCandEvtIntoJSON(b_type);
				fw.write(b_objectJSON.toJSONString());
				fw.write("\n");
            }
            fw.close();
        }
        catch (Exception exception)
        {
            log.error(logCode+"-006 JOB Erreur lors de l'écriture du fichier d'export datalake. error="+exception);
        }
    }
}
