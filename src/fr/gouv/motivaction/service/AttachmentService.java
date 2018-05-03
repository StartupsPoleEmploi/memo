package fr.gouv.motivaction.service;

import fi.solita.clamav.ClamAVClient;
import fr.gouv.motivaction.dao.AttachmentDAO;
import fr.gouv.motivaction.model.Attachment;
import fr.gouv.motivaction.model.AttachmentFile;
import fr.gouv.motivaction.utils.Utils;
import org.apache.commons.codec.binary.Hex;
import org.apache.log4j.Logger;
/*import org.javaswift.joss.client.factory.AccountFactory;
import org.javaswift.joss.model.Account;
import org.javaswift.joss.model.Container;
import org.javaswift.joss.model.StoredObject;*/

import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Properties;

public class AttachmentService {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "033";

    public static String env;
    static Properties prop;

    /*private static String tenantName;
    private static String userName;
    private static String password;
    private static String container;
    private static String authUrl;*/
    public static long maxFileSize;
    public static String authorizedFilesRegexp;
    public static ClamAVClient cl;

    static {
        loadProperties();
        cl = new ClamAVClient("localhost",3310);
    }

    private static void loadProperties()
    {
        prop = new Properties();
        InputStream in = null;

        try
        {
            in = MailService.class.getResourceAsStream("/fr/gouv/motivaction/properties/openstack.properties");
            prop.load(in);

            env = prop.getProperty("env");
            /*if (env != null && "PROD".equals(env)) {
                tenantName = prop.getProperty("tenantName.production");
                authUrl = prop.getProperty("authUrl.production");
                userName = prop.getProperty("userName.production");
                password = prop.getProperty("password.production");
                container = prop.getProperty("container.production");

            } else if ("RECETTE".equals(env)){
                tenantName = prop.getProperty("tenantName.recette");
                authUrl = prop.getProperty("authUrl.recette");
                userName = prop.getProperty("userName.recette");
                password = prop.getProperty("password.recette");
                container = prop.getProperty("container.recette");
            } else {
                tenantName = prop.getProperty("tenantName.local");
                authUrl = prop.getProperty("authUrl.local");
                userName = prop.getProperty("userName.local");
                password = prop.getProperty("password.local");
                container = prop.getProperty("container.local");
            }*/

            maxFileSize = Long.parseLong(prop.getProperty("maxFileSize"));
            authorizedFilesRegexp = prop.getProperty("authorizedFilesRegexp");

            in.close();
        }
        catch (IOException e)
        {
            log.error(logCode + "-001 ATTACHMENTS properties error=" + e);
        }
    }

    public static Attachment loadAttachment(long userId, long attachmentId, boolean allowUncheckedFiles) throws Exception
    {
        return AttachmentDAO.load(userId, attachmentId, allowUncheckedFiles);
    }

    public static Object [] getAttachments(Long candidatureId, Long userId, boolean allowUncheckedFiles) throws Exception
    {
        return AttachmentDAO.list(candidatureId, userId, allowUncheckedFiles);
    }

    public static long storeFile(long userId, long candidatureId, String fileName, String fileType, String fileData) throws Exception
    {
        byte[] fileByteData = Base64.getDecoder().decode(fileData);

        // calcul md5 du fichier
        String md5 = md5(fileByteData);

        Attachment att = new Attachment(userId,candidatureId,fileName,fileType,md5);

        // chargement fichier existe dans attachments via userId and md5
        if(!AttachmentDAO.attachmentExists(userId,md5))
        {
            if(checkForVirus(att,fileByteData))
            {
                att.setVirusChecked(1);

                // zipature, faite après check Virus (non détection avérée sur test eicar)
                fileByteData = Utils.compress(fileByteData);

                // stockage du document
                storeDocument(userId,md5,fileByteData);
            }
            else
                throw new Exception("Virus found. fileName="+fileName);
        }
        else
            att.setVirusChecked(isVirusChecked(att));

        // insertion du lien en base
        long id = AttachmentDAO.saveAttachment(att);

        return id;
    }

    public static void deleteFile(long userId, long candidatureId,long attachmentId) throws Exception
    {
        Attachment att = AttachmentDAO.load(userId, attachmentId, true);

        if(att.getCandidatureId()==candidatureId)
        {
            if(AttachmentDAO.getAttachmentCandidacyCount(att)==1)
            {
                try
                {
                    deleteDocument(att);
                }
                catch (Exception e)
                {
                    if(e.toString().indexOf("404")<0)
                        throw new Exception(e);
                    else
                        log.warn(logCode+"-004 ATTACHMENT Doc not found on file repository. userId="+userId+" candidatureId="+candidatureId+" attachmentId="+attachmentId+" error="+e);
                }
            }
            AttachmentDAO.delete(att);
        }
        else
            throw new Exception("User trying to delete attachment belonging to another candidacy");
    }

    public static void deleteFile(long userId, long attachmentId) throws Exception
    {
        Attachment att = AttachmentDAO.load(userId, attachmentId, true);

        if(AttachmentDAO.getAttachmentCandidacyCount(att)==1)
        {
            deleteDocument(att);
        }
        AttachmentDAO.delete(att);
    }

