package fr.gouv.motivaction.service;

import org.apache.log4j.Logger;

import fr.gouv.motivaction.dao.ConseillerDAO;


public class ConseillerService {
	
	private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "044";
    
	public static String getConseillerLinkForUser(long userId)
    {
        return UserService.getConseillerLinkForUser(userId);
    }

	public static void updateLastAccessRequestDate(long idUser) throws Exception 
	{
		  ConseillerDAO.updateLastAccessRequestDate(idUser);
	}
}