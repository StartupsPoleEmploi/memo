package fr.gouv.motivaction.utils;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.net.URL;
import java.sql.Timestamp;
import java.text.Normalizer;
import java.text.Normalizer.Form;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Properties;
import java.util.Set;
import java.util.StringTokenizer;
import java.util.concurrent.TimeUnit;
import java.util.zip.DataFormatException;
import java.util.zip.Deflater;
import java.util.zip.Inflater;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.elasticsearch.metrics.ElasticsearchReporter;

import com.codahale.metrics.MetricRegistry;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import fr.gouv.motivaction.Constantes;
import fr.gouv.motivaction.dao.UserLogDAO;
import fr.gouv.motivaction.model.CandidatureEvent;
import fr.gouv.motivaction.model.CandidatureReport;
import fr.gouv.motivaction.model.Stat;
import fr.gouv.motivaction.model.UserLog;
import fr.gouv.motivaction.model.UserSummary;
import fr.gouv.motivaction.service.MailService;

import static fr.gouv.motivaction.Constantes.tabIpConseiller;

/**
 * Created by Alan on 12/04/2016.
 */
public class Utils {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "004";

    public static Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm").create();

	public static MetricRegistry metricRegistry = new MetricRegistry();
	/*public static ConsoleReporter reporter = ConsoleReporter.forRegistry(metricRegistry)
			.convertRatesTo(TimeUnit.SECONDS)
			.convertDurationsTo(TimeUnit.MILLISECONDS)
			.build();

	static
	{
		reporter.start(15, TimeUnit.MINUTES);
	}*/
	public static ElasticsearchReporter reporter = null;
	//public static ConsoleReporter reporterConsole = null;
	
	public static String reportingHosts = "";
	public static String reportingIndex = "";
	public static int reportingFrequency = 15;
	static Properties prop;

	static
	{
		loadProperties();

		try
		{
			reporter = ElasticsearchReporter.forRegistry(metricRegistry)
					.hosts(reportingHosts)
					.index(reportingIndex)
					.indexDateFormat(null)
					.convertRatesTo(TimeUnit.SECONDS)
					.convertDurationsTo(TimeUnit.MILLISECONDS).build();
			
			reporter.start(reportingFrequency, TimeUnit.MINUTES);
			
			/*reporterConsole = ConsoleReporter.forRegistry(metricRegistry)
				       .convertRatesTo(TimeUnit.SECONDS)
				       .convertDurationsTo(TimeUnit.MILLISECONDS)
				       .build();
			
			reporterConsole.start(1, TimeUnit.MINUTES);*/

			log.info(logCode+"-006 UTILS reporting started. hosts="+reportingHosts+" index="+reportingIndex+" frequency="+reportingFrequency);
		}
		catch (Exception e)
		{
			log.error(logCode+"-002 UTILS Error starting metrics reporter. error="+e);
		}
	}

	private static void loadProperties() {
		prop = new Properties();
		InputStream in = null;

		try
		{
			in = MailService.class.getResourceAsStream("/fr/gouv/motivaction/properties/reporting.properties");
			prop.load(in);

			String env = prop.getProperty("env");
			if(env.equals("RECETTE"))
			{
				reportingHosts = prop.getProperty("reporting.hosts.recette");
				reportingIndex = prop.getProperty("reporting.index.recette");
			}
			else
			{
				reportingHosts = prop.getProperty("reporting.hosts.prod");
				reportingIndex = prop.getProperty("reporting.index.prod");
			}

			try
			{
				reportingFrequency = Integer.parseInt(prop.getProperty("reporting.frequency"));
			}
			catch(Exception e)
			{
				log.warn(logCode + "-004 UTILS properties error=" + e);
			}

			in.close();
		} catch (IOException e) {
			log.error(logCode + "-005 UTILS properties error=" + e);
		}
	}

	public static void logUserAction(long userId,String domaine, String action, long candidatureId)
    {
        UserLog uLog = new UserLog(userId, domaine, action, candidatureId);

        try
        {
            UserLogDAO.save(uLog);
        }
        catch(Exception e)
        {
            log.error(logCode + "-001 UTILS Error saving user log entry. userId=" + userId + " candidatureId=" + candidatureId + " domaine=" + domaine + " action=" + action + " error=" + e);
        }
    }

