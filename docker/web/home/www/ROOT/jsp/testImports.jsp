<!DOCTYPE html>
<%@page import="fr.gouv.motivaction.Constantes.JobBoardUrl"%>
<%@page import="fr.gouv.motivaction.dao.CandidatureDAO"%>
<%@page import="fr.gouv.motivaction.model.Candidature"%>
<html lang="fr">

<head>
	<meta charset="utf-8" />
	<title>MEMO TestAuto</title>

  	<link rel="shortcut icon" type="image/png" href="../assets/tests/jasmine/jasmine_favicon.png">
	<link rel="stylesheet" type="text/css" href="../assets/tests/jasmine/jasmine.css">

 	
	
	<script type="text/javascript" src="../js/jquery-2.1.3.min.js"></script>	
	
	<script type="text/javascript" src="../assets/tests/jasmine/jasmine.js"></script>
	<script type="text/javascript" src="../assets/tests/jasmine/jasmine-html.js"></script>
<!-- 	<script type="text/javascript" src="../assets/tests/jasmine/boot.js"></script> -->
	
	<!-- The JUnit reporter should go before the boot script -->
	<script src="../assets/tests/jasmine/jasmine2-junit.js"></script>
	<!-- This boot.js is a modified version of Jasmine's default boot.js! -->
	<script src="../assets/tests/jasmine/boot.js"></script>
	
	<script src="https://cdn.ravenjs.com/3.25.2/raven.min.js" crossorigin="anonymous"></script>
	<script type="text/javascript">
	    Raven.config('https://98e791113a174c58a1f14d033e882b9e@sentry.io/1208400').install();
	</script>

	<script type="text/javascript" src="../assets/global/plugins/bootstrap-toastr/toastr.min.js"></script>
    <script type="text/javascript" src="../js/utils.js"></script>
    <script type="text/javascript" src="../js/textField.js"></script>
    <script type="text/javascript" src="../js/classes/leBonRythme.js"></script>
    
	<script>
		var memoVars = {};
		memoVars.isVisitor = 1;
		memoVars.cId = 0;
		memoVars.uLI = 0;
		
		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
		
		ga('create', 'UA-77025427-1', 'auto');
		//memoVars.user.login = "test";
	</script>

    <script type="text/javascript" src="../js/linkifyjs/linkify.min.js"></script>
    <script type="text/javascript" src="../js/linkifyjs/linkify-jquery.min.js"></script>
    <script type="text/javascript" src="../js/pixabay/jquery.auto-complete.min.js"></script>

    <script type="text/javascript" src="../assets/global/plugins/jquery-validation/js/jquery.validate.min.js"></script>
    
    <script type="text/javascript" src="../js/tooltipster/tooltipster.bundle.min.js"></script>

    <script type="text/javascript" src="../assets/pages/scripts/login.min.js"></script>
    <script type="text/javascript" src="../js/Sortable.min.js"></script>
    <script type="text/javascript" src="../js/clipboard/clipboard.js"></script>
    <script type="text/javascript" src="../js/moment/momentwithlocale.js"></script>
    <script type="text/javascript" src="../js/eonasdandatepicker/eonasdandatepicker.js"></script>
    <script type="text/javascript" src="../js/utf8UrlEncoder.js"></script>
    <script type="text/javascript" src="../js/constantes.js"></script>

    <script type="text/javascript" src="../js/utf8UrlEncoder.js"></script>

    <script type="text/javascript" src="../js/classes/attachment.js"></script>
    <script type="text/javascript" src="../js/board/nextevents.js"></script>
   
    <script type="text/javascript" src="../js/board/timeline.js"></script>
    
    <script type="text/javascript" src="../js/parametres.js"></script>
    <script type="text/javascript" src="../js/board/files.js"></script>


    <script type="text/javascript" src="../js/board/parser.js"></script>

	<script type="text/javascript" src="../js/board/parsers/apec.js"></script>
	<script type="text/javascript" src="../js/board/parsers/cadremploi.js"></script>
	<script type="text/javascript" src="../js/board/parsers/envirojob.js"></script>
	<script type="text/javascript" src="../js/board/parsers/indeed.js"></script>
	<script type="text/javascript" src="../js/board/parsers/jobalim.js"></script>
	<script type="text/javascript" src="../js/board/parsers/keljob.js"></script>
	<script type="text/javascript" src="../js/board/parsers/labonneboite.js"></script>
	<script type="text/javascript" src="../js/board/parsers/leboncoin.js"></script>
	<script type="text/javascript" src="../js/board/parsers/linkedin.js"></script>
	<script type="text/javascript" src="../js/board/parsers/meteojob.js"></script>
	<script type="text/javascript" src="../js/board/parsers/monster.js"></script>
	<script type="text/javascript" src="../js/board/parsers/poleemploi.js"></script>
	<script type="text/javascript" src="../js/board/parsers/regionsjob.js"></script>
	<script type="text/javascript" src="../js/board/parsers/stepstone.js"></script>
	<script type="text/javascript" src="../js/board/parsers/vivastreet.js"></script>
	<script type="text/javascript" src="../js/board/parsers/generic.js"></script>

    <script type="text/javascript" src="../js/board/board.js"></script>
	<script type="text/javascript" src="../js/board/form.js"></script>
    
    <script type="text/javascript" src="../js/classes/candidature.js"></script>
    <script type="text/javascript" src="../js/classes/candidatureEvent.js"></script>

