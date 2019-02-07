package fr.gouv.motivaction.service;

import java.io.IOException;
import java.io.InputStream;
import java.net.*;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Properties;
import java.util.StringTokenizer;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.ws.rs.core.MultivaluedMap;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import com.codahale.metrics.Timer;

import fr.gouv.motivaction.Constantes;
import fr.gouv.motivaction.Constantes.JobBoardUrl;
import fr.gouv.motivaction.dao.CandidatureDAO;
import fr.gouv.motivaction.dao.CandidatureEventDAO;
import fr.gouv.motivaction.dao.UserDAO;
import fr.gouv.motivaction.exception.OffreExpiredException;
import fr.gouv.motivaction.mails.MailTools;
import fr.gouv.motivaction.model.Candidature;
import fr.gouv.motivaction.model.CandidatureEvent;
import fr.gouv.motivaction.model.User;
import fr.gouv.motivaction.utils.Utils;
import net.fortuna.ical4j.model.Dur;
import net.fortuna.ical4j.model.TimeZone;
import net.fortuna.ical4j.model.TimeZoneRegistry;
import net.fortuna.ical4j.model.TimeZoneRegistryFactory;
import net.fortuna.ical4j.model.component.VEvent;
import net.fortuna.ical4j.model.component.VTimeZone;
import net.fortuna.ical4j.model.property.CalScale;
import net.fortuna.ical4j.model.property.Method;
import net.fortuna.ical4j.model.property.ProdId;
import net.fortuna.ical4j.model.property.Version;

/**
 * Created by Alan on 12/04/2016.
 */
public class CandidatureService {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "009";

    public static Timer saveCandidaturesTimer = Utils.metricRegistry.timer("saveCandidaturesTimer");
    public static Timer saveCandidatureStateTimer = Utils.metricRegistry.timer("saveCandidatureStateTimer");
    public static Timer saveCandidatureDateTimer = Utils.metricRegistry.timer("saveCandidatureDateTimer");
    public static Timer removeCandidatureTimer = Utils.metricRegistry.timer("removeCandidatureTimer");
    public static Timer saveCandidatureEventTimer = Utils.metricRegistry.timer("saveCandidatureEventTimer");
    public static Timer removeCandidatureEventTimer = Utils.metricRegistry.timer("removeCandidatureEventTimer");
    /*public static Timer removeCandidatureEventsTimer = Utils.metricRegistry.timer("removeCandidatureEventsTimer");
    public static Timer setCandidatureExpiredTimer = Utils.metricRegistry.timer("setCandidatureExpiredTimer");*/

    static Properties propSlack;
    public static String lbbSecret;
    public static VTimeZone tz;

    static {
        loadSlackProperties();
    }

    private static void loadSlackProperties()
    {
        propSlack = new Properties();
        InputStream in = null;

        try
        {
            in = MailService.class.getResourceAsStream("/fr/gouv/motivaction/properties/secret.properties");
            propSlack.load(in);

            lbbSecret = propSlack.getProperty("lbbSecret");

            in.close();
        }
        catch (IOException e)
        {
            log.error(logCode + "-005 CANDIDATURES properties error=" + e);
        }

        TimeZoneRegistry registry = TimeZoneRegistryFactory.getInstance().createRegistry();
        TimeZone timeZone = registry.getTimeZone("Europe/Paris");
        if (timeZone!=null) {
        	tz = timeZone.getVTimeZone();
        } 
    }


    public static Object [] getCandidatures(Long userId) throws Exception
    {
        return CandidatureDAO.list(userId, false);
    }

    public static Candidature getCandidature(Long userId, Long candidatureId) throws Exception
    {
        return CandidatureDAO.load(userId, candidatureId);
    }

    public static boolean isDoublon(MultivaluedMap<String,String>form, long userId) throws Exception
    {
        String sourceId = form.getFirst("sourceId");

        boolean result = false;
        if(sourceId != null)
            result = CandidatureDAO.isDoublon(userId,sourceId);

        return result;
    }

    public static Candidature saveCandidatures(MultivaluedMap<String,String>form, long userId) throws Exception
    {
        Candidature candidature = null;

        final Timer.Context context = saveCandidaturesTimer.time();

        try
        {
            candidature = new Candidature();
            candidature.setUserId(userId);

            String tok = form.getFirst("id");
            if (tok != null)
                candidature.setId(Long.parseLong(tok));

            candidature.setNomCandidature(form.getFirst("nomCandidature"));

            candidature.setNomSociete(form.getFirst("nomSociete"));
            candidature.setNumSiret(form.getFirst("numSiret"));
            candidature.setDescription(form.getFirst("description"));
            candidature.setNote(form.getFirst("note"));

            /*tok = form.getFirst("dateCandidature");
            if(tok!=null)
                candidature.setDateCandidature(new Timestamp(Long.parseLong(tok)));*/

            tok = form.getFirst("etat");
            if (tok != null) {
                // Provisoirement en attendant de trouver d'où vient le problème
                try {
                    candidature.setEtat(Integer.parseInt(tok));
                } catch (Exception e) {
                    candidature.setEtat(Constantes.Etat.VA_POSTULER.ordinal());
                    log.error(logCode + "-001 Error mapping etat. valorisé à 0 par défaut. userId=" + userId + " error=" + e);
                }
            }

            tok = form.getFirst("archived");
            candidature.setArchived((tok != null) ? 1 : 0);

            candidature.setVille(form.getFirst("ville"));
            candidature.setPays(form.getFirst("pays"));

            candidature.setNomContact(form.getFirst("nomContact"));
            candidature.setEmailContact(form.getFirst("emailContact"));
            candidature.setTelContact(form.getFirst("telContact"));

            String urlSource = form.getFirst("urlSource");  // gestion des + dans les urls qui sont remplacés par des espaces
            if (urlSource != null)
                urlSource = urlSource.replaceAll(" ", "+");
            candidature.setUrlSource(urlSource);

            candidature.setLogoUrl(form.getFirst("logoUrl"));

            candidature.setSourceId(form.getFirst("sourceId"));
            if(candidature.getSourceId()!=null && candidature.getSourceId().length()>45)
                candidature.setSourceId(candidature.getSourceId().substring(0,45));

            candidature.setJobBoard(form.getFirst("jobBoard"));
            if(candidature.getJobBoard()!=null && candidature.getJobBoard().length()>45)
                candidature.setJobBoard(candidature.getJobBoard().substring(0, 45));

            tok = form.getFirst("type");
            if (tok != null)
                candidature.setType(Integer.parseInt(tok));

            tok = form.getFirst("rating");
            if (tok != null)
                candidature.setRating(Integer.parseInt(tok));

            tok = form.getFirst("isButton");
            if (tok != null) 
                candidature.setIsButton(1); // PE.FR et LBB utilise ce parametre isButton lors d'import depuis l'extérieur (clic sur bouton MEMO)
            
            candidature.setId(CandidatureDAO.save(candidature));
        }
        catch (Exception e)
        {
            throw new Exception(e);
        }
        finally
        {
            context.stop();
        }

        return candidature;
    }

    public static Candidature saveCandidatureState(MultivaluedMap<String,String>form, long userId) throws Exception
    {
        Candidature candidature = null;

        final Timer.Context context = saveCandidatureStateTimer.time();

        try
        {
            candidature = new Candidature();
            candidature.setUserId(userId);

            String tok = form.getFirst("id");
            candidature.setId(Long.parseLong(tok));

            tok = form.getFirst("etat");
            if (tok != null)
                candidature.setEtat(Integer.parseInt(tok));

            tok = form.getFirst("archived");
            candidature.setArchived((tok != null) ? 1 : 0);

            tok = form.getFirst("rating");
            if (tok != null)
                candidature.setRating(Integer.parseInt(tok));

            CandidatureDAO.updateState(candidature);
        }
        catch (Exception e)
        {
            throw new Exception(e);
        }
        finally
        {
            context.stop();
        }

        return candidature;
    }

    public static Candidature saveCandidatureDateFromEvent(CandidatureEvent evt) throws Exception
    {
        Candidature candidature = null;
        int typeEvt;
        
        final Timer.Context context = saveCandidatureDateTimer.time();

        try
        {
            if (evt != null) {
            	typeEvt = evt.getEventType();

            	if(typeEvt==Constantes.TypeEvt.AI_POSTULE.ordinal() || typeEvt==Constantes.TypeEvt.AI_RELANCE.ordinal() || typeEvt==Constantes.TypeEvt.ENTRETIEN.ordinal()) {
	            	candidature = new Candidature();
		            candidature.setId(evt.getCandidatureId());
		            
		            if(typeEvt==Constantes.TypeEvt.AI_POSTULE.ordinal())
		                candidature.setDateCandidature(evt.getEventTime());
		            else if(typeEvt==Constantes.TypeEvt.AI_RELANCE.ordinal())
		                candidature.setDateRelance(evt.getEventTime());
		            else if(typeEvt==Constantes.TypeEvt.ENTRETIEN.ordinal())
		                candidature.setDateEntretien(evt.getEventTime());
		            	            
		            CandidatureDAO.updateDate(candidature);
            	}
            }
        }
        catch (Exception e)
        {
            throw new Exception(e);
        }
        finally
        {
            context.stop();
        }

        return candidature;
    }

