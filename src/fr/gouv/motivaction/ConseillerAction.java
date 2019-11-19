package fr.gouv.motivaction;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import org.apache.log4j.Logger;

import fr.gouv.motivaction.mails.UserAccountMail;
import fr.gouv.motivaction.model.User;
import fr.gouv.motivaction.service.ConseillerService;
import fr.gouv.motivaction.service.UserService;
import fr.gouv.motivaction.utils.Utils;

@Path("/conseiller")
public class ConseillerAction {

	private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "055";	
	
	@GET
    @Path("user/{email}")
    @Produces(MediaType.TEXT_PLAIN)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public String findUserByEmail(@Context HttpServletRequest servletRequest , @PathParam("email")String email) throws Exception
    {
		String res = "";		
		User user = UserService.loadFromLoginOrPeEmail(email);
		String visitorLink = null;
		boolean isIpConseiller = Utils.isIpConseiller(servletRequest);
		
		if (isIpConseiller) {
			try {
				if( user != null && user.getId() > 0 ) {
					if (user.getConsentAccess() == 1) {
						visitorLink = ConseillerService.getConseillerLinkForUser(user.getId());
					}
					res = "{ \"result\" : \"ok\", \"visitorLink\" : \"" + visitorLink +"\", \"consentAccess\" : \"" + user.getConsentAccess() + "\",\"lastAccessRefuserDate\":"+Utils.gson.toJson(user.getLastAccessRefuserDate())+"}";
				}			
				else {
					res = "{ \"result\" : \"error\", \"msg\" :\" user not found\"}";
				}
			}
			catch (Exception e)
			{
				log.error(logCode + "-002 Error CONSEILLER getting id. error=" + e);
				res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
			}
		} else {
			log.error(logCode + "-003 Error CONSEILLER user not on network PE");
			res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
		}
		return res;
		
    }
	
	@GET
    @Path("sendInvitationToUseMemo/{email}")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_PLAIN)
    public String sendInvitationToUseMemo(@Context HttpServletRequest servletRequest, @PathParam("email") String email) throws Exception     
    {
        String res = "";
        boolean isSent;
		boolean isIpConseiller = Utils.isIpConseiller(servletRequest);
		
		if (isIpConseiller) {
	        User user = UserService.loadFromLoginOrPeEmail(email);	        
	        try
	        {        
	            if (user == null) {        
	            	// Utilisateur inconnu de MEMO
	            	isSent = UserAccountMail.sendInvitationToUseMemo(email);
	                
	                if (isSent = true)
	                	res = "{ \"result\" : \"ok\", \"msg\" : \"email is sent\"}";
	                else
	                	res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
	             
	                log.info(logCode + "-002 Conseiller Inivitation To Use Memo.  login=" + email);
	            } else {
	            	// Utilisateur déjà connu de MEMO
	            	res = "{ \"result\" : \"user\" }";
	            }
	        }
	        catch (Exception e)
	        {
	            log.error(logCode+"-003 Conseiller Error Inivitating To Use Memo. login="+email+" error="+e);
	            res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
	        }
		} else {
			log.error(logCode + "-003 Error CONSEILLER user not on network PE");
			res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
		}
        return res;
    }
	
	@POST
    @Path("sendRequestToAccessTDB/{email}")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_PLAIN)
    public String sendRequestToAccessTDB(@Context HttpServletRequest servletRequest, @PathParam("email") String email) throws Exception     
    {
        String res = "";
        boolean isSent;
        
		boolean isIpConseiller = Utils.isIpConseiller(servletRequest);
		
		if (isIpConseiller) {
	        User user = UserService.loadFromLoginOrPeEmail(email);
	        try
	        {        
	            if ( user != null && user.getId() > 0)
	            {               
	                isSent = UserAccountMail.sendRequestToAccessTDB(user.getId(),email);
	                
	                if (isSent = true) {
	                	ConseillerService.updateLastAccessRequestDate(user.getId());
	                	res = "{ \"result\" : \"ok\"}";
	                }
	                else {
	                	res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
	                }
	             
	                log.info(logCode + "-002 Conseiller Request To access TDB Memo. userId="+user.getId()+" login=" + email);
	            }
	            else
	            {
	                res = "{ \"result\" : \"error\", \"msg\" : \"user not found\" }";
	            }
	        }
	        catch (Exception e)
	        {
	            log.error(logCode+"-003 Conseiller Error Requesting  To access TDB Memo. userId="+user.getId()+" login="+email+" error="+e);
	            res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
	        }
		} else {
			log.error(logCode + "-003 Error CONSEILLER user not on network PE");
			res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
		} 
        return res;
    }
	
	@GET
    @Path("getDatesRefusAccess/{email}")
    @Produces(MediaType.TEXT_PLAIN)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public String getDatesRefusAccess(@Context HttpServletRequest servletRequest, @PathParam("email")String email) throws Exception
    {
		String res = "";
		boolean isIpConseiller = Utils.isIpConseiller(servletRequest);
		
		if (isIpConseiller) {
			User user = UserService.loadFromLoginOrPeEmail(email);
			try
			{			
				if( user != null && user.getId() > 0 )
				{
					res = "{ \"result\" : \"ok\", \"lastAccessRequestDate\" : "+Utils.gson.toJson(Utils.getStringFromTimestamp(user.getLastAccessRequestDate(), "dd-MM-yyyy 'à' kk:mm"))+",\"lastAccessRefuserDate\":"+Utils.gson.toJson(Utils.getStringFromTimestamp(user.getLastAccessRefuserDate(), "dd-MM-yyyy 'à' kk:mm"))+" }";
				}			
				else {
					res = "{ \"result\" : \"error\", \"msg\" :\" user not found\"}";
				}
			}
			catch (Exception e)
			{
				log.error(logCode + "-002 Error CONSEILLER getting id. error=" + e);
				res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
			}
		} else {
			log.error(logCode + "-003 Error CONSEILLER user not on network PE");
			res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
		}
		return res;
    }
}
