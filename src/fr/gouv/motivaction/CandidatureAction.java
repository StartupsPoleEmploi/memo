package fr.gouv.motivaction;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Calendar;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedHashMap;
import javax.ws.rs.core.MultivaluedMap;

import org.apache.log4j.Logger;

import com.codahale.metrics.Timer;

import fr.gouv.motivaction.Constantes.JobBoardUrl;
import fr.gouv.motivaction.dao.CandidatureDAO;
import fr.gouv.motivaction.mails.MailTools;
import fr.gouv.motivaction.model.Candidature;
import fr.gouv.motivaction.model.CandidatureEvent;
import fr.gouv.motivaction.service.CandidatureService;
import fr.gouv.motivaction.service.UserService;
import fr.gouv.motivaction.utils.Utils;

/**
 * Created by Alan on 12/04/2016.
 */
@Path("/candidatures")
public class CandidatureAction {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "002";

    public static Timer candidaturesTimer = Utils.metricRegistry.timer("candidaturesTimer");
    public static Timer candidatureTimer = Utils.metricRegistry.timer("candidatureTimer");
    public static Timer candidatureEventsTimer = Utils.metricRegistry.timer("candidatureEventsTimer");
    public static Timer checkOffreTimer = Utils.metricRegistry.timer("checkOffreTimer");
    public static Timer offreTimer = Utils.metricRegistry.timer("offreTimer");

