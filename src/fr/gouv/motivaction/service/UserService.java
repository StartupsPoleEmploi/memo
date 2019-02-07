package fr.gouv.motivaction.service;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.security.SecureRandom;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.core.MultivaluedMap;

import org.apache.log4j.Logger;
import org.jasypt.commons.CommonUtils;
import org.jasypt.encryption.pbe.StandardPBEStringEncryptor;
import org.json.simple.JSONObject;

import com.codahale.metrics.Timer;

import fr.gouv.motivaction.Constantes;
import fr.gouv.motivaction.Constantes.Etat;
import fr.gouv.motivaction.Constantes.Statut;
import fr.gouv.motivaction.Constantes.TypeOffre;
import fr.gouv.motivaction.dao.CandidatureDAO;
import fr.gouv.motivaction.dao.UserDAO;
import fr.gouv.motivaction.exception.PeConnectException;
import fr.gouv.motivaction.mails.MailTools;
import fr.gouv.motivaction.mails.UserAccountMail;
import fr.gouv.motivaction.model.Candidature;
import fr.gouv.motivaction.model.User;
import fr.gouv.motivaction.model.UserSummary;
import fr.gouv.motivaction.utils.Utils;

/**
 * Created by Alan on 06/04/2016.
 */
public class UserService {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "008";

    public static String salt;
    public static String pwdSql;
    /*public static String salt2;*/
    public static String pwdSql2;
    static Properties prop;
    public static String encryptorSecret;
    public static String algo;
    public static Timer userAuthTimer = Utils.metricRegistry.timer("userAuth");

    public static StandardPBEStringEncryptor encryptor = new StandardPBEStringEncryptor();

    static
    {
        loadProperties();
        encryptor.setPassword(encryptorSecret);                     // we HAVE TO set a password
        encryptor.setAlgorithm(algo);    // optionally set the algorithm
        encryptor.setStringOutputType(CommonUtils.STRING_OUTPUT_TYPE_HEXADECIMAL);
    }

    private static void loadProperties()
    {
        prop = new Properties();
        InputStream in = null;

        try
        {
            in = UserDAO.class.getResourceAsStream("/fr/gouv/motivaction/properties/secret.properties");
            prop.load(in);

            algo = prop.getProperty("algo");
            salt = prop.getProperty("salt");
            pwdSql = prop.getProperty("pwdSql");
            /*salt2 = prop.getProperty("salt2");*/
            pwdSql2 = prop.getProperty("pwdSql2");
            encryptorSecret = prop.getProperty("encryptorSecret");

            in.close();
        }
        catch (IOException e)
        {
            log.error(logCode + "-009 MAILTOOLS properties error=" + e);
        }

    }

    public static User loadUserFromLogin(String login) throws Exception
    {
        User user = UserDAO.load(login.toLowerCase());
        return user;

    }

    public static User loadUserFromId(long id) throws Exception
    {
        User user = UserDAO.loadFromId(id);
        return user;
    }

    /*public static User loadUserFromFacebook(Long facebookId) throws Exception
    {
        User user = UserDAO.load(facebookId);
        return user;
    }*/

    public static User loadUserFromCredentials(String login, String password) throws Exception
    {
        User user = UserDAO.loadWithFallback(login.toLowerCase(),password);
        return user;
    }

    public static void setUserAuthenticationToken(User user, HttpServletRequest servletRequest, HttpServletResponse servletResponse) throws Exception
    {
        // @RG génère un tolen d'authentification pour l'utilisateur qui dure 1 an
        String token = UserService.getEncryptedToken(user);
        int maxAge = 3600 * 24 * 365;

        boolean isSecure = true;
        if(servletRequest.getHeader("x-forwarded-proto") == null || !servletRequest.getHeader("x-forwarded-proto").equals("https"))
            isSecure = false;

        Cookie cookie = new Cookie("auth", token);
        cookie.setMaxAge(maxAge);
        cookie.setPath("/");
        cookie.setSecure(isSecure);    // positionnement secure selon la requête pour permettre la connexion directe en http sur les frontaux
        cookie.setDomain(servletRequest.getServerName());
        cookie.setHttpOnly(true);
        servletResponse.addCookie(cookie);

        // positionnement d'un deuxième cookie qui n'est pas httpOnly pour indiquer si 1 ou 0 une authentification est en cours
        cookie = new Cookie("isAuth", "1");
        cookie.setMaxAge(maxAge);
        cookie.setPath("/");
        cookie.setSecure(isSecure);    // positionnement secure selon la requête pour permettre la connexion directe en http sur les frontaux
        cookie.setDomain(servletRequest.getServerName());
        cookie.setHttpOnly(false);
        servletResponse.addCookie(cookie);
    }

