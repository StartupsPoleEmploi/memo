<%@page import="fr.gouv.motivaction.job.ExportDatalake"%>
<%@page import="fr.gouv.motivaction.job.ExportMaintenance"%>
<%@page import="fr.gouv.motivaction.mails.AccountDisabledAlert"%>
<%@page import="fr.gouv.motivaction.mails.UserAccountMail"%>
<%@page import="fr.gouv.motivaction.model.UserSummary"%>
<%@page import="fr.gouv.motivaction.model.User"%>
<%@page import="fr.gouv.motivaction.mails.DailyAlert"%>
<%@page import="fr.gouv.motivaction.mails.PastInterview"%>
<%@ page import="java.io.IOException, java.util.Properties,javax.mail.BodyPart,javax.mail.Message,javax.mail.Message.RecipientType,javax.mail.Session,javax.mail.Transport,javax.mail.internet.InternetAddress,javax.mail.internet.MimeBodyPart,javax.mail.internet.MimeMessage,javax.mail.internet.MimeMultipart, fr.gouv.motivaction.mails.InterviewPrepReminder, fr.gouv.motivaction.service.MailService, fr.gouv.motivaction.mails.MailTools" %>
<%@ taglib prefix="pack" uri="https://github.com/d8bitr/packtag" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<%
	boolean statut = ExportDatalake.buildAndWriteExport();
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
	</head>
<!-- END HEAD -->

	<body class="page-container-bg-solid">
		<span>Statut export datalake isOk = <%= statut %></span>
	</body>

</html>