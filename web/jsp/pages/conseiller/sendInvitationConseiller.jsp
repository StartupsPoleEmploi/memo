<%@page import="fr.gouv.motivaction.mails.MailTools"%>
<%@page import="fr.gouv.motivaction.utils.Utils"%>
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
					<img src="../../../pic/conseiller/invitEmail.png"  /><br><br>
					<strong>Votre demandeur d'emploi n'utilise pas encore Memo ? Ajoutez son adresse e-mail pour l'inviter à nous rejoindre</strong><br><br>	
					<div class="email">
						<strong><span id="formatEmail" style="color:red" ></span></strong><br>
					</div>					
					<input type="email" id="envEmail" class="form-control" placeholder="Email" /><br>
					<a onclick='javascript:Conseiller.goToHomePage();' class="btn btn-md dark btn-outline btn-rounded">Retour</a>&nbsp;&nbsp;&nbsp;
					<a onclick='javascript:Conseiller.sendInvitationToUseMemo();' role="button" class="btn btn-primary">Envoyer une invitation</a>						
												
				</div>
			</div>
		</div>
	</div>

</body>

<script>
	var Conseiller = new Conseiller();
	var url = new URL(window.location.href);
	//récupération d'email depuis l'url 
	var email = url.searchParams.get("email");
	$("#envEmail").val(email);
</script>

</html>