    // retourne la liste des candidatures de l'utilisateur
    @GET
    @Produces({ MediaType.APPLICATION_JSON })
    public String getCandidatures(@Context HttpServletRequest servletRequest)
    {
        String res;
        long userId = UserService.checkUserAuth(servletRequest,true);

        if(userId>0)
        {
            final Timer.Context context = candidaturesTimer.time();

            try
            {
                Object [] candidatures = (Object [])CandidatureService.getCandidatures(userId);

                String cands = "[";
                for(int i=0; i<candidatures.length; ++i)
                {
                    if(i>0)
                        cands+=",";
                    cands+= Utils.gson.toJson((Candidature)candidatures[i]);
                }
                cands +="]";

                res = "{ \"result\" : \"ok\", \"candidatures\" : " + cands + " }";

               // System.out.println(res);
            }
            catch (Exception e)
            {
                log.error(logCode + "-001 Error getting candidature list. userId="+userId+" error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
            finally {
                context.stop();
            }
        }
        else
        {   // message de reconnexion
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    // retourne les infos de la candidature précisée
    @GET
    @Produces({ MediaType.APPLICATION_JSON })
    @Path("{id}")
    public String getCandidature(@Context HttpServletRequest servletRequest, @PathParam("id")long id) throws IOException
    {
        String res;
        long userId = UserService.checkUserAuth(servletRequest,true);
        if(userId>0)
        {
            final Timer.Context context = candidatureTimer.time();

            try
            {
                Candidature candidature = (Candidature)CandidatureService.getCandidature(userId, id);

                if(candidature!=null)
                    res = "{ \"result\" : \"ok\", \"candidature\" : " + Utils.gson.toJson(candidature)+ " }";
                else
                    res = "{ \"result\" : \"error\", \"msg\" : \"notFound\" }"; // remplacer par rest 404

            }
            catch (Exception e)
            {
                log.error(logCode + "-002 Error getting candidature's description. candidatureId="+id+" error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
            finally {
                context.stop();
            }
        }
        else
        {   // message de reconnexion
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }


    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public String saveCandidature(@Context HttpServletRequest servletRequest, MultivaluedMap<String,String> form) throws IOException
    {
        String res;
        long userId = UserService.checkUserAuthWithCSRF(servletRequest, form);

        if(userId>0)
        {
            try
            {
                Candidature cand = CandidatureService.saveCandidatures(form,userId);

                if(form.getFirst("id")!=null)
                    Utils.logUserAction(userId, "Candidature", "Modification", cand.getId());
                else
                    Utils.logUserAction(userId, "Candidature", "Création", cand.getId());

                //System.out.println("Candidature enregistrée : "+cand.getId());

                res = "{ \"result\" : \"ok\", \"id\" : \"" + cand.getId() + "\" }";
            }
            catch (Exception e)
            {
                log.error(logCode + "-003 Error saving candidature. userId=" + userId + " error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    @POST 
    @Path("importFrom")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public String saveCandidatureFrom(@Context HttpServletRequest servletRequest, MultivaluedMap<String,String> form) throws IOException
    {
        String res;
        long userId = UserService.checkUserAuth(servletRequest);
        boolean save = true;

        if(userId>0)
        {
            try
            {
                if(form.getFirst("isButton")!=null && CandidatureService.isDoublon(form, userId))
                    save = false;

                if(save) {
                    Candidature cand = CandidatureService.saveCandidatures(form, userId);

                    if (form.getFirst("id") != null)
                        Utils.logUserAction(userId, "Candidature", "Modification", cand.getId());
                    else
                        Utils.logUserAction(userId, "Candidature", "Création", cand.getId());

                    //System.out.println("Candidature enregistrée : "+cand.getId());

                    res = "{ \"result\" : \"ok\", \"id\" : \"" + cand.getId() + "\" }";
                }
                else
                    res = "{ \"result\" : \"doublon\" }";
            }
            catch (Exception e)
            {
                log.error(logCode + "-016 Error saving candidature from outside. userId=" + userId + " error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }
    
    @POST
    @Path("/state")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public String editCandidatureState(@Context HttpServletRequest servletRequest, MultivaluedMap<String,String> form) throws IOException
    {
        String res;
        long userId = UserService.checkUserAuthWithCSRF(servletRequest, form);

        if(userId>0)
        {
            try
            {
                Candidature cand = CandidatureService.saveCandidatureState(form, userId);

                Utils.logUserAction(userId, "Candidature", "Modification", cand.getId());

                res = "{ \"result\" : \"ok\", \"id\" : \"" + cand.getId() + "\" }";
            }
            catch (Exception e)
            {
                log.error(logCode + "-012 Error saving candidature state. userId=" + userId + " error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    @GET
    @Path("/stateFromEmail/{idCandidature}/{token}/{eventSubType}")
    @Produces({ MediaType.TEXT_HTML })
    public String saveEtatCandidatureFromEmail(@Context HttpServletRequest servletRequest, @PathParam("idCandidature")long idCandidature, @PathParam("token")String token, @PathParam("eventSubType")long eventSubType) throws IOException
    {
    	String res = "<html><head><title>MEMO</title>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1'>" +
                "<meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /> " +
                "<meta http-equiv='X-UA-Compatible' content='IE=edge'>" +
                "<script>setTimeout('window.location.replace(\""+MailTools.url+"/?c="+idCandidature+"\")',10000);</script>" +
                "</head><body style='margin:auto; text-align:center; margin-top:150px'><div style='margin:auto; text-align:center; font-weight: bold; font-family:verdana; font-size:24px'>";
    	long userId;
    	
    	// A partir du token, on récupère le userId
    	userId = UserService.getUserIdFromUpdateCandidatureEmail(token);
        if(userId>0 && idCandidature > 0)
        {
            if (eventSubType != 0) {
            	// Le candidat a eu le poste ou non
	        	try {
	            	MultivaluedMap<String,String> form = new MultivaluedHashMap<>();
	            	form.add("candidatureId", Long.toString(idCandidature));
	            	form.add("eventType", Integer.toString(Constantes.TypeEvt.ENTRETIEN.ordinal()));
	            	form.add("eventSubType", Long.toString(eventSubType));
	            	form.add("eventTime", Long.toString(Calendar.getInstance().getTimeInMillis()));
	            	CandidatureService.saveCandidatureEvent(form, userId);
	            	form.add("id", Long.toString(idCandidature));
	            	form.add("etat", Integer.toString(Constantes.Etat.ENTRETIEN.ordinal()));
	            	form.add("archived", Integer.toString(1));
	            	CandidatureService.saveCandidatureState(form,userId);
	                Utils.logUserAction(userId, "Candidature", "Candidature archivée par email", idCandidature);

	                res += "Votre candidature a été mise à jour.";

	                log.info(logCode+"-012 CANDIDATURE state updated. userId="+userId);
	            }
	            catch (Exception e)
	            {
	                log.error(logCode+"-013 CANDIDATURE Error updating state. userId="+userId+" error="+e);
	                res += "Une erreur s'est produite lors de votre mise à jour de candidature.";
	            }
            } else {
            	// Le candidat n'a pas encore eu de réponse
            	res += "Pensez à relancer pour avoir une réponse.";
            }
        }
        else
        {   // message de reconnexion
            res += "Le lien cliqué ne fonctionne pas";
        }

        res+="<br /><br />Vous allez être redirigé sur le site de MEMO</body></html>";
        return res;
    }
    
    @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    @Path("{id}")
    public String removeCandidature(@Context HttpServletRequest servletRequest, @PathParam("id")long id, MultivaluedMap<String,String> form) throws IOException
    {
        String res;
        long userId = UserService.checkUserAuthWithCSRF(servletRequest,form);

        if(userId>0)
        {
            try
            {
                CandidatureService.removeCandidature(id, userId);

                //System.out.println("Candidature supprimée : " + id);

                Utils.logUserAction(userId, "Candidature", "Suppression", id);

                res = "{ \"result\" : \"ok\", \"id\" : \"" + id + "\" }";
            }
            catch (Exception e)
            {
                log.error(logCode + "-004 Error deleting candidature. userId=" + userId + " candidatureId=" + id + " error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    @Path("{id}/events/{eventId}")
    public String removeCandidatureEvent(@Context HttpServletRequest servletRequest, @PathParam("id")long id, @PathParam("eventId")long eventId, MultivaluedMap<String,String> form) throws IOException
    {
        String res;
        long userId = UserService.checkUserAuthWithCSRF(servletRequest,form);

        if(userId>0)
        {
            try
            {
                CandidatureService.removeCandidatureEvent(eventId, id, userId);

                //System.out.println("Candidature supprimée : " + id);

                Utils.logUserAction(userId, "CandidatureEvent", "Suppression", id);

                res = "{ \"result\" : \"ok\", \"eventId\" : \"" + eventId + "\" }";
            }
            catch (Exception e)
            {
                log.error(logCode + "-009 Error deleting candidature event. userId=" + userId + " candidatureId="+ id+" eventId="+eventId+" error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    @POST
    @Produces(MediaType.TEXT_HTML)
    @Path("offre")
    public String getOffre(@Context HttpServletRequest servletRequest, MultivaluedMap<String,String> form) throws IOException
    {
        String res;

        final Timer.Context context = offreTimer.time();

        String url = form.getFirst("url");

        try
        {

            boolean generic = false;

            if(form.getFirst("generic")!=null)
                generic = true;

            if (Utils.isInDomain(url,"pole-emploi") && !Utils.isInDomain(url,"labonneboite")) {
            	// Pour les offres PE uniquement, le scraping se fait via une API de l'ESD (cet appel ne remplace pas l'existant pr le moment car toutes les données ne sont pas encore disponibles)
            	res = CandidatureService.getOffrePoleEmploiFromAPI(url);
            }
            res = CandidatureService.getHtmlContentFromUrl(url,generic);

            if(res.equals("error"))
                log.error(logCode+"-008 Error parsing url. url="+url);
        }
        catch (Exception e)
        {
            log.error(logCode + "-005 Error getting offre. url="+url+" error=" + e);
            res = "error";
        }
        finally {
            context.stop();
        }

        return res;
    }

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Path("event")
    public String saveCandidatureEvent(@Context HttpServletRequest servletRequest, MultivaluedMap<String,String> form) throws IOException
    {
        String res;

        long userId = UserService.checkUserAuthWithCSRF(servletRequest, form);

        if(userId>0)
        {
            try
            {
                CandidatureEvent evt = CandidatureService.saveCandidatureEvent(form, userId);

                if(form.getFirst("id")!=null)
                    Utils.logUserAction(userId, "CandidatureEvent", "Modification", evt.getId());
                else
                    Utils.logUserAction(userId, "CandidatureEvent", "Création", evt.getId());

                //System.out.println("Candidature enregistrée : "+cand.getId());

                res = "{ \"result\" : \"ok\", \"id\" : \"" + evt.getId() + "\" }";
            }
            catch (Exception e)
            {
                log.error(logCode + "-006 Error saving candidature event. userId=" + userId + " error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    @POST
    @Produces(MediaType.TEXT_HTML)
    @Path("checkOffre/{candidatureId}")
    public String checkOffre(@Context HttpServletRequest servletRequest, @PathParam("candidatureId")long candidatureId, MultivaluedMap<String,String> form) throws IOException
    {
        String res;

        long userId = UserService.checkUserAuthWithCSRF(servletRequest, form);

        if(userId>0)
        {
            final Timer.Context context = checkOffreTimer.time();

            try
            {
                Candidature c = CandidatureService.getCandidature(userId,candidatureId);

                if(c!=null)
                {
                    String state = CandidatureService.checkOffreExpired(c);
                    res = "{ \"result\" : \""+state+"\", \"candidatureId\" : \"" + candidatureId + "\" }";

                    if(state.equals("expired"))
                        CandidatureDAO.setExpired(c.getId(),1);
                }
                else
                {
                    log.warn(logCode + "-011 Error checking candidature expired. Candidature not found for user. userId=" + userId + " candidatureId="+candidatureId);
                    res = "{ \"result\" : \"error\" }";
                }
            }
            catch (Exception e)
            {
                log.error(logCode + "-010 Error checking candidature expired. userId=" + userId + " error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
            finally {
                context.stop();
            }
        }
        else
        {   // message de reconnexion
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }


    // retourne la liste des événements de candidatures de l'utilisateur
    @GET
    @Path("events")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getCandidatureEvents(@Context HttpServletRequest servletRequest)
    {
        String res;
        long userId = 0;

        userId = UserService.checkUserAuth(servletRequest,true);

        if(userId>0)
        {
            final Timer.Context context = candidatureEventsTimer.time();
            try
            {
                Object [] candidatureEvents = (Object [])CandidatureService.getCandidatureEvents(userId);

                String events = "[";
                for(int i=0; i<candidatureEvents.length; ++i)
                {
                    if(i>0)
                        events+=",";
                    events+= Utils.gson.toJson((CandidatureEvent)candidatureEvents[i]);
                }
                events +="]";

                res = "{ \"result\" : \"ok\", \"events\" : " + events + " }";

                // System.out.println(res);
            }
            catch (Exception e)
            {
                log.error(logCode + "-007 Error getting event list. userId="+userId+" error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
            finally {
                context.stop();
            }
        }
        else
        {   // message de reconnexion
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    // Envoi un email d'entretien
    @POST
    @Path("entretien/{eventId}")
    @Produces(MediaType.APPLICATION_JSON)
    public String sendInterviewCalendar(@Context HttpServletRequest servletRequest, @PathParam("eventId")long eventId, MultivaluedMap<String,String> form) throws IOException
    {
        String res;
        long userId = UserService.checkUserAuthWithCSRF(servletRequest, form);

        if(userId>0)
        {
            try
            {
                CandidatureService.sendInterviewCalendar(eventId, userId);
                res = "{ \"result\" : \"ok\" }";
            }
            catch (Exception e)
            {
                log.error(logCode + "-013 Error sending interview calendar. userId=" + userId + " eventId="+eventId+" error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    // fixe la candidature à favorite
    @POST
    @Path("favorite/{candidatureId}/{status}")
    @Produces(MediaType.APPLICATION_JSON)
    public String setCandidatureFavorite(@Context HttpServletRequest servletRequest, @PathParam("candidatureId")long candidatureId, @PathParam("status")int status, MultivaluedMap<String,String> form) throws IOException
    {
        String res;
        long userId = UserService.checkUserAuthWithCSRF(servletRequest, form);

        if(userId>0)
        {
            try
            {
                CandidatureService.setCandidatureFavorite(userId, candidatureId, status);
                res = "{ \"result\" : \"ok\" }";
            }
            catch (Exception e)
            {
                log.error(logCode + "-014 Error settting favorite candidature. userId=" + userId + " candidatureId="+candidatureId+" error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Path("eventRappel")
    public String saveCandidatureEventRappel(@Context HttpServletRequest servletRequest, MultivaluedMap<String,String> form) throws IOException
    {
        String res;

        long userId = UserService.checkUserAuthWithCSRF(servletRequest,form);

        if(userId>0)
        {
            try
            {
                CandidatureEvent evt = CandidatureService.saveCandidatureEvent(form, userId);

                if(form.getFirst("id")!=null)
                    Utils.logUserAction(userId, "CandidatureEventRappel", "Modification", evt.getId());
                else
                    Utils.logUserAction(userId, "CandidatureEventRappel", "Création", evt.getId());

                //System.out.println("Candidature enregistrée : "+cand.getId());

                res = "{ \"result\" : \"ok\", \"id\" : \"" + evt.getId() + "\" }";
            }
            catch (Exception e)
            {
                log.error(logCode + "-015 Error saving candidature event. userId=" + userId + " error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    // retourne les infos de la candidature précisée
    @GET
    @Produces({ MediaType.APPLICATION_JSON })
    @Path("lastUpdateByJobboard/{jobboard}")
    public String getCandidatureLastUpdateByJobBoard(@Context HttpServletRequest servletRequest, @PathParam("jobboard")String jobboard) throws IOException
    {
        String res;
        long userId = UserService.checkUserAuth(servletRequest);
        if(userId>0)
        {
            final Timer.Context context = candidatureTimer.time();

            try
            {
                Candidature candidature = (Candidature)CandidatureDAO.loadLastUpdateByJobBoard(JobBoardUrl.valueOf(jobboard));

                if(candidature!=null)
                    res = "{ \"result\" : \"ok\", \"candidature\" : " + Utils.gson.toJson(candidature)+ " }";
                else
                    res = "{ \"result\" : \"error\", \"msg\" : \"notFound\" }"; // remplacer par rest 404

            }
            catch (Exception e)
            {
                log.error(logCode + "-017 Error getting last candidature. jobboard="+jobboard+" error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
            finally {
                context.stop();
            }
        }
        else
        {   // message de reconnexion
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    // lance une recherche dans les notes et description des candidatures de l'utilisateur
    @POST
    @Produces({ MediaType.APPLICATION_JSON })
    @Path("search")
    public String searchInUserCandidatures(@Context HttpServletRequest servletRequest, MultivaluedMap<String,String> form) throws IOException
    {
        String res;
        long userId = UserService.checkUserAuthWithCSRF(servletRequest,form);
        if(userId>0)
        {
            final Timer.Context context = candidatureTimer.time();

            try
            {
                ArrayList candidatureIds = CandidatureService.findCandidaturesByKeyword(userId, form.getFirst("searchString"));
                res = "{ \"result\" : \"ok\", \"candidatures\" : " + Utils.gson.toJson(candidatureIds)+ " }";
            }
            catch (Exception e)
            {
                log.error(logCode + "-018 Error searching in candidature. searchString="+form.getFirst("searchString")+" userId="+userId+" error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
            finally {
                context.stop();
            }
        }
        else
        {   // message de reconnexion
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

}