    public static void logoutUser(HttpServletResponse servletResponse, HttpServletRequest servletRequest) throws Exception
    {
        boolean isSecure = true;
        if(servletRequest.getHeader("x-forwarded-proto") == null || !servletRequest.getHeader("x-forwarded-proto").equals("https"))
            isSecure = false;

        Cookie cookie = new Cookie("auth","");
        cookie.setMaxAge(0);
        cookie.setPath("/");
        cookie.setSecure(isSecure);    // positionnement secure selon la requête pour permettre la connexion directe en http sur les frontaux
        cookie.setDomain(servletRequest.getServerName());
        cookie.setHttpOnly(true);
        servletResponse.addCookie(cookie);

        cookie = new Cookie("isAuth","");
        cookie.setMaxAge(0);
        cookie.setPath("/");
        cookie.setSecure(servletRequest.isSecure());    // positionnement secure selon la requête pour permettre la connexion directe en http sur les frontaux
        cookie.setDomain(servletRequest.getServerName());
        cookie.setHttpOnly(false);
        servletResponse.addCookie(cookie);
    }

    public static User createNewUser(String accountLoginEmail, String accountLoginPassword, String userSource) throws Exception
    {
        //System.out.println("create new user ACT");
        User user = new User();
        user.setLogin(accountLoginEmail.toLowerCase());
        user.setPassword(accountLoginPassword);
        user.setSource(userSource);

        UserService.save(user);
        UserAccountMail.sendNewAccountNotification(user, false);

        return user;
    }

/*
    public static User createNewUser(String accountLoginEmail, Long facebookId, String userSource) throws Exception
    {
        //System.out.println("create new user FB");
        User user = new User();
        user.setLogin(accountLoginEmail.toLowerCase());
        user.setFacebookId(facebookId);
        user.setPassword(UserService.randomString(12));
        user.setSource(userSource);

        UserService.save(user);
        UserAccountMail.sendNewAccountNotification(user, false);

        return user;
    }
*/

    static final String AB = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    static SecureRandom rnd = new SecureRandom();

    static String randomString( int len ){
        StringBuilder sb = new StringBuilder( len );
        for( int i = 0; i < len; i++ )
            sb.append( AB.charAt( rnd.nextInt(AB.length()) ) );
        return sb.toString();
    }

    public static void save(User user) throws Exception
    {
        //System.out.println("save user " + user.getLogin() + " / " + user.getFacebookId());
        if(user.getId()==0)
        {
            UserService.setValidationCode(user);
            UserDAO.insert(user);
        }
        else
            UserDAO.update(user);
    }

    // sauvegarde d'un utilisateur connecté via PEAM (insert normal et update différent pour ne pas écraser l'éventuel mot de passe)
    public static void saveFromPEAM(User user) throws Exception
    {
        //System.out.println("save user " + user.getLogin() + " / " + user.getFacebookId());
        if(user.getId()==0)
        {
            UserService.setValidationCode(user);
            user.setSource("PEAM");
            UserDAO.insert(user);
        }
        else
            UserDAO.updatePEAMUser(user);
    }

    public static void setValidationCode(User user)
    {
        user.setValidationCode(UUID.randomUUID().toString());
    }

    public static String getEncryptedToken(User user) throws Exception
    {
        LocalDateTime dt = LocalDateTime.now();
        dt = dt.plusDays(366);
        String input = UUID.randomUUID()+"|"+dt+"|"+user.getId();

        input = encryptor.encrypt(input);

        return input;
    }

    public static String getEncryptedToken(int durationInSeconds) throws Exception
    {
        LocalDateTime dt = LocalDateTime.now();
        dt = dt.plusSeconds(durationInSeconds);
        String input = UUID.randomUUID()+"|"+dt+"|"+salt;

        input = encryptor.encrypt(input);

        return input;
    }


    public static String decryptToken(String token) throws Exception
    {
        String plainText = encryptor.decrypt(token);  // myText.equals(plainText)
        return plainText;
    }

