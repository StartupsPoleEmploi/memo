package fr.gouv.motivaction.mails;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.LocalDateTime;
import java.time.temporal.WeekFields;
import java.util.Locale;
import java.util.Properties;

import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import com.codahale.metrics.Timer;

import fr.gouv.motivaction.Constantes;
import fr.gouv.motivaction.model.CandidatureEvent;
import fr.gouv.motivaction.model.CandidatureReport;
import fr.gouv.motivaction.model.UserSummary;
import fr.gouv.motivaction.service.MailService;
import fr.gouv.motivaction.utils.DatabaseManager;
import fr.gouv.motivaction.utils.Utils;

public class WeeklyReport extends AlertMail {

    private static final String logCode = "019";
    private static int ctSentForIteration = 0;
    private static int ctSentTotal = 0;

    public static Timer weeklyReportTimer = Utils.metricRegistry.timer("weeklyReportTimer");
    
    private static String[] tabConseil = null;

    private static int cohortCount = 0;
    private static String[] cohortTexts = null;

    static Properties prop;

	static {
		tabConseil = new String[7];
		
		// @RG - EMAIL : Dans la campagne de mail "Vos priorités cette semaine", pour l'action de proposition de conseil, le 1er conseil est : la mise en avant du service Maintenant ? 
		tabConseil[0] = "Trouvez le bon job... en moins de 5 minutes et sans CV ? C’est désormais possible avec le service <a href='https://maintenant.pole-emploi.fr/formulaire-candidat.html#utm_source=DE&utm_medium=email&utm_campaign=priorit%C3%A9_MEMO&utm_term=promotionduservice' style='font-weight: bold; text-decoration:underline'>Maintenant!</a><br/><br/>" +
						"Le service est ouvert à ce jour sur 46 métiers dans 9 secteurs d’activité :<br/><br/>" +
						"<table width='100%'>" +
        				"<tr><td style='width:25%;'></td><td style='font-size:16px; font-weight:bold; background:#2C8995; text-align:center; font-family:verdana; padding: 10px 10px; border-radius: 5px;'><a href='https://maintenant.pole-emploi.fr/formulaire-candidat.html#utm_source=DE&utm_medium=email&utm_campaign=priorit%C3%A9_MEMO&utm_term=promotionduservice' style='text-decoration:none;color:#fff;'>JE POSTULE !</a></td><td style='width:25%;'></td></tr>"+
        				"</table><br/>" +
						"Comment ça marche ? <br/>" + 
						"<ul style='margin:0px 0px 0px 20px;'>" +
						"<li style='margin-left:20px; margin-top:5px;'>Sélectionnez vos disponibilités, votre mobilité et les quatre qualités qui font de vous LE bon candidat.</li>" +
						"<li style='margin-left:20px; margin-top:5px;'>Quand les critères correspondent, le service vous met en relation directe par email avec les employeurs.</li>" +
						"</ul>";
				
		// @RG - EMAIL : Dans la campagne de mail "Vos priorités cette semaine", pour l'action de proposition de conseil, le 2ème conseil est : Pour connaître les pratiques de recrutement dans votre métier sur votre territoire et adapter votre stratégie de recherche d'emploi, consultez IMT (informations sur le marché du travail) : ici. Vous pouvez également essayer de  nouveaux sites de diffusion d'offres d'emploi, afin d'identifier plus d'offres..."
		tabConseil[1] = "Pour connaître les pratiques de recrutement dans votre métier sur votre territoire et adapter votre stratégie de recherche d'emploi, consultez <a href='http://candidat.pole-emploi.fr/marche-du-travail/accueil' target='IMT'>IMT</a> (informations sur le marché du travail) : <a href='http://candidat.pole-emploi.fr/marche-du-travail/accueil' target='IMT'>ici</a><br/><br/>" +
						"Vous pouvez également essayer de  nouveaux sites de diffusion d'offres d'emploi, afin d'identifier plus d'offres.<br/>" +
						"Pour vous y aider : " +
						"<ul style='margin:0px 0px 0px 20px;'>" +
						"<li style='margin-left:20px; margin-top:5px;'><a href='http://www.job2-0.com/article-les-300-acteurs-du-recrutement-online-109501082.html' target='job2'>Job 2.0 : les 300 acteurs de l'emploi en ligne</a></li>" +
						"<li style='margin-left:20px; margin-top:5px;'><a href='http://www.emploi-store.fr/portail/centredinteret/trouverunemploi/rechercherUneOffre' target='ES jobboard'>Emploi Store : liste des jobboards</a></li>" +
						"</ul>";
		
		// @RG - EMAIL : Dans la campagne de mail "Vos priorités cette semaine", pour l'action de proposition de conseil, le 3ème conseil est : Les offres d'emploi ne représentent qu'1/3 des opportunités d'emploi ! Afin de maximiser vos chances de retrouver un emploi, envoyez également des candidatures spontanées..."
		tabConseil[2] = "Les offres d'emploi ne représentent qu'1/3 des opportunités d'emploi !<br/><br/>" +
						"Afin de maximiser vos chances de retrouver un emploi, envoyez également des candidatures spontanées.<br/>" +
						"Pour identifier les entreprises à contacter, rien de plus simple ! " +
						"Rendez-vous sur <a href='https://labonneboite.pole-emploi.fr?utm_campaign=memo&utm_medium=email&utm_source=weekly' target'LBB'>la bonne boite</a>, qui vous donnera la liste des entreprises ayant le plus de chances de recruter dans votre métier et sur votre territoire ! " +
						"Vous pouvez enregistrer sur MEMO toutes les entreprises qui vous intéressent en un clic : c'est facile, il vous suffit de cliquer sur le bouton \"Enregistrer dans MEMO\" disponible sur chaque entreprise.<br/><br/>" +
						"Afin de vous aider à préparer vos candidatures spontanées, regardez <a href='http://www.academyk.org/la-candidature-spontanee-comment-s-y-prendre-mc37.html' target='academy spont'>cette vidéo</a> de 5 minutes sur le sujet ;-)"; 
		
		// @RG - EMAIL : Dans la campagne de mail "Vos priorités cette semaine", pour l'action de proposition de conseil, le 4ème conseil est : Le réseau professionnel est le principal levier de retour à l'emploi. Avez-vous mobilisé le vôtre ? Voici quelques conseils pour bien utiliser votre réseau dans le cadre de votre recherche d'emploi : ..."
		tabConseil[3] = "Le réseau professionnel est le principal levier de retour à l'emploi. Avez-vous mobilisé le vôtre ?<br/>" +
						"Voici quelques conseils pour bien utiliser votre réseau dans le cadre de votre recherche d'emploi :" +
						"<ul style='margin:0px 0px 0px 20px;'>" +
						"<li style='margin-left:20px; margin-top:5px;'><a href='http://www.pole-emploi.fr/actualites/developper-son-reseau-@/article.jspz?id=61502' target='batirdevelopper'>pole-emploi.fr : bâtir et développer son réseau</a></li>" +
						"<li style='margin-left:20px; margin-top:5px;'><a href='http://www.emploi-store.fr/portail/services/focusReseauLaPriseDeContact' target='focus'>Apec : atelier focus réseau</a></li>" +
						"<li style='margin-left:20px; margin-top:5px;'><a href='http://www.academyk.org/l-utilisation-du-reseau-dans-sa-recherche-d-emploi-mc19.html' target='academy réseau'>Academyk : l'utilisation du réseau dans sa recherche d'emploi</a></li>" +
						"</ul>" +
						"Pour matérialiser, développer et activer votre réseau, utilisez les réseaux sociaux professionnels !<br/>" +
						"Voici quelques conseils pour débuter et les identifier :" +
						"<ul style='margin:0px 0px 0px 20px;'>" +
						"<li style='margin-left:20px; margin-top:5px;'><a href='http://www.emploi-store.fr/portail/services/bABaReseauxPro' target='B.A BA'>B.A BA des réseaux sociaux professionnels</a></li>" +
						"<li style='margin-left:20px; margin-top:5px;'><a href='http://www.academyk.org/comment-tisser-votre-toile-sur-les-reseaux-sociaux-pro-mc34.html' target='academyk'>Academyk : comment tisser votre toile sur les réseaux sociaux professionnels ?</a></li>" +
						"<li style='margin-left:20px; margin-top:5px;'><a href='http://www.emploi-store.fr/portail/services/voirplus' target='ES reseaux sociaux'>Emploi Store : les réseaux sociaux professionnels</a></li>" +
						"<li style='margin-left:20px; margin-top:5px;'><a href='http://www.job2-0.com/article-les-50-reseaux-sociaux-pros-a-connaitre-106828611.html' target='Job2 reseaux sociaux'>Job 2.0 : les 50 réseaux sociaux professionnels à connaître</a></li>" +
						"</ul>" +
						"Vous pourrez ensuite enregistrer ces démarches dans votre tableau de bord MEMO pour recevoir des conseils et des rappels.";
		
		// @RG - EMAIL : Dans la campagne de mail "Vos priorités cette semaine", pour l'action de proposition de conseil, le 5ème conseil est : Connaissez-vous les différents événements pour l'emploi près de chez vous ? Ces événements peuvent être l'occasion de rencontrer des employeurs qui ont des besoins, mais aussi de développer votre réseau. ..."
		tabConseil[4] = "Connaissez-vous les différents événements pour l'emploi près de chez vous ?<br/>" +
						"Ces événements peuvent être l'occasion de rencontrer des employeurs qui ont des besoins, mais aussi de développer votre réseau.<br/><br/>" +
						"Pour ne manquer aucun événement pour l'emploi :<br/>" +
						"<ul style='margin:0px 0px 0px 20px;'>" +
						"<li style='margin-left:20px; margin-top:5px;'><a href='http://www.pole-emploi.fr/informations/en-region-@/region/' target='Événements'>Pôle emploi Événements</a></li>" +
						"<li style='margin-left:20px; margin-top:5px;'><a href='http://www.emploi-store.fr/portail/services/evenementsDeRecrutementEtChallenges' target='Jobteaser'>Jobteaser</a></li>" +
						"</ul>" +
						"Consultez cette vidéo  pour bien vous préparer avant d'aller à un salon !<br/><br/>" +
						"Certains salons de l'emploi se font maintenant en ligne. C'est pratique, vous n'avez plus besoin de vous déplacer et pouvez postuler directement.<br/>" +
						"Voici quelques plateformes de salons en ligne :" +
						"<ul style='margin:0px 0px 0px 20px;'>" +
						"<li style='margin-left:20px; margin-top:5px;'><a href='http://www.emploi-store.fr/portail/services/salonsEnLigne' target='salons'>salons en ligne pôle emploi</a></li>" +
						"<li style='margin-left:20px; margin-top:5px;'><a href='http://www.myjobdating.com/les-jobdatings' target='myjobdating'>myjobdating</a></li>" +
						"<li style='margin-left:20px; margin-top:5px;'><a href='http://www.emploi-store.fr/portail/services/seekube' target='seekube'>seekube</a></li>" +
						"</ul>";
		
		// @RG - EMAIL : Dans la campagne de mail "Vos priorités cette semaine", pour l'action de proposition de conseil, le 6ème conseil est : Sur MEMO, les offres d'emploi qui ne sont plus en ligne sont tout de même conservées dans votre tableau de bord et automatiquement signalées.  ..."
		tabConseil[5] = "Sur MEMO, les offres d'emploi qui ne sont plus en ligne sont tout de même conservées dans votre tableau de bord et automatiquement signalées. C'est peut-être le bon moment pour effectuer une dernière relance ou bien pour les archiver !<br/><br/>";
		
		// @RG - EMAIL : Dans la campagne de mail "Vos priorités cette semaine", pour l'action de proposition de conseil, le 7ème conseil est : Avez-vous mis votre CV en ligne ? Diffuser votre CV en ligne sur des sites d'offres d'emploi vous permet de rester visible des recruteurs, qui peuvent ensuite vous contacter ! ..."
		tabConseil[6] = "Avez-vous mis votre CV en ligne ?<br/>" +
						"Diffuser votre CV en ligne sur des sites d'offres d'emploi vous permet de rester visible des recruteurs, qui peuvent ensuite vous contacter !<br/><br/>" +
						"Depuis pole-emploi.fr, vous pouvez également exporter votre CV directement sur nos sites partenaires pour encore plus de visibilité !<br/><br/>" + 
						"Découvrez grâce à <a href='http://www.academyk.org/optimiser-son-cv-pour-les-cvtheques-de-sites-d-emploi-mc45.html' target='cvtheque'>cette vidéo</a> de 3 minutes comment optimiser votre CV pour les banques de CV.<br/>" +
						"Rendez-vous dès maintenant sur votre <a href='https://candidat.pole-emploi.fr/candidat/espacepersonnel/authentification' target='espaceperso'>espace personnel</a> !";
		
	}

