<%@page import="fr.gouv.motivaction.model.Candidature"%>
<%@page import="fr.gouv.motivaction.Constantes.JobBoardUrl"%>
<%@page import="javax.validation.ConstraintTarget"%>
<%@page import="fr.gouv.motivaction.dao.CandidatureDAO"%>
<%@ page import="java.io.IOException" %>
<%@ taglib prefix="pack" uri="https://github.com/d8bitr/packtag" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<%
	Candidature cand;
	cand = CandidatureDAO.loadLastUpdateByJobBoard(JobBoardUrl.MONSTER);
%>
<script>
	var url;
	url = <%=cand.getUrlSource()%>;
	testSaveCandidatureOK = testSaveCandidature(testImportOffreOK, c, url);
</script>

<!DOCTYPE html>
<!--[if IE 8]> <html lang="en" class="ie8 no-js"> <![endif]-->
<!--[if IE 9]> <html lang="en" class="ie9 no-js"> <![endif]-->
<!--[if !IE]><!-->
<html lang="fr">
<!--<![endif]-->


	<head>
		<meta charset="utf-8" />
		<title>Test Imports MEMO</title>
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta content="width=device-width, initial-scale=1" name="viewport" />
		<meta content="" name="description" />
		<meta content="" name="author" />

		<script type="text/javascript" src="../js/jquery-2.1.3.min.js"></script>	
	
		<script type="text/javascript" src="../assets/tests/jasmine/jasmine.js"></script>
		<script type="text/javascript" src="../assets/tests/jasmine/jasmine-html.js"></script>
		
		<!-- The JUnit reporter should go before the boot script -->
		<script src="../assets/tests/jasmine/jasmine2-junit.js"></script>
		<!-- This boot.js is a modified version of Jasmine's default boot.js! -->
		<script src="../assets/tests/jasmine/boot.js"></script>
		
		<script type="text/javascript" src="../assets/global/plugins/bootstrap-toastr/toastr.min.js"></script>
	    <script type="text/javascript" src="../js/utils.js"></script>
	    <script type="text/javascript" src="../js/textField.js"></script>
	    <script type="text/javascript" src="../js/classes/leBonRythme.js"></script>

		<script type="text/javascript" src="../js/test/initTest.js"></script>
		<script type="text/javascript" src="../js/test/serviceTest.js"></script>
		
		<script>
			var url;
			url = <%=cand.getUrlSource()%>;
			testSaveCandidatureOK = testSaveCandidature(testImportOffreOK, c, url);
		</script>
	  
	</head>
<!-- END HEAD -->

	<body class="page-container-bg-solid">
		<span>Imports </span>
	</body>

</html>