    public static long getUserIdFromCookie(Cookie cookie) throws Exception
    {
        long userId = 0;

        if (cookie != null) {

            String encryptedCookie = cookie.getValue();

            String ck = UserService.decryptToken(encryptedCookie);

            // "4ed15081-a473-4855-9677-536665a58007|2016-04-12T14:53:18.990|5"

            String[] parts = ck.split("\\|");

            LocalDateTime dt = LocalDateTime.parse(parts[1]);

            if (dt.isAfter(LocalDateTime.now()))    // le cookie expire après la date courante
                userId = Long.parseLong(parts[2]);

        }
        return userId;
    }

    public static long getUserIdFromCSRF(String csrf) throws Exception
    {
        long userId = 0;

        if (csrf != null) {

            String dCSRF = UserService.decryptToken(csrf);

            // "randomuuid|2016-04-12T14:53:18.990|userId"

            String[] parts = dCSRF.split("\\|");

            LocalDateTime dt = LocalDateTime.parse(parts[1]);

            if (dt.isAfter(LocalDateTime.now()))    // le cookie expire après la date courante
                userId = Long.parseLong(parts[2]);

        }
        return userId;
    }

    public static Long checkUserAuth(HttpServletRequest request)
    {
        long userId = 0;

        final Timer.Context context = userAuthTimer.time();

        try
        {
            userId = getUserIdFromCookie(UserService.getAuthCookie(request));
        }
        catch (Exception e)
        {
            log.error(logCode+"-001 Error checking cookie. error="+e);
        }
        finally
        {
            context.stop();
        }

        return userId;
    }

    public static Long checkUserAuthWithCSRF(HttpServletRequest request,MultivaluedMap<String,String> form)
    {
        long userId = 0;

        final Timer.Context context = userAuthTimer.time();

        try
        {
            userId = getUserIdFromCookie(UserService.getAuthCookie(request));
            String csrf = form.getFirst("csrf");

            long csrfUserId = getUserIdFromCSRF(csrf);

            if(userId!=csrfUserId)
                throw new Exception("Wrong CSRF check");
        }
        catch (Exception e)
        {
            log.error(logCode+"-012 Error checking cookie with CSRF. error="+e);
            userId = 0;
        }
        finally
        {
            context.stop();
        }

        return userId;
    }

    // appelé pour les requêtes concernées par la consultation en lecture seule par le conseiller
    public static Long checkUserAuth(HttpServletRequest request, boolean visitorAllowed)
    {
        long userId = 0;

        try {

            String visitorLink = request.getParameter("link");

            if (visitorAllowed && visitorLink != null && !visitorLink.equals(""))
            {
                try
                {
                    userId = getUserIdFromLink(request);
                }
                catch (Exception e)
                {
                    log.error(logCode + "-002 Error identifying user from link. link=" + visitorLink + " error=" + e);
                }
            }
            else
                userId = checkUserAuth(request);
        }
        catch (Exception e)
        {
            log.error(logCode+"-003 ACCOUNT Error checking visitor link. error="+e);
        }

        return userId;
    }

    public static Long checkAdminUserAuth(HttpServletRequest request)
    {
        long userId = 0;

        try
        {
            userId = getUserIdFromCookie(UserService.getAuthCookie(request));

            if(!UserDAO.isAdmin(userId))
            {
                log.warn(logCode+"-004 ACCOUNT Attempt to access back office. Non authorized user. userId="+userId);
                userId = 0;
            }

        }
        catch (Exception e)
        {
            log.error(logCode+"-005 ACCOUNT Error checking admin cookie. error="+e);
            userId=0;
        }

        return userId;
    }

    public static Cookie getAuthCookie(HttpServletRequest request) throws Exception
    {
        Cookie cookie = null;
        Cookie[] cookies = null;

        // Get an array of Cookies associated with this domain
        cookies = request.getCookies();
        if( cookies != null )
        {
            for (int i = 0; i < cookies.length; i++)
            {
                if(cookies[i].getName().equals("auth"))
                {
                    cookie = cookies[i];
                    break;
                }
            }
        }
        return cookie;
    }

    public static String getVisitorLinkForUser(long userId)
    {
        String visitorLink = "";
        LocalDateTime dt = LocalDateTime.now();

        String token = salt+"|"+userId+"|"+dt;

        visitorLink = encryptor.encrypt(token);

        return visitorLink;
    }

