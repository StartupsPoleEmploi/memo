package fr.gouv.motivaction;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;

import com.codahale.metrics.Timer;
import org.apache.log4j.Logger;

import fr.gouv.motivaction.mails.MailTools;
import fr.gouv.motivaction.service.MailService;
import fr.gouv.motivaction.service.UserService;
import fr.gouv.motivaction.utils.Utils;

@Path("/log")
public class LogAction {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "021";

    public static Timer importLogTimer = Utils.metricRegistry.timer("importLog");
    public static Timer uiLogTimer = Utils.metricRegistry.timer("uiLog");

    // enregistre les logs d'erreur d'import
    @POST
    @Path("import")
    @Produces({ MediaType.APPLICATION_JSON })
    public String logImportError(@Context HttpServletRequest servletRequest, MultivaluedMap<String,String> form)
    {
        long userId = UserService.checkUserAuth(servletRequest);

        if(userId>0)
        {

            final Timer.Context context = importLogTimer.time();

            try
            {
                String message = form.getFirst("message");
                String subject = "Import non géré en " + Constantes.env;
                if ("RECETTE".equals(Constantes.env))
                	subject = subject + " - " + userId;
                	
                String body = "L'utilisateur #"+userId+" a tenté un import sur l'adresse suivante : \r\n\r\n"+message;

                MailService.sendMailReport(Utils.concatArrayString(MailTools.tabEmailIntra, MailTools.tabEmailDev, MailTools.tabEmailExtra), subject, body);

                log.warn(logCode+"-001 Error processing import on UI. userId=" + userId + " message=" + message);
            }
            catch (Exception e)
            {
                log.error(logCode + "-002 Error processing import error message from UI. userId=" + userId + " error=" + e);
            }
            finally {
                context.stop();
            }
        }

        return "{ \"result\" : \"ok\" }";
    }

    // enregistre les logs d'erreur d'interface
    @POST
    @Produces({ MediaType.APPLICATION_JSON })
    public String logUIError(@Context HttpServletRequest servletRequest, MultivaluedMap<String,String> form)
    {
        String res;
        long userId = UserService.checkUserAuth(servletRequest);

        if(userId>0)
        {
            final Timer.Context context = uiLogTimer.time();

            try
            {
                String message = form.getFirst("message");
                log.warn(logCode+"-003 Error on UI. userId=" + userId + " message=" + message);
            }
            catch (Exception e)
            {
                log.error(logCode + "-004 Error processing UI error message. userId=" + userId + " error=" + e);
            }
            finally {
                context.stop();
            }
        }

        return "{ \"result\" : \"ok\" }";
    }

}
