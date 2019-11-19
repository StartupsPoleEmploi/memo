<%@page import="fr.gouv.motivaction.job.ExportDatalake"%>
<%@page import="fr.gouv.motivaction.mails.AccountDisabledAlert"%>
<%@page import="fr.gouv.motivaction.mails.UserAccountMail"%>
<%@page import="fr.gouv.motivaction.model.UserSummary"%>
<%@page import="fr.gouv.motivaction.model.User"%>
<%@page import="fr.gouv.motivaction.utils.Utils"%>
<%@page import="fr.gouv.motivaction.service.UserService"%>
<%@page import="fr.gouv.motivaction.Constantes"%>
<%@page import="fr.gouv.motivaction.mails.DailyAlert"%>
<%@page import="fr.gouv.motivaction.mails.PastInterview"%>
<%@ page import="java.io.IOException, java.util.Properties,javax.mail.BodyPart,javax.mail.Message,javax.mail.Message.RecipientType,javax.mail.Session,javax.mail.Transport,javax.mail.internet.InternetAddress,javax.mail.internet.MimeBodyPart,javax.mail.internet.MimeMessage,javax.mail.internet.MimeMultipart, fr.gouv.motivaction.mails.InterviewPrepReminder, fr.gouv.motivaction.service.MailService, fr.gouv.motivaction.mails.MailTools" %>
<%@ taglib prefix="pack" uri="https://github.com/d8bitr/packtag" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<%
    String statut = "mail envoyé";
    String subject = "Mail de test";
    String body = "Nouvel envoie mail de test";
    String from = "memo@pole-emploi.fr";//
    String to = "alan.leruyet@free.fr"; //to = "julien.racine@pole-emploi.fr";


    User testUser = new User();
    testUser.setLogin("alan.leruyet@free.fr");
    testUser.setId(0);
    testUser.setLastName("LLLEE");
    testUser.setFirstName("ALAAAAN");

    UserService.saveFrom(testUser,"JEPOSTULE");

    UserAccountMail.sendNewAccountNotificationFrom(testUser,true,"JEPOSTULE");

   // Create a mail session
   /*Properties props;
   props = MailTools.getProperties();

   Session sessione = Session.getDefaultInstance(props, null);
   sessione.setDebug(true);

   // Construct the message
   MimeMessage msg = new MimeMessage(sessione);

   try
   {
       msg.setHeader("Content-Type", "text/html; charset=\"UTF-8\"");

       InternetAddress ia = new InternetAddress(from);
       //ia.setPersonal(personal);
       msg.setFrom(ia);

       msg.addRecipient(RecipientType.TO, new InternetAddress(to));

      	msg.setSubject(subject);

       MimeMultipart mp = new MimeMultipart("related");

       // le html
       BodyPart bp = new MimeBodyPart();
       bp.setHeader("Content-Type","text/html; charset=\"utf-8\"");
       bp.setContent(body, "text/html; charset=utf-8");
       mp.addBodyPart(bp);
       msg.setContent(mp);

       Transport.send(msg);
       statut = "mail envoyé : </br> FROM=" + from + "</br>  TO=" + to;
   }
   catch (Exception e)
   {
	   statut = "mail plantéééééé : FROM=" + from + " TO=" + to + e;
   }*/

//    PastInterview pastInter = new PastInterview();
//    pastInter.sendPastInterview(new UserSummary(798, "julien.racine@pole-emploi.fr"), "nomCandidature", "nomSociete", new Long(200), true);
//    UserAccountMail.sendNewAccountNotification(new User(787, "julienracine.pe@pole-emploi.fr"), true);
   /*AccountDisabledAlert job = new AccountDisabledAlert();
   job.buildAndSendEmail(787);
   job.updateUserLog(787);
   // désactivation automatique des notifications pour les users
   job.desactivateNotifications(787);*/

   //MailService.sendMail(MailTools.tabEmailDev, MailTools.tabEmailIntra, MailTools.tabEmailExtra, "Rapport - Envoi des rappels de préparation d'entretien", body);

    // essai d'envoi de message sur localhostname spécifique. vérification de la délivrabilité
    //MailTools.sendTestMail("92.ip-167-114-255.eu");
    //MailTools.sendTestMail(null);
    //ExportMaintenance.buildUserList();

	//ExportDatalake.buildAndWriteExportRetry(request, "2019-05-22");

%>

<!DOCTYPE html>
<!--[if IE 8]> <html lang="en" class="ie8 no-js"> <![endif]-->
<!--[if IE 9]> <html lang="en" class="ie9 no-js"> <![endif]-->
<!--[if !IE]><!-->
<html lang="fr">
<!--<![endif]-->
<!-- BEGIN HEAD -->

	<head>
	  <meta charset="utf-8" />
	  <title>Test MEMO</title>
	  <meta http-equiv="X-UA-Compatible" content="IE=edge">
	  <meta content="width=device-width, initial-scale=1" name="viewport" />
	  <meta content="" name="description" />
	  <meta content="" name="author" />
	  	  <script src="../js/jquery-2.1.3.min.js" type="text/javascript"></script>
	  <script type="text/javascript">
	  		/*
	  		var jepostule={
	  				
	  				  adresseUtilisateur: '3 rue du four 75018 Paris',
	  		  		  emailUtilisateur: 'candidat@pe.fr',
	  		  		  lettreMotivation: 'je suis chaud bouillant pour bosser chez vous',
	  		  		  nomUtilisateur: 'Sept',
	  		  		  numSiret: '48447862300016',
	  		  		  peId: 'peIdJa',
	  		  		  prenomUtilisateur: 'Charles',
	  		  		  romeRecherche: 'A1102',
	  		  		  telUtilisateur: '0123456789'
	  		};

	  		  
	  		var now = 1556637736367;//Date.now();
            $.ajax({
                type: 'POST',
                url: 'http://localhost/rest/api/v1/candidature?user=jepostule&timestamp=2019-05-23T12:18:14&signature=0f2157406d4a2f3f3daab8586979bff2',
                contentType: 'application/JSON',
                data: JSON.stringify(jepostule),
                dataType: "JSON",

                success: function (response)
                {
                    if(response.result=="ok")
                    {
                    	console.log('API saveCandSpont OK - idCand=' + response.id);
                    }
                    else
                    {
                    	console.log('API saveCandSpont ERROR' + response.msg);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown)
                {
                    // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                    console.log('/candidature error: ' + textStatus);
                    console.log("traitement erreur changement d'état candidature");
                    Raven.captureException("updateCandidatureState ajax error : ",textStatus,errorThrown);
                }
            });
            */
	  </script>
	  
	</head>
<!-- END HEAD -->

	<body class="page-container-bg-solid">
		<span><!--Emails de test JEPOSTULE envoyés--></span>

		Test ip in range 185.215.64.0/22 ?
        <br />(de 185.215.64.0 à 185.215.67.255)

		<br /><br />

		<%=Constantes.testIpRange()%>


	</body>

</html>