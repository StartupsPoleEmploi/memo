package fr.gouv.motivaction.service;


import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Properties;
import java.util.StringTokenizer;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.*;

import fr.gouv.motivaction.exception.PeConnectException;
import fr.gouv.motivaction.mails.MailTools;
import fr.gouv.motivaction.model.User;
import org.apache.log4j.Logger;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

public class APIService {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "037";  

    static Properties prop;
	static Properties secretProp;
    public static String urlOffrePEAPI, urlAccessTokenPEAPI;
    
    public static String offreAccessToken = null;
    public static LocalDateTime timeExpiredAccessToken = null;

	public static Client wsClient = ClientBuilder.newClient();

	public static String PEAMHost = null;
	public static String ESDHost = null;
	public static String PEAMauthorizeEndPoint = null;
	public static String PEAMaccessTokenEndPoint = null;
	public static String PEAMUserInfoEndPoint = null;
	public static String PEAMUserAddressEndPoint = null;
	public static String memoClientId = null;
	public static String memoClientSecret = null;
	public static String memoHost = null;
	public static String memoRedirectEndPoint = null;
	public static int memoTokenDuration = 60;
    
    static {
        loadProperties();
    }
    
    private static void loadProperties()
    {
    	prop = new Properties();
		secretProp = new Properties();
        InputStream in = null;
		InputStream secretIn = null;

        try
        {
            in = MailService.class.getResourceAsStream("/fr/gouv/motivaction/properties/api.properties");
            prop.load(in);

			secretIn = MailService.class.getResourceAsStream("/fr/gouv/motivaction/properties/secret.properties");
			secretProp.load(secretIn);

            
            urlOffrePEAPI = prop.getProperty("pe.offres.url");
            urlAccessTokenPEAPI = prop.getProperty("pe.accessToken.url");

			PEAMHost = prop.getProperty("PEAMHost");
			ESDHost = prop.getProperty("ESDHost");
			PEAMauthorizeEndPoint = prop.getProperty("PEAMauthorizeEndPoint");
			PEAMaccessTokenEndPoint = prop.getProperty("PEAMaccessTokenEndPoint");
			PEAMUserInfoEndPoint = prop.getProperty("PEAMUserInfoEndPoint");
			PEAMUserAddressEndPoint = prop.getProperty("PEAMUserAddressEndPoint");

			memoHost = prop.getProperty("memoHost");

			memoRedirectEndPoint = prop.getProperty("memoRedirectEndPoint");
			memoTokenDuration = Integer.parseInt(prop.getProperty("memoTokenDuration"));

			memoClientId = secretProp.getProperty("memoClientId");
			memoClientSecret = secretProp.getProperty("memoClientSecret");

            in.close();
			secretIn.close();
        }
        catch (IOException e)
        {
            log.error(logCode + "-001 API Service properties error=" + e);
        }
    }
    
    // transforme des URL pole emploi en une url avec des données accessibles
    public static String getIdOffreFromUrlPoleEmploi(String u)
    {
        String url = u;
        String res = u;
        int tokenRank = 0;
        // forme attendue : https://candidat.pole-emploi.fr/offres/recherche/detail/1712795
        // forme alternative 0 : https://candidat.pole-emploi.fr/candidat/rechercheoffres/detail/040JGSS
        // forme alternative 1 : http://offre.pole-emploi.fr/040JGSS
        // forme alternative 2 : https://candidat.pole-emploi.fr/candidat/classeuroffres/detailoffre/040JGSS
        // forme alternative 3 : http://logp6.xiti.com/go.url?xts=475540&xtor=EPR-11-[Abonnement_Offres]&url=http://offre.pole-emploi.fr/040JGSS
        // forme alternative 4 : https://candidat.pole-emploi.fr/candidat/mespropositions/detailproposition/17454042/050KZKG

        if(u.indexOf("xiti")>-1)
            url = u.substring(u.indexOf("&url=")+5);

        if(url.indexOf("offre.")>=0)
            tokenRank = 3;
        else if (url.indexOf("classeuroffres")>=0 || url.indexOf("rechercheoffres")>=0 || url.indexOf("/offres/recherche/detail")>=0)
            tokenRank = 6;
        else if (url.indexOf("detailproposition")>=0)
            tokenRank = 7;


        if(tokenRank>0) {
            StringTokenizer st = new StringTokenizer(url, "/");
            String idx = "";
            for (int i = 0; i < tokenRank; ++i)
                idx=  st.nextToken();

            res = idx;
        }

        return res;
    }
    