    // format du lien décodé : salt|userId|date
    public static long getUserIdFromLink(HttpServletRequest request) throws Exception
    {
        long userId = 0;
        String visitorLink = "";

        try
        {
            visitorLink = request.getParameter("link");

            if (visitorLink != null)
            {
                String token = encryptor.decrypt(visitorLink);
                userId = Long.parseLong(token.substring(token.indexOf('|') + 1, token.lastIndexOf('|')));

                // on vérifie que le lien n'a pas plus de 30 jours.
                LocalDateTime now = LocalDateTime.now();
                LocalDateTime dt = LocalDateTime.parse(token.substring(token.lastIndexOf('|') + 1));

                // @RG - TDB : le lien de partage pour accéder en lecture au TDB est valide pendant 30j à compter de la date de génération du lien de partage
                if(dt.until(now, ChronoUnit.DAYS)>30)
                    userId = 0;
            }
        }
        catch(Exception e)
        {
            log.error(logCode+"-006 ACCOUNT Error checking visitor link. userId="+userId+" visitorLink="+visitorLink+" error="+e);
        }

        return userId;
    }

    public static String getUnsubscribeLinkForUser(long userId)
    {
        String visitorLink = "";
        LocalDateTime dt = LocalDateTime.now();

        String token = userId+"|"+dt+"|"+salt;

        visitorLink = encryptor.encrypt(token);

        return visitorLink;
    }

    public static long getUserIdFromUnsubscribeLink(String link)
    {
        long userId = 0;

        try
        {
            if (link != null)
            {
                String token = encryptor.decrypt(link);
                userId = Long.parseLong(token.substring(0, token.indexOf('|')));

                // on vérifie que le lien n'a pas plus de 7 jours.
                LocalDateTime now = LocalDateTime.now();
                LocalDateTime dt = LocalDateTime.parse(token.substring(token.indexOf('|')+1,token.lastIndexOf('|')));

                // @RG - EMAIL : le lien de désinscription (proposé en fin de mail) est valide pendant 7j à compter de la date d'envoie du mail 
                if(dt.until(now, ChronoUnit.DAYS)>7)
                    userId = 0;
            }
        }
        catch(Exception e)
        {
            log.error(logCode+"-007 ACCOUNT Error checking unsubscribe link. userId="+userId+" link="+link+" error="+e);
            userId = 0;
        }

        return userId;
    }

    public static String getPasswordRefreshLinkForUser(long userId)
    {
        String refreshLink = "";

        LocalDateTime dt = LocalDateTime.now();

        String token = salt+"|"+dt+"|"+userId;

        refreshLink = encryptor.encrypt(token);

        return refreshLink;
    }

    public static void saveUserRefreshLink(long userId, String token) throws Exception
    {
        UserDAO.saveUserRefreshLink(userId, token);
    }

    public static long getUserIdFromPasswordRefreshLink(String link)
    {
        long userId = 0;

        try
        {
            if (link != null)
            {
                String token = encryptor.decrypt(link);
                userId = Long.parseLong(token.substring(token.lastIndexOf('|')+1));

                // on vérifie que le lien n'a pas plus de 24 heures.
                LocalDateTime now = LocalDateTime.now();
                LocalDateTime dt = LocalDateTime.parse(token.substring(token.indexOf('|')+1,token.lastIndexOf('|')));

                // @RG - EMAIL : le lien de renouvellement de mdp est valide pendant 24h à compter de la date d'envoie du mail
                if(dt.until(now, ChronoUnit.HOURS)>24)
                    userId = 0;
            }
        }
        catch(Exception e)
        {
            log.error(logCode+"-010 ACCOUNT Error checking password refresh link. userId="+userId+" link="+link+" error="+e);
            userId = 0;
        }

        return userId;
    }


    public static void setUserSubscription(Long userId, int val, String actionLog) throws Exception
    {
    	User user = new User();
        user.setId(userId);
        user.setReceiveNotification(val);
        
    	UserDAO.setUserSubscriptions(user);
        Utils.logUserAction(userId, "User", actionLog, 0);
    }

    public static void resetPassword(User user) throws Exception
    {
        Random random = new Random();

        String newPassword = "";

        for(int i=0; i<8; ++i)
            newPassword+=random.nextInt(10);

        user.setPassword(newPassword);

        UserDAO.update(user);
    }