    public void execute(JobExecutionContext context) throws JobExecutionException
    {
        log.info(logCode + "-001 Executing weekly report");
        
        // Pour limiter l'envoi de mails aux admins 
        this.moduloFiltreEnvoiMailAdmin = MailTools.moduloFiltreWeekly;

        // initialisation des textes optionnels par cohortes
        this.initCohortTexts();

        // construction du mail et envoi aux utilisateurs
        String body = buildAndSendWeeklyTaskReminder(0);
        body += "<br/><br/> Moludo du random d'envoie :" + this.moduloFiltreEnvoiMailAdmin;

        // envoi du mail de rapport d'execution aux intras, devs et extra
        MailService.sendMailReport(Utils.concatArrayString(MailTools.tabEmailIntra, MailTools.tabEmailDev, MailTools.tabEmailExtra), "Rapport " + MailTools.env + " - Vos priorités cette semaine", body);
    }

    private void initCohortTexts()
    {
        prop = new Properties();
        InputStream in = null;

        int cohortCount = 0;

        try
        {
            in = MailService.class.getResourceAsStream("/fr/gouv/motivaction/properties/advice.properties");
            prop.load(in);

            cohortCount = Integer.parseInt(prop.getProperty("cohortCount"));
            WeeklyReport.cohortTexts = new String[cohortCount];

            for(int i=0; i<cohortCount; ++i)
            {
                String text = "";
                if(prop.getProperty("cohort."+i+".text")!=null)
                    text = prop.getProperty("cohort."+i+".text");

                WeeklyReport.cohortTexts[i] = text;
            }
            WeeklyReport.cohortCount = cohortCount;

            in.close();
        }
        catch (IOException e)
        {
            log.error(logCode + "-008 MAIL Weekly report cohort properties error=" + e);
            WeeklyReport.cohortCount = 0;
            WeeklyReport.cohortTexts = null;
        }
    }

