package fr.gouv.motivaction.service;


import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.log4j.Logger;

public class SlackService {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "036";  

    static Properties prop;
    private static String propUrlSlack;
    
    static {
        loadProperties();
    }
    
    private static void loadProperties()
    {
        prop = new Properties();
        InputStream in = null;

        try
        {
            in = SlackService.class.getResourceAsStream("/fr/gouv/motivaction/properties/slack.properties");
            prop.load(in);

            propUrlSlack = prop.getProperty("urlSlack");

            in.close();
        }
        catch (IOException e)
        {
            log.error(logCode + "-001 Slack properties error=" + e);
        }
    }
    
    public static void sendMsg(String msg) {
    	Client client = ClientBuilder.newClient();
    	Response response = client.target(propUrlSlack)
    			.request(MediaType.APPLICATION_JSON_TYPE)
    			.post(Entity.entity("{ \"text\" : \" " + msg + " \", \"username\": \"healthCheck-bot\", \"icon_emoji\": \":monkey_face:\"}", MediaType.APPLICATION_JSON_TYPE));
    }
}