    public static String getPoleEmploiAPIAccessToken() throws Exception {
    	Client client = null;
    	String uri = null;
		WebTarget target = null;
		Response response = null;
		JSONParser parser = null;
		JSONObject json = null;	
		Long expiresIn = null;
		LocalDateTime now = LocalDateTime.now();	
		
    	if (timeExpiredAccessToken == null || now.isBefore(timeExpiredAccessToken)) {
    		// L'acces token est périmé

			if (wsClient != null) {
		    	uri = urlAccessTokenPEAPI.replaceAll(" ","%20");
				target = wsClient.target(UriBuilder.fromUri(uri).build());
				if (target != null) {
					// Appel de l'API
					response = target.request(MediaType.APPLICATION_JSON).post(null);
					if (response.getStatus() == 200) {
						// Lecture de la réponse
						parser = new JSONParser();
						json = (JSONObject) parser.parse((String)response.readEntity(String.class));	   
						offreAccessToken = (String)json.get("access_token");
						expiresIn = (Long)json.get("expires_in");
						now = LocalDateTime.now();
						timeExpiredAccessToken = now.plusSeconds(expiresIn);
					}
				}
	    	}
    	}
		return offreAccessToken;
    }
    
    public static String getPoleEmploiAPIOffres(String idOffre, String accessToken) throws Exception {

		String uri = null;
		WebTarget target = null;
		Response response = null;
		JSONParser parser = null;
		JSONObject json = null;	
		String res = null;	
		
    	if (accessToken != null) {
			if (wsClient != null) {
	    		uri = urlOffrePEAPI.concat(idOffre);
		    	uri = uri.replaceAll(" ","%20");
				target = wsClient.target(UriBuilder.fromUri(uri).build());
				if (target != null) {
					// Appel de l'API
					response = target.request(MediaType.APPLICATION_JSON)
								.header(HttpHeaders.CONTENT_TYPE, "application/json")
								.header(HttpHeaders.ACCEPT, "application/json")
								.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
								.get();
					if (response.getStatus() == 200) {
						parser = new JSONParser();
						json = (JSONObject) parser.parse((String)response.readEntity(String.class));
						// Lecture de la réponse
						res = (String)json.get("title");
					}
				}
	    	}
    	}
		return res;
    }

	public static URI getPEConnectFormURI(boolean noPrompt) throws Exception
	{
		//log.info("memoHost : "+memoHost+memoRedirectEndPoint);

		StringBuilder uri = new StringBuilder(PEAMHost)
									.append(PEAMauthorizeEndPoint)
									.append("?")
									.append("realm=/individu")
									.append("&response_type=code")
									.append(noPrompt?"&prompt=none":"")
									.append("&client_id=").append(memoClientId)
									.append("&redirect_uri=").append(memoHost).append(memoRedirectEndPoint)
									.append("&nonce=").append(buildNonce())
									.append("&state=").append(buildState())
									.append("&scope=").append("application_").append(memoClientId).append("+api_peconnect-individuv1+api_peconnect-coordonneesv1+openid+profile+email+coordonnees");

		return new URI(uri.toString());
	}

	public static User getUserFromPEConnect(HttpServletRequest request) throws PeConnectException
	{
		// récupération des paramètres transmis par la mire PE
		String authorizationCode = request.getParameter("code");
		String clientId = request.getParameter("client_id");
		String iss = request.getParameter("iss");
		String state = request.getParameter("state");
		String scope = request.getParameter("scope");

		User res = null;

		if(checkPEAMSource(clientId,state))
		{
			JSONObject accessToken = getPEAMAccessToken(authorizationCode);

			if(accessToken!=null)
			{
				String nonce = (String)accessToken.get("nonce");

				if(APIService.isTokenValid(nonce))
				{
					String sAccessToken = (String) accessToken.get("access_token");

					try
					{
						JSONObject userPE = getPEAMUser(sAccessToken);
						JSONObject userAddress = null;

						try
						{
							userAddress = getPEAMUserAddress(sAccessToken);
						}
						catch (Exception peamAddressException)
						{
							log.error(logCode+"-007 API Error getting user address through PEAM. error"+peamAddressException);
						}

						//log.info("userAddress : "+userAddress.toJSONString());
						User user = getMEMOUserFromPEAMUser(userPE,userAddress);
						res = user;
					}
					catch (Exception e)
					{
						if (e.getClass() == PeConnectException.class) 
							throw new PeConnectException(); // renouvellement de la propagation de l'exception
						else 
							log.error(logCode + "-005 API Error getting user from authorization token. error=" + e);
					}
				}
				else
				{
					log.warn(logCode + "-006 API Forged nonce. nonce=" + nonce + " accessToken="+accessToken.toString()+" sourceIp=" + request.getRemoteAddr());
				}
			}
			else
			{
				log.error(logCode+"-003 API Error getting authorization token.");
			}
		}
		else
		{
			//traitement cas d'erreur requête illégitime
			log.warn(logCode + "-001 API Forged clientId or state. clientId=" + clientId + " sourceIp=" + request.getRemoteAddr());
		}

		return res;
	}