    public static void removeCandidature(long id, long userId) throws Exception
    {
        final Timer.Context context = removeCandidatureTimer.time();

        try
        {
            CandidatureDAO.remove(id, userId);
            AttachmentService.removeCandidatureAttachments(id, userId);
        }
        catch (Exception e)
        {
            throw new Exception(e);
        }
        finally
        {
            context.stop();
        }
    }

    public static void removeCandidatureEvent(long eventId, long candidatureId, long userId) throws Exception
    {
        final Timer.Context context = removeCandidatureEventTimer.time();

        try
        {
            CandidatureEventDAO.removeEvent(eventId, candidatureId, userId);
        }
        catch (Exception e)
        {
            throw new Exception(e);
        }
        finally
        {
            context.stop();
        }
    }

    public static String getHtmlContentFromUrl(String url, boolean isGeneric) throws Exception
    {
        String u = translateURL(url);

        //log.info(url+" ----------------- "+u);

        u = u.replaceAll(" ","+");  // correction de la suppression des + par des espaces

        String res = "";

        CookieHandler.setDefault(new CookieManager(null,CookiePolicy.ACCEPT_ALL));  // permet la connexion à la recette PE.fr

        URL Url = new URL(u);

        try
        {
            HttpURLConnection con = (HttpURLConnection) Url.openConnection();

            con.setConnectTimeout(15 * 1000);
            con.setReadTimeout(15 * 1000);

            // User Agent nécessaire pour certains jobboards
            con.setRequestProperty("User-Agent", "curl/7.38.0");

            InputStream is = con.getInputStream();

            // Encoding character
            String encoding = con.getContentEncoding();
            encoding = getEncodingFromURL(encoding, u);
            // ContentType character
            String contentType = "";
            if (con.getContentType() != null && con.getContentType().indexOf("charset=") > 0) {
                contentType = con.getContentType();
                contentType = contentType.substring(contentType.indexOf("charset=") + 8, contentType.length());
                contentType = contentType.toUpperCase();
            }

            if (contentType != "" && !contentType.equals(encoding)) {
                // En conflit, dans certains cas, tel qu'avec carriere.info.fr
                encoding = contentType;
            }

            /* commentaire essai de traitement avec cookie pour Linkedin
            Map<String, List<String>> headerFields = con.getHeaderFields();
            Set<String> headerFieldsSet = headerFields.keySet();
            Iterator<String> hearerFieldsIter = headerFieldsSet.iterator();

            String cookieString = "";

            while (hearerFieldsIter.hasNext())
            {
                String headerFieldKey = hearerFieldsIter.next();
                if ("Set-Cookie".equalsIgnoreCase(headerFieldKey))
                {
                    List<String> headerFieldValue = headerFields.get(headerFieldKey);
                    for (String headerValue : headerFieldValue)
                    {
                        log.info("Cookie Found...");
                        String[] fields = headerValue.split("; *");

                        String cookieValue = fields[0];

                        log.info("cookieValue:" + cookieValue);
                        cookieString+=cookieValue+"; ";

                    }
                }
            }
            log.info("test");

            is.close();
            Url = new URL("https://www.linkedin.com/voyager/api/jobs/jobPostings/287941303");
            con = Url.openConnection();
            // User Agent nécessaire pour certains jobboards
            con.setRequestProperty("User-Agent", "Mozilla/5.0");
            con.setRequestProperty("Cookie",cookieString);
            is = con.getInputStream();*/

            res = IOUtils.toString(is, encoding);

            res = getRelevantContentFromHTML(res, u, isGeneric);
        }
        catch (java.net.SocketTimeoutException e)
        {
            log.error(logCode + "-018 Error timemout import offre. url="+url+" error=" + e);
            res = "error";
        }
        catch (Exception e)
        {
            log.error(logCode + "-019 Error import Offre. url="+url+" error=" + e);
            res = "error";
        }

        return res;
    }
    
    public static String getOffrePoleEmploiFromAPI(String url) throws Exception
    {
        String res = null;
        String accessToken = null;

        try {
        	accessToken = APIService.getPoleEmploiAPIAccessToken();
        	res = APIService.getPoleEmploiAPIOffres(APIService.getIdOffreFromUrlPoleEmploi(url), accessToken);
        	
        } catch(Exception e) {
        	log.error(logCode + "-011 Error getting offre via API Offre. url="+url+" error=" + e);
        }
        return res;
    }
    
    public static String checkOffreExpired(Candidature c) throws Exception
    {
        String u = translateURL(c.getUrlSource());

        URL Url = new URL(u);

        String res = "";

        int codeResponse;
        InputStream is = null;

        HttpURLConnection con = (HttpURLConnection)Url.openConnection();

        con.setConnectTimeout(15 * 1000);
        con.setReadTimeout(15 * 1000);

        codeResponse = con.getResponseCode();

        if (codeResponse == HttpURLConnection.HTTP_NOT_FOUND) {
        	//is = con.getErrorStream();
            res = "expired";

        } else {
        	is = con.getInputStream();
            String encoding = con.getContentEncoding();
            encoding = getEncodingFromURL(encoding, u);
            res = IOUtils.toString(is, encoding);
            res = getIsExpiredFromHTML(res, u);
        }

        return res;
    }


    // en cas d'url alternative, retourne une url "garantie"
    public static String translateURL(String u)
    {
        String res = u;
        if(Utils.isInDomain(u,"labonneboite"))
            res = translateURLLaBonneBoite(u);
        else if(Utils.isInDomain(u,"pole-emploi"))
            res = translateURLPoleEmploi(u);
        else if(Utils.isInDomain(u,"pe-qvr"))
            res = translateURLPoleEmploi(u);
        else if(Utils.isInDomain(u,"apec.fr"))
            res = translateURLApec(u);
        else if(Utils.isInDomain(u,"marketvente."))
            res = translateURLMarketvente(u);
        else if(Utils.isInDomain(u,"indeed."))
            res = translateURLIndeed(u);
        else if(Utils.isInDomain(u,"qapa."))
            res = translateURLQapa(u);

        return res;
    }

    // transforme des URL marketvente en url stepstone
    public static String translateURLMarketvente(String u)
    {
        String idOffre = u;
        String res = "http://www.stepstone.fr/emploi--Titre-offre-emploi--";

        // forme attendue http://www.stepstone.fr/emploi--Titre-offre-emploi--1234564-inline.html
        // forme en entrée
        // a ) http://www.marketvente.fr/index.cfm?event=offerView.dspOfferInline&offerId=1234564&CID=JaJob-cv-insert-08-2017_ps_2_2_offertitle&jacid=4491674_08-2017_3-7_rg-2_ct-ci&p=3&t=7&nctid=20170831&intcid=jajob-regextend&bl=r&sl=AE5336F3742333708
        // b ) http://www.marketvente.fr/emploi--CHARGE-DE-RECOUVREMENT-H-F-Rambouillet-RECOCASH--733788-inline.html

        if(u.indexOf("offerId=")>-1)
        {
            idOffre = u.substring(u.indexOf("offerId=") + 8);
            if (idOffre.indexOf("&") != -1)
                idOffre = idOffre.substring(0, idOffre.indexOf("&"));
        }
        else
        {
            idOffre = u.substring(0,u.indexOf("-inline.htm"));
            idOffre = idOffre.substring(idOffre.lastIndexOf("-")+1);
        }

        res += idOffre+"-inline.html";

        return res;
    }

    // transforme des URL apec en une url avec des données accessibles
    public static String translateURLApec(String u)
    {
        String idOffre = u;
        String res = "https://cadres.apec.fr/cms/webservices/offre/public?numeroOffre=";
        // forme attendue https://cadres.apec.fr/cms/webservices/offre/public?numeroOffre=161524336W
        // forme en entrée https://cadres.apec.fr/offres-emploi-cadres/0_0_0_161824336W__________offre-d-emploi-developpeur-php-h-f.html?numIdOffre=161524336W&selectedElement=0&sortsType=SCORE&sortsDirection=DESCENDING&nbParPage=20&typeAffichage=detaille&page=0&motsCles=d%C3%A9veloppeur&xtmc=developpeur&xtnp=1&xtcr=1&retour=%2Fhome%2Fmes-offres%2Frecherche-des-offres-demploi%2Fliste-des-offres-demploi.html%3FmotsCles%3Dd%25C3%25A9veloppeur%26sortsType%3DSCORE%26sortsDirection%3DDESCENDING

        idOffre = u.substring(u.indexOf("numIdOffre") + 11);
        if (idOffre.indexOf("&")!=-1)
        	idOffre = idOffre.substring(0, idOffre.indexOf("&"));

        return res + idOffre;
    }

