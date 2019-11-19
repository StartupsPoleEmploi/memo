package fr.gouv.motivaction.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;

import org.apache.log4j.Logger;

import fr.gouv.motivaction.Constantes.JobBoard;
import fr.gouv.motivaction.model.UserActivity;
import fr.gouv.motivaction.model.UserInterview;
import fr.gouv.motivaction.model.UserLog;
import fr.gouv.motivaction.service.UserService;
import fr.gouv.motivaction.utils.DatabaseManager;
import fr.gouv.motivaction.utils.Utils;

/**
 * Created by Alan on 03/05/2016.
 */
public class AdminDAO {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "014";

    public static long getUserCount(String cohorte) throws Exception
    {
        long userCount = 0;

        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        try
        {
            con = DatabaseManager.getConnectionCalcul();
            String sql = "SELECT count(*) FROM users WHERE id NOT IN (SELECT userId FROM adminUsers) AND id NOT IN (SELECT userId FROM fakeUsers) ";
            if(cohorte!=null)
                sql+=" AND cohorte="+cohorte;

            pStmt = con.prepareStatement(sql);

            rs = pStmt.executeQuery();

            if(rs.next())
                userCount = rs.getLong(1);
        }
        catch (Exception e)
        {
            log.error(logCode+"-001 Error loading user count. error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "002");
        }

        return userCount;

    }

    public static long getMaxUserId() throws Exception
    {
        long userCount = 0;

        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        try
        {
            con = DatabaseManager.getConnectionCalcul();
            String sql = "SELECT max(id) FROM users";
            
            pStmt = con.prepareStatement(sql);

            rs = pStmt.executeQuery();

            if(rs.next())
                userCount = rs.getLong(1);
        }
        catch (Exception e)
        {
            log.error(logCode+"-019 Error loading max userId. error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "020");
        }

        return userCount;

    }
    
    public static long getCandidatureCount(String cohorte) throws Exception
    {
        long candidatureCount = 0;

        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        try
        {
            con = DatabaseManager.getConnectionCalcul();
            String sql = "SELECT count(*) FROM candidatures WHERE userId NOT IN (SELECT userId FROM adminUsers) AND userId NOT IN (SELECT userId FROM fakeUsers)";

            if(cohorte!=null)
                sql+=" AND userId IN (SELECT id FROM users WHERE cohorte="+cohorte+")";

            pStmt = con.prepareStatement(sql);

            rs = pStmt.executeQuery();

            if(rs.next())
                candidatureCount = rs.getLong(1);
        }
        catch (Exception e)
        {
            log.error(logCode + "-003 Error loading candidature count. error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "004");
        }

        return candidatureCount;

    }

    public static double getCandidaturePerUser(String cohorte) throws Exception
    {
        double candidaturePerUser = 0;

        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        try
        {
            con = DatabaseManager.getConnectionCalcul();
            String sql = "SELECT COUNT(*)/(SELECT COUNT(*) FROM users WHERE id NOT IN (SELECT userId FROM adminUsers) AND id NOT IN (SELECT userId FROM fakeUsers) ";

            if(cohorte!=null)
                sql+=" AND cohorte="+cohorte;

            sql += ") FROM candidatures WHERE userId NOT IN (SELECT userId FROM adminUsers) AND userId NOT IN (SELECT userId FROM fakeUsers) ";

            if(cohorte!=null)
                sql+=" AND userId IN (SELECT id FROM users WHERE cohorte="+cohorte+")";

            pStmt = con.prepareStatement(sql);

            rs = pStmt.executeQuery();

            if(rs.next())
                candidaturePerUser = rs.getDouble(1);
        }
        catch (Exception e)
        {
            log.error(logCode + "-005 Error loading candidature per user. error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "006");
        }

        return candidaturePerUser;
    }

    public static long [] getCandidatureAndUserCount(int d, String cohorte) throws Exception
    {
        long [] candidatureAndUserCounts = new long[2];

        Connection con = null;
        Statement stmt = null;
        ResultSet rs = null;
        try
        {
            con = DatabaseManager.getConnectionCalcul();

            String pref1 = "SELECT COUNT(DISTINCT(userId)) ";
            String sqlPart1 = "FROM userLogs WHERE action LIKE 'Connexion%' " + 
								            		"AND creationTime > ADDDATE(now(),-"+d+") " +
								                    "AND userId IN (SELECT userId FROM userLogs WHERE action LIKE 'Connexion%' GROUP BY userId HAVING COUNT(*)>1) " +
								                    "AND userId NOT IN (SELECT userId FROM adminUsers) " +
								                    "AND userId NOT IN (SELECT userId FROM fakeUsers) ";
                   
            if(cohorte!=null)
                sqlPart1+=" AND userId IN (SELECT id FROM users WHERE cohorte="+cohorte+") ";

            stmt = con.createStatement();
            rs = stmt.executeQuery(pref1 + sqlPart1);

            if(rs.next())
            {
            	String sqlPart2 = "SELECT COUNT(1) FROM candidatures WHERE userId IN (SELECT DISTINCT(userId) "+sqlPart1+") " +
            																"AND lastUpdate > ADDDATE(now(),-"+d+")";
            	
                candidatureAndUserCounts[0] = rs.getLong(1);
                rs = stmt.executeQuery(sqlPart2);

                if(rs.next())
                    candidatureAndUserCounts[1] = rs.getLong(1);
            }
        }
        catch (Exception e)
        {
            log.error(logCode + "-007 Error loading candidature and user count. error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, stmt, rs, logCode, "008");
        }

        return candidatureAndUserCounts;
    }

    
    public static Object [] getUserActivities(String cohorte, String limit) throws Exception
    {
        ArrayList<UserActivity> activities = new ArrayList<UserActivity>();

        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        try
        {
            con = DatabaseManager.getConnectionCalcul();
            String sql = "SELECT * FROM userActivities_m ";
            
            if(cohorte!=null)
                sql += "WHERE cohorte="+cohorte+" OR idUser IN (SELECT userId FROM adminUsers) ";
            
            if(limit!=null)
            	sql +=  "LIMIT "+limit;
            
            pStmt = con.prepareStatement(sql);
            rs = pStmt.executeQuery();

            while (rs.next())
            {
                activities.add(AdminDAO.initUserActivityFromDB(rs));
            }
        }
        catch (Exception e)
        {
            log.error(logCode+"-009 Error loading user activities. error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "010");
        }

        return activities.toArray();
    }

    public static Object [] getExtractUserActivities(Long idMin, Long idMax) throws Exception
    {
        ArrayList<UserActivity> activities = new ArrayList<UserActivity>();

        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        try
        {
            con = DatabaseManager.getConnectionCalcul();
            String sql = "SELECT * FROM userActivities_m WHERE idUser > "+idMin+" AND idUser < "+idMax;
            
            pStmt = con.prepareStatement(sql);
            rs = pStmt.executeQuery();

            while (rs.next())
            {
                activities.add(AdminDAO.initUserActivityFromDB(rs));
            }
        }
        catch (Exception e)
        {
            log.error(logCode+"-016 Error loading user activities. error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "010");
        }

        return activities.toArray();
    }
    
    public static Object [] getUserActivities(String email) throws Exception
    {
        ArrayList<UserActivity> activities = new ArrayList<UserActivity>();

        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        try
        {
            con = DatabaseManager.getConnectionCalcul();
            String sql = "SELECT * FROM userActivities_m " +
                         "WHERE email LIKE '%" + email + "%' " +
                         "ORDER BY lastActivity desc";
            
            pStmt = con.prepareStatement(sql);
            rs = pStmt.executeQuery();

            while (rs.next())
            {
                activities.add(AdminDAO.initUserActivityFromDB(rs));
            }
        }
        catch (Exception e)
        {
            log.error(logCode+"-017 Error loading user activities. error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "018");
        }

        return activities.toArray();
    }
    
    public static Object [] getUserActions(long userId) throws Exception
    {
        ArrayList<UserLog> actions = new ArrayList<UserLog>();

        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        try
        {
            con = DatabaseManager.getConnectionCalcul();
            String sql = "SELECT * FROM userLogs WHERE userId = ? ORDER BY id DESC";
            pStmt = con.prepareStatement(sql);
            pStmt.setLong(1,userId);

            rs = pStmt.executeQuery();

            while (rs.next()) {
                actions.add(AdminDAO.initUserLogFromDB(rs));
            }
        }
        catch (Exception e)
        {
            log.error(logCode+"-011 Error loading user actions. error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "012");
        }

        return actions.toArray();
    }

    public static Object [] getUserInterviews(String cohorte) throws Exception
    {
        ArrayList<UserInterview> interviews = new ArrayList<UserInterview>();

        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        try
        {
            con = DatabaseManager.getConnectionCalcul();
            String sql = "SELECT candidatures.id, candidatures.userId, candidatures.nomCandidature, users.login, candidatures.archived " +
                    "FROM candidatures LEFT JOIN users ON candidatures.userId = users.id " +
                    "WHERE candidatures.etat = 3 AND candidatures.userId NOT IN (SELECT userId FROM adminUsers) " +
                    "AND candidatures.userId NOT IN (SELECT userId FROM fakeUsers) ";

            if(cohorte!=null)
                sql+="AND candidatures.userId IN (SELECT id FROM users WHERE cohorte="+cohorte+") ";

            sql+= "ORDER BY candidatures.userId, candidatures.nomCandidature";

            pStmt = con.prepareStatement(sql);

            rs = pStmt.executeQuery();

            while (rs.next()) {
                interviews.add(AdminDAO.initUserInterviewFromDB(rs));
            }
        }
        catch (Exception e)
        {
            log.error(logCode+"-013 Error loading interviews. error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "014");
        }

        return interviews.toArray();
    }

    private static UserLog initUserLogFromDB(ResultSet rs) throws Exception
    {
        UserLog ul = new UserLog();
        ul.setUserId(rs.getLong("userId"));
        ul.setDomaine(rs.getString("domaine"));
        ul.setAction(rs.getString("action"));
        ul.setCreationTime(rs.getTimestamp("creationTime"));
        ul.setCandidatureId(rs.getLong("candidatureId"));

        return ul;
    }
    
    private static UserActivity initUserActivityFromDB(ResultSet rs) throws Exception
    {
        UserActivity ua = new UserActivity();
        Long idUser = rs.getLong("idUser");
        ua.setUserId(idUser);
        ua.setEmail(rs.getString("email"));
        ua.setReceiveEmail(rs.getInt("receiveEmail"));
        ua.setDateCreation(rs.getTimestamp("dateCreation"));
        ua.setTodos(rs.getInt("todo"));
        ua.setCandidatures(rs.getInt("cand"));
        ua.setRelances(rs.getInt("rela"));
        ua.setEntretiens(rs.getInt("entr"));
        ua.setCandidatures(rs.getInt("cand"));
        ua.setConns(rs.getInt("conn"));
        ua.setFbConns(rs.getInt("fbConn"));
        ua.setLastActivity(rs.getTimestamp("lastActivity"));
        ua.setNbConnLastMonth(rs.getInt("connAssMonth"));
        ua.setNbActLastMonth(rs.getInt("actAssMonth"));
        ua.setNbConnLastTrim(rs.getInt("connAssTrim"));
        ua.setNbActLastTrim(rs.getInt("actAssTrim"));
        // FIXME getVisitorLinkUser() devrait exister ds classe utilitaire plutot que service
        ua.setVisitorLink(UserService.getVisitorLinkForUser(idUser));

        return ua;
    }

    private static UserInterview initUserInterviewFromDB(ResultSet rs) throws Exception
    {
        UserInterview ui = new UserInterview();
        ui.setEmail(rs.getString("login"));
        ui.setUserId(rs.getLong("userId"));
        ui.setCandidatureId(rs.getLong("id"));
        ui.setTitle(rs.getString("nomCandidature"));
        ui.setArchived(rs.getBoolean("archived"));

        return ui;
    }
    
    public static void getHealthCheck() throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        try
        {
            con = DatabaseManager.getConnectionCalcul();
            String sql = "SELECT 1;";
            pStmt = con.prepareStatement(sql);
            rs = pStmt.executeQuery();
            rs.next();
        }
        catch (Exception e)
        {
            log.error(logCode+"-015 Error healthCheck. error="+Utils.getStackTraceIntoString(e));
            throw e;
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "016");
        }
    }
    
    public static void deleteAllCandidatures(long userId) throws Exception {

    	Connection con = null ;
    	PreparedStatement pStmt = null ;

    	try {
    		con = DatabaseManager.getConnection();

    		String sql = "DELETE cE FROM candidatures c INNER JOIN candidatureEvents cE ON (c.id = cE.candidatureId) WHERE c.userId = ?";
    		pStmt = con.prepareStatement(sql);
    		pStmt.setLong(1, userId);
    		pStmt.executeUpdate();
    		
    		sql = "DELETE c FROM candidatures c WHERE c.userId = ?";
    		pStmt = con.prepareStatement(sql);
    		pStmt.setLong(1, userId);
    		pStmt.executeUpdate();

    		sql = "DELETE a FROM users u INNER JOIN attachments a ON (u.id = a.userId) WHERE userId = ?";
    		pStmt = con.prepareStatement(sql);
    		pStmt.setLong(1, userId);
    		pStmt.executeUpdate();

    		sql = "DELETE aF FROM users u INNER JOIN attachmentFiles aF ON (u.id = aF.userId) WHERE userId = ?";
    		pStmt = con.prepareStatement(sql);
    		pStmt.setLong(1, userId);
    		pStmt.executeUpdate();
    	}
    	catch (Exception e)
    	{
    		log.error(logCode+"-016 Error delete all candidatures. error="+e);
    		throw e;

    	}
    	finally
    	{
    		DatabaseManager.close(con, pStmt, null, logCode, "017");
    	}

    }

    public static void loadTDB(long userId, String jobboard) throws Exception{

    	Connection con = null ;
    	PreparedStatement pStmt = null ;
    	ResultSet rs = null;
    	String sql = null;
    	
    	try {
    		con = DatabaseManager.getConnection();	
    	
			sql = "INSERT INTO candidatures (userId,nomCandidature,nomSociete,description,"+
    				"lastUpdate,etat,ville,urlSource,type,sourceId,logoUrl,jobBoard)"+ 
    				" SELECT ?,nomCandidature,nomSociete,description,NOW(),etat,ville,urlSource,type,sourceId,logoUrl,jobBoard"+
    					" FROM candidatures where userId!=? AND expired = 0 AND archived = 0 AND urlSource IS NOT NULL"+
    					" AND jobBoard LIKE '" + jobboard + "' ORDER BY creationDate desc limit 1";
    		pStmt = con.prepareStatement(sql);
    		pStmt.setLong(1, userId);
    		pStmt.setLong(2, userId);
    		rs = pStmt.executeQuery();
    	}
    	catch (Exception e)
    	{
    		log.error(logCode+"-017 Error loading candidatures. error="+e);
    		throw e;
    	}
    	finally
    	{
    		DatabaseManager.close(con, pStmt, null, logCode, "018");
    	}
    }	


    public static long getCandidatureCurrentUserCount(long userId) throws Exception
    {
    	long candidatureCurrentUserCount = 0;

    	Connection con = null;
    	PreparedStatement pStmt = null;
    	ResultSet rs = null;
    	try
    	{
    		con = DatabaseManager.getConnection();
    		String sql = "select count(*) from candidatures where userId=?";

    		pStmt = con.prepareStatement(sql);
    		pStmt.setLong(1, userId);

    		rs = pStmt.executeQuery();

    		if(rs.next())
    			candidatureCurrentUserCount = rs.getLong(1);
    	}
    	catch (Exception e)
    	{
    		log.error(logCode + "-018 Error loading current user candidature count. error=" + e);
    		throw new Exception("DB Error");
    	}
    	finally
    	{
    		DatabaseManager.close(con, pStmt, rs, logCode, "019");
    	}

    	return candidatureCurrentUserCount;

    }
}
 

