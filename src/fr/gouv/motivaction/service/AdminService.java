package fr.gouv.motivaction.service;

import org.apache.log4j.Logger;

import fr.gouv.motivaction.dao.AdminDAO;
import fr.gouv.motivaction.utils.Utils;

public class AdminService {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "010";

    public static long getUserCount(String cohorte) throws Exception
    {
        return AdminDAO.getUserCount(cohorte);
    }

    public static long getCandidatureCount(String cohorte) throws Exception
    {
        return AdminDAO.getCandidatureCount(cohorte);
    }

    public static double getCandidaturePerUser(String cohorte) throws Exception
    {
        return AdminDAO.getCandidaturePerUser(cohorte);
    }

    public static long [] getCandidatureAndUserCount(int d, String cohorte) throws Exception
    {
        return AdminDAO.getCandidatureAndUserCount(d, cohorte);
    }

    public static Object [] getUserActivities(String cohorte, String limit) throws Exception
    {
        Object []  list = AdminDAO.getUserActivities(cohorte, limit);
        
        return list;
    }
    
    public static Object [] getUserActivities(String email) throws Exception
    {
        Object []  list = AdminDAO.getUserActivities(email);
        
        return list;
    }
    
    public static Object [] getUserActions(long userId) throws Exception
    {
        Object []  list = AdminDAO.getUserActions(userId);

        return list;
    }

    public static Object [] getUserInterviews(String cohorte) throws Exception
    {
        Object []  list = AdminDAO.getUserInterviews(cohorte);

        return list;
    }
    
    public static String getHealthCheck() {
        String res = null;
        
        try {
        	AdminDAO.getHealthCheck();
        } catch (Exception e) {
        	res = "Service BDD KO : " + e;
        	log.error(logCode + "-001 Error DAO getting healthCheck. error=" + Utils.getStackTraceIntoString(e));
        }

        return res;
    }
    
    public static void deleteAllCandidatures(long userId) throws Exception
    {
    	AdminDAO.deleteAllCandidatures(userId);
    }

    public static void loadTDB(long userId, String jobboard) throws Exception
    {
    	AdminDAO.loadTDB(userId, jobboard);
    }

    public static long getCandidatureCurrentUserCount(long userId) throws Exception
    {
        return AdminDAO.getCandidatureCurrentUserCount(userId);
    }
}