    public static String getSuppressionCompteLinkForUser(long userId)
    {
        String visitorLink = "";

        LocalDateTime dt = LocalDateTime.now();

        String token = salt+"|"+dt+"|"+userId;

        visitorLink = encryptor.encrypt(token);

        return visitorLink;
    }

    public static long getUserIdFromSuppressionCompteLink(String link)
    {
        long userId = 0;

        try
        {
            if (link != null)
            {
                String token = encryptor.decrypt(link);
                userId = Long.parseLong(token.substring(token.lastIndexOf('|')+1));

                // on vérifie que le lien n'a pas plus de 60 minutes.
                LocalDateTime now = LocalDateTime.now();
                LocalDateTime dt = LocalDateTime.parse(token.substring(token.indexOf('|')+1,token.lastIndexOf('|')));

                // @RG - EMAIL : le lien de suppression de compte est valide pendant 1h à compter de la date d'envoie du mail
                if(dt.until(now, ChronoUnit.MINUTES)>60)
                    userId = 0;
            }
        }
        catch(Exception e)
        {
            log.error(logCode+"-010 ACCOUNT Error checking password refresh link. userId="+userId+" link="+link+" error="+e);
            userId = 0;
        }

        return userId;
    }
    
    public static String getUpdateCandidatureEmailLinkForUser(long userId)
    {
        String visitorLink = "";
        LocalDateTime dt = LocalDateTime.now();

        String token = userId+"|"+dt+"|"+salt;

        visitorLink = encryptor.encrypt(token);

        return visitorLink;
    }

    public static long getUserIdFromUpdateCandidatureEmail(String link)
    {
        long userId = 0;

        try
        {
            if (link != null)
            {
                String token = encryptor.decrypt(link);
                userId = Long.parseLong(token.substring(0, token.indexOf('|')));

                // on vérifie que le lien n'a pas plus de 7 jours.
                LocalDateTime now = LocalDateTime.now();
                LocalDateTime dt = LocalDateTime.parse(token.substring(token.indexOf('|')+1,token.lastIndexOf('|')));

                // @RG - EMAIL : le lien de modification d'une candidature ("j'ai le poste") est valide pendant 7j à compter de la date d'envoie du mail
                if(dt.until(now, ChronoUnit.DAYS)>7)
                    userId = 0;
            }
        }
        catch(Exception e)
        {
            log.error(logCode+"-011 ACCOUNT Error checking unsubscribe link. userId="+userId+" link="+link+" error="+e);
            userId = 0;
        }

        return userId;
    }
    
    public static void deleteUser(Long userId) {
    	try
        {
            AttachmentService.removeUserAttachments(userId);
            CandidatureService.anonymizeUserCandidacies(userId);
            UserService.anonymizeUser(userId);

            //UserDAO.deleteFromId(userId);
        }
        catch(Exception e)
        {
            log.error(logCode+"-008 ACCOUNT Error deleting user. userId="+userId+" error="+e);
        }
    }

    public static void prepareUserForDeletion(Long userId) {
        try
        {
            UserDAO.prepareUserForDeletion(userId);
        }
        catch(Exception e)
        {
            log.error(logCode+"-013 ACCOUNT Error deleting user. userId="+userId+" error="+e);
        }
    }

    public static void anonymizeUser(Long userId) throws Exception
    {
        UserDAO.anonymizeUser(userId);
    }

    public static String checkPasswordChange(long userId) throws Exception
    {
        String result="ok";
        if(UserDAO.checkUserLastPasswordChange(userId))
            result="doChange";

        return result;
    }
    
    public static void desactivateNotifications(ArrayList<Long>lstIdUser) throws Exception {
    	if(lstIdUser!=null && lstIdUser.size()>0) {
    		for(Long idUser : lstIdUser) {
    			// On désabonne tous les utilisateurs concernés
    	        setUserSubscription(idUser, 0, "Désabonnement auto");
    			// On réinitialise le top d'inactivaction auto des notifs
    	        UserDAO.setAutoDisableNotification(idUser, 1);
    		}
    	}
    }
    
