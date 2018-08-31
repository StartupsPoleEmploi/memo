<%@ page import="fr.gouv.motivaction.service.UserService" %>
<%@ taglib prefix="pack" uri="https://github.com/d8bitr/packtag" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<!DOCTYPE html>
<!--[if IE 8]> <html lang="en" class="ie8 no-js"> <![endif]-->
<!--[if IE 9]> <html lang="en" class="ie9 no-js"> <![endif]-->
<!--[if !IE]><!-->
<html lang="fr">
<!--<![endif]-->
<!-- BEGIN HEAD -->

<head>
	<meta charset="utf-8" />
	<title>STATS MEMO</title>
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta content="width=device-width, initial-scale=1" name="viewport" />
	<meta content="" name="description" />
	<meta content="" name="author" />
	<meta name="robots" content="noindex, follow">

  	<link rel="stylesheet" href="../assets/global/plugins/bootstrap/css/bootstrap.min.css" type="text/css" />
  	<link href="../assets/global/plugins/font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css" />
  	<link href="../assets/global/plugins/simple-line-icons/simple-line-icons.min.css" rel="stylesheet" type="text/css" />
  	<link rel="stylesheet" href="../assets/global/css/components.min.css" type="text/css" />
	<link rel="stylesheet" href="../assets/stats/chartist.min.css" type="text/css">
	<link rel="stylesheet" href="../assets/stats/stats.css" type="text/css">
	<link rel="stylesheet" href="../css/stats.css" type="text/css">
	<link rel="shortcut icon" href="../pic/favicon.ico" />

	<script src="../js/jquery-2.1.3.min.js" type="text/javascript"></script>
	<script src="../js/moment/momentwithlocale.js" type="text/javascript"></script>
	<script src="../js/stats.js" type="text/javascript"></script>
	<script src="../assets/stats/chartist.min.js" type="text/javascript"></script>
	<script src="../assets/stats/chartist-plugin-barlabels.min.js" type="text/javascript"></script>
	<script src="../assets/stats/chartist-plugin-pointlabels.min.js" type="text/javascript"></script>
	<script src="../assets/stats/chartist-plugin-threshold.min.js" type="text/javascript"></script>
	<script src="../assets/stats/chartist-plugin-legend.js" type="text/javascript"></script>
	
</head>
<!-- END HEAD -->

