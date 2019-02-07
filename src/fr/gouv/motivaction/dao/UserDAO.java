package fr.gouv.motivaction.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Types;
import java.time.format.DateTimeFormatter;

import org.apache.log4j.Logger;

import fr.gouv.motivaction.model.CandidatureEvent;
import fr.gouv.motivaction.model.CandidatureReport;
import fr.gouv.motivaction.model.User;
import fr.gouv.motivaction.model.UserSummary;
import fr.gouv.motivaction.service.UserService;
import fr.gouv.motivaction.utils.DatabaseManager;
import fr.gouv.motivaction.utils.Utils;


/**
 * Created by Alan on 06/04/2016.
 */
public class UserDAO {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "011";

    public static String url;
    public static DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");

    public static User load(String login) throws Exception
    {
        User user = null;

        Connection con = null;
        ResultSet rs = null;
        PreparedStatement pStmt = null;

        try
        {
            con = DatabaseManager.getConnection();
            String sql = "select * from users where login = ?";
            pStmt = con.prepareStatement(sql);

            pStmt.setString(1, login);

            rs = pStmt.executeQuery();

            if (rs.next())
            {   // un compte présent, on vérifie s'il est validé
                user = UserDAO.initUserFromDB(rs);
            }
        }
        catch (Exception e)
        {
            log.error(logCode+"-001 Error loading user. login="+login+" error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con,pStmt,rs, logCode, "002");
        }

        return user;
    }

    // charge un utilisateur à partir de son login et de son mot de passe en essayant d'abord avec le salt actuel, puis avec le salt précédent
    public static User loadWithFallback(String login, String password) throws Exception
    {
        User user = null;

        user = UserDAO.load(login, password, UserService.pwdSql);

        if(user==null)
        {
            log.info(logCode+"-029 USER Connection did not work with primary salt. Falling back.");
            user = UserDAO.load(login, password, UserService.pwdSql2);
        }

        return user;
    }

    public static User load(String login, String password, String pwdSql) throws Exception
    {
        User user = null;

        Connection con = null;
        ResultSet rs = null;
        PreparedStatement pStmt = null;

        try
        {
            con = DatabaseManager.getConnection();
            String sql = "SELECT * FROM users WHERE login = ? AND newPassword="+ pwdSql;

            pStmt = con.prepareStatement(sql);

            pStmt.setString(1, login);
            pStmt.setString(2, login);
            pStmt.setString(3, password);

            rs = pStmt.executeQuery();

            if (rs.next())
            {   // un compte présent, on vérifie s'il est validé
                user = UserDAO.initUserFromDB(rs);
            }
        }
        catch (Exception e)
        {
            log.error(logCode+"-015 Error loading user. login="+login+" error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con,pStmt,rs, logCode, "016");
        }

        return user;
    }




    public static User load(Long facebookId) throws Exception
    {
        User user = null;

        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;

        try
        {
            String sql = "select * from users where facebookId = ?";
            con = DatabaseManager.getConnection();
            pStmt = con.prepareStatement(sql);

            pStmt.setLong(1, facebookId);

            rs = pStmt.executeQuery();

            if (rs.next())
            {   // un compte présent, on vérifie s'il est validé
                user = UserDAO.initUserFromDB(rs);
            }
        }
        catch (Exception e)
        {
            log.error(logCode + "-003 Error loading user. facebookId=" + facebookId + " error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "004");
        }

        return user;
    }

    public static User loadFromPEAMId(String peUserId) throws Exception
    {
        User user = null;

        Connection con = null;
        ResultSet rs = null;
        PreparedStatement pStmt = null;

        try
        {
            con = DatabaseManager.getConnection();
            String sql = "select * from users where peId = ?";
            pStmt = con.prepareStatement(sql);

            pStmt.setString(1, peUserId);

            rs = pStmt.executeQuery();

            if (rs.next())
            {
                user = UserDAO.initUserFromDB(rs);
            }
        }
        catch (Exception e)
        {
            log.error(logCode+"-023 Error loading user from PE Id. peUserId="+peUserId+" error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con,pStmt,rs, logCode, "024");
        }

        return user;
    }


    public static User loadFromId(Long userId) throws Exception
    {
        User user = null;

        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;

        try
        {
            String sql = "select * from users where id = ?";
            con = DatabaseManager.getConnection();
            pStmt = con.prepareStatement(sql);

            pStmt.setLong(1, userId);

            rs = pStmt.executeQuery();

            if (rs.next())
            {   // un compte présent, on vérifie s'il est validé
                user = UserDAO.initUserFromDB(rs);
            }
        }
        catch (Exception e)
        {
            log.error(logCode + "-005 Error loading user. userId=" + userId + " error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "006");
        }

        return user;
    }

    public static boolean isAdmin(long userId) throws  Exception{

        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        boolean res = false;

        try
        {
            String sql = "select * from adminUsers where userId = ?";
            con = DatabaseManager.getConnection();
            pStmt = con.prepareStatement(sql);

            pStmt.setLong(1, userId);

            rs = pStmt.executeQuery();

            if (rs.next())
            {   // userId correspond bien  à l'id d'un utilisateur autorisé
                res = true;
            }
        }
        catch (Exception e)
        {
            log.error(logCode + "-007 Error checking isAdmin. userId=" + userId + " error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "008");
        }

        return res;
    }

    public static User initUserFromDB(ResultSet rs) throws Exception{

        User user = new User();
        user.setLogin(rs.getString("login"));
        //user.setPassword(rs.getString("password"));
        user.setValidated(rs.getInt("validated"));
        user.setValidationCode(rs.getString("validationCode"));
        user.setCreationTime(rs.getTimestamp("creationTime"));
        user.setId(rs.getLong("id"));
        user.setChangePasswordToken(rs.getString("changePasswordToken"));
        user.setFacebookId(rs.getLong("facebookId"));
        user.setReceiveNotification(rs.getInt("receiveNotification"));
        user.setLastPasswordChange(rs.getTimestamp("lastPasswordChange"));
        user.setAutoDisableNotification(rs.getInt("autoDisableNotification"));
        user.setLastName(rs.getString("lastName"));
        user.setFirstName(rs.getString("firstName"));
        user.setGender(rs.getString("gender"));
        user.setPeId(rs.getString("peId"));
        user.setPeEmail(rs.getString("peEmail"));
        user.setAddress(rs.getString("address"));
        user.setCity(rs.getString("city"));
        user.setCountry(rs.getString("country"));
        user.setZip(rs.getString("zip"));
        user.setCityInsee(rs.getString("cityInsee"));
        user.setSource(rs.getString("source"));

        return user;
    }

    public static void insert(User user) throws Exception
    {
        Connection con = null;
        ResultSet rs = null;
        PreparedStatement pStmt = null;
        try
        {
            con = DatabaseManager.getConnection();
            //String sql = "insert into users (login, password, facebookId, validationCode, creationTime) value (?,?,?,?,now())";
            String sql = "insert into users " +
                    "(login, newPassword, facebookId, validationCode, creationTime, source, lastName, " +
                    "firstName, peId, peEmail, gender, address, city, country, zip, cityInsee) value " +
                    "(?,"+UserService.pwdSql+",?,?,now(),?,?,?,?,?,?,?,?,?,?,?)";
            pStmt = con.prepareStatement(sql);

            pStmt.setString(1, user.getLogin());

            String shaLogin = user.getLogin();
            if(shaLogin==null)                      // en cas d'absence de login il n'est pas possible de se connecter par login / mot de passe
                shaLogin="";

            pStmt.setString(2, shaLogin);    // pour le mdp obfusqué
            pStmt.setString(3, user.getPassword());

            if(user.getFacebookId()==0)
                pStmt.setNull(4, Types.BIGINT);
            else
                pStmt.setLong(4, user.getFacebookId());

            pStmt.setString(5, user.getValidationCode());

            pStmt.setString(6,user.getSource());
            pStmt.setString(7,user.getLastName());
            pStmt.setString(8,user.getFirstName());
            pStmt.setString(9,user.getPeId());
            pStmt.setString(10,user.getPeEmail());
            pStmt.setString(11,user.getGender());
            pStmt.setString(12,user.getAddress());
            pStmt.setString(13,user.getCity());
            pStmt.setString(14,user.getCountry());
            pStmt.setString(15,user.getZip());
            pStmt.setString(16,user.getCityInsee());

            pStmt.executeUpdate();

            sql = "SELECT last_insert_id()";
            pStmt = con.prepareStatement(sql);
            rs = pStmt.executeQuery();

            if (rs.next())
                user.setId(rs.getLong(1));
        }
        catch (Exception e)
        {
            log.error(logCode + "-009 Error inserting user. login=" + user.getLogin() + " error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con,pStmt,rs, logCode, "010");
        }
    }

    public static void update(User user) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;

        try
        {
            con = DatabaseManager.getConnection();
            String sql = "UPDATE users SET login=?, newPassword="+UserService.pwdSql+", facebookId=?, validationCode=?, validated=?, " +
                    "lastPasswordChange=?, changePasswordToken=?, lastName=?, firstName=?, peId=?, peEmail=?, gender=?, source=?, " +
                    "address=?, city=?, country=?, zip=?, cityInsee=? WHERE id=?";
            pStmt = con.prepareStatement(sql);

            pStmt.setString(1, user.getLogin());

            String shaLogin = user.getLogin();
            if(shaLogin==null)                      // en cas d'absence de login il n'est pas possible de se connecter par login / mot de passe
                shaLogin="";

            pStmt.setString(2, shaLogin);    // pour le mdp obfusqué

            pStmt.setString(3, user.getPassword());

            if(user.getFacebookId()==0)
                pStmt.setNull(4, Types.BIGINT);
            else
                pStmt.setLong(4, user.getFacebookId());

            pStmt.setString(5, user.getValidationCode());
            pStmt.setInt(6, user.getValidated());
            pStmt.setTimestamp(7, user.getLastPasswordChange());
            pStmt.setString(8, (user.getChangePasswordToken()==null)?"":user.getChangePasswordToken());

            pStmt.setString(9,user.getLastName());
            pStmt.setString(10,user.getFirstName());
            pStmt.setString(11, user.getPeId());
            pStmt.setString(12, user.getPeEmail());
            pStmt.setString(13,user.getGender());
            pStmt.setString(14,user.getSource());

            pStmt.setString(15,user.getAddress());
            pStmt.setString(16,user.getCity());
            pStmt.setString(17,user.getCountry());
            pStmt.setString(18, user.getZip());
            pStmt.setString(19,user.getCityInsee());

            pStmt.setLong(20, user.getId());

            pStmt.executeUpdate();
        }
        catch (Exception e)
        {
            log.error(logCode+"-011 Error updating user. userId="+user.getId()+" error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt,null, logCode, "012");
        }
    }

    public static void updatePEAMUser(User user) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;

        try
        {
            con = DatabaseManager.getConnection();
            String sql = "UPDATE users SET lastName=?, firstName=?, peEmail=?, gender=?, address=?, city=?, country=?, zip=?, cityInsee=?, peId=? WHERE id=?";
            pStmt = con.prepareStatement(sql);

            pStmt.setString(1,user.getLastName());
            pStmt.setString(2,user.getFirstName());
            pStmt.setString(3, user.getPeEmail());
            pStmt.setString(4,user.getGender());
            pStmt.setString(5,user.getAddress());
            pStmt.setString(6,user.getCity());
            pStmt.setString(7,user.getCountry());
            pStmt.setString(8,user.getZip());
            pStmt.setString(9,user.getCityInsee());
            pStmt.setString(10,user.getPeId());
            
            pStmt.setLong(11, user.getId());

            pStmt.executeUpdate();
        }
        catch (Exception e)
        {
            log.error(logCode+"-025 Error updating user from PEAM. userId="+user.getId()+" error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt,null, logCode, "026");
        }
    }


    public static void setUserSubscriptions(User user) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;

        try
        {
            con = DatabaseManager.getConnection();
            String sql = "UPDATE users SET receiveNotification=? WHERE id=?";
            pStmt = con.prepareStatement(sql);

            pStmt.setInt(1, user.getReceiveNotification());
            pStmt.setLong(2, user.getId());

            pStmt.executeUpdate();
        }
        catch (Exception e)
        {
            log.error(logCode+"-013 Error updating user's email subscription. userId="+user.getId()+" error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt,null, logCode, "014");
        }
    }

    /*
    public static User deleteFromId(Long userId) throws Exception
    {
        User user = null;

        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;

        try
        {
            con = DatabaseManager.getConnection();
            String sql = "delete from candidatureEvents where candidatureId in (select id from candidatures where userId= ?)";
            pStmt = con.prepareStatement(sql);
            pStmt.setLong(1, userId);
            rs = pStmt.executeQuery();

            sql = "delete from candidatures where userId = ?";
            pStmt = con.prepareStatement(sql);
            pStmt.setLong(1, userId);
            rs = pStmt.executeQuery();
            
            sql = "delete from users where id = ?";
            pStmt = con.prepareStatement(sql);
            pStmt.setLong(1, userId);
            rs = pStmt.executeQuery();
            
            sql = "delete from userLogs where userId = ?";
            pStmt = con.prepareStatement(sql);
            pStmt.setLong(1, userId);
            rs = pStmt.executeQuery();
        }
        catch (Exception e)
        {
            log.error(logCode + "-015 Error deleting user. userId=" + userId + " error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "016");
        }

        return user;
    }
    */

    public static void anonymizeUser(Long userId) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;

        try
        {
            con = DatabaseManager.getConnection();
            String sql = "update users set login=null, facebookId=null, newPassword=null, peEmail=null, peId=null, lastName=null, firstName=null, gender=null, address=null, city=null, " +
                    "zip = SUBSTRING(zip,1,2), " +
                    "cityInsee =  SUBSTRING(cityInsee,1,2), " +
                    "toDelete = 0 " +
                    "WHERE id = ?";
            pStmt = con.prepareStatement(sql);
            pStmt.setLong(1, userId);
            pStmt.executeUpdate();
        }
        catch (Exception e)
        {
            log.error(logCode + "-027 Error anonymizing user. userId=" + userId + " error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, null, logCode, "028");
        }
    }

    public static void prepareUserForDeletion(long userId) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;

        try
        {
            con = DatabaseManager.getConnection();
            String sql = "update users set login=null, facebookId=null, newPassword=null, peId=null, toDelete = 1 " +
                    "WHERE id = ?";
            pStmt = con.prepareStatement(sql);
            pStmt.setLong(1, userId);
            pStmt.executeUpdate();
        }
        catch (Exception e)
        {
            log.error(logCode + "-030 Error preparing user for deletion. userId=" + userId + " error=" + e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, null, logCode, "031");
        }
    }

    public static void saveUserRefreshLink(long userId, String token) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;

        try
        {
            con = DatabaseManager.getConnection();
            String sql = "UPDATE users SET changePasswordToken=? WHERE id=?";
            pStmt = con.prepareStatement(sql);

            pStmt.setString(1, token);
            pStmt.setLong(2, userId);

            pStmt.executeUpdate();
        }
        catch (Exception e)
        {
            log.error(logCode+"-017 Error updating user's password token. userId="+userId+" error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt,null, logCode, "018");
        }
    }

    public static boolean checkUserLastPasswordChange(long userId) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        boolean result = false;

        try
        {
            con = DatabaseManager.getConnection();
            //@RG suggestion de changement de mot de passe tous les 6 mois
            String sql = "SELECT * FROM users WHERE id=? AND lastPasswordChange < NOW() - INTERVAL 6 MONTH";
            pStmt = con.prepareStatement(sql);
            pStmt.setLong(1, userId);
            rs = pStmt.executeQuery();

            result = rs.next();
        }
        catch (Exception e)
        {
            log.error(logCode+"-019 Error checking user's last password change. userId="+userId+" error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "020");
        }

        return result;
    }
    
    /**
     * update le champ autoDisableNotification de la table users
     * @param idUser
     * @param val
     * @throws Exception
     */
    public static void setAutoDisableNotification(Long idUser, int val) throws Exception {
    	Connection con = null;
        PreparedStatement pStmt = null;

        if (idUser != null) {
	        try
	        {
	            con = DatabaseManager.getConnection();
	            String sql = "UPDATE users SET autoDisableNotification="+val+" WHERE id = " + idUser.longValue() + " ";
	            pStmt = con.prepareStatement(sql);
	            pStmt.executeUpdate();
	        }
	        catch (Exception e)
	        {
	            log.error(logCode+"-021 Error updating user's autoDisableNotification. error="+e);
	            throw new Exception("DB Error");
	        }
	        finally
	        {
	            DatabaseManager.close(con, pStmt,null, logCode, "022");
	        }
        }
    }
    
    public static UserSummary loadUserSummary(long userId) {
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        
        UserSummary userSum = null;
        CandidatureReport currentCandidature = null;
        CandidatureEvent evt;
        long  cId;

        try
        {
        	// @RG - EMAIL : la campagne de mail "Vos priorités cette semaine" s'adresse aux utilisateurs ayant des candidatures afin de leur rappeler les actions de la semaine à effectuer sur leurs candidatures 'non terminées' 
            con = DatabaseManager.getConnection();

            String sql = "SELECT    users.login, " +
                    "    users.id as uId," +
                    "    candidatures.nomCandidature," +
                    "    candidatures.nomSociete," +
                    "    candidatures.id as cId," +
                    "    candidatures.type," +
                    "    candidatures.urlSource," +
                    "    candidatures.etat," +
                    "    candidatures.creationDate," +
                    "    candidatures.lastUpdate," +
                    "    candidatures.nomContact," +
                    "    candidatures.emailContact," +
                    "    candidatures.telContact," +
                    "    candidatures.ville," +
                    "    candidatures.archived," +
                    "    candidatureEvents.eventTime," +
                    "    candidatureEvents.creationTime," +
                    "    candidatureEvents.eventType," +
                    "    candidatureEvents.eventSubType" +
                    "    FROM  users" +
                    "    LEFT JOIN  candidatures ON  users.id = candidatures.userId" +
                    "    LEFT JOIN  candidatureEvents ON  candidatureEvents.candidatureId = candidatures.id" +
                    "    WHERE users.id=" + userId +
                    "    ORDER BY candidatures.id, candidatureEvents.eventTime";

            
                pStmt = con.prepareStatement(sql);
                rs = pStmt.executeQuery();

                if (rs != null) {
                    while (rs.next()) {
                    	if (userSum == null) {
	                    	// initialisation nouvel utilisateur courant
	                    	userSum = new UserSummary();
	                    	userSum.setUserId(userId);
	                    	userSum.setEmail(rs.getString("login"));
                    	}
                    	
                        evt = new CandidatureEvent();
                        cId = rs.getLong("cId");

                        evt.setCandidatureId(cId);
                        if(rs.getTimestamp("eventTime")!=null)
                            evt.setEventTime(rs.getTimestamp("eventTime").getTime());

                        if(rs.getTimestamp("creationTime")!=null)
                            evt.setCreationTime(rs.getTimestamp("creationTime").getTime());
                        evt.setEventSubType(rs.getInt("eventSubType"));
                        evt.setEventType(rs.getInt("eventType"));

                        if (currentCandidature != null && currentCandidature.getId()!=0 && currentCandidature.getId() != cId) {
                            // début d'une nouvelle candidature
                            // traitement candidature précédente et init de la nouvelle
                            Utils.addCandidatureToUserSummary(currentCandidature, userSum);
                            currentCandidature = null;
                        }

                        if (currentCandidature == null || currentCandidature.getId()==0) {
                            // initialisation nouvelle candidature
                            currentCandidature = new CandidatureReport();
                            currentCandidature.setId(cId);
                            if(rs.getTimestamp("creationDate")!=null)
                                currentCandidature.setCreationDate(rs.getTimestamp("creationDate").getTime());
                            if(rs.getTimestamp("lastUpdate")!=null)
                                currentCandidature.setLastUpdate(rs.getTimestamp("lastUpdate").getTime());
                            currentCandidature.setNomContact(rs.getString("nomContact"));
                            currentCandidature.setEmailContact(rs.getString("emailContact"));
                            currentCandidature.setTelContact(rs.getString("telContact"));
                            currentCandidature.setNomCandidature(rs.getString("nomCandidature"));
                            currentCandidature.setNomSociete(rs.getString("nomSociete"));
                            currentCandidature.setVille(rs.getString("ville"));
                            currentCandidature.setType(rs.getInt("type"));
                            currentCandidature.setEtat(rs.getInt("etat"));
                            currentCandidature.setArchived(rs.getInt("archived"));
                            currentCandidature.setUrlSource(rs.getString("urlSource"));
                        }

                        Utils.updateCandidatureReportFromEvent(currentCandidature, evt);
                    }
                } 
                

                // traitement candidature courante
                if (currentCandidature != null && currentCandidature.getId()!=0 && userSum != null) {
                    Utils.addCandidatureToUserSummary(currentCandidature, userSum);
                }
        }
        catch (Exception e)
        {
        	log.error(logCode + "-001 Error processing weekly reminder email candidature. userId=" + userId + " error=" + e);
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "002");
        }

        return userSum;
    }

    public static void mergeCandidatures(long destinationId, String idsToRemove) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;

        try
        {
            con = DatabaseManager.getConnection();
            String sql = "update candidatures set userId = "+destinationId+" where userId in "+idsToRemove;
            pStmt = con.prepareStatement(sql);

            pStmt.executeUpdate();
        }
        catch (Exception e)
        {
            log.error(logCode+"-032 Error merging user's candidatures. destinationId="+destinationId+" idsToRemove="+idsToRemove+" error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt,null, logCode, "033");
        }
    }

    public static void mergeAttachments(long destinationId, String idsToRemove) throws Exception
    {

        Connection con = null;
        PreparedStatement pStmt = null;

        try
        {
            con = DatabaseManager.getConnection();
            String sql = "update attachments set userId = "+destinationId+" where userId in "+idsToRemove;
            pStmt = con.prepareStatement(sql);

            pStmt.executeUpdate();
        }
        catch (Exception e)
        {
            log.error(logCode+"-034 Error Merging user's attachments. destinationId="+destinationId+" idsToRemove="+idsToRemove+" error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt,null, logCode, "035");
        }
    }

    public static void mergeAttachmentFiles(long destinationId, String idsToRemove) throws Exception
    {

        Connection con = null;
        PreparedStatement pStmt = null;

        try
        {
            con = DatabaseManager.getConnection();
            String sql = "update attachmentFiles set userId = "+destinationId+" where userId in "+idsToRemove;
            pStmt = con.prepareStatement(sql);

            pStmt.executeUpdate();
        }
        catch (Exception e)
        {
            log.error(logCode+"-036 Error merging user's attachment files. destinationId="+destinationId+" idsToRemove="+idsToRemove+" error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt,null, logCode, "037");
        }
    }

    public static void mergeUserLogs(long destinationId, String idsToRemove) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;

        try
        {
            con = DatabaseManager.getConnection();
            String sql = "update userLogs set userId = "+destinationId+" where userId in "+idsToRemove;
            pStmt = con.prepareStatement(sql);

            pStmt.executeUpdate();
        }
        catch (Exception e)
        {
            log.error(logCode+"-038 Error merging user logs. destinationId="+destinationId+" idsToRemove="+idsToRemove+" error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt,null, logCode, "039");
        }
    }

    public static void deleteDoubleAccounts(long destinationId, String idsToRemove) throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;

        try
        {
            con = DatabaseManager.getConnection();
            String sql = "delete from users where id in "+idsToRemove;
            pStmt = con.prepareStatement(sql);

            pStmt.executeUpdate();
        }
        catch (Exception e)
        {
            log.error(logCode+"-040 Error removing user's double accounts. destinationId="+destinationId+" idsToRemove="+idsToRemove+" error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt,null, logCode, "041");
        }
    }
}
