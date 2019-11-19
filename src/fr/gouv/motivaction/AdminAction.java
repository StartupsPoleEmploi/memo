package fr.gouv.motivaction;

import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Paths;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.log4j.Logger;

import fr.gouv.motivaction.job.ExtractBO;
import fr.gouv.motivaction.mails.DailyAlert;
import fr.gouv.motivaction.mails.MailTools;
import fr.gouv.motivaction.mails.WeeklyReport;
import fr.gouv.motivaction.model.UserActivity;
import fr.gouv.motivaction.model.UserInterview;
import fr.gouv.motivaction.model.UserLog;
import fr.gouv.motivaction.service.AdminService;
import fr.gouv.motivaction.service.MailService;
import fr.gouv.motivaction.service.SlackService;
import fr.gouv.motivaction.service.UserService;
import fr.gouv.motivaction.utils.Quartz;
import fr.gouv.motivaction.utils.Utils;


@Path("/admin")
public class AdminAction {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "003";

    //public static Timer metricAdminActionTimer = Utils.metricRegistry.timer("metricAdminActionTimer");
    
    // retourne le nombre d'utilisateurs total
    @GET
    @Path("userCount")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getUserCount(@Context HttpServletRequest servletRequest)
    {
        String res;
        long userId = UserService.checkAdminUserAuth(servletRequest);

        if(userId>0)
        {
            try
            {
                String cohorte = servletRequest.getParameter("cohorte");
                long userCount = AdminService.getUserCount(cohorte);

                res = "{ \"result\" : \"ok\", \"userCount\" : " + userCount+ " }";

            }
            catch (Exception e)
            {
                log.error(logCode + "-001 Error getting user count. error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            log.warn(logCode + "-002 Unauthentified trial to access admin page.");
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    // retourne le nombre total de candidature
    @GET
    @Path("candidatureCount")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getCandidatureCount(@Context HttpServletRequest servletRequest)
    {
        String res;
        long userId = UserService.checkAdminUserAuth(servletRequest);

        if(userId>0)
        {
            try
            {
                String cohorte = servletRequest.getParameter("cohorte");
                long candidatureCount = AdminService.getCandidatureCount(cohorte);

                res = "{ \"result\" : \"ok\", \"candidatureCount\" : " + candidatureCount+ " }";

            }
            catch (Exception e)
            {
                log.error(logCode + "-003 Error getting candidature count. error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            log.warn(logCode + "-004 Unauthentified trial to access admin page.");
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    // retourne le nombre de candidature par utilisateur
    @GET
    @Path("candidaturePerUser")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getCandidaturePerUser(@Context HttpServletRequest servletRequest)
    {
        String res;
        long userId = UserService.checkAdminUserAuth(servletRequest);

        if(userId>0)
        {
            try
            {
                String cohorte = servletRequest.getParameter("cohorte");
                double candidaturePerUser = AdminService.getCandidaturePerUser(cohorte);

                res = "{ \"result\" : \"ok\", \"candidaturePerUser\" : " + candidaturePerUser + " }";

            }
            catch (Exception e)
            {
                log.error(logCode + "-005 Error getting candidaturePerUser. error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            log.warn(logCode + "-006 Unauthentified trial to access admin page.");
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    // retourne le nombre de candidature par utilisateur
    @GET
    @Path("candidatureAndUserCount/{d}")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getCandidatureAndUserCount(@Context HttpServletRequest servletRequest,@PathParam("d")int d)
    {
        String res;
        long userId = UserService.checkAdminUserAuth(servletRequest);

        if(userId>0)
        {
            try
            {
                String cohorte = servletRequest.getParameter("cohorte");
                long [] counts = AdminService.getCandidatureAndUserCount(d, cohorte);

                res = "{ \"result\" : \"ok\", \"userCount\" : " + counts[0]+ ", \"candidatureCount\" : "+ counts[1]+" }";

            }
            catch (Exception e)
            {
                log.error(logCode + "-007 Error getting candidature and user count. error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            log.warn(logCode + "-008 Unauthentified trial to access admin page.");
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    // retourne la liste des candidatures de l'utilisateur
    @GET
    @Path("activities/{userId}")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getUserActions(@Context HttpServletRequest servletRequest,@PathParam("userId")long userId)
    {
        String res;
        long adminUserId = UserService.checkAdminUserAuth(servletRequest);
        if(adminUserId>0)
        {
            try
            {
                Object [] actions = (Object [])AdminService.getUserActions(userId);

                String action = "[";
                for(int i=0; i<actions.length; ++i)
                {
                    if(i>0)
                        action+=",";
                    action+= Utils.gson.toJson((UserLog)actions[i]);
                }
                action +="]";

                String vLink = UserService.getVisitorLinkForUser(userId);

                res = "{ \"result\" : \"ok\", \"visitorLink\" : \""+vLink+"\", \"actions\" : " + action + " }";

                // System.out.println(res);
            }
            catch (Exception e)
            {
                log.error(logCode + "-013 Error getting user actions. error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            log.warn(logCode+"-014 Unauthentified trial to access admin page.");
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    // retourne la liste des candidatures de l'utilisateur
    @GET
    @Path("getUserActivities")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getUserActivities(@Context HttpServletRequest servletRequest)
    {
        String res;
        long userId = UserService.checkAdminUserAuth(servletRequest);
        if(userId>0)
        {
            try
            {
                String cohorte = servletRequest.getParameter("cohorte");
                String email = servletRequest.getParameter("email");

                Object [] activities = null;


                if(email==null) {
                    activities = (Object[]) AdminService.getUserActivities(cohorte, "50");
                }
                else
                {
                    activities = (Object[]) AdminService.getUserActivities(email);
                }

                String activity = "[";
                for(int i=0; i<activities.length; ++i)
                {
                    if(i>0)
                        activity+=",";
                    activity+= Utils.gson.toJson((UserActivity)activities[i]);
                }
                activity +="]";

                res = "{ \"result\" : \"ok\", \"activities\" : " + activity + " }";

                // System.out.println(res);
            }
            catch (Exception e)
            {
                log.error(logCode + "-009 Error getting user activities. error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            log.warn(logCode+"-010 Unauthentified trial to access admin page.");
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    // retourne la liste des entretiens et utilisateurs
    @GET
    @Path("userInterviews")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getUserInterviews(@Context HttpServletRequest servletRequest)
    {
        String res;
        long userId = UserService.checkAdminUserAuth(servletRequest);
        if(userId>0)
        {
            try
            {
                String cohorte = servletRequest.getParameter("cohorte");
                Object [] interviews = (Object [])AdminService.getUserInterviews(cohorte);

                String interview = "[";
                for(int i=0; i<interviews.length; ++i)
                {
                    if(i>0)
                        interview+=",";
                    interview+= Utils.gson.toJson((UserInterview)interviews[i]);
                }
                interview +="]";

                res = "{ \"result\" : \"ok\", \"interviews\" : " + interview + " }";

                // System.out.println(res);
            }
            catch (Exception e)
            {
                log.error(logCode + "-015 Error getting user interviews. error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            log.warn(logCode+"-016 Unauthentified trial to access admin page.");
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    // envoie un email avec le compte rendu hebdo de l'utilisateur aux admins de MEMO
    @POST
    @Path("sendWeeklyEmailReminder/{userId}")
    @Produces({ MediaType.APPLICATION_JSON })
    public String sendWeeklyEmailReminder(@Context HttpServletRequest servletRequest, @PathParam("userId")long userId)
    {
        String res;
        long adminUserId = UserService.checkAdminUserAuth(servletRequest);

        if(adminUserId>0)
        {
            try
            {
            	// Mail du weekly report
            	WeeklyReport weekReport = new WeeklyReport();

                WeeklyReport.initCohortTexts();
            	weekReport.buildAndSendWeeklyTaskReminder(userId);
            	// Mail du daily report
                DailyAlert dailyAlert = new DailyAlert();
                dailyAlert.buildAndSendWeeklyTaskReminderNoCandidature(userId);

                res = "{ \"result\" : \"ok\" }";
            }
            catch (Exception e)
            {
                log.error(logCode + "-011 Error sending weekly reminder report. userId="+userId+" error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            log.warn(logCode + "-012 Unauthentified trial to use admin feature.");
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    // retourne un extract CSV des activités des utilisateurs
    @GET
    @Path("getExtractUserActivities")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response getExtractUserActivities(@Context HttpServletRequest servletRequest)
    {
        long userId = UserService.checkAdminUserAuth(servletRequest);

        byte[] document = null;
        String fileName="";

        if(userId>0)
        {
            try
            {
                fileName = "extract-userActivities.zip";
                String aFile = Constantes.pathCSV+fileName;
                if (Files.exists(Paths.get(aFile), LinkOption.NOFOLLOW_LINKS)) {
                	document = Files.readAllBytes(Paths.get(aFile));
                } else {
                	ExtractBO.buildAndWriteExtract();
                	document = Files.readAllBytes(Paths.get(aFile));
                }
            }
            catch (Exception e)
            {
                log.error(logCode + "-017 Error downloading user export. userId="+userId+" error=" + e);
            }
        }

        return Response.ok(document, MediaType.APPLICATION_OCTET_STREAM)
                .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
                .build();

    }
    
    @GET
    @Path("healthCheck")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getHealthCheck(@Context HttpServletRequest servletRequest)
    {
        String res;
        String healthCheck = null;
        
        try {
        	healthCheck = AdminService.getHealthCheck();
        } catch(Exception e){
        	healthCheck = "Service JAVA KO : " + e;
        	log.error(logCode + "-019 Error Action getting healthCheck. error=" + Utils.getStackTraceIntoString(e));
        }
        
        if (healthCheck==null)
    		res = "{ \"result\" : \"ok\" }";
    	else {
    		res = "{ \"result\" : \"error\", \"msg\" : \" " + healthCheck + " \" }";
    	}
        return res;
    }
    
    @GET
    @Path("reportErrorHealthCheck/{errorMsg}")
    @Produces({ MediaType.APPLICATION_JSON })
    public String reportErrorHealthCheck(@Context HttpServletRequest servletRequest, @PathParam("errorMsg")String errorMsg)
    {
    	String res;
    	
    	try {
	    	// Notification ds Slack
			SlackService.sendMsg("HealthCheck KO ! " + errorMsg);
			// Envoie d'un email d'alerte
			MailService.sendMailReport(Utils.concatArrayString(MailTools.tabEmailIntra, MailTools.tabEmailDev, MailTools.tabEmailExtra), "Alerte " + Constantes.env + " - HealthCheck KO", "");
			res = "{ \"result\" : \"ok\" }";
    	} catch(Exception e) {
    		res = "{ \"result\" : \"error\", \"msg\" : \" " + e + " \" }";
    	}		
		return res;
    }
    
    @GET
    @Path("quartz")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getQuartzInfo(@Context HttpServletRequest servletRequest)
    {
    	String res;

        long userId = UserService.checkAdminUserAuth(servletRequest);
        if(userId>0)
        {
            try
            {
            	res = "{ \"result\" : \"ok\", \"hostname\" : \"" + MailTools.getHostname() + "\", \"quartzIsRunning\" : \"" + MailTools.getQuartzRunning() + "\", \"jobsMails\" : \"" + this.isJobsRunning(Constantes.jobsMails) + "\", \"jobsAdmins\" : \"" + this.isJobsRunning(Constantes.jobsAdmins) + "\", \"jobsCalculs\" : \"" + this.isJobsRunning(Constantes.jobsCalculs) + "\" }";
            }
            catch (Exception e)
            {
                res = "{ \"result\" : \"error\", \"msg\" : \" " + e + " \" }";
            }
        }
        else
        {
            log.warn(logCode + "-018 Unauthentified trial to use admin feature.");
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

		return res;
    }

    @GET
    @Path("startJobs/{jobs}")
    @Produces({ MediaType.APPLICATION_JSON })
    public String startQuartzCalcul(@Context HttpServletRequest servletRequest, @PathParam("jobs") String jobs) {
        String res;

        long userId = UserService.checkAdminUserAuth(servletRequest);
        if(userId>0)
        {
            try
            {
                log.warn(logCode + "-019 ADMIN Server set to true jobs="+jobs);
                
                Quartz.reloadJobs(jobs, true);

                res = "{ \"result\" : \"ok\", \"hostname\" : \"" + MailTools.getHostname() + "\", \"quartzIsRunning\" : \"" + MailTools.getQuartzRunning() + "\", \"jobsMails\" : \"" + this.isJobsRunning(Constantes.jobsMails) + "\", \"jobsAdmins\" : \"" + this.isJobsRunning(Constantes.jobsAdmins) + "\", \"jobsCalculs\" : \"" + this.isJobsRunning(Constantes.jobsCalculs) + "\" }";
            }
            catch(Exception e) {
                res = "{ \"result\" : \"error\", \"msg\" : \" " + e + " \" }";
            }
        }
        else
        {
            log.warn(logCode + "-020 Unauthentified trial to use admin feature.");
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    @GET
    @Path("stopJobs/{jobs}")
    @Produces({ MediaType.APPLICATION_JSON })
    public String stopQuartzCalcul(@Context HttpServletRequest servletRequest, @PathParam("jobs") String jobs)
    {
        String res;

        long userId = UserService.checkAdminUserAuth(servletRequest);
        if(userId>0)
        {
            try
            {
            	log.warn(logCode + "-021 ADMIN Server set to false jobs="+jobs);
            	
                Quartz.reloadJobs(jobs, false);

                res = "{ \"result\" : \"ok\", \"hostname\" : \"" + MailTools.getHostname() + "\", \"quartzIsRunning\" : \"" + MailTools.getQuartzRunning() + "\", \"jobsMails\" : \"" + this.isJobsRunning(Constantes.jobsMails) + "\", \"jobsAdmins\" : \"" + this.isJobsRunning(Constantes.jobsAdmins) + "\", \"jobsCalculs\" : \"" + this.isJobsRunning(Constantes.jobsCalculs) + "\" }";
            }
            catch(Exception e)
            {
                res = "{ \"result\" : \"error\", \"msg\" : \" " + e + " \" }";
            }
        }
        else
        {
            log.warn(logCode + "-022 Unauthentified trial to use admin feature.");
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }
    
  //Suppression des candidatures 
    @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    @Path("deleteAllCandidatures")
    //@Produces({ MediaType.APPLICATION_JSON })
    public String deleteAllCandidatures(@Context HttpServletRequest servletRequest) {
    	
    	String res = null;
    	long userId = UserService.checkAdminUserAuth(servletRequest); 	
    	if(userId >0)
    	{
    		try {    		
    			AdminService.deleteAllCandidatures(userId);
    			res = "{ \"result\" : \"ok\"}";
    		}

    		catch (Exception e)
    		{
    			log.error(logCode + "-023 Error deleting candidature . error=" + e);
    			res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
    		}
    	}
    	else {
    		log.warn(logCode + "-023 User is not admin");
    		res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
    	}
    	return res ;
    }
    
    /**
     * Chargement automatique de tableau de board
     * @param servletRequest
     * @throws Exception 
     */
    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    @Path("loadTDB/{jobboard}")
    public String loadTDB(@Context HttpServletRequest servletRequest, @PathParam("jobboard") String jobboard) throws Exception
    {
    	String res = null;
    	long userId = UserService.checkAdminUserAuth(servletRequest); 	

    	if(userId >0)
    	{
    		try {  
    			AdminService.loadTDB(userId, jobboard);	
    			res = "{ \"result\" : \"ok\",  \"jobboard\" : \"" + jobboard + "\"}";
    		}
    		catch (Exception e)
    		{
    			log.error(logCode + "-023 Error loading dashboard . error=" + e);
    			res = "{ \"result\" : \"error\", \"msg\" : \"systemError\",  \"jobboard\" : \"" + jobboard + "\"}";
    		}
    	}
    	else {
    		log.warn(logCode + "-023 User is not admin");	
    		res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
    	}
    	return res ; 
      }
    
    @GET
    @Path("candidatureCurrentUserCount")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getCandidatureCurrentUserCount(@Context HttpServletRequest servletRequest)
    {
        String res;
        long userId = UserService.checkAdminUserAuth(servletRequest);

        if(userId>0)
        {
            try
            {
                long c = AdminService.getCandidatureCurrentUserCount(userId);

                res = "{ \"result\" : \"ok\", \"candidatureCurrentUserCount\" : " +c+ " }";

            }
            catch (Exception e)
            {
                log.error(logCode + "-024 Error getting candidature current user count. error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            log.warn(logCode + "-024 Unauthentified trial to access admin page.");
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }
    
    private String isJobsRunning(boolean isRunning) {
    	if (isRunning)
    		return "RUNNING";
    	else
    		return "STOPPED";
    }
}
