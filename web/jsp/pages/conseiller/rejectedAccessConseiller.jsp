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
						
					<img src="../../../pic/conseiller/noLaw.png"  /><br><br>
					<strong>Cet utilisateur a refusé l'accès de son espace Memo.</strong>
					<p>Vous pouvez faire une nouvelle recherche <br>en retournant à la page précédente</p>
					<small id="txtDateAccess" style="display:none;"><p><img src="../../../pic/conseiller/demandeConsentement.png"/>une demande de consentement a déjà été envoyée le <span id="dateAcces"></span></p></small>
					<small id="txtDateRefus" style="display:none;"><p><img src="../../../pic/conseiller/demandeConsentement.png"/>la demande a été refusée le <span id="dateRefus"></span></p></small>			 
					<a onclick='javascript:Conseiller.goToHomePage();' class="btn btn-md dark btn-outline btn-rounded">Retour</a>		
						
												
				</div>
			</div>
		</div>
	</div>
</body>

<script>
	var url = new URL(window.location.href),
	//récupération d'email depuis l'url 
	email = url.searchParams.get("email");

	var Conseiller = new Conseiller();	
	var tabDate = Conseiller.getDateRefusAccess(email);
</script>


</html>