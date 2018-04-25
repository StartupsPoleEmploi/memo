<%@ taglib prefix="pack" uri="https://github.com/d8bitr/packtag" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="org.apache.commons.lang3.StringEscapeUtils" %>
<%@ include file="./jsp/userAuth.jsp"%>
<%@ include file="./jsp/urlParams.jsp"%>
<!DOCTYPE html>
<html lang="fr">
    <head>
        <title>MEMO | Visualisez toutes vos candidatures – un service Pôle emploi</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta content="Suivez l'ensemble de vos candidatures en un clin d'œil et boostez leur potentiel !" name="description" />
        <meta content="Pôle emploi" name="author" />


        <link rel="shortcut icon" href="./pic/favicon.ico" />

        <%@ include file="./jsp/css.jsp"%>

        <%@ include file="./jsp/jsParams.jsp"%>

    </head>
<body class="marginTop15 Site">
    <div class="Site-content">
    <%@ include file="./jsp/welcome.jsp"%>
    <%@ include file="./jsp/facebookJS.jsp"%>
    <%@ include file="./jsp/home.jsp"%>
    <%@ include file="./jsp/classeur.jsp"%>
    <%@ include file="./jsp/pages/parametres.jsp"%>
    <%@ include file="./jsp/pages/priorites.jsp"%>
    <%@ include file="./jsp/pages/conseilsPage.jsp"%>
    <%@ include file="./jsp/pages/activites.jsp"%>
    <%@ include file="./jsp/homeLandingFromImport.jsp"%>
    </div>

    <%@ include file="./jsp/footer.jsp"%>

	<%@ include file="./jsp/modals/noInternet.jsp"%>
    <%@ include file="./jsp/modals/errorMessage.jsp"%>
    <%@ include file="./jsp/modals/PEAMError.jsp"%>
    <%@ include file="./jsp/modals/modifierMotDePasse.jsp"%>
    <%@ include file="./jsp/modals/modifierEmail.jsp"%>
    <%@ include file="./jsp/modals/supprimerCompte.jsp"%>
    <%@ include file="./jsp/modals/editEventForm.jsp"%>
    <%@ include file="./jsp/modals/editTunnel.jsp"%>
    <%@ include file="./jsp/modals/removeCandidature.jsp"%>
    <%@ include file="./jsp/modals/removeCandidatureEvent.jsp"%>
    <%@ include file="./jsp/modals/archiveCandidature.jsp"%>
    <%@ include file="./jsp/modals/cgu.jsp"%>
    <%@ include file="./jsp/modals/faq.jsp"%>
    <%@ include file="./jsp/modals/privacyPolicy.jsp"%>
    <%@ include file="./jsp/modals/privacyInfo.jsp"%>
    <%@ include file="./jsp/modals/candDejaImportee.jsp"%>

    <%@ include file="./jsp/modals/archiverCandidature.jsp"%>
    <%@ include file="./jsp/modals/postulerCandidature.jsp"%>
    <%@ include file="./jsp/modals/preparerCandidature.jsp"%>
    <%@ include file="./jsp/modals/relancerCandidature.jsp"%>
    <%@ include file="./jsp/modals/relancerEntretien.jsp"%>
    <%@ include file="./jsp/modals/remercierEntretien.jsp"%>
    <%@ include file="./jsp/modals/noCandidatureVideo.jsp"%>
    <%@ include file="./jsp/modals/setEntretienForm.jsp"%>
    <%@ include file="./jsp/modals/unsavedCandidature.jsp"%>
    <%@ include file="./jsp/modals/refusCandidature.jsp"%>
    <%@ include file="./jsp/modals/acceptationCandidature.jsp"%>
    <%@ include file="./jsp/modals/attachmentManager.jsp"%>
    <%@ include file="./jsp/modals/removeFile.jsp"%>
    <%@ include file="./jsp/modals/renouvelerMotDePasse.jsp"%>

    <%@ include file="./jsp/modals/shareLink.jsp"%>

    <%@ include file="./jsp/modals/mdConseilNudgeReseau.jsp"%>

    <%@ include file="./jsp/js.jsp"%>

    <div id="importContainer" style="display:none;"></div>

    <input type="hidden" id="csrf" value="<%=csrf%>" />
</body>