    public static boolean isInDomain(String url, String domain) {
    	URL u = null;
    	boolean res = false;
    	if (url.indexOf("http") != 0) {
    		url = "http://" + url;
    	} 
    	try {
	    	u = new URL(url);
	    	if (u.getHost().indexOf(domain) > -1) {
	    		res = true;
	    	}
    	} 
    	catch(Exception e) {
    		log.error(logCode + "-003 UTILS error identifying domain. domain=" + domain + " url=" + url + " error=" + e);
    	}
    	return res;
    }

    public static String[] concatArrayString(String[] tab1, String[] tab2, String[] tab3) {
    	String[] res = null, tmp = null;
    	if (tab1 != null && tab2 != null) {
    		tmp = Arrays.copyOf(tab1, tab1.length + tab2.length);
    		System.arraycopy(tab2, 0, tmp, tab1.length, tab2.length);
    		if (tmp != null && tab3 != null) {
        		res = Arrays.copyOf(tmp, tmp.length + tab3.length);
        		System.arraycopy(tmp, 0, res, tmp.length, tab3.length);
        	} else {
        		res = tmp;
        	}
    	}   	
    	return res;
    }
    
	public static byte[] compress(byte[] data) throws IOException {

		Deflater deflater = new Deflater();
		deflater.setInput(data);
		ByteArrayOutputStream outputStream = new ByteArrayOutputStream(data.length);
		deflater.finish();
		byte[] buffer = new byte[1024];

		while (!deflater.finished()) {
			int count = deflater.deflate(buffer); // returns the generated code... index
			outputStream.write(buffer, 0, count);
		}

		outputStream.close();
		byte[] output = outputStream.toByteArray();
		return output;
	}

	public static byte[] decompress(byte[] data) throws IOException, DataFormatException {

		Inflater inflater = new Inflater();
		inflater.setInput(data);
		ByteArrayOutputStream outputStream = new ByteArrayOutputStream(data.length);
		byte[] buffer = new byte[1024];

		while (!inflater.finished()) {
			int count = inflater.inflate(buffer);
			outputStream.write(buffer, 0, count);
		}

		outputStream.close();
		byte[] output = outputStream.toByteArray();
		return output;
	}
	
	public static int getListSize(ArrayList list) {
		int res = 0;
		if (list != null) {
			res = list.size();
		}
		return res;
	}

	public static String getStackTraceIntoString(Exception e) {
		String res = null;
		StringWriter sw = new StringWriter();
        e.printStackTrace(new PrintWriter(sw));
        res = sw.toString();
        return res;
	}
	
	/**
	 * Récupère les clefs de la liste de Stat sous la forme d'un set
	 * @param lstStat
	 * @return
	 */
	public static Set<String> getSetKeyFromStat(ArrayList<Stat> lstStat) {
		Set<String> setResult = null;
		
		if (lstStat != null) {
			setResult = new LinkedHashSet<String>();
			for(Stat stat : lstStat) {
				setResult.add(stat.getCle());
			}
		}
		return setResult;
	}
	
	/**
	 * Ajoute des stats à la liste de Stat pour les clefs manquante avec comme valeur 0
	 * @param mapSrc
	 * @param mapDest
	 */
	public static void concatEmptyStat(ArrayList<Stat> lstStat, Set<String> setKeys) {
		StringTokenizer strToken = null;
		String month = null;
		String year = null;
		Stat stat = null;
		if(lstStat != null) {
			for(String key : setKeys) {
				stat = new Stat(key, new Long(0));
				if(!lstStat.contains(stat)) {
					strToken = new StringTokenizer(key, "/");
					month = strToken.nextToken();
					year = strToken.nextToken();
					lstStat.add(new Stat(key, new Long(0), new Long(year+month)));
				}
			}
		}
	}