    // transforme des URL Indeed en une url avec des données accessibles
    public static String translateURLIndeed(String u)
    {
        String idOffre = u;
        String res = "https://www.indeed.fr/m/viewjob?jk=";
        // a1 forme attendue https://www.indeed.fr/m/viewjob?jk=52db384e8c6c7791
        // a2 forme en entrée https://www.indeed.fr/jobs?q=informaticien&l=Paris%20(75)&vjk=d429e7c15ab1251a
        // a3 forme en entrée https://www.indeed.fr/m/viewjob?jk=52db384e8c6c7791&from=serp&prevUrl=https%3A%2F%2Fwww.indeed.fr%2Fm%2Fjobs%3Fq%3Dsecretaire%2Bmedicale%26vjk%3D6d6ffd9bdc5a83df%26l%3DVilleurbanne%2B%252869%2529
        // b1 https://www.indeed.fr/cmp/EMS-Inc./jobs/Assistante-Commerciale-Administrative-Matériel-Médical-549f9e9d46ebc2e6?sjdu=QwrRXKrqZ3CNX5W-O9jEvYHXq6EmUuJHDdM5N896Ej81CrEYnYdVN5YiFWsak9mSWaCgS7AzkzHBDfIULlK1iWzdoouL1HSgOzorkAS62sgbVOn81RSYF4G5Q5r9xoDJP4ZnFZw...
        // b2 https://www.indeed.fr/cmp/EURO-DIFFUSION-MEDICALE/jobs/Assistante-Direction-817d7ad8121eb5e1

        if(u.indexOf("jk=")>=0)     //a1-3
        {
            idOffre = u.substring(u.indexOf("jk=")+3);
            if (idOffre.indexOf("&")!=-1)
                idOffre = idOffre.substring(0, idOffre.indexOf("&"));
        }
        else
        {
            String tmp = u;
            if (tmp.indexOf("?") >= 0)      // b1
                tmp = tmp.substring(0, u.indexOf("?"));
            //else b2

            idOffre = tmp.substring(tmp.lastIndexOf("-") + 1);
        }

        res += idOffre;

        return res;
    }

    // transforme des URL QAPA en une url avec des données accessibles
    public static String translateURLQapa(String u)
    {
        String idOffre = u;
        String res = "https://api.qapa.fr/api/offers/";
        // forme attendue https://api.qapa.fr/api/offers/41868574/show?projection=web.detail
        // forme en entrée http://www.qapa.fr/offres-d-emploi/peintre-enduiseur-enduiseuse-briancon/41868574

        String oId = "";
        StringTokenizer st = new StringTokenizer(u,"/");
        while(st.hasMoreTokens())
            oId = st.nextToken();

        res += oId;
        res+="/show?projection=web.detail";

        return res;
    }




    // transforme des URL pole emploi en une url avec des données accessibles
    public static String translateURLPoleEmploi(String u)
    {
        String url = u;
        String res = u;
        int tokenRank = 0;
        // forme attendue : https://candidat.pole-emploi.fr/offres/recherche/detail/1712795
        // forme alternative 1 : http://offre.pole-emploi.fr/040JGSS
        // forme alternative 2 : http://logp6.xiti.com/go.url?xts=475540&xtor=EPR-11-[Abonnement_Offres]&url=http://offre.pole-emploi.fr/040JGSS
        // forme alternative 3 : https://candidat.pole-emploi.fr/offres/selection/detail/065HWKG
        // forme alternative 4 : https://candidat.pole-emploi.fr/offres/recherche/cv/detail/3602963
        // forme alternative 5 : https://candidat.pole-emploi.fr/offres/candidature/detail/065VTRG

        if(u.indexOf(".xiti.")>=0)
            url = u.substring(u.indexOf("&url=")+5);
        else if(url.indexOf("offre.pole")>=0)
            tokenRank = 3;
        else if (url.indexOf("/cv/detail")>=0)
            tokenRank = 7;
        else
            tokenRank = 6;

        if(tokenRank>0) {
            StringTokenizer st = new StringTokenizer(url, "/");
            String id = "";
            for (int i = 0; i < tokenRank; ++i)
                id=  st.nextToken();

            if(u.indexOf("pe-qvr")>=0)      // verrue pour le serveur de recette de PE
                res = "https://candidat-r.pe-qvr.fr/offres/recherche/detail/"+id;
            else
                res = "https://candidat.pole-emploi.fr/offres/recherche/detail/"+id;
        }

        return res;
    }

    
    