	// traitement du descriptif utilisateur PE pour créer un compte le cas échéant et connecter l'utilisateur dans tous les cas
	public static User getMEMOUserFromPEAMUser(JSONObject peUser, JSONObject peUserAddress) throws Exception
	{
		//log.info("Resultat : "+peUser.toString()+" ///// "+peUserAddress.toString());

		String peUserId = (String)peUser.get("sub");

		User user = UserService.getUserFromPEAMID(peUserId);

		User peUserInfo = UserService.getUserInfoFromPEAMID(peUser,peUserAddress);

		if(user==null)
		{
			user = UserService.createUserFromPEAMUser(peUserInfo);
		}
		else
		{
			UserService.updatePEAMUser(user, peUserInfo, (peUserAddress!=null?true:false));
		}

		return user;
	}

	public static JSONObject getPEAMUser(String accessToken) throws Exception
	{
		String url = ESDHost+PEAMUserInfoEndPoint;

		WebTarget target = wsClient.target(UriBuilder.fromUri(url).build());
		Response response = target.request(MediaType.APPLICATION_JSON).header("Authorization", "Bearer "+accessToken).get();

		JSONParser parser = new JSONParser();

		String resp = (String) response.readEntity(String.class);

		JSONObject user = (JSONObject) parser.parse(resp);

		return user;
	}

	public static JSONObject getPEAMUserAddress(String accessToken) throws Exception
	{
		String url = ESDHost+PEAMUserAddressEndPoint;

		WebTarget target = wsClient.target(UriBuilder.fromUri(url).build());
		Response response = target.request(MediaType.APPLICATION_JSON).header("Authorization", "Bearer "+accessToken).get();

		JSONParser parser = new JSONParser();

		String resp = (String) response.readEntity(String.class);

		JSONObject address = (JSONObject) parser.parse(resp);

		return address;
	}

	public static JSONObject getPEAMAccessToken(String authorizationCode)
	{
		String url = PEAMHost + PEAMaccessTokenEndPoint +"?realm=%2Findividu";

		JSONObject  authorizationToken = null;

		WebTarget target = null;
		Response response = null;

		Form form = new Form();
		form.param("client_id",memoClientId);
		form.param("client_secret",memoClientSecret);
		form.param("grant_type","authorization_code");
		form.param("response_type","code");
		form.param("redirect_uri",memoHost+memoRedirectEndPoint);
		form.param("code",authorizationCode);

		target = wsClient.target(UriBuilder.fromUri(url).build());

		if (target != null)
		{
			// Appel de l'API
			response = target.request(MediaType.APPLICATION_JSON).post(Entity.entity(form, MediaType.APPLICATION_FORM_URLENCODED_TYPE));

			if(response.getStatus()==200)
			{
				JSONParser parser = new JSONParser();
				try
				{
					authorizationToken = (JSONObject) parser.parse((String) response.readEntity(String.class));
				}
				catch (Exception e)
				{
					log.error(logCode + "-002 API Error parsing authorization request response. error=" + e);
				}
			}
			else
			{
				log.error(logCode + "-004 API Error getting access token. responseStatus="+ response.getStatus());
			}
		}

		return authorizationToken;
	}

	public static String buildNonce() throws Exception
	{
		return UserService.getEncryptedToken(memoTokenDuration);
	}

	public static String buildState() throws Exception
	{
		return UserService.getEncryptedToken(memoTokenDuration);
	}

	public static boolean checkPEAMSource(String clientId, String state)
	{
		boolean res = true;

		if(!clientId.equals(memoClientId))
		{
			res = false;
		}

		if(!isTokenValid(state))
		{
			res = false;
		}

		return res;
	}

	public static boolean isTokenValid(String value)
	{
		boolean result = true;

		String token = UserService.encryptor.decrypt(value);
		String salt  = token.substring(token.lastIndexOf('|') + 1);

		if(!salt.equals(UserService.salt))
			result = false;
		else
		{
			// on vérifie que le lien n'est pas dépassé
			LocalDateTime now = LocalDateTime.now();
			LocalDateTime dt = LocalDateTime.parse(token.substring(token.indexOf('|')+1,token.lastIndexOf('|')));

			if(dt.until(now, ChronoUnit.SECONDS)>memoTokenDuration)
				result = false;
		}

		return result;
	}

}
