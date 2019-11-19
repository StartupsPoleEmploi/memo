<%@page import="fr.gouv.motivaction.utils.Utils"%>
<%@page import="fr.gouv.motivaction.Constantes"%>
<%@page import="fr.gouv.motivaction.mails.MailTools"%>
<%@ page import="fr.gouv.motivaction.Constantes" %>

<%@ taglib prefix="pack" uri="https://github.com/d8bitr/packtag" %>
<%@ page contentType="text/html;charset=UTF-8" language="java"%>

<%
	boolean isIpConseiller = false;
	isIpConseiller = Utils.isIpConseiller(request);
	
	if (!isIpConseiller) {
		// il ne s'agit pas d'une ip conseiller (hors réseau PE)
		response.sendRedirect(MailTools.url + "/jsp/pages/conseiller/forbiddenConseiller.jsp");
	}
%>

<!DOCTYPE html>
<html>
<head>

<link rel="stylesheet" href="../../../assets/global/plugins/bootstrap/css/bootstrap.min.css" type="text/css" />
<link rel="stylesheet" href="../../../assets/global/css/components.min.css" type="text/css" />
<link rel="stylesheet" href="../../../css/conseiller.css" type="text/css" />
<link rel="shortcut icon" href="../../../pic/favicon.ico" />
<script:pack>
	<script type="text/javascript" src="../../../js/classes/conseiller.js"></script>
	<script src="../../../js/jquery-2.1.3.min.js"></script>
</script:pack>
<meta charset="UTF-8">

<title>Espace Memo Conseiller</title>

</head>

<body>

	<div class="container-fluid">
		<div class="row">
			<div class="col-sm-4" style="background-color: #F7F7F7;">
				<img class="logo" src="../../../pic/conseiller/memoLogo.svg" height="70"
					weight="70" alt="Logo Memo" />
			</div>
			<div class="col-sm-8">
				<div align="center" class="ctn">

					<h3>
						<b>Bienvenue sur Memo</b>
					</h3>
					<strong>Inscrivez l'adresse e-mail du demandeur d'emploi <br> 
						pour consulter son espace Memo</strong><br><br>
					
					<div class="email" style="display:none;">
						<strong><span id="formatEmail" style="color:red" ></span></strong><br>
					</div>					
					<div id="success">
						<input type="email" id="email" class="form-control" placeholder="Email" /><br>
					</div>
					<div class="notEmail" style="display:none;">
						<img id="notEmail" src="../../../pic/conseiller/emailNot.png" />
						<small>Aucun compte n'a été trouvé pour cette adresse e-mail.</small><br>
						<small><a onclick='javascript:conseiller.goToInvitPage();'>Inviter votre demandeur d'emploi à rejoindre Memo</a></small><br><br>
					</div>
					<a id="goToEspaceDemandeur" class="btn btn-primary btn-lg">Rechercher</a><br><br>
					
					<strong>Votre demandeur d'emploi n'a pas encore de compte ?</strong>
					<p>
						<a onclick='javascript:conseiller.goToInvitPage();'>Invitez-le à rejoindre Memo</a>
					</p>
				</div>
			</div>
		</div>
	</div>

</body>

<script>
	var conseiller = new Conseiller();
	conseiller.logEventToGA('event', 'Conseiller', 'Accès home', '');
</script>

</html>