    // a) https://labonneboite.pole-emploi.fr/api/v1/office/41040901500998/details
    // b) https://labonneboite.pole-emploi.fr/38396013500275/details
    public static String translateURLLaBonneBoite(String u)
    {
        // ajout des paramètres suivants:
        // &timestamp=2017-05-11T10:06:20
        // &user=memo
        // &signature=

        Instant in = Instant.now();
        OffsetDateTime odt = in.atOffset(ZoneOffset.UTC);
        String ts = odt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        ts = ts.substring(0,ts.indexOf('.'));

        try
        {
            ts = URLEncoder.encode(ts,"UTF-8");
        }
        catch (Exception e){}

        String params = "timestamp="+ts+"&user=memo";

        String url="";

        if(u.indexOf("/api/v1/")>=0)    // cas a
        {
            url = u;
        }
        else    // cas b
        {
            StringTokenizer st = new StringTokenizer(u,"/",false);
            url = "https://labonneboite.pole-emploi.fr/api/v1/office/";
            st.nextToken();
            st.nextToken();
            url+=st.nextToken()+"/"+st.nextToken();
        }

        String res=url+"?"+params;

        String signature = hmacDigest(params,lbbSecret,"HmacMD5");
        res+="&signature="+signature;

        /*if(res.startsWith("https"))
            res = "http"+res.substring(5);*/

        return res;
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

    public static String getEncodingFromURL(String encoding,String url)
    {
        String res = encoding==null?"UTF-8":encoding;

        if(url.indexOf("leboncoin.fr")>=0)
            res = "ISO-8859-1";
        else if (url.indexOf("cadremploi.fr")>=0)
            res = "iso-8859-15";
        else if (url.indexOf("jobalim.com")>=0)
            res = "iso-8859-15";
        else if (url.indexOf("vitijob.com")>=0)
            res = "iso-8859-15";
        return res;
    }

    public static String getRelevantContentFromHTML(String html, String url, boolean isGeneric) throws Exception
    {
        String res="";
        String jobBoard = "";
        String jobId = "";

        //log.info("url  : "+url+" / "+html);

        try {
        	if(isGeneric)
                res = getRelevantContentFromGenericSource(html);
            else if(Utils.isInDomain(url,"labonneboite"))
            {
                jobBoard = "labonneboite";
                res = getJobIdFromLaBonneBoite(url);
                res += getRelevantContentFromLaBonneBoite(html);
            }
            else if(Utils.isInDomain(url,"pole-emploi"))
            {
            	jobBoard = "pole-emploi";
                res = getJobIdFromPoleEmploi(url);
            	res += getRelevantContentFromPoleEmploi(html);
            }
            else if(Utils.isInDomain(url,"leboncoin.fr"))
            {
            	jobBoard = "leboncoin.fr";
                res = getJobIdFromLeBonCoin(url);
            	res += getRelevantContentFromLeBonCoin(html);
            }
            else if(Utils.isInDomain(url,"indeed.fr"))
            {
            	jobBoard = "indeed.fr";
                res = getJobIdFromIndeed(url);
            	res += getRelevantContentFromIndeed(html);
            }
            else if(Utils.isInDomain(url,"vivastreet.com"))
            {
            	jobBoard = "vivastreet.com";
                res = getJobIdFromVivastreet(url);
            	res += getRelevantContentFromVivastreet(html);
            }
            else if(Utils.isInDomain(url,"monster.fr"))
            {
            	jobBoard = "monster.fr";
            	jobId = getJobIdFromMonster(url);
            	// Pas de scrapping, recup via API
            	res = getRelevantContentFromMonster(html, jobId);
        	}
            else if(Utils.isInDomain(url,"keljob.com"))
            {
            	jobBoard = "keljob.com";
                res = getJobIdFromKeljob(url);
            	res += getRelevantContentFromKeljob(html);
    		}
            else if(Utils.isInDomain(url,"cadremploi.fr"))
            {
            	jobBoard = "cadremploi.fr";
                res = getJobIdFromCadremploi(url);
            	res += getRelevantContentFromCadremploi(html);
            }
            else if(Utils.isInDomain(url,"linkedin.com"))
            {
                jobBoard = "linkedin.com";
                res = getRelevantContentFromLinkedin(html);
            }
            else if(Utils.isInDomain(url,"envirojob.fr"))
            {
                jobBoard = "envirojob.fr";
                res = getJobIdFromEnvirojob(url);
                res += getRelevantContentFromEnvirojob(html);
			}
            else if(Utils.isInDomain(url,"apec.fr"))
            {
            	jobBoard = "apec.fr";
                res = getJobIdFromApec(url);
                // Pas de scrapping, recup via API
                res += getRelevantContentFromApec(html);
            }
            else if(Utils.isInDomain(url,"meteojob.com"))
            {
            	jobBoard = "meteojob.com";
                res = getJobIdFromMeteoJob(url);
            	res += getRelevantContentFromMeteojob(html);
        	}
            else if(Utils.isInDomain(url,"jobalim.com"))
            {
                jobBoard = "jobalim.com";
                res = getJobIdFromJobalimVitijob(url);
                res += getRelevantContentFromJobalimVitijob(html);
            }
            else if(Utils.isInDomain(url,"vitijob.com"))
            {
                jobBoard = "vitijob.com";
                res = getJobIdFromJobalimVitijob(url);
                res += getRelevantContentFromJobalimVitijob(html);
            }
            else if(Utils.isInDomain(url,"stepstone."))
            {
                jobBoard = "StepStone";
                res = getJobIdFromStepStone(url);
                res += getRelevantContentFromStepStone(html);
            }
            else if(Utils.isInDomain(url,"qapa."))
            {
                jobBoard = "QAPA";
                res = getJobIdFromQapa(url);
                res += getRelevantContentFromQapa(html);
            }
            else if(Utils.isInDomain(url,JobBoardUrl.ADECCO.getDomaine()))
            {
                jobBoard = JobBoardUrl.ADECCO.toString();
                res = getJobIdFromAdecco(url);
                res += getRelevantContentFromAdecco(html);
            }
            else if(Utils.isInDomain(url,JobBoardUrl.MANPOWER.getDomaine()))
            {
                jobBoard = JobBoardUrl.MANPOWER.toString();
                res = getJobIdFromManpower(url);
                res += getRelevantContentFromManpower(html);
            }
            else if(Utils.isInDomain(url,JobBoardUrl.RANDSTAD.getDomaine()))
            {
                jobBoard = JobBoardUrl.RANDSTAD.toString();
                res = getJobIdFromRandstad(url);
                res += getRelevantContentFromRandstad(html);
            }
            else if(Utils.isInDomain(url,"job.com") && (
                        Utils.isInDomain(url,"ouestjob.com") ||
                        Utils.isInDomain(url,"parisjob.com") ||
                        Utils.isInDomain(url,"nordjob.com") ||
                        Utils.isInDomain(url,"centrejob.com") ||
                        Utils.isInDomain(url,"estjob.com") ||
                        Utils.isInDomain(url,"rhonealpesjob.com") ||
                        Utils.isInDomain(url,"sudouestjob.com") ||
                        Utils.isInDomain(url,"pacajob.com")
                    ))
            {
            	jobBoard = "RegionsJob.com";
                res = getJobIdFromRegionsJob(url);
                res += getRelevantContentFromRegionsjob(html);
        	} else
                res = getRelevantContentFromGenericSource(html);    // cas des imports génériques par bouton

        }
        catch (Exception e)
        {
        	if(!e.getClass().getName().equals(OffreExpiredException.class.getName())) { 
        		// Exception différente d'OffreExpiredException 
	        	try
	            {
	        		res = "error";
	                log.error(logCode + "-003 Error processing import on server. url=" + url + " error=" + e);
	
	                if (!isGeneric) {
		        		// Mails aux admins pour alerter la bascule vers l'import générique
		        		MailService.sendMailReport(Utils.concatArrayString(MailTools.tabEmailIntra, MailTools.tabEmailDev, MailTools.tabEmailExtra), "Avertissement " + MailTools.env + " d'import MEMO de " + jobBoard + " basculé vers import générique", "L'import n'a pas été fait pour l'url suivante : " + url + " error : " + e);
		        		res = getRelevantContentFromGenericSource(html);
		        	} else {
		        		// Mails aux admins pour analyser le problème sur l'import
	                    MailService.sendMailReport(Utils.concatArrayString(MailTools.tabEmailIntra, MailTools.tabEmailDev, MailTools.tabEmailExtra), "Erreur " + MailTools.env + " d'import MEMO générique", "L'import générique n'a pas été fait pour l'url suivante : " + url);
		        	}
	        	}
	            catch(Exception ex)
	            {
	                res = "error";
	                // Mails aux admins pour analyser le problème sur l'import
	                log.error(logCode + "-004 Error processing import on server. url=" + url + " error=" + ex);
	                MailService.sendMailReport(Utils.concatArrayString(MailTools.tabEmailIntra, MailTools.tabEmailDev, MailTools.tabEmailExtra), "Erreur " + MailTools.env + " d'import MEMO générique", "L'import générique n'a pas été fait pour l'url suivante : " + url + " error : " + ex);
	        	}
        	}
            else
            {
        		res = "expired";
        	}
        }

        return res;
    }

	public static String getIsExpiredFromHTML(String html, String url) throws Exception
    {
        String res="ok";

        if(Utils.isInDomain(url,"labonneboite"))
            res = getIsExpiredFromLaBonneBoite(html);
        else if(Utils.isInDomain(url,"pole-emploi"))
            res = getIsExpiredFromPoleEmploi(html);
        else if(Utils.isInDomain(url,"leboncoin.fr"))
            res = getIsExpiredFromLeBonCoin(html);
        else if(Utils.isInDomain(url,"indeed.fr"))
            res = getIsExpiredFromIndeed(html);
        else if(Utils.isInDomain(url,"monster.fr"))
            res = getIsExpiredFromMonster(html);
        else if(Utils.isInDomain(url,"keljob.com"))
            res = getIsExpiredFromKeljob(html);
        else if(Utils.isInDomain(url,"cadremploi.fr"))
            res = getIsExpiredFromCadremploi(html);
        else if(Utils.isInDomain(url,"linkedin.com"))
            res = getIsExpiredFromLinkedin(html);
        else if(Utils.isInDomain(url,"envirojob.fr"))
            res = getIsExpiredFromEnvirojob(html);
        else if(Utils.isInDomain(url,"apec.fr"))
            res = getIsExpiredFromApec(html);
        else if(Utils.isInDomain(url,"vivastreet.com"))
            res = getIsExpiredFromVivastreet(html);
        else if(Utils.isInDomain(url,"meteojob.com"))
            res = getIsExpiredFromMeteojob(html);
        else if(Utils.isInDomain(url,"vitijob.com"))
            res = getIsExpiredFromJobalimVitijob(html);
        else if(Utils.isInDomain(url,"jobalim.com"))
            res = getIsExpiredFromJobalimVitijob(html);
        else if(Utils.isInDomain(url,"stepstone."))
            res = getIsExpiredFromStepStone(html);
        /*else if(Utils.isInDomain(url,"qapa."))
            res = getIsExpiredFromQapa(html);*/
        else if(Utils.isInDomain(url, JobBoardUrl.ADECCO.getDomaine()))
            res = getIsExpiredFromAdecco(html);
        else if(Utils.isInDomain(url, JobBoardUrl.MANPOWER.getDomaine()))
            res = getIsExpiredFromManpower(html);
        else if(Utils.isInDomain(url,"job.com") && (
                Utils.isInDomain(url,"ouestjob.com") ||
                        Utils.isInDomain(url,"parisjob.com") ||
                        Utils.isInDomain(url,"nordjob.com") ||
                        Utils.isInDomain(url,"centrejob.com") ||
                        Utils.isInDomain(url,"estjob.com") ||
                        Utils.isInDomain(url,"rhonealpesjob.com") ||
                        Utils.isInDomain(url,"sudouestjob.com") ||
                        Utils.isInDomain(url,"pacajob.com")
        ))
            res = getIsExpiredFromRegionsjob(html);

        return res;
    }

	private static String getRelevantContentFromGenericSource(String html) throws Exception
    {
        String res = "";
        String title = "";

        if(html.indexOf("<title>")>-1)
        	title = html.substring(html.indexOf("<title>")+7, html.indexOf("</title"));
        else if (html.indexOf("<TITLE>")>-1)
            title = html.substring(html.indexOf("<TITLE>")+7, html.indexOf("</TITLE"));
        if (html.indexOf("<body")>-1)
        	res = html.substring(html.indexOf("<body"), html.indexOf("</body"));
        else if (html.indexOf("<BODY")>-1)
        	res = html.substring(html.indexOf("<BODY"), html.indexOf("</BODY"));

        res+="<h0>"+title+"</h0></body>";   // l'ajout du title en h0 est un recours en cas d'absence de title dans les h1

        return res;
    }

	private static String getRelevantContentFromMeteojob(String html) throws Exception {
		String res=  "";

		//<div class="mj-offer-details mj-block"
    	if (html.indexOf("<div class=\"mj-offer-details mj-block") >0) {
			if (html.indexOf("<section class=\"offer-apply-form") > 0)
	    		res = html.substring(html.indexOf("<div class=\"mj-offer-details mj-block"), html.indexOf("<section class=\"offer-apply-form"));
	    	else if (html.indexOf("<a class=\"report-pb") > 0)
	    		res = html.substring(html.indexOf("<div class=\"mj-offer-details mj-block"), html.indexOf("<a class=\"report-pb"));
	    	else if (html.indexOf("<a class=\"sub-actions") > 0)
	    		res = html.substring(html.indexOf("<div class=\"mj-offer-details mj-block"), html.indexOf("<a class=\"sub-actions"));
    	}

		return res;
	}

    public static String getJobIdFromMeteoJob(String url)
    {
        // a https://www.meteojob.com/candidat/offres/offre-d-emploi-responsable-communication-h-f-paris-ile-de-france-immobilier-infrastructures-cdi-5121064?utm_source=Jobrapido&amp;utm_campaign=CDI&amp;rx_source=Jobrapido&amp;rx_campaign=jobrapido2&amp;rx_medium=cpc
        // b https://www.meteojob.com/candidat/offres/offre-d-emploi-responsable-des-ressources-humaines-h-f-essonne-logistique-transport-de-biens-courrier-cdi-5180960
        // c https://www.meteojob.com/candidate/offers/candidateViewOffer.mj?mofferId=5186119
        // d https://www.meteojob.com/candidate/offers/candidateViewOffer.mj?mofferId=5189314&amp;my-meteo=true&amp;auth=-9lqGuv90dQV02EBxgDdjVzuFr-u2nAcLReG7ZH3RZHpTG1tbleaM-B801Kn6FbK&amp;utm_source=mailing&amp;utm_medium=email&amp;utm_campaign=newOfferAlert_HotOff...
        // e https://www.meteojob.com/jobsearch/offers/4800077

        String res = "";

        try
        {
            res = "offreId=";
            String oId;

            if(url.indexOf("mofferId")>=0)
            {   // c et d
                oId = url.substring(url.indexOf("mofferId=")+9);
                if(oId.indexOf("&amp")>0)
                    oId = oId.substring(0,oId.indexOf("&amp"));
            }
            else if(url.indexOf("offers")>0)
            {   // e
                oId = url.substring(url.lastIndexOf("/")+1);
            }
            else
            {   // a et b
                oId = url;
                if(oId.indexOf("?")>0)
                    oId = oId.substring(0,oId.indexOf("?"));

                oId = oId.substring(oId.lastIndexOf("-")+1);
            }

            res += oId + "\n";
        }
        catch (Exception e)
        {
            //log.info("bug meteojob "+e+" - "+url);
            res = "";
        }
        return res;
    }

    private static String getIsExpiredFromMeteojob(String html) {
        String res=  "ok";

        if(html.indexOf("Page non trouvée")>=0)
            res = "expired";
        else if(html.indexOf("n'existe pas ou plus.")>=0)
            res = "expired";
        else if(html.indexOf("voir a déjà été pourvue")>=0)
            res = "expired";

        return res;
    }

    private static String getRelevantContentFromJobalimVitijob(String html) throws Exception {
        String res=  "";

        //<div class="mj-offer-details mj-block"
        if ("ok".equals(getIsExpiredFromJobalimVitijob(html))) {
        	// L'offre n'est pas expirée

            if (html.indexOf("<div id=\"conteneur_centre") >= 0)
            {
                res = html.substring(html.indexOf("<div id=\"conteneur_centre"));

                if(res.indexOf("</mx:inclusion")>=0)
                    res = res.substring(0, res.indexOf("</mx:inclusion"));
                else
                {
                    res = res.substring(0,res.indexOf("<div id=\"bas\""));
                    res = res.substring(0,res.lastIndexOf("</div"));
                    res = res.substring(0,res.lastIndexOf("</div"));
                }
            }
        } else {
        	throw new OffreExpiredException();
        }

        return res;
    }

    public static String getJobIdFromJobalimVitijob(String url)
    {
        // a http://www.jobalim.com/agroalimentaire-offre-33810-Directeur-supply-chain-et-production-HF.htm
        // - b http://www.vitijob.com/vin-offre-36657-Ouvrier-polyvalent-vigne-cave-HF-base-a-Limeray.htm

        String res = "";

        try
        {
            res = "offreId=";
            String oId = url.substring(url.indexOf("-offre-")+7);
            oId = oId.substring(0,oId.indexOf("-"));
            res += oId + "\n";
        }
        catch (Exception e)
        {
            //log.info("bug jobalim/vitijob "+e+" - "+url);
            res = "";
        }
        return res;
    }


	private static String getIsExpiredFromJobalimVitijob(String html) {
    	String res=  "ok";

    	if(html.indexOf("Cette offre n'est plus référencée")>=0)
    		res = "expired";

        return res;
	}

    private static String getRelevantContentFromPoleEmploi(String html) throws Exception
    {
        String res=  "";

        if ("ok".equals(getIsExpiredFromPoleEmploi(html))) {
        	// L'offre n'est pas expirée
            // Utilisation de la lib de scrapping Jsoup pour récupérer tout le bloc du descriptif de l'offre
            Document doc = Jsoup.parse(html);
            if (doc.select("div.modal-details") != null) {
	            Element element = doc.select("div.modal-details").first(); //div with class=masthead
	            if(element != null)
	            	res = element.html();
            }
        } else {
        	throw new OffreExpiredException();
        }
        
        return res;
    }

    public static String getIsExpiredFromPoleEmploi(String html) throws Exception
    {
        String res=  "ok";

        if(html.indexOf("L'offre que vous souhaitez consulter n'est plus disponible")>=0)
            res = "expired";

        return res;
    }

    public static String getJobIdFromPoleEmploi(String url)
    {
        String res = "";

        try
        {
            // https://candidat.pole-emploi.fr/candidat/rechercheoffres/detail/040JGSS
            res = "offreId=";
            String oId = url.substring(url.lastIndexOf("/") + 1);
            res += oId + "\n";
        }
        catch (Exception e)
        {
            //log.info("bu PE "+e+" - "+url);
            res = "";
        }
        return res;
    }

    public static String getRelevantContentFromLeBonCoin(String html) throws Exception
    {
        String res=  "";

        res = html.substring(html.indexOf("<header role=\"banner"));
        res = res.substring(0,res.indexOf("<footer"));

        return res;
    }

    public static String getIsExpiredFromLeBonCoin(String html) throws Exception
    {
        String res=  "ok";

        if(html.indexOf("<h1>Cette annonce est d")>=0)
            res = "expired";

        return res;
    }

    public static String getJobIdFromLeBonCoin(String url)
    {
        String res = "";

        try
        {
            res = "offreId=";
            String oId = "";

            if (url.indexOf(".htm") >= 0)
            {   
            	//https://www.leboncoin.fr/offres_d_emploi/1524666150.htm/
            	url = url.substring(0, url.indexOf(".htm")+4);
                oId = url.substring(url.lastIndexOf("/") + 1, url.indexOf(".htm"));
            } else {   //https://www.leboncoin.fr/ar/form/0?ca=3_s&amp;id=1145355271
                oId = url.substring(url.indexOf("id=") + 3);
            }

            res += oId + "\n";
        }
        catch (Exception e)
        {
            res = "";
        }

        return res;
    }

    public static String getRelevantContentFromIndeed(String html) throws Exception
    {
        String res=  "";

        res = html.substring(html.indexOf("<p"));
        res = res.substring(0,res.indexOf("<hr"));

        return res;
    }

    public static String getJobIdFromIndeed(String url)
    {
        // a1 https://www.indeed.fr/m/viewjob?jk=cef9d8d43b676c27&amp;from=rje&amp;rgtk=1bidupi6t1d53fbv&amp;dupclk=0
        // a2 https://www.indeed.fr/voir-emploi?jk=cb3497c3b2f63479
        // b1 https://www.indeed.fr/cmp/EMS-Inc./jobs/Assistante-Commerciale-Administrative-Matériel-Médical-549f9e9d46ebc2e6?sjdu=QwrRXKrqZ3CNX5W-O9jEvYHXq6EmUuJHDdM5N896Ej81CrEYnYdVN5YiFWsak9mSWaCgS7AzkzHBDfIULlK1iWzdoouL1HSgOzorkAS62sgbVOn81RSYF4G5Q5r9xoDJP4ZnFZw...
        // b2 https://www.indeed.fr/cmp/EURO-DIFFUSION-MEDICALE/jobs/Assistante-Direction-817d7ad8121eb5e1
        String res  = "";

        try
        {
            res = "offreId=";
            String oId = "";

            if (url.indexOf("jk=") >= 0)
            {
                if (url.indexOf("&amp;") >= 0)  // forme a1
                    oId = url.substring(url.indexOf("jk=") + 3, url.indexOf("&amp;"));
                else    // forme a2
                    oId = url.substring(url.indexOf("jk=") + 3);
            }
            else
            {
                String tmp = url;
                if (url.indexOf("?") >= 0)  // b1
                    tmp = tmp.substring(0, url.indexOf("?"));
                // else b2
                oId = tmp.substring(tmp.lastIndexOf("-") + 1);
            }

            res += oId + "\n";
        }
        catch (Exception e)
        {
            res = "";
        }

        return res;
    }

    public static String getRelevantContentFromVivastreet(String html) throws Exception
    {
        String res=  "";

        if(html.indexOf("<div id=\"classified-detail-block")>=0)
        {
            res = html.substring(html.indexOf("<div id=\"classified-detail-block"));
            res = res.substring(0, res.lastIndexOf("<div class=\"kiwii-fine-span-68"));
        }
        else
        {
            res = html.substring(html.indexOf("<div id=\"r_clad_block"));
            res = res.substring(0, res.lastIndexOf("<div class=\"ads-header"));
        }

        return res;
    }

    public static String getJobIdFromVivastreet(String url)
    {
        // a http://annonces-emploi.vivastreet.com/informatique-internet-telecom+alfortville-94140/gestionnaire-de-donn-es--h-f-/147868580
        // b http://annonces-emploi.vivastreet.com/sante+laboulbene-81100/cadre-de-sante--h-f-/147753461/r?utm_source=adzuna&amp;utm_medium=Aggregator&amp;utm_campaign=France-Aggregator-adzuna-premium-jobs-job_offers&amp;cmpid=173#

        String res = "";

        try
        {
            res = "offreId=";
            String oId = url;

            if (url.indexOf("/r?") >= 0) {   // forme a
                oId = oId.substring(0, oId.indexOf("/r?"));
            }
            //else // forme b

            oId = oId.substring(oId.lastIndexOf("/") + 1);

            res += oId + "\n";
        }
        catch (Exception e)
        {
            //log.info("bug VIVASTREET "+e+" - "+url);
            res = "";
        }

        return res;
    }

    public static String getIsExpiredFromIndeed(String html) throws Exception
    {
        String res=  "ok";

        if(html.indexOf("Cet emploi n'est plus disponible")>=0)
            res = "expired";

        return res;
    }

    public static String getIsExpiredFromVivastreet(String html) throws Exception
    {
        String res=  "ok";

        if(html.indexOf("id=\"header-tag\"")>=0)
            res = "expired";

        return res;
    }

    public static String getRelevantContentFromMonster(String html, String jobId) throws Exception
    {
        String res = "";
        String url = "https://offre-demploi.monster.fr/v2/job/pure-json-view?jobid=";
        

        if (jobId != null) {
	        CookieHandler.setDefault(new CookieManager(null,CookiePolicy.ACCEPT_ALL));  // permet la connexion à la recette PE.fr
	
	        URL Url = new URL(url+jobId);
	
	        try
	        {
	            HttpURLConnection con = (HttpURLConnection) Url.openConnection();
	
	            con.setConnectTimeout(15 * 1000);
	            con.setReadTimeout(15 * 1000);
	
	            
	            // User Agent nécessaire pour certains jobboards
	            con.setRequestProperty("User-Agent", "curl/7.38.0");
	
	            InputStream is = con.getInputStream();
	
	            // Encoding character
	            String encoding = con.getContentEncoding();
	            encoding = getEncodingFromURL(encoding, url);
	            // ContentType character
	            String contentType = "";
	            if (con.getContentType() != null && con.getContentType().indexOf("charset=") > 0) {
	                contentType = con.getContentType();
	                contentType = contentType.substring(contentType.indexOf("charset=") + 8, contentType.length());
	                contentType = contentType.toUpperCase();
	            }
	
	            if (contentType != "" && !contentType.equals(encoding)) {
	                // En conflit, dans certains cas, tel qu'avec carriere.info.fr
	                encoding = contentType;
	            }
	
	            res = IOUtils.toString(is, encoding); //"{\"companyInfo\":{\"yearFounded\":0,\"name\":\"Atix Interim\",\"profileUrl\":\"<span id=\'TrackingJobBody\'>\", }}";
	        }
	        catch (java.net.SocketTimeoutException e)
	        {
	            log.error(logCode + "-018 Error timemout import offre. url="+url+" error=" + e);
	            res = "error";
	        }
	        catch (Exception e)
	        {
	            log.error(logCode + "-019 Error import Offre. url="+url+" error=" + e);
	            res = "error";
	        }
        }

        return res;
    }

    public static String getJobIdFromMonster(String url)
    {
        // a -> https://offre-demploi.monster.fr/Charg%C3%A9-e-de-mission-communication-CDD-H-F-Paris-IDF-France-LA-BANQUE-POSTALE/31/048ba66a-5d58-47ca-a50e-cc2a1e3664b8
        // b -> http://offre-emploi.monster.fr/GetJob.aspx?JobID=179275758&amp;WT.mc_n=CRM_FR_B2C_LR_Search_1
        // c -> http://offre-emploi.monster.fr/assistant-e-commercial-e-trilingue-anglais-espagnol-italien-hf-offre-emploi-beauvais-hdf-france-184252826.aspx?en_at=1&amp;mescoid=4300758001001&amp;jobPosition=2
        // d -> https://offre-demploi.monster.fr/Senior-Relationship-Manager-Legal-M-F-H-F-Luxembourg-LU-INTERTRUST/11/169382637?rje=0&tk=&en_at=1&intcid=js
        // e http://offre-emploi.monster.fr/responsable-de-magasin-h-f-boulangerie-artisanale-offre-emploi-marseille-provence-alpes-c%C3%B4te-d'azur-184452540.aspx?mescoid=1101116002005&jobPosition=1

        String res = "";
        String oId;

        try
        {
            oId = url;

            if(StringUtils.indexOfIgnoreCase(oId, "jobid")>=0)
            {   // JobID= --> b
            	oId = oId.substring(StringUtils.indexOfIgnoreCase(oId, "jobid"));
            	if(oId.indexOf("&")>-1) {
            		oId = oId.substring(StringUtils.indexOfIgnoreCase(oId, "jobid=")+6,oId.indexOf("&"));
            	} else {
            		// jobid est le dernier parametre
            		oId = oId.substring(StringUtils.indexOfIgnoreCase(oId, "jobid=")+6,oId.length());
            	}
            }
            else if(oId.indexOf("?")<0)
            {   // pas de ? --> a
                oId = oId.substring(oId.lastIndexOf("/")+1);
            }
            else if(oId.indexOf(".aspx?")>=0)
            {   // .aspx? --> c
                oId = oId.substring(0,oId.indexOf(".aspx?"));
                oId = oId.substring(oId.lastIndexOf("-")+1);
            }
            else
            {   //entre / et ? --> d
                oId = oId.substring(0,oId.indexOf("?"));
                oId = oId.substring(oId.lastIndexOf("/")+1);
            }

            res = oId;
        }
        catch (Exception e)
        {
            //log.info("bug MONSTER "+e+" - "+url);
            res = "";
        }

        return res;
    }

    public static String getIsExpiredFromMonster(String html) throws Exception
    {
        String res=  "ok";

        if(html.indexOf("Cette offre d'emploi n'est plus disponible")>=0 || html.indexOf("Cette offre a expiré")>=0)
            res = "expired";

        return res;
    }

    public static String getRelevantContentFromKeljob(String html) throws Exception
    {
        String res = "";

        res = html.substring(html.indexOf("<div class=\"jobs-detail"));
        res = res.substring(0, res.indexOf("<script type=\"application/ld+json"));

        return res;
    }

    public static String getJobIdFromKeljob(String url)
    {
        // a https://www.keljob.com/offre/acheteur-h-f-20999224?utm_campaign=alert&amp;utm_source=keljob&amp;utm_medium=email
        // b https://www.keljob.com/offre/assistante-e-de-direction-h-f-20758704

        String res = "";

        try
        {
            res = "offreId=";
            String oId = url;

            if(url.indexOf("?") >= 0) {   // forme a
                oId = oId.substring(0, oId.indexOf("?"));
            }
            //else // forme b

            oId = oId.substring(oId.lastIndexOf("-") + 1);

            res += oId + "\n";
        }
        catch (Exception e)
        {
            //log.info("bug KJ "+e+" - "+url);
            res = "";
        }

        return res;
    }

    public static String getIsExpiredFromKeljob(String html) throws Exception
    {
        String res=  "ok";

        if(html.indexOf("La page demandée n'existe pas ou plus.")>=0)
            res = "expired";

        return res;
    }

    public static String getJobIdFromStepStone(String url)
    {
        // a http://www.stepstone.fr/emploi--Macon-Maconne-H-F-Nancy-SYNERGIE--720647-inline.html
        // b http://www.stepstone.fr/emploi--Comptable-en-Delegation-H-F-Paris-Page-Personnel--725614-inline.html?suid=a33bc748-5d15-4153-b0f5-131f65c3ff7d&rltr=3_3_25_dynrl_m_0_0

        String res = "";

        try
        {
            res = "offreId=";
            String oId = url.substring(0,url.indexOf(".html"));
            oId = oId.substring(oId.lastIndexOf("--")+2,oId.lastIndexOf("-"));

            res += oId + "\n";
        }
        catch (Exception e)
        {
            //log.info("bug KJ "+e+" - "+url);
            res = "";
        }

        return res;
    }
    
    public static String getRelevantContentFromStepStone(String html) throws Exception
    {
        String res = "";

        res = html.substring(html.indexOf("<div class=\"listing-content"));
        if (res.indexOf("<section data-location=")>0)
        	res = res.substring(0, res.indexOf("<section data-location="));

        return res;
    }
    
    public static String getIsExpiredFromStepStone(String html) throws Exception
    {
        String res=  "ok";

        if(html.indexOf("Cette offre d'emploi n'est plus disponible")>=0)
            res = "expired";

        return res;
    }

    public static String getJobIdFromManpower(String url)
    {
        // a https://www.manpower.fr/candidats/detail-offre-d-emploi/interim/boucher-ouvrier-boucher/beauvais/1100153632.html

        String res = "", oId;

        try
        {
            res = "offreId=";
            oId = url;

            if (url.indexOf(".html") >= 0) 
            {   
                oId = url.substring(url.lastIndexOf("/") + 1, url.indexOf(".html"));
            }
            res += oId + "\n";
        }
        catch (Exception e)
        {
            res = "";
        }

        return res;
    }

    public static String getRelevantContentFromManpower(String html) throws Exception
    {
        String res = html;

        if (res.indexOf("<section class=\"content resultat\">")>=0)
        	res = res.substring(res.indexOf("<section class=\"content resultat\">"));
        
        if (res.indexOf("<p class=\"font-politique\">")>=0)
        	res = res.substring(0, res.indexOf("<p class=\"font-politique\">"));

        return res;
    }
    
    public static String getIsExpiredFromManpower(String html) throws Exception
    {
        String res=  "ok";

        if(html.indexOf("Cette offre d'emploi n'est plus disponible")>=0)
            res = "expired";

        return res;
    }

    public static String getJobIdFromRandstad(String url)
    {
        // a https://www.randstad.fr/offre/001-FIG-R000253_01R/BOUCHER_F_H_/

        String res = "", oId = "", tmp;

        try
        {
            res = "offreId=";
            tmp = url;

            if (url.indexOf("/offre/") >= 0) 
            {   
            	tmp = url.substring(url.indexOf("/offre/")+7);
                oId = tmp.substring(0, tmp.indexOf("/"));
            }
            res += oId + "\n";
        }
        catch (Exception e)
        {
            res = "";
        }

        return res;
    }

    public static String getRelevantContentFromRandstad(String html) throws Exception
    {
        String res = html;

        if (res.indexOf("<div class=\"job-offer-share\">")>=0)
        	res = res.substring(0, res.indexOf("<div class=\"job-offer-share\">"));
        
        return res;
    }
    
    public static String getIsExpiredFromRandstad(String html) throws Exception
    {
        String res=  "ok";

        if(html.indexOf("Cette offre d'emploi n'est plus disponible")>=0)
            res = "expired";

        return res;
    }
    
    public static String getJobIdFromAdecco(String url)
    {
        // a https://www.adecco.fr/offres-d-emploi/preparateur-de-commande-hf-verneuil-en-halatte/?ID=abc2b9a9-4d5f-40d4-a6fd-20b8b38ad99e

        String res = "", oId;

        try
        {
            res = "offreId=";
            oId = url;

            if(StringUtils.indexOfIgnoreCase(oId, "id")>=0)
            {   // ID
            	oId = oId.substring(StringUtils.indexOfIgnoreCase(oId, "id"));
            	if(oId.indexOf("&")>-1) {
            		oId = oId.substring(StringUtils.indexOfIgnoreCase(oId, "id=")+3,oId.indexOf("&"));
            	} else {
            		// ID est le dernier parametre
            		oId = oId.substring(StringUtils.indexOfIgnoreCase(oId, "id=")+6,oId.length());
            	}
            }

            res += oId + "\n";
        }
        catch (Exception e)
        {
            res = "";
        }

        return res;
    }

    public static String getRelevantContentFromAdecco(String html) throws Exception
    {
        String res = html;

        if (res.indexOf("<div class=\"box job-full\">")>=0)
        	res = res.substring(res.indexOf("<div class=\"box job-full\">"));
        
        if (res.indexOf("<footer class=\"box-footer\">")>=0)
        	res = res.substring(0, res.indexOf("<footer class=\"box-footer\">"));

        return res;
    }
    
    public static String getIsExpiredFromAdecco(String html) throws Exception
    {
        String res=  "ok";

        if(html.indexOf("Cette offre d'emploi n'est plus disponible")>=0)
            res = "expired";

        return res;
    }
    
    public static String getRelevantContentFromApec(String html) throws Exception
    {
        return html;
    }

    public static String getJobIdFromApec(String url)
    {
        String res = "";

        try
        {
            res = "offreId=";
            String oId = url.substring(url.lastIndexOf("=") + 1);
            res += oId + "\n";
        }
        catch (Exception e)
        {
            res = "";
        }

        return res;
    }

    public static String getIsExpiredFromApec(String html) throws Exception
    {
        String res=  "ok";

        if(html.indexOf("Etat HTTP 404")>=0)
            res = "expired";

        return res;
    }

    // retourne directement le json résultat
    public static String getRelevantContentFromLaBonneBoite(String html) throws Exception
    {
        return html;
    }

    public static String getJobIdFromLaBonneBoite(String url)
    {   // https://labonneboite.pole-emploi.fr/api/v1/office/41040901500998/details

        String res = "";
        try
        {
            res = "offreId=";

            String oId = url.substring(0, url.indexOf("/details"));
            oId = oId.substring(oId.lastIndexOf("/") + 1);

            res += oId + "\n";
        }
        catch (Exception e)
        {
            //log.info("bug LBB "+e+" - "+url);
            res = "";
        }

        return res;
    }


    public static String getIsExpiredFromLaBonneBoite(String html) throws Exception
    {
        return "ok";
    }

    public static String getRelevantContentFromCadremploi(String html) throws Exception
    {
        String res = "";

        res = html.substring(html.indexOf("<main"));
        res = res.substring(0, res.indexOf("</main>")+7);

        return res;
    }

    public static String getJobIdFromCadremploi(String url)
    {
        // a https://www.cadremploi.fr/emploi/detail_offre?offreId=156613329810687426
        // b https://www.cadremploi.fr/emploi/detail_offre?offreId=156713427902080289&amp;provenance=alertecv&amp;utm_source=cadremploi&amp;utm_medium=email&amp;utm_campaign=alerte_cv&amp;seen=4&amp;een=880c0b5c8cd867e5e2f344c6c2546bd5&amp;token=eyJ1c2VyaWQiOiJnaW5vL...
        // c https://www.cadremploi.fr/emploi/detail_offre?offreId=156813343098485523#offre-postuler
        // d https://www.cadremploi.fr/emploi/detail_offre?offreId=156813351071482358#

        String res = "";

        try
        {
            res = "offreId=";
            String oId = url.substring(url.indexOf("offreId=") + 8);

            if(oId.indexOf("#")>=0)
                oId = oId.substring(0,oId.indexOf("#"));
            else if(oId.indexOf("&amp;")>=0)
                oId = oId.substring(0,oId.indexOf("&amp;"));

            res += oId + "\n";
        }
        catch (Exception e)
        {
            //log.info("bug Cadremploi "+e+" - "+url);
            res = "";
        }

        return res;
    }

    public static String getIsExpiredFromCadremploi(String html) throws Exception
    {
        String res=  "ok";

        if(html.indexOf("Cette offre n'est plus disponible")>=0)
            res = "expired";
        else if(html.indexOf("Offre inconnue")>=0)
        	res = "expired";
        else if (html.indexOf("cette offre est expirée")>=0)
        	res = "expired";

        return res;
    }

    public static String getRelevantContentFromQapa(String html) throws Exception
    {
        String json = html;
        json = StringUtils.replace(json,"class=\\\"fontSize18\\\"",""); // retrait d'un élément qui provoque l'empêchement du JSON.parse côté client

        return json;
    }

    public static String getJobIdFromQapa(String url)
    {
        // a https://api.qapa.fr/api/offers/41868574/show?projection=web.detail

        String res = "";

        try
        {
            res = "offreId=";
            String oId = url.substring(0, url.lastIndexOf("/"));
            oId = oId.substring(oId.lastIndexOf("/")+1);
            res += oId + "\n";
        }
        catch (Exception e)
        {
            res = "";
        }

        return res;
    }

    /*  Réponse 404 sur requête vers api QAPA lorsqu'offre expirée
    public static String getIsExpiredFromQapa(String html) throws Exception
    {
    }
    */

    public static String getRelevantContentFromLinkedin(String html) throws Exception
    {
        //log.info("LINKED IN HTML : "+html);
        String res = "";

        res = html.substring(html.indexOf("<section id=\"main-content"));
        res = res.substring(0, res.indexOf("<section id=\"sidebar"));

        return res;
    }

    public static String getIsExpiredFromLinkedin(String html) throws Exception
    {
        String res=  "ok";

        if(html.indexOf("Les candidatures ne sont plus acceptées pour cette annonce.")>=0)
            res = "expired";

        return res;
    }

    public static String getRelevantContentFromEnvirojob(String html) throws Exception
    {
        String res = "";

        if ("ok".equals(getIsExpiredFromEnvirojob(html))) {
        	// L'offre n'est pas expirée
        	res = html.substring(html.indexOf("<div class=\"offre"));
            res = res.substring(res.indexOf("<table"),res.indexOf("<form"));
        } else {
        	throw new OffreExpiredException();
        }

        return res;
    }

    public static String getJobIdFromEnvirojob(String url)
    {
        // a http://www.envirojob.fr/emploi/cdd/technicien-ne-support-utilisateurs/ej28162/

        String res = "";

        try
        {
            res = "offreId=";
            String oId = url.substring(0,url.lastIndexOf("/"));
            oId = oId.substring(oId.lastIndexOf("/")+1);

            res += oId + "\n";
        }
        catch (Exception e)
        {
            res = "";
        }

        return res;
    }

    public static String getIsExpiredFromEnvirojob(String html) throws Exception
    {
        String res=  "ok";

        if(html.indexOf("Désolé, cette offre est introuvable")>=0)
            res = "expired";

        return res;
    }


    public static String getRelevantContentFromRegionsjob(String html) throws Exception
    {
        String res = "";

        if ("ok".equals(getIsExpiredFromRegionsjob(html))) {
        	// L'offre n'est pas expirée
        	res = html.substring(html.indexOf("<div id=\"annonce"));
            if (res.indexOf("<div id=\"load-profils-candidats")>0) {
            	res = res.substring(0, res.indexOf("<div id=\"load-profils-candidats"));
            }
        } else {
        	throw new OffreExpiredException();
        }

        return res;
    }

    public static String getJobIdFromRegionsJob(String url)
    {
        // a http://www.rhonealpesjob.com/emplois/charge-administratif-service-facturation-h-f-1485520.html
        // b http://www.rhonealpesjob.com/emplois/graduate-program-supply-chain-h-f-1485985.html# // annonce chartée parser invalide
        // c http://www.pacajob.com/emplois/candidature.html?offre=1497042&amp;application=5
        // d http://www.pacajob.com/emplois/animateur-securite-qualite-environnement-h-f-1496276.html?&amp;utm_source=Adzuna&amp;utm_medium=Metamoteurs-cpc&amp;utm_campaign=Adzuna

        String res = "";

        try
        {
            res = "offreId=";
            String oId;

            if(url.indexOf("?offre=")>=0)
            {   // c
                oId = url.substring(url.indexOf("offre=")+6);
                oId = oId .substring(0,oId.indexOf("&amp"));
            }
            else
            {   // a b d
                oId = url.substring(0, url.indexOf(".htm"));
                oId = oId.substring(oId.lastIndexOf("-")+1);
            }

            res += oId + "\n";
        }
        catch (Exception e)
        {
            //log.info("bug RegionsJob "+e+" - "+url);
            res = "";
        }

        return res;
    }

    public static String getIsExpiredFromRegionsjob(String html) throws Exception
    {
        String res=  "ok";

        if(html.indexOf("Cette offre d'emploi a expiré")>=0)
            res = "expired";
        else if(html.indexOf("Page non trouvée")>=0)
            res = "expired";

        return res;
    }

    public static CandidatureEvent saveCandidatureEvent(MultivaluedMap<String,String>form, long userId) throws Exception
    {
        CandidatureEvent evt = null;

        final Timer.Context context = saveCandidatureEventTimer.time();

        try
        {
            evt = new CandidatureEvent();

            String tok = form.getFirst("id");
            if (tok != null)
                evt.setId(Long.parseLong(tok));

            tok = form.getFirst("candidatureId");
            if (tok != null)
                evt.setCandidatureId(Long.parseLong(tok));

            evt.setComment(form.getFirst("comment"));

            tok = form.getFirst("eventType");
            if (tok != null)
                evt.setEventType(Integer.parseInt(tok));

            tok = form.getFirst("eventSubType");
            if (tok != null)
                evt.setEventSubType(Integer.parseInt(tok));

            tok = form.getFirst("eventTime");
            if (tok != null)
                evt.setEventTime(Long.parseLong(tok));

            evt.setId(CandidatureEventDAO.save(evt));
        }
        catch (Exception e)
        {
            throw new Exception(e);
        }
        finally {
            context.stop();
        }

        return evt;
    }

    public static Object [] getCandidatureEvents(Long userId) throws Exception
    {
        return CandidatureEventDAO.list(userId);
    }

    public static void sendInterviewCalendar(long eventId, long userId)
    {
        try
        {
            CandidatureEvent evt = CandidatureEventDAO.load(eventId);

            if(evt==null)
                throw new Exception("Event not found");
            else
            {
                Candidature cand = CandidatureDAO.load(userId, evt.getCandidatureId());

                if(cand==null)
                    throw new Exception("Candidature not found");
                else
                {
                    User user = UserDAO.loadFromId(userId);

                    // construction de l'email contenant les données de calendrier
                    String title = cand.getNomCandidature();
                    String societe = cand.getNomSociete();
                    boolean addSociete = false;
                    if (societe != null && !societe.equals("")) {
                        addSociete = true;
                        title += " chez " + societe;
                    }

                    String subject = "Entretien pour le poste " + title;

                    VEvent calendarEvent = new VEvent(new net.fortuna.ical4j.model.DateTime(evt.getEventTime()), new Dur(0, 1, 0, 0), subject);

                    // ajout de la notion de timezone à la date de début (important pour la bonne interprétation par Outlook)
                    calendarEvent.getProperties()
                            .getProperty(net.fortuna.ical4j.model.Property.DTSTART)
                            .getParameters()
                            .add(new net.fortuna.ical4j.model.parameter.TzId(tz.getProperties().getProperty(net.fortuna.ical4j.model.Property.TZID).getValue()));

                    calendarEvent.getProperties().add(tz.getTimeZoneId());

                    String description = title;

                    if (cand.getNomContact() != null && !cand.getNomContact().equals(""))
                        description += "\r\n\r\nContact : " + cand.getNomContact();

                    if (cand.getEmailContact() != null && !cand.getEmailContact().equals(""))
                        description += "\r\n\r\nMail contact : " + cand.getEmailContact();

                    if (cand.getTelContact() != null && !cand.getTelContact().equals(""))
                        description += "\r\n\r\nTél Contact : " + cand.getTelContact();

                    if (cand.getDescription() != null && !cand.getDescription().equals(""))
                        description += "\r\n\r\n" + cand.getDescription();

                    // TODO: ajouter un lien direct sur la fiche candidature

                    description += "\r\n\r\n\r\nRetrouvez votre fiche candidature sur votre compte MEMO : " + MailTools.url + "?c=" + cand.getId();

                    calendarEvent.getProperties().add(new net.fortuna.ical4j.model.property.Description(description));
                    calendarEvent.getProperties().add(new net.fortuna.ical4j.model.property.Uid("memoEvent-" + evt.getId()));
                    calendarEvent.getProperties().add(new net.fortuna.ical4j.model.property.Organizer(user.getLogin()));

                    if (addSociete)
                        calendarEvent.getProperties().add(new net.fortuna.ical4j.model.property.Location(societe));

                    net.fortuna.ical4j.model.Calendar cal = new net.fortuna.ical4j.model.Calendar();
                    cal.getProperties().add(new ProdId("-//POLE EMPLOI//Memo//FR"));
                    cal.getProperties().add(Version.VERSION_2_0);
                    cal.getProperties().add(CalScale.GREGORIAN);
                    cal.getProperties().add(Method.REQUEST);
                    cal.getComponents().add(calendarEvent);

                    // ajout de l'objet TimeZone au format pour une meilleure compatibilité avec les clients de calendrier
                    cal.getComponents().add(tz);

                    MailTools.sendInterviewCalendar(user, cal.toString(), subject, description);
                }
            }
        }
        catch (Exception e)
        {
            log.error(logCode+"-002 CAND Error building Interview Calendar Event. userId="+userId+" eventId="+eventId+" error="+e);
        }
    }

    public static void setCandidatureFavorite(long userId, long candidatureId, int status) throws Exception {
        CandidatureDAO.setCandidatureFavorite(userId, candidatureId, status);
    }

    public static ArrayList findCandidaturesByKeyword(long userId, String searchString) throws Exception
    {
        return CandidatureDAO.findCandidaturesByKeyword(userId, searchString);
    }

    public static void anonymizeUserCandidacies(Long userId) throws Exception
    {
        CandidatureDAO.anonymizeUserCandidacies(userId);
        CandidatureEventDAO.anonymizeUserCandidacyEvents(userId);
    }

    // créé et enregistre une candidature vide pour signifier qu'un utilisateur a signalé une reprise d'emploi
    public static void createDummySuccesfulApplication(long userId) throws Exception
    {
        try
        {
            Candidature candidature = new Candidature();
            candidature.setUserId(userId);
            candidature.setType(4);

            candidature.setNomCandidature("Reprise d'emploi");
            candidature.setArchived(1);

            candidature.setId(CandidatureDAO.save(candidature));

            CandidatureEvent evt = new CandidatureEvent();
            evt.setCandidatureId(candidature.getId());
            evt.setComment("Evénement ajouté par MEMO suite à signalement de reprise d'emploi");
            evt.setEventType(6);    // archiver
            evt.setEventSubType(9); // ai le poste
            CandidatureEventDAO.save(evt);
        }
        catch (Exception e)
        {
            log.error(logCode+"-007 CANDIDATURES Error saving dummy succesful application. userId="+userId+" error="+e);
            throw new Exception(e);
        }
    }
}
