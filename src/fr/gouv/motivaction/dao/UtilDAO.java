package fr.gouv.motivaction.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;

import org.apache.log4j.Logger;

import fr.gouv.motivaction.model.UserLog;
import fr.gouv.motivaction.utils.DatabaseManager;

public class UtilDAO {

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

}