    public static void reactivateNotification(User user) throws Exception {
	    Long userId = null;
	    
    	if (user.getAutoDisableNotification() == 1) {
    		userId = user.getId();
    		// On réactive les notifications pour les utilisateurs désactivés automatiquement
	        setUserSubscription(userId, 1, "Réabonnement auto");
	        // On réinitialise le top d'inactivaction auto des notifs
	        UserDAO.setAutoDisableNotification(userId, 0);
	    }
    }

    public static User getUserFromPEAMID(String peUserId) throws Exception
    {
        User user = UserDAO.loadFromPEAMId(peUserId);

        return user;
    }

    public static User getUserInfoFromPEAMID(JSONObject peUser, JSONObject peUserAddress) throws Exception
    {
        // récupération des éléments d'identité
        String peEmail = (String)peUser.get("email");
        String lastName = (String)peUser.get("family_name");
        String firstName = (String)peUser.get("given_name");
        String peId = (String)peUser.get("sub");
        String gender = (String)peUser.get("gender");

        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPeId(peId);
        user.setGender(gender);
        user.setPeEmail(peEmail);

        // récupération des éléments d'adresse s'ils ont bien été récupérés
        if(peUserAddress!=null) {
            if (peUserAddress.get("libellePays") != null)
                user.setCountry((String) peUserAddress.get("libellePays"));
            if (peUserAddress.get("codePostal") != null)
                user.setZip((String) peUserAddress.get("codePostal"));
            if (peUserAddress.get("codeINSEE") != null)
                user.setCityInsee((String) peUserAddress.get("codeINSEE"));
            if (peUserAddress.get("libelleCommune") != null)
                user.setCity((String) peUserAddress.get("libelleCommune"));

            String address = "";
            if (peUserAddress.get("adresse1") != null)
                address += (String) peUserAddress.get("adresse1") + " ";
            if (peUserAddress.get("adresse2") != null)
                address += (String) peUserAddress.get("adresse2") + " ";
            if (peUserAddress.get("adresse3") != null)
                address += (String) peUserAddress.get("adresse3") + " ";
            if (peUserAddress.get("adresse4") != null)
                address += (String) peUserAddress.get("adresse4");
            address = address.trim();
            user.setAddress(address);
        }

        return user;
    }

    public static User createUserFromPEAMUser(User user) throws Exception
    {
        // cas 1 : email et user inexistant pour cet email -> création utilisateur                                                      OK
        // cas 2 : email et user existant pour cet email et pas de peId -> update utilisateur pour ajouter les infos utilisateurs       OK
        // cas 3 : email et user existant pour cet email existant et peId différent -> création utilisateur login null                  OK
        // cas 4 : pas d'email -> création utilisateur login null                                                                       OK

        // récupération des éléments d'identité

        if(user.getPeEmail()!=null)
        {   // email PE
            String peEmail = user.getPeEmail().toLowerCase();
            user.setPeEmail(peEmail);

            User user2 = loadUserFromLogin(peEmail);

            if(user2!=null) // un utilisateur existe déjà pour cette adresse email
            {
                if(user2.getPeId()==null)
                {   // cas 2 : email et user existant pour cet email et pas de peId -> update utilisateur pour ajouter les infos utilisateurs

                    user = copyUserPEAMInfo(user2,user,true);
                }
                // else cas 3 : email et user existant pour cet email existant et peId différent -> création utilisateur login null
            }
            else    // cas 1 : email et user inexistant pour cet email -> création utilisateur
            {
                user.setLogin(peEmail);
            }

        }
        else  {
        	//cas 4 : pas d'email -> pas de création utilisateur MEMO
        	throw new PeConnectException();
        }

        if(user.getPassword()==null)
            user.setPassword(UserService.randomString(12));

        boolean create = false;
        if(user.getId()==0)
            create=true;

        saveFromPEAM(user);

        if(create)
        {
            UserAccountMail.sendNewAccountNotification(user, false);
            Utils.logUserAction(user.getId(), "User", "Création PE Connect", 0);
        }

        return user;
    }

    // mets à jour user avec les infos disponibles dans userInfo
    public static User updatePEAMUser(User user, User userInfo, boolean updateAddress) throws Exception
    {
        if(userInfo.getPeEmail()!=null && (user.getPeEmail()==null || !user.getPeEmail().equalsIgnoreCase(userInfo.getPeEmail())))
        {
            String peEmail = userInfo.getPeEmail().toLowerCase();

            User user2 = loadUserFromLogin(peEmail);

            if(user2==null || user2.getId()==user.getId()) // adresse email libre ou correspondant à celle de l'utilisateur peam
                user.setLogin(peEmail);
            //else    // adresse email occupée par un autre
        }

        copyUserPEAMInfo(user, userInfo, updateAddress);

        saveFromPEAM(user);

        return user;
    }

