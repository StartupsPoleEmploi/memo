package fr.gouv.motivaction;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;

import com.codahale.metrics.Timer;
import fr.gouv.motivaction.model.Attachment;
import fr.gouv.motivaction.model.Candidature;
import fr.gouv.motivaction.service.AttachmentService;
import fr.gouv.motivaction.service.CandidatureService;
import fr.gouv.motivaction.utils.Utils;
import org.apache.log4j.Logger;

import fr.gouv.motivaction.service.UserService;

@Path("/attachments")
public class AttachmentAction
{
    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "032";

    public static Timer attachmentsTimer = Utils.metricRegistry.timer("attachmentsTimer");
    public static Timer attachmentTimer = Utils.metricRegistry.timer("attachmentTimer");
    public static Timer storeTimer = Utils.metricRegistry.timer("storeTimer");
    public static Timer unstoreTimer = Utils.metricRegistry.timer("unstoreTimer");

    @GET
    @Produces({ MediaType.APPLICATION_JSON })
    @Path("{candidatureId}")
    public String getCandidatureFiles(@Context HttpServletRequest servletRequest, @PathParam("candidatureId")long candidatureId)
    {
        // controle propriété du fichier avec le userId, visiteur autorisé
        long userId = UserService.checkUserAuth(servletRequest,true);
        String res = "";

        if(userId>0)    // controle propriété du fichier avec le userId et le attachmentId
        {
            final Timer.Context context = attachmentsTimer.time();

            try
            {
                Candidature cand = CandidatureService.getCandidature(userId, candidatureId);

                if(cand!=null)
                {
                    boolean allowUncheckedFiles = (servletRequest.getParameter("link")==null)?true:false;
                    Object [] attachments = (Object [])AttachmentService.getAttachments(candidatureId,userId,allowUncheckedFiles);

                    String atts = "[";
                    for(int i=0; i<attachments.length; ++i)
                    {
                        if(i>0)
                            atts+=",";
                        atts+= Utils.gson.toJson((Attachment)attachments[i]);
                    }
                    atts +="]";

                    res = "{ \"result\" : \"ok\", \"attachments\" : " + atts + " }";
                }
                else
                    throw new Exception("User trying to get file list belonging to someone else");
            }
            catch(Exception e)
            {
                log.error(logCode + "-001 Error getting candidature's file list. userId="+userId+" candidatureId="+candidatureId+" error=" + e);
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

    @GET
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    @Path("/file/{attachmentId}")
    public Response getFile(@Context HttpServletRequest servletRequest, @Context HttpServletResponse servletResponse, @PathParam("attachmentId")long attachmentId)
    {
        long userId = UserService.checkUserAuth(servletRequest,true);
        byte[] document = null;
        String fileName="";

        if(userId>0)    // controle propriété du fichier avec le userId et le attachmentId
        {
            final Timer.Context context = attachmentTimer.time();

            try
            {
                boolean allowUncheckedFiles = (servletRequest.getParameter("link")==null)?true:false;
                Attachment att = AttachmentService.loadAttachment(userId, attachmentId, allowUncheckedFiles);

                if(att!=null)
                {
                    // chargement du document via swift
                    document = AttachmentService.downloadFile(att);
                    document = Utils.decompress(document);
                    fileName = att.getFileName();
                }
                else
                    throw new Exception("User trying to get file belonging to someone else");
            }
            catch (Exception e)
            {
                log.error(logCode + "-002 Error downloading file. userId="+userId+" attachmentId="+attachmentId+" error=" + e);
            }
            finally {
                context.stop();
            }
        }
        else
        {   // message de reconnexion
            //res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
            //TODO: retravailler les retours autre que la réponse ok
        }

        return Response.ok(document, MediaType.APPLICATION_OCTET_STREAM)
                .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
                .build();
    }

    @POST
    @Produces({ MediaType.APPLICATION_JSON })
    @Path("/file/{candidatureId}")
    public String storeFile(@Context HttpServletRequest servletRequest, @PathParam("candidatureId")long candidatureId, MultivaluedMap<String,String> form) throws IOException
    {
        // controle user
        String res;
        long userId = UserService.checkUserAuthWithCSRF(servletRequest,form);

        if(userId>0)
        {
            final Timer.Context context = storeTimer.time();

            try
            {
                Candidature cand = CandidatureService.getCandidature(userId, candidatureId);

                if(cand!=null)
                {
                    String fileName = form.getFirst("name");
                    String fileData = form.getFirst("file");
                    String fileType = form.getFirst("type");

                    Pattern pattern = Pattern.compile(AttachmentService.authorizedFilesRegexp);
                    Matcher matcher = pattern.matcher(fileName);

                    if(fileData.length()>AttachmentService.maxFileSize || matcher.find())
                        throw new Exception("File too big or not allowed fileSize="+fileData.length()+" fileName="+fileName);

                    long attachmentId = AttachmentService.storeFile(userId,candidatureId,fileName,fileType,fileData);

                    res = "{ \"result\" : \"ok\", \"id\" : "+attachmentId+" }";
                }
                else
                    throw new Exception("User trying to add file to someone else candidature");
            }
            catch (Exception e)
            {
                log.error(logCode + "-003 Error saving file. userId="+userId+" candidatureId="+candidatureId+" error=" + e);
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

    @DELETE
    @Produces({ MediaType.APPLICATION_JSON })
    @Path("/file/{candidatureId}/{attachmentId}")
    public String deleteFile (@Context HttpServletRequest servletRequest, @PathParam("candidatureId")long candidatureId, @PathParam("attachmentId")long attachmentId, MultivaluedMap<String,String> form)
    {
        // controle user
        String res;
        long userId = UserService.checkUserAuthWithCSRF(servletRequest,form);

        if(userId>0)
        {
            final Timer.Context context = unstoreTimer.time();

            try
            {
                Candidature cand = CandidatureService.getCandidature(userId,candidatureId);

                if(cand!=null)
                {
                    AttachmentService.deleteFile(userId,candidatureId,attachmentId);

                    res = "{ \"result\" : \"ok\" }";
                }
                else
                    throw new Exception("User trying to delete attachment belonging to someone else");
            }
            catch (Exception e)
            {
                log.error(logCode + "-004 Error deleting file. userId="+userId+" candidatureId="+candidatureId+" attachmentId="+attachmentId+" error=" + e);
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
    @Produces({ MediaType.APPLICATION_JSON })
    @Path("/file/{candidatureId}/{attachmentId}")
    public String deleteFilePOST (@Context HttpServletRequest servletRequest, @PathParam("candidatureId")long candidatureId, @PathParam("attachmentId")long attachmentId, MultivaluedMap<String,String> form)
    {
        // controle user
        String res;
        long userId = UserService.checkUserAuthWithCSRF(servletRequest,form);

        if(userId>0)
        {
            final Timer.Context context = unstoreTimer.time();

            try
            {
                Candidature cand = CandidatureService.getCandidature(userId,candidatureId);

                if(cand!=null)
                {
                    AttachmentService.deleteFile(userId,candidatureId,attachmentId);

                    res = "{ \"result\" : \"ok\" }";
                }
                else
                    throw new Exception("User trying to delete attachment belonging to someone else");
            }
            catch (Exception e)
            {
                log.error(logCode + "-004 Error deleting file. userId="+userId+" candidatureId="+candidatureId+" attachmentId="+attachmentId+" error=" + e);
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

    /*
    @GET
    @Produces({ MediaType.APPLICATION_JSON })
    @Path("/delete/user")
    public String testDeleteUser(@Context HttpServletRequest servletRequest) throws IOException
    {
        // controle user
        String res="";

        try
        {
                AttachmentService.removeUserAttachments(5900);
            res = "{ \"result\" : \"ok\" }";
            }
            catch (Exception e)
            {
                log.error(logCode + "-00X error removing user attachments error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }

        return res;
    }
    */
    /*
    @GET
    @Produces({ MediaType.APPLICATION_JSON })
    @Path("/delete/cand")
    public String testDeleteCand(@Context HttpServletRequest servletRequest) throws IOException
    {
        // controle user
        String res="";

        try
        {
            AttachmentService.removeCandidatureAttachments(55429,5900);
            res = "{ \"result\" : \"ok\" }";
        }
        catch (Exception e)
        {
            log.error(logCode + "-00X error removing user attachments error=" + e);
            res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
        }

        return res;
    }*/

}