</head>
<!-- END HEAD -->
<body>	
	<input type="hidden" id="csrf" value="" />
	<input type="hidden" id="loginEmail" value="" />
	<input type="hidden" id="loginPassword" value="" />
	<input type="hidden" id="loginMsg" value="" />
	
	
	<!-- Global -->
	<script type="text/javascript" src="../js/test/initTest.js"></script>
	<script type="text/javascript" src="../js/test/serviceTest.js"></script>
 
 <%
	Candidature cand;
	cand = CandidatureDAO.loadLastUpdateByJobBoard(JobBoardUrl.MONSTER);
%>

	<!-- Tests d'import -->
<script>
	describe("Offre Apec", function() {
		var candId, res = false, url;
		
		// Affichage des msg dans la console
		toastr['error'] = console.log;
		toastr['warning'] = console.log;
		toastr['success'] = console.log;
	
		it("test ImportOffre [nomSociete, ville, nomContact, logoUrl]", function() {	
			url = '<%=cand.getUrlSource()%>';
			c = testImportCandidature(url);
			
			if (c && url) {
				// Mock de l'objet Board
				spyOn(Board.prototype, "init");
				spyOn(Board.prototype, "buildCandidatures");
				spyOn(Board.prototype, "buildCandidature");
				spyOn(Board.prototype, "setCandidature");			
				spyOn(Board.prototype, "setCandidatureId");
				spyOn(Board.prototype, "displayStartButton");
				// Mock de l'objet Parser
		    	spyOn(Parser.prototype, "logUrlToGA");
		    	// Mock de l'objet CandidatureForm
		    	spyOn(CandidatureForm.prototype, "init");
		    	spyOn(CandidatureForm.prototype, "resetErrorMessage");
		    	
		    	var b = new Board();
				var p = new Parser();
				var f = new CandidatureForm(b);
				
		    	b.parser = p;	    	
				f.board = b;
				b.selectedCandidature = c;
				
				// Chargement des données dans le mock
				f.initTest(c, url);
				
				// Chargement des données dans le DOM
				lBR.board = b;
				lBR.board.form = f;
				
				// Sauvegarde de la candidature en synchrone
				candId = f.saveCandidature(-1, false);
				//expect(candId).toBeDefined('idCandidature null');
		        //expect(candId).toBeDefined('idCandidature null');
		    	
		        if (candId) {
		        	c.id = candId
		        	res = true;
		        }
			}
		});
	});
</script>
	
</body>

</html>