    // email récapitulant toutes les actions de la semaine sur les fiches en cours
    public String buildAndSendWeeklyTaskReminder(long userId)
    {
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        String res = "";
        
        UserSummary currentUser = null;
        CandidatureReport currentCandidature = null;
        CandidatureEvent evt;
        long uId, cId;

        int ok=0; int err=0;
        //String oks="";

        final Timer.Context context = weeklyReportTimer.time();

        try
        {
        	// @RG - EMAIL : la campagne de mail "Vos priorités cette semaine" s'adresse aux utilisateurs ayant des candidatures afin de leur rappeler les actions de la semaine à effectuer sur leurs candidatures 'non terminées' 
            con = DatabaseManager.getConnection();

            String sqla = "SELECT    users.login, " +
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
                    "    FROM    users" +
                    "    LEFT JOIN   candidatures        ON  users.id = candidatures.userId" +
                    "    LEFT JOIN   candidatureEvents   ON  candidatureEvents.candidatureId = candidatures.id" +
                    "    WHERE users.receiveNotification=1";

            String sql="";
            long maxUserId = 0;
            long iter = 1;

            if(userId==0)
            {
                sql = "SELECT MAX(id) FROM users";
                pStmt = con.prepareStatement(sql);
                rs = pStmt.executeQuery();
                rs.next();
                maxUserId = rs.getLong(1);
                iter = (maxUserId/1000)+1;
                log.info(logCode+"-002 MAIL Sending weekly report. maxUserId="+maxUserId+" iter="+iter);
            }

            ctSentTotal = 0;
            for(int i=0; i<iter; ++i)
            {
                log.info(logCode+"-003 MAIL Sending weekly report. iteration_number="+i+" - reports sent for previous iteration="+ctSentForIteration);

                ctSentTotal+=ctSentForIteration;
                ctSentForIteration = 0;

                sql = sqla;

                if (userId > 0)
                    sql += " AND users.id = " + userId;
                else
                {
                    sql += " AND users.id BETWEEN "+((i*1000)+1)+" AND "+((i+1)*1000);
                }

                sql += "    ORDER BY    users.id,   " +
                        "                candidatures.id," +
                        "                candidatureEvents.eventTime";

                pStmt = con.prepareStatement(sql);

                rs = pStmt.executeQuery();

                currentUser = null;
                currentCandidature = null;

                while (rs.next()) {

                    evt = new CandidatureEvent();
                    uId = rs.getLong("uId");
                    cId = rs.getLong("cId");

                    evt.setCandidatureId(cId);
                    if(rs.getTimestamp("eventTime")!=null)
                        evt.setEventTime(rs.getTimestamp("eventTime").getTime());

                    if(rs.getTimestamp("creationTime")!=null)
                        evt.setCreationTime(rs.getTimestamp("creationTime").getTime());
                    evt.setEventSubType(rs.getInt("eventSubType"));
                    evt.setEventType(rs.getInt("eventType"));

                    // changement d'utilisateur
                    if (currentUser != null && currentUser.getUserId() != uId)
                    {
                        // envoi d'un message à l'utilisateur courant
                        if (currentCandidature != null && currentCandidature.getId()!=0)
                            Utils.addCandidatureToUserSummary(currentCandidature, currentUser);

                        this.sendWeeklyReport(currentUser, (userId > 0) ? true : false);

                        ok++;
                        //oks+= " - "+currentUser.getEmail()+" ("+currentUser.getUserId()+")\r\n";

                        currentUser = null;
                        currentCandidature = null;
                    }

                    if (currentUser == null) {
                        // initialisation nouvel utilisateur courant
                        currentUser = new UserSummary();
                        currentUser.setUserId(uId);
                        currentUser.setEmail(rs.getString("login"));
                    }

                    if (currentCandidature != null && currentCandidature.getId()!=0 && currentCandidature.getId() != cId) {
                        // début d'une nouvelle candidature
                        // traitement candidature précédente et init de la nouvelle
                        Utils.addCandidatureToUserSummary(currentCandidature, currentUser);
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

                // traitement candidature courante
                if (currentCandidature != null && currentCandidature.getId()!=0 && currentUser != null) {
                    Utils.addCandidatureToUserSummary(currentCandidature, currentUser);
                }

                // traitement utilisateur courant
                if (currentUser != null) {
                    sendWeeklyReport(currentUser, (userId > 0) ? true : false);
                    ok++;
                    //oks+= " - "+currentUser.getEmail()+" ("+currentUser.getUserId()+")";
                }
            }

            ctSentTotal+=ctSentForIteration;
            log.info(logCode+"-007 MAIL Finished sending weekly report. Reports sent for previous iteration="+ctSentForIteration+". Total reports sent="+ctSentTotal);
        }
        catch (Exception e)
        {
            if (currentCandidature!=null && currentCandidature.getId()!=0) {
            	log.error(logCode + "-004 MAIL Error processing weekly reminder email candidature. userId=" + userId + " error=" + e + " cand=" + currentCandidature.getId()+"-"+currentCandidature.getNomCandidature());
            }
            else
                log.error(logCode + "-005 MAIL Error processing weekly reminder email candidature. userId=" + userId + " error=" + e);
            //e.printStackTrace();
            err++;
        }
        finally
        {
            context.close();
            DatabaseManager.close(con, pStmt, rs, logCode, "006");
        }
        res = "Conseils hebdomadaires envoyés à "+ok+" utilisateurs<br/>Erreurs de traitement : "+err;
        res += "<br/><br/>IP serveur SMTP d'envoi : " + MailTools.host;

        return res;
    }

    private void sendWeeklyReport(UserSummary user, boolean test)
    {
        String subject = "Vos priorités cette semaine";
    	String html = MailTools.buildHtmlHeader(user);

        LocalDateTime currentTime = LocalDateTime.now();
        String campaign = currentTime.format(formatter);
        String source = "rapport_hebdo";

        boolean hasBoardConseils = false;

        html += buildWeeklyReportCandidature(user);

        try
        {
            html += buildCohortMessagePart(user, source, campaign);
        }
        catch (Exception e)
        {
            log.error(logCode+"-009 MAIL Error building cohort part of report. userId="+user.getUserId()+" error="+e);
        }

        if(user.getRemercierEntretien()!=null || user.getRelancerEntretien()!=null || user.getPreparer()!=null || user.getDoisRelancer()!=null || user.getVaPostuler()!=null /*|| user.getArchiver()!=null*/)
        	html+="<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>Voici ci-dessous, une liste personnalisée d'actions à mener en priorité pour accélérer votre retour à l'emploi.</td></tr>";

        // @RG - EMAIL : Dans la campagne de mail "Vos priorités cette semaine", la 1ère action conseillée est le remerciement suite à un entretien pour chaque candidature concernée
        if(user.getRemercierEntretien()!=null)
        {
            hasBoardConseils = true;
            html+=buildRemercierEntretien(user,source,campaign);
        }

        // @RG - EMAIL : Dans la campagne de mail "Vos priorités cette semaine", la 2ème action conseillée est la relance suite à un entretien pour chaque candidature concernée
        if(user.getRelancerEntretien()!=null)
        {
            hasBoardConseils = true;
            html+=buildRelancerEntretien(user,source,campaign);
        }

        // @RG - EMAIL : Dans la campagne de mail "Vos priorités cette semaine", la 3ème action conseillée est la préparation à un entretien pour chaque candidature concernée
        if(user.getPreparer()!=null)
        {
            hasBoardConseils = true;
            html+=buildPreparer(user,source,campaign);
        }

        // @RG - EMAIL : Dans la campagne de mail "Vos priorités cette semaine", la 4ème action conseillée est la relance suite à une candidature pour chaque candidature concernée
        if(user.getDoisRelancer()!=null)
        {
            hasBoardConseils = true;
            html+=buildRelancer(user,source,campaign);
        }

        // @RG - EMAIL : Dans la campagne de mail "Vos priorités cette semaine", la 5ème action conseillée est l'incitation à postuler pour toutes les candidatures à l'état 'VA_POSTULER'
        if(user.getVaPostuler()!=null)
        {
            hasBoardConseils = true;
            html+=buildPostuler(user,source,campaign);
        }

        // @RG - EMAIL : Dans la campagne de mail "Vos priorités cette semaine", la 6ème action conseillée est la vérification des candidatures potentiellement hors ligne car obsolète
        /*if(user.getArchiver()!=null)
            html+=buildArchiver(user,source,campaign);
        */
        // @RG - EMAIL : Dans la campagne de mail "Vos priorités cette semaine", la 7ème action est un conseil proposé parmis la liste des 6 conseils possibles
        html += buildConseils(currentTime);

        if(hasBoardConseils)
            html += buildPriorityLink(source,campaign);

        html += MailTools.getGotAJobButton(user, source, campaign);

        html += MailTools.buildHTMLSignature(source, campaign, "", false);
        html+= MailTools.buildHTMLFooter(user, source,campaign);

        boolean enBCC = false;
        // pour limiter l'envoi de mails aux admins
    	if (this.cptNbEnvoi%this.moduloFiltreEnvoiMailAdmin == 0) {
    		enBCC = true;
    	}

        if ("PROD".equals(MailTools.env) || test || ("RECETTE".equals(MailTools.env) && this.cptNbEnvoi%this.moduloFiltreEnvoiMailAdmin == 0)) {
        	// PROD ou RECETTE avec modulo OK ou mode TEST depuis le BO
            if(MailService.sendMailWithImage(user.getEmail(), subject, html, test, enBCC))
                ctSentForIteration++;
            //log.info("weeklyReport mail sent "+user.getEmail());
        }

        this.cptNbEnvoi++;
    }

    private String buildCohortMessagePart(UserSummary user, String source, String campaign) throws Exception
    {
        String params = "&utm_campaign="+campaign+"&utm_medium=email&utm_source="+source+"&utm_content=";

        String res = "";

        if(WeeklyReport.cohortCount>0)
        {
            int cohort = (int)(user.getUserId()%WeeklyReport.cohortCount);

            String text = WeeklyReport.cohortTexts[cohort];

            if(text!=null && !text.equals(""))
            {
                params+=cohort;

                res = "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>"
                        +text +"</td></tr>";
            }
        }

        return res;
    }

    private String buildPriorityLink(String source, String campaign) {
        String params = "&utm_campaign="+campaign+"&utm_medium=email&utm_source="+source;

        String res = "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>" +
                "Votre liste des priorités de la semaine est également disponible <strong>";

        res +="<a href='"+MailTools.url+"/priorities?"+params+"'>ici</a></strong></td></tr>";

        return res;
    }


    private static String buildRemercierEntretien(UserSummary user, String source, String campaign)
    {
        String res = "";

        String params = "&utm_campaign="+campaign+"&utm_medium=email&utm_source="+source;

        if(user.getRemercierEntretien()!=null)
        {
            CandidatureReport cand = null;
            String tok;

            res = "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>";

            for(int i=0, l=user.getRemercierEntretien().size(); i<l; ++i)
            {
                if(i>0)
                    res+="<br /><br />";
                cand = (CandidatureReport)user.getRemercierEntretien().get(i);

                res+="<li><b>Remerciez suite à l'entretien</b> le recruteur pour ";
                res+="\"<a href='"+MailTools.url+"?c="+cand.getId()+params+"' style='color:#20314d;text-decoration:underline'>";
                res+=cand.getNomCandidature();
                tok = cand.getNomSociete();
                if(tok!=null && !tok.equals(""))
                    res+=" chez "+tok;
                res+="</a>\"</li>";
                res+="<br/>&emsp;Distinguez-vous !";
                if (cand.getNomContact() != null || cand.getTelContact() != null || cand.getEmailContact() != null)
                {
                    res+= " ("+ (cand.getNomContact()!=null?cand.getNomContact():"") + " " + (cand.getTelContact()!=null?cand.getTelContact():"") + " " + (cand.getEmailContact()!=null?cand.getEmailContact():"") + ") ";
                }

            }

            res+="</td></tr>";
        }

        return res;
    }

    private static String buildRelancerEntretien(UserSummary user, String source, String campaign)
    {
        String res = "";

        String params = "&utm_campaign="+campaign+"&utm_medium=email&utm_source="+source;

        if(user.getRelancerEntretien()!=null)
        {
            CandidatureReport cand = null;
            String tok;

            res = "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>";


            for(int i=0, l=user.getRelancerEntretien().size(); i<l; ++i)
            {
                if(i>0)
                    res+="<br /><br />";

                cand = (CandidatureReport)user.getRelancerEntretien().get(i);

                res+="<li><b>Relancez suite à l'entretien</b> le recruteur pour ";

                res+="\"<a href='"+MailTools.url+"?c="+cand.getId()+params+"' style='color:#20314d;text-decoration:underline'>";

                res+=cand.getNomCandidature();
                tok = cand.getNomSociete();
                if(tok!=null && !tok.equals(""))
                    res+=" chez "+tok;
                res+="</a>\"</li>";
                res+="<br/>&emsp;Démarquez-vous !";
            }

            res+="</td></tr>";
        }


        return res;
    }

    private static String buildPreparer(UserSummary user, String source, String campaign)
    {
        String res = "";

        String params = "&utm_campaign="+campaign+"&utm_medium=email&utm_source="+source;

        if(user.getPreparer()!=null)
        {
            res = "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>";

            CandidatureReport cand = null;
            String tok;

            for(int i=0, l=user.getPreparer().size(); i<l; ++i)
            {
                if(i>0)
                    res+="<br /><br />";

                cand = (CandidatureReport)user.getPreparer().get(i);

                res+="<li><b>Préparez</b> votre entretien pour ";

                res+="\"<a href='"+MailTools.url+"?c="+cand.getId()+params+"' style='color:#20314d;text-decoration:underline'>";

                res+=cand.getNomCandidature();
                tok = cand.getNomSociete();
                if(tok!=null && !tok.equals(""))
                    res+=" chez "+tok;
                res+="</a>\"";
                if (cand.getVille() != null) {
                	res+=" (<a href='https://www.google.fr/maps/dir//" + cand.getVille() + "' target='itineraire'>Préparez votre trajet ici</a>) ";
                }
            }

            res+="</li></td></tr>";
        }

        return res;
    }

    private static String buildRelancer(UserSummary user, String source, String campaign)
    {
        String res = "";

        String params = "&utm_campaign="+campaign+"&utm_medium=email&utm_source="+source;

        if(user.getDoisRelancer()!=null)
        {
            res = "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>";
            res += "<li><b>Relancez vos candidatures</b> pour montrer votre motivation aux employeurs :</li>";

            CandidatureReport cand = null;
            String tok;

            res+="<ul style='list-style-type:circle;margin:0px 20px;'>";

            for(int i=0, l=user.getDoisRelancer().size(); i<l; ++i)
            {
                cand = (CandidatureReport)user.getDoisRelancer().get(i);
                res+="<li style='margin-left:20px; margin-top:5px;'>\"<a href='"+MailTools.url+"?c="+cand.getId()+params+"' style='color:#20314d;text-decoration:underline'>";

                res+=cand.getNomCandidature();
                tok = cand.getNomSociete();
                if(tok!=null && !tok.equals(""))
                    res+=" chez "+tok;
                res+="</a>\"</li>";
            }

            res+="</ul></td></tr>";
        }

        return res;
    }

    private static String buildPostuler(UserSummary user, String source, String campaign)
    {
        String res = "";

        String params = "&utm_campaign="+campaign+"&utm_medium=email&utm_source="+source;

        if(Utils.getListSize(user.getVaPostuler())>0)
        {
            res = "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>";
            if(Utils.getListSize(user.getVaPostuler()) != Utils.getListSize(user.getPostulerSpont())) {
            	// @RG - EMAIL : Dans la campagne de mail "Vos priorités cette semaine", pour l'action d'incitation à postuler, on affiche "Postulez aux offres que vous avez sauvegardées : ..." pour les candidatures non spontanées
            	res += "<li><b>Postulez</b> aux offres que vous avez sauvegardées :</li>";
            	
            	CandidatureReport cand = null;
                String tok;

                res+="<ul style='list-style-type:circle; margin:0px 20px;'>";
                for(int i=0, l=user.getVaPostuler().size(); i<l; ++i)
                {
                    cand = (CandidatureReport)user.getVaPostuler().get(i);

                    if (cand.getType()!=Constantes.TypeOffre.SPONT.ordinal()) {
                    	// La candidature n'est pas de type spontanée
	                    res+="<li style='margin-left:20px; margin-top:5px;'>\"<a href='"+MailTools.url+"?c="+cand.getId()+params+"' style='color:#20314d;text-decoration:underline'>";
	                    res+=cand.getNomCandidature();
	                    tok = cand.getNomSociete();
	                    if(tok!=null && !tok.equals(""))
	                        res+=" chez "+tok;
	                    res+="</a>\"</li>";
                	}

                }
                res+="</ul>";
            }
            // Pour les candidatures spontanées
            res+=buildPostulerSpont(user, params);
            
            res+="</td></tr>";
        }

        return res;
    }
    
    private static String buildPostulerSpont(UserSummary user, String params) {
    	String res = "";
    	
        if(Utils.getListSize(user.getPostulerSpont())>0) {
        	// @RG - EMAIL : Dans la campagne de mail "Vos priorités cette semaine", pour l'action d'incitation à postuler, on affiche "Contactez les entreprises que vous avez repérées : ..." pour les candidatures spontanées
        	res += "<li margin-top:10px;><b>Contactez</b> les entreprises que vous avez repérées :</li>";

	        CandidatureReport cand = null;
	        String tok;
	
	        res+="<ul style='list-style-type:circle; margin:0px 0px 0px 20px;'>";
	        for(int i=0, l=user.getPostulerSpont().size(); i<l; ++i)
	        {
	            cand = (CandidatureReport)user.getPostulerSpont().get(i);
	
	            res+="<li style='margin-left:20px;margin-top:5px;'>\"<a href='"+MailTools.url+"?c="+cand.getId()+params+"' style='color:#20314d;text-decoration:underline'>";
	            res+=cand.getNomCandidature();
	            tok = cand.getNomSociete();
	            if(tok!=null && !tok.equals(""))
	                res+=" chez "+tok;
	            res+="</a>\"</li>";
	
	        }
	        res+="</ul>";
        }
        return res;
    }

    public static String buildWeeklyReportCandidature(UserSummary user)
    {
    	int nbCandidatureActive = 0;
        String res = "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>";

        res+="Bonjour,<br /><br />";

        if (user.getEntretienCount()>0) {
        	res+="Avant tout, félicitations car vous avez réussi à décrocher <strong>" + user.getEntretienCount() + " entretien(s)</strong> depuis la dernière fois. <br />";
        }
        if (Utils.getListSize(user.getAiRelance())>0 ||  Utils.getListSize(user.getVaPostuler())>0) {
        	res+="Votre recherche d'emploi avance : depuis une semaine vous avez ";
        	if (Utils.getListSize(user.getAiRelance())>0) {
        		res+="relancé <strong>" + Utils.getListSize(user.getAiRelance()) + " candidature(s)</strong> ";
        	}
        	if (Utils.getListSize(user.getAiPostule())>0) {
        		if (Utils.getListSize(user.getAiRelance())>0) res+=", ";
        		res+="postulé <strong>" + Utils.getListSize(user.getAiPostule()) + " fois</strong> ";
        	}
        	if (Utils.getListSize(user.getVaPostuler())>0) {
        		if (Utils.getListSize(user.getAiRelance())>0 || Utils.getListSize(user.getAiPostule())>0) res+="et ";
        		res+="mémorisé <strong>" + Utils.getListSize(user.getVaPostuler()) + " nouvelle(s) candidature(s)</strong>";
        	}
        	res+=".<br />";
        }
        // nb entretien décroché + nb relance faite + nb nouvelle candidature depuis la semaine dernière
        nbCandidatureActive = user.getEntretienCount() + Utils.getListSize(user.getAiRelance()) + Utils.getListSize(user.getAiPostule());
        if(nbCandidatureActive < 4)
        	res+="Vous augmenterez significativement vos chances de retrouver un emploi si vous faites d'autres candidatures dès maintenant ! <br />";
        res+="</td></tr>";

        return res;
    }
    
    public static String buildConseils(LocalDateTime today) {
    	WeekFields weekFields = WeekFields.of(Locale.getDefault()); 
    	int numSemaine = today.get(weekFields.weekOfWeekBasedYear());
    	int modulo = 0;
    	
    	// @RG - EMAIL : Dans la campagne de mail "Vos priorités cette semaine", pour l'action de proposition de conseil, on affiche 1 conseil selon le numéro de semaine via un modulo (num_semaine%nb_conseil)
    	if (tabConseil!=null)
    		modulo = numSemaine%tabConseil.length;
    	
    	String res = "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>";
    	res += "<li><b>Le saviez-vous ?</b></li><br/>";
    	res += tabConseil[modulo];
        res += "</td></tr>";
        
        return res;
    }
}

