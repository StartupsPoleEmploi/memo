package fr.gouv.motivaction.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Calendar;

import org.apache.log4j.Logger;

import fr.gouv.motivaction.model.Candidature;
import fr.gouv.motivaction.model.UserLog;
import fr.gouv.motivaction.utils.DatabaseManager;

public class UserLogDAO {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "015";

	public static void save(UserLog uLog) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;
        try
        {
            con = DatabaseManager.getConnection();
            String sql = "insert into userLogs (userId, domaine, action, candidatureId, creationTime) value (?,?,?,?,now())";
            pStmt = con.prepareStatement(sql);

            pStmt.setLong(1, uLog.getUserId());
            pStmt.setString(2, uLog.getDomaine());
            pStmt.setString(3, uLog.getAction());
            pStmt.setLong(4, uLog.getCandidatureId());

            pStmt.executeUpdate();
        }
        catch (Exception e)
        {
            log.error(logCode+"-001 Error saving user action. userId="+uLog.getUserId()+" error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con,pStmt,null, logCode, "002");
        }
    }
	
	public static Object [] listUserLogsPerPreviousDay(long day) throws Exception
    {
        ArrayList<UserLog> lstUserLog = new ArrayList<UserLog>();

        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        long count = 0;
        
        try
        {
            con = DatabaseManager.getConnection();
            String sql = "SELECT * from userLogs uL " + 
            				"INNER JOIN users u ON uL.userId = u.id " +
            				"WHERE DATE(uL.creationTime) = DATE( SUBDATE(NOW(), INTERVAL " + day + " DAY) )";
            
            pStmt = con.prepareStatement(sql);
            rs = pStmt.executeQuery();

            while (rs.next()) {
            	lstUserLog.add(UserLogDAO.initUserLogFromDB(rs));
            	count++;
            }
            log.debug(logCode+" - SQL (nb lignes)=" + count + "\n sql="+sql);
        }
        catch (Exception e)
        {
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "003");
        }

        return lstUserLog.toArray();
    }
	
	public static UserLog initUserLogFromDB(ResultSet rs) throws Exception
    {
		UserLog userLog = new UserLog();
		userLog.setId(rs.getLong("id"));
		userLog.setUserId(rs.getLong("userId"));
       	userLog.setCreationTime(rs.getTimestamp("creationTime"));
       	userLog.setCandidatureId(rs.getLong("candidatureId"));
       	userLog.setAction(rs.getString("action"));
       	userLog.setDomaine(rs.getString("domaine"));
       	userLog.setLogin(rs.getString("login"));
       	userLog.setPeId(rs.getString("peId"));
       	userLog.setPeEmail(rs.getString("peEmail"));
       	
        return userLog;
    }

}