	public static void addCandidatureToUserSummary(CandidatureReport cand, UserSummary user)
    {
		try
		{
			LocalDateTime now = LocalDateTime.now();
			LocalDateTime creationDate = null;

			if (cand.getArchived() == 0) {
				// Seules les candidatures non archivées (terminées) sont concernées
				/*if (cand.getLastActivity() != null && ChronoUnit.DAYS.between(cand.getLastActivity(), now) > 30) {
						user.addArchiver(cand);
				} else*/ {
					switch(Constantes.Etat.values()[cand.getEtat()])
					{
						case VA_POSTULER : {
							// Conversion de creationDate en LocalDateTime
							if(cand.getCreationDate() != 0) {
								creationDate = new Timestamp(cand.getCreationDate()).toLocalDateTime();
							}
							if (ChronoUnit.DAYS.between(creationDate, now)>=0 && ChronoUnit.DAYS.between(creationDate, now)<=7) {
								// @RG - EMAIL : Dans la campagne de mail "Vos priorités cette semaine", pour le rapport et la priorité DOIS_POSTULER, les candidatures concernées sont celles enregistrées la semaine passée
								user.addVaPostuler(cand);
								if (cand.getType()==Constantes.TypeOffre.SPONT.ordinal())
									user.addVaPostulerSpont(cand);
							}
							break;
						}
						case A_RELANCE : {
							if (cand.getLastRelance() != null && ChronoUnit.DAYS.between(cand.getLastRelance(), now)>=0 && ChronoUnit.DAYS.between(cand.getLastRelance(), now)<=7) {
								// @RG - EMAIL : Dans la campagne de mail "Vos priorités cette semaine", pour le rapport, les candidatures "J'ai relancé" concernées sont celles relancées la semaine passée
								user.addAiRelance(cand);
							}
							break;
						}
						case A_POSTULE : {
							if (cand.getLastCandidature() != null && ChronoUnit.DAYS.between(cand.getLastCandidature(), now)>=0 && ChronoUnit.DAYS.between(cand.getLastCandidature(), now)<=7) {
								// @RG - EMAIL : Dans la campagne de mail "Vos priorités cette semaine", pour le rapport, les candidatures "J'ai postulé" concernées sont celles postulées la semaine passée
								user.addAiPostule(cand);
							}
							// @RG - EMAIL : Dans la campagne de mail "Vos priorités cette semaine", pour la priorité DOIS_RELANCER, les candidatures concernées sont celles disposant d'un rappel de type 'RELANCE CANDIDATURE' dans la semaine à venir
							if(cand.getLastRappelCandidatureRelance()!=null && ChronoUnit.DAYS.between(now, cand.getLastRappelCandidatureRelance())>=0 && ChronoUnit.DAYS.between(now, cand.getLastRappelCandidatureRelance())<7) {
								if(cand.getLastRelance()==null || (cand.getLastCandidature() != null && cand.getLastRelance().isBefore(cand.getLastCandidature()))) {
									user.addDoisRelancer(cand); // Pas de relancer depuis la derniere candidature
								}
							}
							break;
						}
						case ENTRETIEN : {

							// priorité sur préparer par rapport à relancer --> implique qu'un autre entretien est prévu et donc qu'une relance est inutile
							// exception s'il y a  déjà eu une prépration avant cette entretien

							if(cand.getNextEntretien()!=null && now.isBefore(cand.getNextEntretien()))
							{
								// @RG - EMAIL : Dans la campagne de mail "Vos priorités cette semaine", pour l'action de préparation à un entretien, les candidatures concernées sont celles ayant un entretien prévu dans la semaine à venir
								if(cand.getLastPreparation()==null || cand.getLastEntretien()==null || cand.getLastPreparation().isBefore(cand.getLastEntretien()))
									user.addPreparer(cand);
							}
							else
							{
								if(cand.getLastRappelEntretienRemercier()!=null && cand.getLastEntretien()!=null && ChronoUnit.DAYS.between(cand.getLastEntretien(), now)>=0 && ChronoUnit.DAYS.between(cand.getLastEntretien(), now)<7) {
									// @RG - EMAIL : Dans la campagne de mail "Vos priorités cette semaine", pour l'action de remerciement suite à un entretien, les candidatures concernées sont celles disposant d'un rappel de type 'REMERCIER ENTRETIEN' et pour lequel l'entretien était la semaine passée
									if(cand.getLastMerci()==null || cand.getLastMerci().isBefore(cand.getLastEntretien()) ) {
										user.addRemercierEntretien(cand); // Pas eu de remercier depuis le dernier entretien
									}
								}
								if(cand.getLastRappelEntretienRelance()!=null && cand.getLastEntretien()!=null && ChronoUnit.DAYS.between(cand.getLastEntretien(), now)>=0 && ChronoUnit.DAYS.between(cand.getLastEntretien(), now)<7) {  //--> si le rappel est dans la semaine à venir --> Relancer
									// @RG - EMAIL : Dans la campagne de mail "Vos priorités cette semaine", pour l'action de relance suite à un entretien, les candidatures concernées sont celles disposant d'un rappel de type 'RELANCE ENTRETIEN' et pour lequel l'entretien était la semaine passée
									if(cand.getLastRelance()==null || cand.getLastRelance().isBefore(cand.getLastEntretien()) ) {
										user.addRelancerEntretien(cand); // Pas eu de relancer depuis le dernier entretien
									}
								}
							}
							// On dénombre les entretien créés la semaine passée
							if (cand.getLastEntretienCree()!=null && cand.getLastEntretienCree()!=null && ChronoUnit.DAYS.between(cand.getLastEntretienCree(), now)>=0 && ChronoUnit.DAYS.between(cand.getLastEntretienCree(), now)<=7) {
								// @RG - EMAIL : Dans la campagne de mail "Vos priorités cette semaine", pour le reporting, les candidatures concernées sont celles avec un entretien créé la semaine passée
								user.addEntretienCount();
							}
							break;
						}
					}
				}
			}
		}
		catch (Exception e)
		{
			log.error(logCode+"-007 MAIL Error processing weekly mail report. userId="+user.getUserId()+" cand="+cand.getId()+" error="+e);
		}
    }
    
