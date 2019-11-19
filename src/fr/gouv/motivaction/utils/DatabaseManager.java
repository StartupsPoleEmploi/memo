package fr.gouv.motivaction.utils;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.sql.DataSource;

import org.apache.log4j.Logger;

public class DatabaseManager
{
    public static DataSource ds;

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "007";

    public static Connection getConnection()
    {
        Connection con = null;
        try
        {
            Context initialContext = new InitialContext();

            Context environmentContext = (Context) initialContext.lookup("java:comp/env");

            String dataResourceName = "jdbc/mariadb";

            DataSource dataSource = (DataSource) environmentContext.lookup(dataResourceName);

            con = dataSource.getConnection();
        }
        catch (Exception e)
        {
            log.error(logCode+"-001 DATABASE Error fetching database connection. error="+e);
        }

        return con;
    }

    public static Connection getConnectionCalcul()
    {
        Connection con = null;
        try
        {
            Context initialContext = new InitialContext();

            Context environmentContext = (Context) initialContext.lookup("java:comp/env");

            String dataResourceName = "jdbc/mariadb_calcul";

            DataSource dataSource = (DataSource) environmentContext.lookup(dataResourceName);

            con = dataSource.getConnection();
        }
        catch (Exception e)
        {
            log.error(logCode+"-001 DATABASE Error fetching database connection. error="+e);
        }

        return con;
    }

    public final static void close(Connection con, Statement pStmt, ResultSet rs, String classLogCode,String logCode)
    {
        if(rs!=null)
        {
            try
            {
                rs.close();
                rs = null;
            }
            catch(Exception e)
            {
                log.error(classLogCode+"-"+logCode+" DATABASE Error closing database result set. error="+e);
            }
        }

        if(pStmt!=null)
        {
            try
            {
                pStmt.close();
                pStmt = null;
            }
            catch(Exception e)
            {
                log.error(classLogCode+"-"+logCode+" DATABASE Error closing database statement. error="+e);
            }
        }

        if(con!=null)
        {
            try
            {
                con.close();
                con = null;
            }
            catch(Exception e)
            {
                log.error(classLogCode+"-"+logCode+" DATABASE Error closing database connection. error="+e);
            }
        }
    }
}
