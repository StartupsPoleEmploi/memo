package fr.gouv.motivaction.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;

import org.apache.log4j.Logger;

import fr.gouv.motivaction.utils.DatabaseManager;

public class ConseillerDAO {

	private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "088";
	   	
	public static void updateLastAccessRequestDate(long idUser) throws Exception {
		Connection con = null ;
		PreparedStatement pStmt = null ;
		String sql = null;

		try {
			con = DatabaseManager.getConnection();	
			sql = "UPDATE users SET lastAccessRequestDate = NOW() WHERE id=?";    	    		

			pStmt = con.prepareStatement(sql);
			pStmt.setLong(1,idUser); 
			pStmt.executeQuery();     	            
		}
		catch (Exception e)
		{
			log.error(logCode+"-004 Error updating lastAccessRequestDate. error="+e);
			throw e;
		}
		finally
		{
			DatabaseManager.close(con, pStmt, null, logCode, "002");
		}
	}	
}