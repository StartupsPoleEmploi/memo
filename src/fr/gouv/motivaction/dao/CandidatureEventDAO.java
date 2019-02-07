package fr.gouv.motivaction.dao;

import fr.gouv.motivaction.model.Candidature;
import fr.gouv.motivaction.model.CandidatureEvent;
import fr.gouv.motivaction.utils.DatabaseManager;
import org.apache.log4j.Logger;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.util.ArrayList;

/**
 * Created by Alan on 30/05/2016.
 */
public class CandidatureEventDAO {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "013";

    public static long save(CandidatureEvent event) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;

        long eventId = event.getId();

        try
        {
            String sql;
            con = DatabaseManager.getConnection();
            if (eventId > 0)  //update
            {
                sql = "UPDATE candidatureEvents SET eventType = ?, eventSubType = ?, eventTime = ?, " +
                        "comment = ? WHERE id = ?";
            }
            else    // insert
            {
                sql = "INSERT INTO candidatureEvents (eventType, eventSubType, eventTime, comment, " +
                        "candidatureId, creationTime) VALUE (?,?,?,?,?,now())";
            }

            pStmt = con.prepareStatement(sql);

            pStmt.setInt(1, event.getEventType());
            pStmt.setInt(2, event.getEventSubType());
            pStmt.setTimestamp(3, new Timestamp(event.getEventTime()));
            pStmt.setString(4, event.getComment());
            if(eventId>0)
                pStmt.setLong(5,eventId);
            else
                pStmt.setLong(5,event.getCandidatureId());


            pStmt.executeUpdate();

            if(eventId==0)
            {
                sql = "SELECT last_insert_id()";
                pStmt = con.prepareStatement(sql);
                rs = pStmt.executeQuery();

                if (rs.next())
                    eventId = rs.getLong(1);
            }

        }
        catch(Exception e)
        {
            log.error(logCode + "-001 Error saving candidature event. candidatureId=" + event.getCandidatureId() + " error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "002");
        }

        return eventId;
    }

    public static CandidatureEvent initEventFromDB(ResultSet rs) throws Exception
    {
        CandidatureEvent event = new CandidatureEvent();
        event.setId(rs.getLong("id"));
        event.setCandidatureId(rs.getLong("candidatureId"));

        if(rs.getTimestamp("creationTime")!=null)
            event.setCreationTime(rs.getTimestamp("creationTime").getTime());

        if(rs.getTimestamp("eventTime")!=null)
            event.setEventTime(rs.getTimestamp("eventTime").getTime());

        if(event.getEventTime()==0)
            event.setEventTime(event.getCreationTime());

        event.setComment(rs.getString("comment"));
        event.setEventType(rs.getInt("eventType"));
        event.setEventSubType(rs.getInt("eventSubType"));

        return event;
    }

    public static void remove(long id, long candidatureId) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;

        try
        {
            con = DatabaseManager.getConnection();

            // l'utilisation de userId ici est une sécurité dont la pertinence n'est pas étudiée
            String sql = "DELETE FROM candidatureEvents WHERE id = ?  AND candidatureId = ?";
            pStmt = con.prepareStatement(sql);
            pStmt.setLong(1, id);
            pStmt.setLong(2, candidatureId);

            pStmt.executeUpdate();
        }
        catch (Exception e)
        {
            log.error(logCode + "-003 Error removing candidature event. eventId=" + id + " candidatureId="+candidatureId+" error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, null, logCode, "004");
        }
    }

    public static Object [] list(Long userId) throws Exception
    {
        ArrayList<CandidatureEvent> events = new ArrayList<CandidatureEvent>();

        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        try
        {
            con = DatabaseManager.getConnection();
            String sql = "SELECT * FROM candidatureEvents WHERE candidatureId IN (SELECT id FROM candidatures WHERE userId = ?)";
            pStmt = con.prepareStatement(sql);

            pStmt.setLong(1, userId);

            rs = pStmt.executeQuery();

            while (rs.next())
                events.add(CandidatureEventDAO.initEventFromDB(rs));
        }
        catch (Exception e)
        {
            log.error(logCode + "-005 Error loading candidature event list. userId=" + userId + " error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "006");
        }

        return events.toArray();
    }

    public static Object [] listFromUserLogPerPreviousDay(int day) throws Exception
    {
        ArrayList<CandidatureEvent> lstCandEvt = new ArrayList<CandidatureEvent>();

        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        try
        {
            con = DatabaseManager.getConnection();
            String sql = "SELECT * from userLogs uL " +
            				"INNER JOIN candidatureEvents cE ON uL.candidatureId = cE.id " + 
            				"WHERE DATE(uL.creationTime) = DATE( SUBDATE(NOW(), INTERVAL " + day + " DAY) ) " +
            				"AND uL.domaine = 'CandidatureEvent'";
            pStmt = con.prepareStatement(sql);
            rs = pStmt.executeQuery();

            while (rs.next())
            	lstCandEvt.add(CandidatureEventDAO.initEventFromDB(rs));
        }
        catch (Exception e)
        {
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "003");
        }

        return lstCandEvt.toArray();
    }
    
    public static void removeEvent(long eventId, long candidatureId, long userId) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;

        try
        {
            con = DatabaseManager.getConnection();

            // l'utilisation de userId ici est une sécurité dont la pertinence n'est pas étudiée
            String sql = "DELETE FROM candidatureEvents WHERE id = ? AND candidatureId IN (SELECT id FROM candidatures WHERE id=? AND userId = ?)";
            pStmt = con.prepareStatement(sql);
            pStmt.setLong(1, eventId);
            pStmt.setLong(2, candidatureId);
            pStmt.setLong(3, userId);

            pStmt.executeUpdate();
        }
        catch (Exception e)
        {
            log.error(logCode + "-009 Error removing candidature event. userId=" + userId + " candidatureId=" + candidatureId + " eventId=" + eventId + "  error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, null, logCode, "010");
        }


    }

    public static CandidatureEvent load(Long eventId) throws Exception
    {
        CandidatureEvent event = null;

        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        try
        {
            con = DatabaseManager.getConnection();
            String sql = "SELECT * FROM candidatureEvents WHERE id = ?";
            pStmt = con.prepareStatement(sql);

            pStmt.setLong(1, eventId);

            rs = pStmt.executeQuery();

            if(rs.next())
                event = CandidatureEventDAO.initEventFromDB(rs);
        }
        catch (Exception e)
        {
            log.error(logCode + "-011 Error loading candidature event. eventId=" + eventId + " error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "012");
        }

        return event;
    }


    public static void anonymizeUserCandidacyEvents(Long userId) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;

        try
        {
            con = DatabaseManager.getConnection();
            String sql = "UPDATE candidatureEvents SET comment=null WHERE candidatureId IN (SELECT id FROM candidatures WHERE userId=?)";
            pStmt = con.prepareStatement(sql);
            pStmt.setLong(1, userId);
            pStmt.executeUpdate();
        }
        catch (Exception e)
        {
            log.error(logCode + "-013 Error anonymizing candidature events. userId=" + userId + " error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, null, logCode, "014");
        }
    }
}