    public static void updateCandidatureReportFromEvent(CandidatureReport cand, CandidatureEvent evt)
    {
        // types d'evts
        //1 : "Je dois relancer", 2 : "Echange de mail", 3 : "Entretien", 4 : "J'ai postulé",
        //5 : "J'ai relancé", 6 : "Archiver", 7 : "Rappel", 8 : "Note"

        LocalDateTime now = LocalDateTime.now();

        if(evt.getEventTime()!=0)
        {
            LocalDateTime evtTime =  new Timestamp(evt.getEventTime()).toLocalDateTime();
            LocalDateTime evtCreation = new Timestamp(evt.getCreationTime()).toLocalDateTime();

            int type = evt.getEventType();
            int subType = evt.getEventSubType();

            if(type==Constantes.TypeEvt.ENTRETIEN.ordinal() && (cand.getLastEntretien()==null || evtTime.isAfter(cand.getLastEntretien())))
                cand.setLastEntretien(evtTime);
            else if (type == Constantes.TypeEvt.AI_PREPARE.ordinal() && (cand.getLastPreparation()==null || evtTime.isAfter(cand.getLastPreparation())))
                cand.setLastPreparation(evtTime);
            else if (type == Constantes.TypeEvt.AI_REMERCIE.ordinal() && (cand.getLastMerci()==null || evtTime.isAfter(cand.getLastMerci())))
                cand.setLastMerci(evtTime);
            else if (type == Constantes.TypeEvt.AI_POSTULE.ordinal() && (cand.getLastCandidature()==null || evtTime.isAfter(cand.getLastCandidature())))
                cand.setLastCandidature(evtTime);
            else if (type == Constantes.TypeEvt.AI_RELANCE.ordinal() && (cand.getLastRelance()==null || evtTime.isAfter(cand.getLastRelance())))
                cand.setLastRelance(evtTime);
            else if (type == Constantes.TypeEvt.RAPPEL.ordinal() && subType == Constantes.TypeSubEvt.RAPPEL_POSTULE_RELANCE.ordinal() && (cand.getLastRappelCandidatureRelance()==null || evtTime.isBefore(cand.getLastRappelCandidatureRelance())))
            	cand.setLastRappelCandidatureRelance(evtTime);
            else if (type == Constantes.TypeEvt.RAPPEL.ordinal() && subType == Constantes.TypeSubEvt.RAPPEL_ENTRETIEN_RELANCE.ordinal() && (cand.getLastRappelEntretienRelance()==null || evtTime.isBefore(cand.getLastRappelEntretienRelance())))
            	cand.setLastRappelEntretienRelance(evtTime);
            else if (type == Constantes.TypeEvt.RAPPEL.ordinal() && subType == Constantes.TypeSubEvt.RAPPEL_ENTRETIEN_REMERCIER.ordinal() && (cand.getLastRappelEntretienRemercier()==null || evtTime.isBefore(cand.getLastRappelEntretienRemercier())))
            	cand.setLastRappelEntretienRemercier(evtTime);

            if(type==Constantes.TypeEvt.ENTRETIEN.ordinal())
            {
            	// détermination du nextEntretien
                if(now.isBefore(evtTime))
                {
                    if(cand.getNextEntretien()==null || evtTime.isBefore(cand.getNextEntretien()))  // cet entretien est plus proche dans le temps qu'un autre entretien
                        cand.setNextEntretien(evtTime);
                }
                // détermination du lastEntretienCree
                if(cand.getLastEntretienCree()==null || evtCreation.isAfter(cand.getLastEntretienCree())) {
                	cand.setLastEntretienCree(evtCreation);
                }
            }

            if(cand.getLastActivity()==null || evtTime.isAfter(cand.getLastActivity()))
                cand.setLastActivity(evtTime);
        }
        else
        {   // pas d'événement mais une candidature avec un état et un lastUpdate
            if(cand.getId()!=0)
            {
                int etat = cand.getEtat();
                LocalDateTime candTime = new Timestamp(cand.getLastUpdate()).toLocalDateTime();

                if (cand.getLastActivity() == null)
                    cand.setLastActivity(candTime);

                if (etat == Constantes.Etat.A_POSTULE.ordinal() && cand.getLastCandidature() == null)
                    cand.setLastCandidature(candTime);
                else if (etat == Constantes.Etat.ENTRETIEN.ordinal() && cand.getLastEntretien() == null)
                    cand.setLastEntretien(candTime);
            }
        }
    }
    
