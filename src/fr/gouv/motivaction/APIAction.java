package fr.gouv.motivaction;

import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;

import com.codahale.metrics.Timer;

import fr.gouv.motivaction.exception.EmailLoginException;
import fr.gouv.motivaction.exception.LaBonneBoiteAPIException;
import fr.gouv.motivaction.json.CandidatureJson;
import fr.gouv.motivaction.service.APIService;
import fr.gouv.motivaction.utils.Utils;
import net.fortuna.ical4j.model.TimeZone;

/**
 * 
 * @author JR on 08/04/2019
 *
 */
@Path("/api")
public class APIAction {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "050";

    public static Timer apiTimer = Utils.metricRegistry.timer("apiTimer");


    public static Properties propSecret;
    public static Properties propApi;
    
    public static String apiMemoKey;
    public static String apiMemoAlgo;
    public static String apiUserSaveCandidature;

    static {
    	loadSecretProperties();
    }

    private static void loadSecretProperties()
    {
    	propSecret = new Properties();
    	propApi = new Properties();
        InputStream in = null;

        try
        {
            in = APIAction.class.getResourceAsStream("/fr/gouv/motivaction/properties/secret.properties");
            propSecret.load(in);
            apiMemoKey = propSecret.getProperty("apiMemoKey");
            apiMemoAlgo = propSecret.getProperty("apiMemoAlgo");
            in.close();
            
            in = APIAction.class.getResourceAsStream("/fr/gouv/motivaction/properties/api.properties");
            propApi.load(in);
            apiUserSaveCandidature = propApi.getProperty("apiUserSaveCandidature");

            in.close();
        }
        catch (IOException e)
        {
            log.error(logCode + "-001 API Action properties error=" + e);
        }
    }
    
    @POST 
    @Path("v1/candidature")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public String saveCandidatureV1(@Context HttpServletRequest servletRequest, @QueryParam("user") String client, @QueryParam("timestamp") String date, @QueryParam("signature") String signature, CandidatureJson candidatureJson) throws IOException
    {
        String res = "";
        String signature_memo = "";
        long idCandidature = 0;
       
        // @RG - API saveCandidature : les datas peId, emailUtilisateur et numSiret sont obligatoires, clients possibles = [jepostule], la requête est valide pendant 2min et les doublons sont bloqués
        // On controle la valorisation des parametres d'appel
        if(!StringUtils.isEmpty(client) && !StringUtils.isEmpty(date) && !StringUtils.isEmpty(signature)) {
            // on vérifie que l'appellant est autorisé à utiliser l'API
	        if(apiUserSaveCandidature.equals(client)) {
	        	try {
	                LocalDateTime date_memo = Instant.now().atOffset(ZoneOffset.UTC).toLocalDateTime();
	                LocalDateTime date_api = LocalDateTime.parse(date, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
	                
	        		// on vérifie que l'appel n'a pas plus de 2min.
	                if(date_api.until(date_memo, ChronoUnit.MINUTES)<=2) {
	                	signature_memo = Utils.hmacDigest("user=" + client + "&timestamp=" + date, apiMemoKey, apiMemoAlgo);
	                	// on vérifie que les signature sont identiques
	                	if(signature_memo.equals(signature)) {
	                		// on vérifie que la candidature est valorisée
	                		if (candidatureJson != null) {
	                			if (!StringUtils.isEmpty(candidatureJson.getPeId())) {
	                				idCandidature = APIService.saveCandidatureFromAPI(candidatureJson, 0);
	                				if (idCandidature != 0) {
	                					res = "{ \"result\" : \"ok\", \"idCandidature\" : \"" + idCandidature + "\", \"msg\" : \"Application saved\" }";
	                					log.info(logCode + "-009 CANDIDATURE API candidature saved. client="+client+" id="+idCandidature);
	                				} else {
	                					log.error(logCode + "-008 CANDIDATURE API Error saving candidature.");
	                        	    	res = "{ \"result\" : \"error\", \"msg\" : \"The application could not be saved \" }";
	                				}
	                			} else {
	                				log.error(logCode + "-002 CANDIDATURE API Error saving candidature. MEMO user not found.");
	                    	    	res = "{ \"result\" : \"error\", \"msg\" : \"Unknown user PE (peId null) \" }";
	                			}
	                		} else {
	                			log.error(logCode + "-003 CANDIDATURE API Error saving candidature. empty parameters");
	                	    	res = "{ \"result\" : \"error\", \"msg\" : \"Empty data parameters\" }";
	                	    }
	                	} else {
	                		log.error(logCode + "-004 CANDIDATURE API Error saving candidature. Wrong control signature");
	                    	res = "{ \"result\" : \"error\", \"msg\" : \"Wrong authorization\" }";
	                	}
	                } else {
	                	log.error(logCode + "-005 CANDIDATURE API Error saving candidature. Request timestamp too old");
	                	res = "{ \"result\" : \"error\", \"msg\" : \"Timestamp too old (> 2 minutes)\" }";
	                }
	        	} catch(Exception e) {
	        		log.error(logCode + "-006 CANDIDATURE API Error saving candidature. error=" + e);
	    			if (e instanceof LaBonneBoiteAPIException || e instanceof EmailLoginException) {
	    				res = "{ \"result\" : \"error\", \"msg\" : \"" + e.getMessage() + "\" }";
	    			} else {
	    				res = "{ \"result\" : \"error\", \"msg\" : \"The application could not be saved\" }";
	    			};
	        	}
	        	
	        } else {
	        	log.error(logCode + "-007 CANDIDATURE API save candidature. Unknow API client. client="+client);
	        	res = "{ \"result\" : \"error\", \"msg\" : \"Unauthorized client\" }";
	        }
        } else {
			log.error(logCode + "-003 CANDIDATURE API Error saving candidature. empty parameters");
	    	res = "{ \"result\" : \"error\", \"msg\" : \"Empty parameters (client or date or signature)\" }";
        }
        return res;
    }
}