    // enregistre un document sur le serveur openstack
    public static void storeDocument(long userId, String md5, byte[] document) throws Exception
    {
        /*log.info("storing doc : "+md5);
        StoredObject object = getStoredObject(userId, md5);
        object.uploadObject(document);*/

        AttachmentFile attFile = new AttachmentFile(userId,md5,document);
        AttachmentDAO.saveFile(attFile);
    }

    // télécharge un document depuis le serveur openstack
    public static byte[] downloadFile(Attachment att) throws Exception
    {
        /*log.info("downloading doc : "+att.getMd5());
        StoredObject object = getStoredObject(att.getUserId(), att.getMd5());
        return object.downloadObject();*/

        AttachmentFile attFile = AttachmentDAO.loadFile(att.getUserId(), att.getMd5());
        return attFile.getFileData();
    }

    // supprime un document sur le serveur openstack
    public static void deleteDocument(Attachment att) throws Exception
    {
        /*log.info("delete doc : "+att.getMd5());
        StoredObject object = getStoredObject(att.getUserId(), att.getMd5());
        object.delete();*/

        AttachmentDAO.deleteFile(att.getUserId(), att.getMd5());
    }

    // récupère un pointeur sur un document openStack
    /*
    public static StoredObject getStoredObject(long userId, String md5) throws Exception
    {
        Container container = getContainer();

        String objectPath = getPath(userId, md5);

        StoredObject object = container.getObject(objectPath);

        return object;
    }*/

    // construit le chemin d'un objet à partir du userId et du md5
    /*public static String getPath(long userId, String md5)
    {
        // Chemin d'un fichier : userId[1-8]/userId[9-12]/userId[13-16]/userId[17-20]/md5[1-3]/md5[4-6]/md5[7-9]/md5
        // ex : 00000000/0000/0000/0000/027/cf5/fd4/027cf5fd4be04c5f0c7b3ddb5eb984ff

        String paddedUserId = StringUtils.leftPad("" + userId, 20, "0");
        String objectPath = paddedUserId.substring(0,8)+"/"+paddedUserId.substring(8,12)+"/"+paddedUserId.substring(12,16)+"/"+paddedUserId.substring(16)+"/";
        objectPath+=md5.substring(0,3)+"/"+md5.substring(3,6)+"/"+md5.substring(6,9)+"/"+md5;

        return objectPath;
    }*/

    // supprime l'arborescence complète d'un utilisateur
    public static void removeUserAttachments(long userId)
    {
        try
        {
            /*Object[] list = AttachmentDAO.list(userId);
            for(int i=0; i<list.length; ++i)
            {
                Attachment att = (Attachment) list[i];
                deleteFile(userId, att.getId());
            }*/

            AttachmentDAO.deleteUserAttachments(userId);
        }
        catch (Exception e)
        {
            log.error(logCode + "-002 ATTACHMENTS Error cleaning user attachments. userId="+userId+" error="+e);
        }
    }

    // supprime les pièces jointes d'une candidature
    public static void removeCandidatureAttachments(long candidatureId, long userId)
    {
        try
        {
            Object[] list = AttachmentDAO.list(candidatureId, userId, true);

            for(int i=0; i<list.length; ++i)
            {
                Attachment att = (Attachment) list[i];
                deleteFile(userId, candidatureId, att.getId());
            }
        }
        catch (Exception e)
        {
            log.error(logCode + "-003 ATTACHMENTS Error cleaning candidature attachments. userId="+userId+" candidatureId="+candidatureId+" error="+e);
        }
    }

    // connexion au container openstack
    /*public static Container getContainer() throws Exception
    {
        // TODO: caser ça en static chargé au startup en autoreconnect
        Account account = new AccountFactory()
                .setUsername(userName)
                .setPassword(password)
                .setAuthUrl(authUrl)
                .setTenantName(tenantName)
                .createAccount();

        return account.getContainer(container);
    }*/

    /*
    public static String md5(InputStream source) throws Exception
    {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] buf = new byte[8096];
        int len;
        while ( (len=source.read(buf)) >= 0 )
        {
            md.update(buf, 0, len);
        }
        return Hex.encodeHexString(md.digest());
    }*/

    public static String md5(byte[] data) throws Exception
    {
        MessageDigest md = MessageDigest.getInstance("MD5");
        md.update(data);
        return Hex.encodeHexString(md.digest());
    }

    public static boolean checkForVirus(Attachment att, byte[] fileByteData) throws Exception
    {
        boolean res = true;

        byte[] reply;
        reply = cl.scan(fileByteData);

        if(!ClamAVClient.isCleanReply(reply))
        {
            res = false;
            log.warn(logCode + "-005 ATTACHMENT Virus found. userId=" + att.getUserId() + " candidatureId=" + att.getCandidatureId() + " fileName=" + att.getFileName() + " res=" + res);
        }

        return res;
    }


    public static int isVirusChecked(Attachment att) throws Exception
    {
        return AttachmentDAO.isVirusChecked(att.getId());
    }

}
