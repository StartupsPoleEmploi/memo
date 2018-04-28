package fr.gouv.motivaction.dao;

import fr.gouv.motivaction.model.Attachment;
import fr.gouv.motivaction.model.AttachmentFile;
import fr.gouv.motivaction.model.Candidature;
import fr.gouv.motivaction.utils.DatabaseManager;
import org.apache.log4j.Logger;

import java.sql.Blob;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

public class AttachmentDAO {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "034";

    // test l'existence d'un document en base correspondant à ce md5 pour cet utilisateur
    public static boolean attachmentExists(long userId, String md5) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        boolean result = false;

        try
        {
            con = DatabaseManager.getConnection();
            String sql = "SELECT * FROM attachments WHERE userId = ? AND md5 = ?";
            pStmt = con.prepareStatement(sql);

            pStmt.setLong(1, userId);
            pStmt.setString(2, md5);

            rs = pStmt.executeQuery();

            if (rs.next())
                result = true;
        }
        catch (Exception e)
        {
            log.error(logCode + "-001 Error checking attachment existence. userId=" + userId + " md5=" + md5 + " error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "002");
        }

        return result;
    }

    public static long saveAttachment(Attachment att) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;

        long attachmentId = 0;

        try
        {
            String sql;
            con = DatabaseManager.getConnection();
            sql = "INSERT INTO attachments (userId, candidatureId, fileName, type, md5, virusChecked) VALUE (?,?,?,?,?,?)";

            pStmt = con.prepareStatement(sql);

            pStmt.setLong(1, att.getUserId());
            pStmt.setLong(2, att.getCandidatureId());
            pStmt.setString(3, att.getFileName());
            pStmt.setString(4, att.getType());
            pStmt.setString(5, att.getMd5());
            pStmt.setInt(6, att.getVirusChecked());

            pStmt.executeUpdate();

            sql = "SELECT last_insert_id()";
            pStmt = con.prepareStatement(sql);
            rs = pStmt.executeQuery();

            if (rs.next())
                attachmentId = rs.getLong(1);
        }
        catch(Exception e)
        {
            log.error(logCode + "-003 Error saving attachment. userId="+att.getUserId()+" candidatureId=" + att.getId() + " md5="+att.getMd5()+" error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "004");
        }

        return attachmentId;
    }

    public static Attachment load(long userId, long attachmentId, boolean allowUncheckedFiles) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;

        Attachment att = null;

        try
        {
            String sql;
            con = DatabaseManager.getConnection();
            sql = "SELECT * FROM attachments WHERE userId=? AND id=?";

            if(!allowUncheckedFiles)
                sql += " AND virusChecked=1";

            pStmt = con.prepareStatement(sql);

            pStmt.setLong(1, userId);
            pStmt.setLong(2, attachmentId);

            rs = pStmt.executeQuery();

            if (rs.next())
                att = initAttachmentFromDB(rs);
        }
        catch(Exception e)
        {
            log.error(logCode + "-005 Error loading attachment. userId="+userId+" attachmentId="+attachmentId+" error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "006");
        }

        return att;
    }