<body class="page-container-bg-solid">
	<div class="page-container page-content-inner page-container-bg-solid">
		<div class="container-fluid container-lf-space">
			<div class="row widget-row" style='padding-top:15px;'>
				<div class="col-md-2" >
  					<div class="logoSmall" id="logoSmall" style='margin-top:5px;margin-left:20px;'><img src="../pic/logo_memo.png" alt="Logo Memo" style='height: 50px;'></div>
				</div>
  				<div class="col-md-8" >
					<h1 style='text-align:center; font-weight:700; color:#8e9daa; font-family:"Open Sans",sans-serif;'> Les principales métriques de MEMO</h1>
				</div>
				<div class="col-md-2" >
  					<div class="logoPE hidden-xs" style='margin-top:5px;margin-left:20px;'><a href="http://www.pole-emploi.fr" target="_blank"><img src="../pic/logos/pe.png" alt="logo pole emploi"></a></div>
				</div>
			</div>

			<div id='container'>
				<div id='page'>
					<div class="row widget-row" style='padding-top:30px;'>
						<div class="col-md-6" >
							<div class="ct-chartNPS ct-perfect-fourth"></div>
							
							<div class="portlet mt-element-ribbon light portlet-fit bg-grey-steel bordered" style='margin-left:10px;'>
				                  <div class="ribbon ribbon-vertical-right ribbon-shadow ribbon-color-success uppercase">
				                      <div class="ribbon-sub ribbon-bookmark"></div>
				                      <i class="fa fa-star"></i>
				                  </div>
				                  <div class="portlet-title">
				                      <div class="caption">
				                          <i class=" icon-bar-chart font-green"></i>
				                          <span class="caption-subject font-green bold uppercase">Satisfaction</span>
				                      </div>
				                  </div>
				                  <div class="portlet-body"> Indice de satisfaction (net promoter score). 
				                  	Les valeurs du NPS sont comprises entre -100 et +100.
				                  </div>
							</div>      
						</div>
						
						<div class="col-md-6" >
							<div id="chartUsersAssidus" class="ct-chartUsersAssidus ct-perfect-fourth"></div>
							<p id="spinnerChartUsersAssidus" style='text-align:center; padding-top:30px; padding-bottom:30px; display:none;' >Chargement en cours<i class="fa fa-spinner fa-spin"></i></p>
							<div class="portlet mt-element-ribbon light portlet-fit bg-grey-steel bordered" style='margin-left:10px;'>
								<div class="ribbon ribbon-vertical-right ribbon-shadow ribbon-color-success uppercase">
									<div class="ribbon-sub ribbon-bookmark"></div>
									<i class="fa fa-star"></i>
									</div>
										<div class="portlet-title">
				    						<div class="caption">
				        						<i class=" icon-bar-chart font-green"></i>
				        						<span class="caption-subject font-green bold uppercase">Utilisateurs assidus</span>
				    						</div>
										</div>
								<div class="portlet-body"> Nombre d'utilisateurs qui ont eu dans MEMO au moins 4 connexions et 8 actions dans le mois (hors agents PE). </div>
							</div>
						</div>
									
					</div>
					
					<div class="row widget-row" style='padding-top:15px;'>
					
						<div class="col-md-6" >
							<div id="chartUsersEntretien" class="ct-chartUsersEntretien ct-perfect-fourth"></div>
							<p id="spinnerChartUsersEntretien" style='text-align:center; padding-top:30px; padding-bottom:30px; display:none;' >Chargement en cours<i class="fa fa-spinner fa-spin"></i></p>
							<div class="portlet mt-element-ribbon light portlet-fit bg-grey-steel bordered" style='margin-left:10px;'>
								<div class="ribbon ribbon-vertical-right ribbon-shadow ribbon-color-success uppercase">
									<div class="ribbon-sub ribbon-bookmark"></div>
									<i class="fa fa-star"></i>
									</div>
										<div class="portlet-title">
				    						<div class="caption">
				        						<i class=" icon-bar-chart font-green"></i>
				        						<span class="caption-subject font-green bold uppercase">Utilisateurs ayant eu un entretien</span>
				    						</div>
										</div>
								<div class="portlet-body"> Nombre d'utilisateurs ayant décroché un entretien dans le mois (parmi les utilisateurs assidus, déclarés sur MEMO et hors agents PE).</div>
							</div>
						</div>
						
						<div class="col-md-6" >
							<div id="chartUsersRetourEmploi" class="ct-chartUsersRetourEmploi ct-perfect-fourth"></div>
							<p id="spinnerChartUsersRetourEmploi" style='text-align:center; padding-top:30px; padding-bottom:30px; display:none;' >Chargement en cours<i class="fa fa-spinner fa-spin"></i></p>
							<div class="portlet mt-element-ribbon light portlet-fit bg-grey-steel bordered" style='margin-left:10px;'>
								<div class="ribbon ribbon-vertical-right ribbon-shadow ribbon-color-success uppercase">
									<div class="ribbon-sub ribbon-bookmark"></div>
									<i class="fa fa-star"></i>
									</div>
										<div class="portlet-title">
				    						<div class="caption">
				        						<i class=" icon-bar-chart font-green"></i>
				        						<span class="caption-subject font-green bold uppercase">Retour à l'emploi</span>
				    						</div>
										</div>
								<div class="portlet-body"> Nombre d'utilisateurs ayant décroché un emploi dans le mois (parmi les utilisateurs assidus, déclarés sur MEMO et hors agents PE). </div>
							</div>
						</div>
					</div>
					
				</div>
			 </div> 
			
		</div>	
	</div>	
	
	<script>
		var stats = new Stats();
		stats.initGraph();
	</script>
</body>

</html>