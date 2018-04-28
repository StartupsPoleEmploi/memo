package fr.gouv.motivaction.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import org.apache.log4j.Logger;

import fr.gouv.motivaction.Constantes.JobBoardUrl;
import fr.gouv.motivaction.model.Candidature;
import fr.gouv.motivaction.utils.DatabaseManager;

/**
 * Created by Alan on 12/04/2016.
 */
public class CandidatureDAO {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "012";

    public static Object [] list(Long userId, boolean withDescription) throws Exception
    {
        ArrayList<Candidature> cands = new ArrayList<Candidature>();

        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        try
        {
            con = DatabaseManager.getConnection();
            String sql = "SELECT * FROM candidatures WHERE userId = ?";
            pStmt = con.prepareStatement(sql);

            pStmt.setLong(1, userId);

            rs = pStmt.executeQuery();

            while (rs.next())
                cands.add(CandidatureDAO.initCandidatureFromDB(rs,withDescription));
        }
        catch (Exception e)
        {
            log.error(logCode + "-001 Error loading candidature list. userId=" + userId + " error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "002");
        }

        return cands.toArray();
    }

    public static Candidature load(Long userId, Long candidatureId) throws Exception
    {
        Candidature cand = null;
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;

        try
        {
            con = DatabaseManager.getConnection();
            String sql = "SELECT * FROM candidatures WHERE userId = ? AND id = ?";
            pStmt = con.prepareStatement(sql);

            pStmt.setLong(1, userId);
            pStmt.setLong(2, candidatureId);

            rs = pStmt.executeQuery();

            if (rs.next())
                cand = CandidatureDAO.initCandidatureFromDB(rs,true);
        }
        catch (Exception e)
        {
            log.error(logCode + "-003 Error loading candidature. userId=" + userId + " candidatureId=" + candidatureId + " error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "004");
        }

        return cand;
    }

    public static boolean isDoublon(long userId, String sourceId) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        boolean result = false;

        try
        {
            String sql = "SELECT * FROM candidatures WHERE userId=? AND sourceId=?";

            con = DatabaseManager.getConnection();
            pStmt = con.prepareStatement(sql);

            pStmt.setLong(1, userId);
            pStmt.setString(2, sourceId);

            rs = pStmt.executeQuery();

            if (rs.next())
                result = true;
        }
        catch(Exception e)
        {
            log.error(logCode + "-015 Error checking is candidature doublon. userId=" + userId + " sourceId="+sourceId+" error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "016");
        }

        return result;
    }
    
    public static long save(Candidature cand) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;

        long candidatureId = cand.getId();

        try
        {
            String sql;
            con = DatabaseManager.getConnection();
            if (cand.getId() > 0)  //update
            {
                sql = "UPDATE candidatures SET userId = ?, description = ?, " +
                        "emailContact = ?, etat = ?, lastUpdate = now(), nomCandidature = ?, nomContact = ?, nomSociete = ?, pays = ?, " +
                        "telContact = ?, urlSource = ?, ville = ?, note = ?, archived = ?, type = ?, rating = ?, sourceId = ?, logoUrl = ?, jobBoard=?, isButton=?, numSiret = ? " +
                        "WHERE id = ?";
            }
            else    // insert
            {
                sql = "INSERT INTO candidatures (userId, description, " +
                        "emailContact, etat, lastUpdate, nomCandidature, nomContact, nomSociete, pays, telContact, " +
                        "urlSource, ville, note, archived, type, rating, sourceId, logoUrl, jobBoard, isButton, numSiret) VALUE (?,?,?,?,now(),?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
            }

            pStmt = con.prepareStatement(sql);

            pStmt.setLong(1, cand.getUserId());
            pStmt.setString(2, cand.getDescription());
            pStmt.setString(3, cand.getEmailContact());
            pStmt.setInt(4, cand.getEtat());
            pStmt.setString(5, cand.getNomCandidature());
            pStmt.setString(6, cand.getNomContact());
            pStmt.setString(7, cand.getNomSociete());
            pStmt.setString(8, cand.getPays());
            pStmt.setString(9, cand.getTelContact());
            pStmt.setString(10, cand.getUrlSource());
            pStmt.setString(11, cand.getVille());
            pStmt.setString(12, cand.getNote());
            pStmt.setInt(13, cand.getArchived());
            pStmt.setInt(14, cand.getType());
            pStmt.setInt(15, cand.getRating());
            pStmt.setString(16, cand.getSourceId());
            pStmt.setString(17, cand.getLogoUrl());
            pStmt.setString(18, cand.getJobBoard());
            pStmt.setInt(19, cand.getIsButton());
            pStmt.setString(20, cand.getNumSiret());

            if(candidatureId>0)
                pStmt.setLong(21, cand.getId());
            
            
            
            pStmt.executeUpdate();

            if(candidatureId==0)
            {
                sql = "SELECT last_insert_id()";
                pStmt = con.prepareStatement(sql);
                rs = pStmt.executeQuery();

                if (rs.next())
                    candidatureId = rs.getLong(1);
            }

        }
        catch(Exception e)
        {
            log.error(logCode + "-005 Error saving candidature. candidatureId=" + cand.getId() + " error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "006");
        }

        return candidatureId;
    }

    public static void updateState(Candidature cand) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;

        try
        {
            String sql;
            con = DatabaseManager.getConnection();

            sql = "UPDATE candidatures SET etat = ?, lastUpdate = now(), archived = ?, rating = ? WHERE id = ? AND userId = ?";

            pStmt = con.prepareStatement(sql);

            pStmt.setInt(1, cand.getEtat());
            pStmt.setInt(2, cand.getArchived());
            pStmt.setInt(3, cand.getRating());
            pStmt.setLong(4, cand.getId());
            pStmt.setLong(5, cand.getUserId());

            pStmt.executeUpdate();
        }
        catch(Exception e)
        {
            log.error(logCode + "-011 Error saving candidature update. candidatureId=" + cand.getId() + " error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "012");
        }
    }

    public static Candidature initCandidatureFromDB(ResultSet rs, boolean withDescription) throws Exception
    {
        Candidature cand = new Candidature();
        cand.setId(rs.getLong("id"));
        cand.setUserId(rs.getLong("userId"));

        cand.setEmailContact(rs.getString("emailContact"));
        cand.setEtat(rs.getInt("etat"));

        if(rs.getTimestamp("lastUpdate")!=null)
            cand.setLastUpdate(rs.getTimestamp("lastUpdate").getTime());
        if(rs.getTimestamp("creationDate")!=null)
            cand.setCreationDate(rs.getTimestamp("creationDate").getTime());

        cand.setNomCandidature(rs.getString("nomCandidature"));
        cand.setNomContact(rs.getString("nomContact"));
        cand.setNomSociete(rs.getString("nomSociete"));
        cand.setNumSiret(rs.getString("numSiret"));
        cand.setPays(rs.getString("pays"));
        cand.setTelContact(rs.getString("telContact"));
        cand.setUrlSource(rs.getString("urlSource"));
        cand.setVille(rs.getString("ville"));

        cand.setArchived(rs.getInt("archived"));
        cand.setRating(rs.getInt("rating"));
        cand.setType(rs.getInt("type"));
        cand.setSourceId(rs.getString("sourceId"));
        cand.setJobBoard(rs.getString("jobBoard"));

        cand.setExpired(rs.getInt("expired"));

        cand.setLogoUrl(rs.getString("logoUrl"));

        if(withDescription)
        {
            cand.setDescription(rs.getString("description"));
            cand.setNote(rs.getString("note"));
        }

        return cand;
    }

    public static void remove(long id, long userId) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;

        try
        {
            con = DatabaseManager.getConnection();

            // l'utilisation de userId ici est une sécurité dont la pertinence n'est pas étudiée
            String sql = "DELETE FROM candidatureEvents WHERE candidatureId IN (SELECT id FROM candidatures WHERE id=? AND userId = ?)";
            pStmt = con.prepareStatement(sql);
            pStmt.setLong(1, id);
            pStmt.setLong(2, userId);

            pStmt.executeUpdate();

            sql = "DELETE FROM candidatures WHERE id=? AND userId = ?";
            pStmt = con.prepareStatement(sql);
            pStmt.setLong(1, id);
            pStmt.setLong(2, userId);

            pStmt.executeUpdate();
        }
        catch (Exception e)
        {
            log.error(logCode + "-007 Error removing candidature. userId=" + userId + " candidatureId=" + id + " error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, null, logCode, "008");
        }
    }

    public static void setExpired(long candidatureId, int expired) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;

        try
        {
            con = DatabaseManager.getConnection();

            // l'utilisation de userId ici est une sécurité dont la pertinence n'est pas étudiée
            String sql = "UPDATE candidatures SET expired=? WHERE id = ?";
            pStmt = con.prepareStatement(sql);
            pStmt.setInt(1, expired);
            pStmt.setLong(2, candidatureId);

            pStmt.executeUpdate();
        }
        catch (Exception e)
        {
            log.error(logCode + "-009 Error updating candidature expiration status. candidatureId=" + candidatureId + " error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, null, logCode, "010");
        }
    }

    public static void setCandidatureFavorite(long userId, long candidatureId, int status) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;

        try
        {
            con = DatabaseManager.getConnection();

            // l'utilisation de userId ici est une sécurité dont la pertinence n'est pas étudiée
            String sql = "UPDATE candidatures SET rating=? WHERE id = ? AND userId=?";
            pStmt = con.prepareStatement(sql);
            pStmt.setInt(1, status);
            pStmt.setLong(2, candidatureId);
            pStmt.setLong(3, userId);

            pStmt.executeUpdate();
        }
        catch (Exception e)
        {
            log.error(logCode + "-013 Error updating candidature expiration status. candidatureId=" + candidatureId + " error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, null, logCode, "014");
        }
    }
    
    /**
     * Renvoie la plus récente candidature non expirée et correspondant au jobBoard renseigné en paramètre
     * @param jobBoard
     * @return
     * @throws Exception
     */
    public static Candidature loadLastUpdateByJobBoard(JobBoardUrl jobBoard) throws Exception {
    	Candidature cand = null;
    	Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        String sql = "";

        try
        {
        	con = DatabaseManager.getConnection();
        	if (jobBoard != JobBoardUrl.GENERIQUE) {
        		sql = "SELECT * FROM candidatures WHERE urlSource LIKE '%" + jobBoard.getDomaine() + "%' AND expired = 0 ORDER BY lastUpdate DESC";
        	} else {
        		sql = "SELECT * FROM candidatures WHERE urlSource NOT LIKE '%" + JobBoardUrl.APEC + "%' "
        				+ "AND urlSource NOT LIKE '%" + JobBoardUrl.CADREMPLOI + "%' "
        				+ "AND urlSource NOT LIKE '%" + JobBoardUrl.INDEED + "%' "
        				+ "AND urlSource NOT LIKE '%" + JobBoardUrl.KELJOB + "%' "
        				+ "AND urlSource NOT LIKE '%" + JobBoardUrl.LEBONCOIN + "%' "
        				+ "AND urlSource NOT LIKE '%" + JobBoardUrl.METEOJOB + "%' "
        				+ "AND urlSource NOT LIKE '%" + JobBoardUrl.MONSTER + "%' "
        				+ "AND urlSource NOT LIKE '%" + JobBoardUrl.POLE_EMPLOI + "%' "
        				+ "AND urlSource NOT LIKE '%" + JobBoardUrl.VIVASTREET + "%' "
        				+ "AND urlSource NOT LIKE '%" + JobBoardUrl.CENTREJOB + "%' "
        				+ "AND urlSource NOT LIKE '%" + JobBoardUrl.ESTJOB + "%' "
        				+ "AND urlSource NOT LIKE '%" + JobBoardUrl.NORDJOB + "%' "
        				+ "AND urlSource NOT LIKE '%" + JobBoardUrl.OUESTJOB + "%' "
        				+ "AND urlSource NOT LIKE '%" + JobBoardUrl.PACAJOB + "%' "
        				+ "AND urlSource NOT LIKE '%" + JobBoardUrl.PARISJOB + "%' "
        				+ "AND urlSource NOT LIKE '%" + JobBoardUrl.RHONEALPESJOB + "%' "
        				+ "AND urlSource NOT LIKE '%" + JobBoardUrl.SUDOUESTJOB + "%' "
        				+ "AND expired = 0 ORDER BY lastUpdate DESC";
        	}
            pStmt = con.prepareStatement(sql);

            rs = pStmt.executeQuery();

            if (rs.next())
                cand = CandidatureDAO.initCandidatureFromDB(rs,true);
        }
        catch (Exception e)
        {
            log.error(logCode + "-017 Error loading candidature. urlSource=" + jobBoard + " error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "018" );
        }

        return cand;
    }

    public static ArrayList findCandidaturesByKeyword(long userId, String searchString) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;

        ArrayList res = new ArrayList();

        try
        {
            con = DatabaseManager.getConnection();
            String sql = "SELECT id FROM candidatures WHERE userId = ? AND (description like ? or note like ?)";

            pStmt = con.prepareStatement(sql);

            pStmt.setLong(1, userId);
            pStmt.setString(2, "%" + searchString + "%");
            pStmt.setString(3,"%"+searchString+"%");

            rs = pStmt.executeQuery();

            while (rs.next())
                res.add(rs.getLong("id"));
        }
        catch (Exception e)
        {
            log.error(logCode + "-019 Error searching in candidatures. userId=" + userId + " searchString=" + searchString + " error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "020");
        }

        return res;
    }

    public static void anonymizeUserCandidacies(Long userId) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;

        try
        {
            con = DatabaseManager.getConnection();
            String sql = "UPDATE candidatures SET description=null, nomContact=null, emailContact=null, telContact=null, urlSource = null, note = null, sourceId = null " +
                    " WHERE userId=?";

            pStmt = con.prepareStatement(sql);
            pStmt.setLong(1, userId);
            pStmt.executeUpdate();
        }
        catch (Exception e)
        {
            log.error(logCode + "-021 Error anonymizing candidatures. userId=" + userId + " error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, null, logCode, "022");
        }
    }
}