    private static User copyUserPEAMInfo(User toUser, User fromUser, boolean updateAddress)
    {
        toUser.setFirstName(fromUser.getFirstName());
        toUser.setLastName(fromUser.getLastName());
        toUser.setPeId(fromUser.getPeId());
        toUser.setGender(fromUser.getGender());
        toUser.setPeEmail(fromUser.getPeEmail());

        // au cas où les infos d'adresse n'ont pas été récupérées on ne mets pas à jour ce bloc pour ne pas écraser l'existant éventuel
        if(updateAddress)
        {
            toUser.setAddress(fromUser.getAddress());
            toUser.setCity(fromUser.getCity());
            toUser.setZip(fromUser.getZip());
            toUser.setCityInsee(fromUser.getCityInsee());
            toUser.setCountry(fromUser.getCountry());
        }

        return toUser;
    }
    
    public static UserSummary getUserSummary(long userId) {
    	UserSummary userSum = UserDAO.loadUserSummary(userId);
    	return userSum;
    }
    
    public static String getExtractTDB(long userId) {
    	String res = null;
    	Object[] tabCandidatures = null;
    	if(userId>0) {
    		try {
    			tabCandidatures = CandidatureDAO.list(userId, true);
    			UserService.writeCandidaturesInCSV(tabCandidatures, MailTools.pathCSV+"extractTDB-"+userId+".csv");
    		} catch(Exception e) {
                log.error(logCode+"-012 ACCOUNT Error user extractTDB. userId="+userId+" error="+e);
            }
    	}
    	return res;
    }
    
