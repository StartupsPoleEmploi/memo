<%@ page contentType="text/html;charset=UTF-8" language="java"%>



<!DOCTYPE html>
<html>
<head>

	<link rel="stylesheet" href="../../css/header.css" type="text/css">
	<link rel="stylesheet" href="../../css/home.css" type="text/css">
	<link rel="stylesheet" href="../../assets/global/plugins/bootstrap/css/bootstrap.min.css" type="text/css" />
	<link rel="stylesheet" href="../../assets/global/css/components.min.css" type="text/css" />
	
	<script src="../../js/jquery-2.1.3.min.js" type="text/javascript"></script>
	<script src="../../js/utils.js" type="text/javascript"></script>
	
	<style>
		body {
			background: #D4D4D4;
			font-family: Verdana, Arial;
		}
		
		h1, h2 {
			font-family: Verdana, Arial;
		}
	
	.content {
		max-width: 1000px;
		margin: auto;
		background: white;
		padding: 10px;
	}
	.formButtons .btn,
	.modal .btn
	{
	    border-radius: 5px !important;
	    height: 40px;
	    padding: 9px;
	}
	
	</style>
	
	<meta charset="UTF-8">
	<title>MEMO - Conseils pour votre recherche d'emploi</title>
	<script type="text/javascript">
		document.title = "MEMO - Conseils pour votre recherche d'emploi";
	</script>
	
	<link rel="shortcut icon" href="../../pic/favicon.ico" />

</head>

<body>

	
	<div class="content">
	
			<div class="pull-left">
					<div class="logoSmall pull-left">
						<a href="/"><img src="../../pic/logo_memo.png" alt="Logo MEMO" /></a>
					</div>
			</div>
			<div class="pull-right headerButtons">
				<b>Organisez, suivez et relancez vos candidatures avec Memo</b>
                <a href="/" class="btn btn-md dark btn-outline btn-rounded">
                   Découvrir le service
                </a>
		     </div>
			<br><br><br><br>
				<div> 
				<h1  style='text-align: center; font-weight: 700; color: #090909;'>Notre sélection de conseils pour votre recherche d'emploi:</h1>	
				</div>
				<hr width="100%">
				<h2>Réussir vos candidatures spontanées</h2>
				<p>80% des recrutements se font hors offres d’emploi, la
					candidature spontanée est un excellent moyen d’accéder aux
					opportunités qui ne sont pas visibles sur le marché du travail.
					Découvrez comment optimiser vos candidatures spontanées.</p>
				<div align="center" class="formButtons" style="display: block;">
					<a  href="/conseils/reussir-vos-candidatures-spontanees" class="btn green" target="_blank">En savoir plus</a>
				</div>
				<hr width="100%">

				<h2>Mobiliser votre réseau relationnel</h2>
				<p>Le réseau est le meilleur levier pour accélérer votre
					retour à l’emploi. Nous avons sélectionné pour vous les conseils
					pour créer, développer et entretenir votre réseau relationnel.</p>
				<div align="center" class="formButtons" style="display: block;">
					<a href="/conseils/mobiliser-votre-reseau-relationnel" class="btn green" target="_blank">En savoir plus</a>
				</div>
				<hr width="100%">

				<h2>Répondre aux offres d’emploi</h2>
				<p>Retrouvez les conseils et outils pour répondre aux offres,
					créer vos CV et vos lettres de motivation.</p>
				<div align="center" class="formButtons" style="display: block;">
					<a href="/conseils/repondre-aux-offres-emploi" class="btn green" target="_blank">En savoir plus</a>
				</div>
				<hr width="100%">

				<h2>Relancer les recruteurs</h2>
				<p>La relance de vos candidatures peut être déterminante dans
					un processus de recrutement. C’est le moyen pour vous de
					réaffirmer votre motivation auprès du recruteur.</p>
				<div align="center" class="formButtons" style="display: block;">
					<a href="/conseils/relancer-les-recruteurs" class="btn green" target="_blank">En savoir plus</a>
				</div>
				<hr width="100%">

				<h2>Réussir vos entretiens d’embauche</h2>
				<p>La réussite d’un entretien d’embauche passe par une bonne
					préparation. Nous vous proposons de découvrir les conseils
					d’Yves Gautier (coach emploi).</p>
				<div align="center" class="formButtons" style="display: block;">
					<a href="/conseils/reussir-vos-entretiens-embauche" class="btn green" target="_blank">En savoir plus</a>
				</div>
				<br>
	</div>

</body>

<script>
	$("#conseilsPage").show();
	$("#closeButton").hide();
	$("#conseilsPage a[rel]").on("click", function(el) {
		var id = $(el.currentTarget).attr("rel");
		console.log("showConseils ", id);
		$goToConseils(id);
	})
</script>
</html>