    public static Object [] list(Long candidatureId, long userId, boolean allowUncheckedFiles) throws Exception
    {
        ArrayList<Attachment> atts = new ArrayList<Attachment>();

        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        try
        {
            con = DatabaseManager.getConnection();
            String sql = "SELECT * FROM attachments WHERE candidatureId = ?";

            if(!allowUncheckedFiles)
                sql += " AND virusChecked=1";

            pStmt = con.prepareStatement(sql);

            pStmt.setLong(1, candidatureId);

            rs = pStmt.executeQuery();

            while (rs.next())
                atts.add(AttachmentDAO.initAttachmentFromDB(rs));
        }
        catch (Exception e)
        {
            log.error(logCode + "-007 Error loading attachment list. userId=" + userId + " candidatureId="+candidatureId+" error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "008");
        }

        return atts.toArray();
    }

    public static Object [] list(long userId) throws Exception
    {
        ArrayList<Attachment> atts = new ArrayList<Attachment>();

        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        try
        {
            con = DatabaseManager.getConnection();
            String sql = "SELECT * FROM attachments WHERE userId = ?";
            pStmt = con.prepareStatement(sql);

            pStmt.setLong(1, userId);

            rs = pStmt.executeQuery();

            while (rs.next())
                atts.add(AttachmentDAO.initAttachmentFromDB(rs));
        }
        catch (Exception e)
        {
            log.error(logCode + "-015 Error loading attachment list. userId=" + userId + " error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "016");
        }

        return atts.toArray();
    }


    public static Attachment initAttachmentFromDB(ResultSet rs) throws Exception
    {
        Attachment att = new Attachment();

        att.setId(rs.getLong("id"));
        att.setUserId(rs.getLong("userId"));
        att.setCandidatureId(rs.getLong("candidatureId"));

        att.setMd5(rs.getString("md5"));
        att.setFileName(rs.getString("fileName"));
        att.setType(rs.getString("type"));

        att.setVirusChecked(rs.getInt("virusChecked"));

        return att;
    }

    public static int getAttachmentCandidacyCount(Attachment att) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        int res = 0;
        try
        {
            con = DatabaseManager.getConnection();
            String sql = "SELECT count(*) FROM attachments WHERE md5=? AND userId=?";
            pStmt = con.prepareStatement(sql);

            pStmt.setString(1, att.getMd5());
            pStmt.setLong(2, att.getUserId());

            rs = pStmt.executeQuery();

            if(rs.next())
                res = rs.getInt(1);
        }
        catch (Exception e)
        {
            log.error(logCode + "-009 Error couting attachment occurence. userId=" + att.getUserId()+ " attachmentId="+att.getId()+" error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "010");
        }

        return res;
    }

    public static void delete(Attachment att) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;

        try
        {
            con = DatabaseManager.getConnection();
            String sql = "DELETE FROM attachments WHERE id=? AND userId=?";
            pStmt = con.prepareStatement(sql);

            pStmt.setLong(1, att.getId());
            pStmt.setLong(2, att.getUserId());

            pStmt.executeUpdate();

        }
        catch (Exception e)
        {
            log.error(logCode + "-011 Error deleting attachment. userId=" + att.getUserId()+ " attachmentId="+att.getId()+" error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, null, logCode, "012");
        }
    }

    public static void deleteUserAttachments(long userId)
    {
        Connection con = null;
        PreparedStatement pStmt = null;

        try
        {
            con = DatabaseManager.getConnection();

            String sql = "DELETE FROM attachmentFiles WHERE userId=?";
            pStmt = con.prepareStatement(sql);
            pStmt.setLong(1, userId);
            pStmt.executeUpdate();

            sql = "DELETE FROM attachments WHERE userId=?";
            pStmt = con.prepareStatement(sql);
            pStmt.setLong(1, userId);
            pStmt.executeUpdate();
        }
        catch (Exception e)
        {
            log.error(logCode + "-013 Error deleting user attachments. userId=" + userId+ " error=" + e);
        }
        finally
        {
            DatabaseManager.close(con, pStmt, null, logCode, "014");
        }
    }

    public static int isVirusChecked(long attId) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        int res = 0;
        try
        {
            con = DatabaseManager.getConnection();
            String sql = "SELECT virusChecked FROM attachments WHERE id=?";
            pStmt = con.prepareStatement(sql);

            pStmt.setLong(1, attId);

            rs = pStmt.executeQuery();

            if(rs.next())
                res = rs.getInt(1);
        }
        catch (Exception e)
        {
            log.error(logCode + "-017 Error checking isVirusChecked. attachmentId="+attId+" error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "018");
        }

        return res;


    }

    public static void deleteFile(long userId, String md5) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;

        try
        {
            con = DatabaseManager.getConnection();
            String sql = "DELETE FROM attachmentFiles WHERE userId=? AND md5=?";
            pStmt = con.prepareStatement(sql);

            pStmt.setLong(1, userId);
            pStmt.setString(2, md5);

            pStmt.executeUpdate();

        }
        catch (Exception e)
        {
            log.error(logCode + "-023 Error deleting attachment. userId=" + userId+ " md5="+md5+" error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, null, logCode, "024");
        }
    }

    public static AttachmentFile loadFile(long userId, String md5) throws Exception
    {
        AttachmentFile attFile = null;

        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;

        try
        {
            String sql;
            con = DatabaseManager.getConnection();
            sql = "SELECT * FROM attachmentFiles WHERE userId=? AND md5=?";

            pStmt = con.prepareStatement(sql);

            pStmt.setLong(1, userId);
            pStmt.setString(2, md5);

            rs = pStmt.executeQuery();

            if (rs.next())
                attFile = initAttachmentFileFromDB(rs);
        }
        catch(Exception e)
        {
            log.error(logCode + "-021 Error loading attachment file. userId="+userId+" md5="+md5+" error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "022");
        }

        return attFile;
    }

    public static void saveFile(AttachmentFile attFile) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;

        try
        {
            String sql;
            con = DatabaseManager.getConnection();
            sql = "INSERT INTO attachmentFiles (userId, md5, fileData) VALUE (?,?,?)";

            pStmt = con.prepareStatement(sql);

            pStmt.setLong(1, attFile.getUserId());
            pStmt.setString(2, attFile.getMd5());
            pStmt.setBytes(3, attFile.getFileData());

            pStmt.executeUpdate();
        }
        catch(Exception e)
        {
            log.error(logCode + "-019 Error saving attachment file data. userId="+attFile.getUserId()+" md5="+attFile.getMd5()+" error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "020");
        }
    }

    public static AttachmentFile initAttachmentFileFromDB(ResultSet rs) throws Exception
    {
        AttachmentFile att = new AttachmentFile();

        att.setId(rs.getLong("id"));
        att.setUserId(rs.getLong("userId"));
        att.setMd5(rs.getString("md5"));
        att.setFileData(rs.getBytes("fileData"));

        return att;
    }

}