    public static String replaceSpecialsCharacters(String text) { 
    	return text == null ? null : Normalizer.normalize(text, Form.NFD).replaceAll("\\p{InCombiningDiacriticalMarks}+", ""); 
    }
    
    public static String getStringFromTimestamp(Timestamp timestamp, String pattern) {
    	LocalDateTime localDate = null;
    	String result = null; 
    	
    	if (timestamp != null && pattern != null) {
    		localDate = timestamp.toLocalDateTime();
    		result = localDate.format(DateTimeFormatter.ofPattern(pattern));
    	}
        
        return result; 
    }

    public static String getStringFromLong(long time, String pattern) {
    	LocalDateTime localDate = null;
    	Timestamp timeStamp = null;
    	String result = null; 
    	
    	if (time != 0 && pattern != null) {
    		timeStamp = new Timestamp(time);
    		localDate = timeStamp.toLocalDateTime();
    		result = localDate.format(DateTimeFormatter.ofPattern(pattern));
    	}
        
        return result; 
    }
    
    public static String hmacDigest(String msg, String keyString, String algo)
    {
        //log.info("params : "+msg+" / "+keyString);
        String digest = null;
        try
        {
            SecretKeySpec key = new SecretKeySpec((keyString).getBytes("UTF-8"), algo);
            Mac mac = Mac.getInstance(algo);
            mac.init(key);

            byte[] bytes = mac.doFinal(msg.getBytes("ASCII"));

            StringBuffer hash = new StringBuffer();
            for (int i = 0; i < bytes.length; i++) {
                String hex = Integer.toHexString(0xFF & bytes[i]);
                if (hex.length() == 1) {
                    hash.append('0');
                }
                hash.append(hex);
            }
            digest = hash.toString();
        }
        catch (Exception e)
        {
            log.error(logCode+"-006 CANDIDATURE hmacDigest error : "+e);
        }
        return digest;
    }
    
    public static String getIp(HttpServletRequest request) {
    	 String ip = request.getHeader("X-Forwarded-For");
         if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
             ip = request.getHeader("Proxy-Client-IP");
         }
         if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
             ip = request.getHeader("WL-Proxy-Client-IP");
         }
         if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
             ip = request.getHeader("HTTP_CLIENT_IP");
         }
         if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
             ip = request.getHeader("HTTP_X_FORWARDED_FOR");
         }
         if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
             ip = request.getRemoteAddr();
         }
         return ip;
    }
    
    public static boolean isIpConseiller(HttpServletRequest request) {
    	boolean res = false;
    	String ip;
    	String userAgent;
    	String [] tabIp;
    	String ipUser;
	
    	if (request != null) {
    		ip = getIp(request);
    		userAgent = request.getHeader("User-Agent");
    		 
    		if (ip != null && !StringUtils.containsIgnoreCase(userAgent, "pila")) {
    			// il ne s'agit pas d'une borne PILA
    			tabIp = ip.split(",");
    	    	ipUser = tabIp[0];
				// On vérifie l'ip de l'utilisateur avec les IP des conseillés
				/*for(int i=0 ; i<Constantes.tabIpConseiller.length; i++) {
					if(ipUser.equals(Constantes.tabIpConseiller[i])) {
						res = true;
						break;
					}
				}*/
				res = tabIpConseiller.isInRange(ipUser);
    		}
    	}
		return res;
    }
}