    private static void writeCandidaturesInCSV(Object [] lstCandidatures, String fileName) {
    	File f = new File (fileName);
    	Candidature c;
    	Etat e;
    	TypeOffre t;
    	LocalDateTime d;
    	String s;
    	Statut st;
    	
    	try
    	{
    	    FileWriter fw = new FileWriter (f);
    	    StringBuilder sb = new StringBuilder();
    	    // @RG-EXTRACT : extraction des champs suivants délimités par des ';' : Statut candidature;Titre candidature;Nom societe;Lieu;Nom contact;Email contact;Telephone contact;Type candidature;Etat candidature;Date creation;Date modification;Url offre;Description;Note
    	    fw.write("Statut candidature;Titre candidature;Nom societe;Lieu;Nom contact;Email contact;Telephone contact;Type candidature;Etat candidature;Date creation;Date modification;Url offre;Description;Note");
    	    fw.write("\n");
    	    for(Object o : lstCandidatures)
    	    {
    	    	c = (Candidature) o;
    	    	// Réinitialise la String
    	    	sb.delete(0, sb.length());
    	    	// Statut
    	    	try {
    	    		st = Constantes.Statut.values()[c.getArchived()];
	    	    	if(st!=null)
	    	    		sb.append(st.getLibelle()+";");
	    	    	else
	    	    		sb.append(";");
    	    	} catch(Exception ex) {
    	    		log.error(logCode+"-010 UTILS Erreur lors de l'écriture du fichier d'activités (statut de la candidature inconnu)="+c.getArchived()+". error="+ex);
    	    	}
    	    	// NomCandidature
    	    	s = new String(c.getNomCandidature());
	    		// conversion des caractères spéciaux
    			s = Utils.replaceSpecialsCharacters(s);
    	        sb.append(c.getNomCandidature()+";");
    	        // NomSociete
    	    	if(c.getNomSociete()!=null) {
    	    		s = new String(c.getNomSociete());
    	    		// conversion des caractères spéciaux
	    			s = Utils.replaceSpecialsCharacters(s);
    	    		sb.append(s+";");
    	    	} else
    	    		sb.append(";");
    	    	// Lieu
    	    	if(c.getVille()!=null) {
    	    		s = new String(c.getVille());
    	    		// conversion des caractères spéciaux
	    			s = Utils.replaceSpecialsCharacters(s);
    	    		sb.append(s+";");
    	    	} else
    	    		sb.append(";");
    	    	// NomContact
    	    	if(c.getNomContact()!=null) {
    	    		s = new String(c.getNomContact());
    	    		// conversion des caractères spéciaux
	    			s = Utils.replaceSpecialsCharacters(s);
    	    		sb.append(s+";");
    	    	} else
    	    		sb.append(";");
    	    	// EmailContact
    	    	if(c.getEmailContact()!=null)
    	    		sb.append(c.getEmailContact()+";");
    	    	else
    	    		sb.append(";");
    	    	// TelContact
    	    	if(c.getTelContact()!=null)
    	    		sb.append("'"+c.getTelContact()+";");
    	    	else
    	    		sb.append(";");
    	    	// Type
    	    	try {
	    	    	t = Constantes.TypeOffre.values()[c.getType()];
	    	    	if(t!=null)
	    	    		sb.append(t.getLibelle()+";");
	    	    	else
	    	    		sb.append(";");
    	    	} catch(Exception ex) {
    	    		log.error(logCode+"-009 UTILS Erreur lors de l'écriture du fichier d'activités (type de la candidature inconnu)="+c.getType()+". error="+ex);
    	    	}
    	        // Etat
    	    	try {
	    	    	e = Constantes.Etat.values()[c.getEtat()];
	    	    	if(e!=null)
	    	    		sb.append(e.getLibelle()+";");
	    	    	else
	    	    		sb.append(";");
    	    	} catch(Exception ex) {
    	    		log.error(logCode+"-008 UTILS Erreur lors de l'écriture du fichier d'activités (etat de la candidature inconnu)="+c.getEtat()+". error="+ex);
    	    	}

    	    	// CreationDate
    	    	d = new Timestamp(c.getCreationDate()).toLocalDateTime();
    	    	if(d!=null)
    	    		sb.append(d+";");
    	    	else
    	    		sb.append(";");   	  
    	    	// ModificationDate
    	    	d = new Timestamp(c.getLastUpdate()).toLocalDateTime();
    	    	if(d!=null)
    	    		sb.append(d+";");
    	    	else
    	    		sb.append(";");
    	    	// Url
    	    	if(c.getUrlSource()!=null)
    	    		sb.append(c.getUrlSource()+";");
    	    	else
    	    		sb.append(";");
    	    	// Description
    	    	if(c.getDescription()!=null) {
    	    		s = new String(c.getDescription());
    	    		// retrait de code HTML
    	    		s = s.replaceAll("\\<[^>]*>","");
    	    		// retrait de retour à la ligne
    	    		s = s.replaceAll("\n","");
    	    		// conversion des caractères spéciaux
    	    		s = Utils.replaceSpecialsCharacters(s);
    	    		sb.append(s+";");
    	    	} else
    	    		sb.append(";");
    	    	// Note
    	    	if(c.getNote()!=null) {
    	    		s = new String(c.getNote());
    	    		// retrait de code HTML
    	    		s = s.replaceAll("\\<[^>]*>","");
    	    		// retrait de retour à la ligne
    	    		s = s.replaceAll("\n","");
    	    		// conversion des caractères spéciaux
    	    		s = Utils.replaceSpecialsCharacters(s);
    	    		sb.append(s+";");
    	    	} else
    	    		sb.append(";");
    	        sb.append("\n");
    	        fw.write(sb.toString());
    	    }
    	    fw.close();
    	}
    	catch (IOException exception)
    	{
			log.error(logCode+"-007 UTILS Erreur lors de l'écriture du fichier d'activités user. error="+exception);
    	}
	}

    public static void mergeCandidatures(long destinationId, String idsToRemove) throws Exception
    {
        UserDAO.mergeCandidatures(destinationId, idsToRemove);
    }

    public static void mergeAttachments(long destinationId, String idsToRemove) throws Exception
    {
        UserDAO.mergeAttachments(destinationId, idsToRemove);
    }

    public static void mergeAttachmentFiles(long destinationId, String idsToRemove) throws Exception
    {
        UserDAO.mergeAttachmentFiles(destinationId, idsToRemove);
    }

    public static void mergeUserLogs(long destinationId, String idsToRemove) throws Exception
    {
        UserDAO.mergeUserLogs(destinationId, idsToRemove);
    }

    public static void deleteDoubleAccounts(long destinationId, String idsToRemove) throws Exception
    {
        UserDAO.deleteDoubleAccounts(destinationId, idsToRemove);
    }
}
