<%@ page import="fr.gouv.motivaction.service.UserService" %>
<%@ taglib prefix="pack" uri="https://github.com/d8bitr/packtag" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<%
  long userId = UserService.checkAdminUserAuth(request);

  if(userId==0)
  {
    response.setStatus(response.SC_MOVED_TEMPORARILY);
    response.setHeader("Location","http://"+request.getServerName());
  }

  boolean isDemo = false;

  String cohorte = "0";

  if(request.getParameter("cohorte")!=null)
  {
    cohorte = request.getParameter("cohorte");
    try
    {
      Integer.parseInt(cohorte);
    }
    catch (Exception e){cohorte="0";}
  }

  if(request.getParameter("stats")!=null)
    isDemo = true;

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
  <title>BO MEMO</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="width=device-width, initial-scale=1" name="viewport" />
  <meta content="" name="description" />
  <meta content="" name="author" />
  <!-- BEGIN GLOBAL MANDATORY STYLES -->
  <link href="../assets/global/plugins/font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css" />
  <link href="../assets/global/plugins/simple-line-icons/simple-line-icons.min.css" rel="stylesheet" type="text/css" />
  <link href="../assets/global/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css" />
  <link href="../assets/global/plugins/uniform/css/uniform.default.min.css" rel="stylesheet" type="text/css" />
  <link href="../assets/global/plugins/bootstrap-switch/css/bootstrap-switch.min.css" rel="stylesheet" type="text/css" />
  <!-- END GLOBAL MANDATORY STYLES -->
  <!-- BEGIN PAGE LEVEL PLUGINS -->
  <link href="../assets/global/plugins/morris/morris.css" rel="stylesheet" type="text/css" />
  <link href="../assets/global/plugins/mapplic/mapplic/mapplic.css" rel="stylesheet" type="text/css" />
  <!-- END PAGE LEVEL PLUGINS -->
  <!-- BEGIN THEME GLOBAL STYLES -->
  <link href="../assets/global/css/components.min.css" rel="stylesheet" id="style_components" type="text/css" />
  <link href="../assets/global/css/plugins.min.css" rel="stylesheet" type="text/css" />
  <!-- END THEME GLOBAL STYLES -->
  <link rel="shortcut icon" href="../pic/favicon.ico" />

  <!-- STATS + CHARTIST -->
  <link rel="stylesheet" href="../assets/stats/chartist.min.css" type="text/css">
  <link rel="stylesheet" href="../assets/stats/chartist-tooltip.css" type="text/css">
  <link rel="stylesheet" href="../css/stats.css" type="text/css">

  <script src="../js/jquery-2.1.3.min.js"></script>

  <script src="../js/stats.js"></script>
  <script src="../assets/stats/chartist.min.js" type="text/javascript"></script>
  <script src="../assets/stats/chartist-plugin-barlabels.min.js" type="text/javascript"></script>
  <script src="../assets/stats/chartist-plugin-pointlabels.min.js" type="text/javascript"></script>
  <script src="../assets/stats/chartist-plugin-legend.js" type="text/javascript"></script>
  <script src="../assets/stats/chartist-plugin-tooltip.js" type="text/javascript"></script>

  <script>
    var isDemo = <%=isDemo%>;
    var cohorte = <%=cohorte%>;
  </script>

  <style>
    #userAndCandidatureState th,
    #userInterviews th
    {
      border-bottom: 1px solid black;
      padding-right: 15px;
    }

    #userAndCandidatureState td,
    #userInterviews td
    {
      border-bottom: 1px solid rgba(0,0,0,0.5);
      padding-right: 15px;
      padding-top : 5px;
      padding-bottom: 5px;
    }

    #userActivityArray td {
      padding: 1px 15px 1px 1px;
    }

    .boldRow > td {
      font-weight: bold;
    }

    .archivedRow > td {
      font-style: italic;
      font-color: #AAA;
    }

    .modal-dialog {
      width: 800px;
    }

    .stats .widget-thumb .widget-thumb-heading
    {
      font-size: 30px;
    }

    .stats .col-md-3
    {
      margin-left: 100px;
    }

    .stats .widget-thumb .widget-thumb-body .widget-thumb-subtitle
    {
      font-size: 24px;
    }

    .stats .widget-thumb .widget-thumb-body .widget-thumb-body-stat
    {
      font-size: 48px;
    }

  </style>

</head>
<!-- END HEAD -->

<body class="page-container-bg-solid">

<!-- BEGIN CONTAINER -->
<div class="page-container page-content-inner page-container-bg-solid">

  <!-- BEGIN CONTENT -->
  <div class="container-fluid container-lf-space">
    <!-- BEGIN PAGE BASE CONTENT -->
    <div class="row widget-row">

      <div class="col-md-2">
        <!-- BEGIN WIDGET THUMB -->
        <div class="widget-thumb widget-bg-color-white text-uppercase margin-bottom-20 ">
          <h4 class="widget-thumb-heading">Nombre d'utilisateurs</h4>
          <div class="widget-thumb-wrap">
            <i class="widget-thumb-icon bg-green icon-bulb"></i>
            <div class="widget-thumb-body">
              <span class="widget-thumb-body-stat" data-counter="counterup" id="userCount" data-value="0">0</span>
            </div>
          </div>
        </div>
        <!-- END WIDGET THUMB -->
      </div>
      <div class="col-md-2" id="nbFiches">
        <!-- BEGIN WIDGET THUMB -->
        <div class="widget-thumb widget-bg-color-white text-uppercase margin-bottom-20 ">
          <h4 class="widget-thumb-heading">Nombre de fiches candidatures</h4>
          <div class="widget-thumb-wrap">
            <i class="widget-thumb-icon bg-red icon-layers"></i>
            <div class="widget-thumb-body">
              <span class="widget-thumb-body-stat" data-counter="counterup" id="candidatureCount" data-value="0">0</span>
            </div>
          </div>
        </div>
        <!-- END WIDGET THUMB -->
      </div>
      <div class="col-md-2" id="nbFichesParUser">
        <!-- BEGIN WIDGET THUMB -->
        <div class="widget-thumb widget-bg-color-white text-uppercase margin-bottom-20 ">
          <h4 class="widget-thumb-heading">Candidatures par utilisateur</h4>
          <div class="widget-thumb-wrap">
            <i class="widget-thumb-icon bg-purple icon-screen-desktop"></i>
            <div class="widget-thumb-body">
              <span class="widget-thumb-body-stat" data-counter="counterup" id="candidaturePerUser" data-value="0">0</span>
            </div>
          </div>
        </div>
        <!-- END WIDGET THUMB -->
      </div>

      <div class="col-md-3" id="infoQuartz">
        <!-- BEGIN WIDGET THUMB -->
        <div class="widget-thumb widget-bg-color-white text-uppercase margin-bottom-20 ">
          <h4 class="widget-thumb-heading">Infos Quartz</h4>
          <div class="widget-thumb-wrap">
            <i class="widget-thumb-icon bg-purple icon-screen-desktop"></i>
            <div class="widget-thumb-body">
              <span id="quartz"></span>
              <span id="jobsMails"></span><a id='btStartJobsMails' style='padding-left:20px;font-size:12px;'>Start</a><a id='btStopJobsMails' style='padding-left:20px;font-size:12px;'>Stop</a><br/>
              <span style='font-size:12px;text-transform:lowercase'>(campagne de mails, et fusion de compte)</span>
              <span id="jobsAdmins"></span><a id='btStartJobsAdmins' style='padding-left:20px;font-size:12px;'>Start</a><a id='btStopJobsAdmins' style='padding-left:20px;font-size:12px;'>Stop</a><br/>
              <span style='font-size:12px;text-transform:lowercase'>(extract BO)</span><br/>
              <span id="jobsCleans">JOBS_CLEANS	: RUNNING</span>
              <span style='font-size:12px;text-transform:lowercase'>(nettoyage des extracts TDB/BO)</span>
              <span id="jobsCalculs"></span><a id='btStartJobsCalculs' style='padding-left:20px;font-size:12px;'>Start</a><a id='btStopJobsCalculs' style='padding-left:20px;font-size:12px;'>Stop</a><br/>
              <span style='font-size:12px;text-transform:lowercase'>(calculs de stats et d'export datalake)</span>
            </div>
          </div>
        </div>
        <!-- END WIDGET THUMB -->
      </div>


      <!--       <div class="col-md-3" id="nbUser14"> -->
      <!--         BEGIN WIDGET THUMB -->
      <!--         <div class="widget-thumb widget-bg-color-white text-uppercase margin-bottom-20 "> -->
      <!--           <h4 class="widget-thumb-heading">Nombre d'utilisateurs sur 14 jours</h4> -->
      <!-- 			   <a id='btGetCandAndUserCount' style='padding-left:50px;font-size:12px;'>Lancer la requête</a> -->
      <!--           <div class="widget-thumb-wrap"> -->
      <!--             <i class="widget-thumb-icon bg-blue icon-bar-chart"></i> -->
      <!--             <div class="widget-thumb-body"> -->
      <!--                 <span class="widget-thumb-subtitle">Utilisateurs</span> -->
      <!--                 <span class="widget-thumb-body-stat" id="weekUsers" data-counter="counterup" data-value="0">0</span> -->
      <!--                 <span class="widget-thumb-subtitle">Candidatures</span> -->
      <!--                 <span class="widget-thumb-body-stat" id="weekCandidatures" data-counter="counterup" data-value="0">0</span> -->
      <!--                 <span class="widget-thumb-subtitle">Utilisateurs avec au moins 2 cnx, au moins 1 candidature et s'étant connecté lors des 14 derniers jours</span> -->
      <!--             </div> -->
      <!--           </div> -->
      <!--         </div> -->
      <!--         END WIDGET THUMB -->
      <!--       </div> -->

      <!--       <div class="col-md-3"> -->
      <!--         BEGIN WIDGET THUMB -->
      <!--         <div class="widget-thumb widget-bg-color-white text-uppercase margin-bottom-20 "> -->
      <!--           <h4 class="widget-thumb-heading">Nombre d'utilisateurs sur 30 jours</h4> -->
      <!--           <div class="widget-thumb-wrap"> -->
      <!--             <i class="widget-thumb-icon bg-blue icon-bar-chart"></i> -->
      <!--             <div class="widget-thumb-body"> -->
      <!--               <span class="widget-thumb-subtitle">Utilisateurs</span> -->
      <!--               <span class="widget-thumb-body-stat" id="monthUsers" data-counter="counterup" data-value="0">0</span> -->
      <!--               <span class="widget-thumb-subtitle">Candidatures</span> -->
      <!--               <span class="widget-thumb-body-stat" id="monthCandidatures" data-counter="counterup" data-value="0">0</span> -->
      <!--               <span class="widget-thumb-subtitle" id="nbUser30Rule">Utilisateurs avec au moins 2 cnx, au moins 1 candidature et s'étant connecté lors des 30 derniers jours</span> -->
      <!--             </div> -->
      <!--           </div> -->
      <!--         </div> -->
      <!--         END WIDGET THUMB -->
      <!--       </div> -->

      <!--       <div class="col-md-2"> -->
      <!--         BEGIN WIDGET THUMB -->
      <!--         <div class="widget-thumb widget-bg-color-white text-uppercase margin-bottom-20 "> -->
      <!--           <h4 class="widget-thumb-heading">Choix de la cohorte</h4> -->
      <!--           <div class="widget-thumb-wrap"> -->
      <!--             <div class="widget-thumb-body"> -->
      <!--               <select id="cohortePicker"> -->
      <!--                 <option value="0">Tous les utilisateurs</option> -->
      <!--                 <option value="1">1 : Avant le 20/09/2016</option> -->
      <!--                 <option value="2">2 : Après le 20/09/2016</option> -->
      <!--                 <option value="3">3 : Après le 10/01/2017</option> -->
      <!--               </select> -->
      <!--             </div> -->
      <!--           </div> -->
      <!--         </div> -->
      <!--         END WIDGET THUMB -->
      <!--       </div> -->

    </div>

    <div class="row widget-row" id="userStateRow">
      <div class="col-md-12">
        <!-- BEGIN PORTLET-->
        <div class="portlet light tasks-widget">
          <div class="portlet-title">
            <div class="caption caption-md font-red-sunglo">
              <span class="caption-subject theme-font bold uppercase">Liste des utilisateurs s'appelant : </span>
              <!--               <a id='btGetUserActivities' style='padding-left:20px;font-size:12px;'>Lancer la requête</a> -->
              <input type="email" id="btSpecificUserEmail" style='margin-left:50px;font-size:12px;' placeholder="Email utilisateur" />
              <a id='btGetSpecificUserActivities' style='padding-left:20px;font-size:12px;'>Rechercher</a>
            </div>
          </div>

          <!--           <div class="portlet-body"> -->
          <!--             <div  id="userState" style="overflow: auto;" ></div> -->
          <!--           </div> -->

          <div class="portlet-body">
            <div  id="userAndCandidatureState" style="overflow: auto;" ></div>
          </div>
        </div>
        <!-- END PORTLET-->
      </div>
    </div>
    
     <div class="row widget-row">
				<div class="col-md-12">
					<!-- BEGIN PORTLET-->
					<div class="portlet light tasks-widget">
						<div class="portlet-title">
							<div class="caption caption-md font-red-sunglo">
								<span class="caption-subject theme-font bold uppercase">Test automatique :</span>
							</div>
						<div>
							<a id='btdeleteAllCandidatures' style='padding-left: 20px; font-size: 12px;'>Vider mon TBD</a><br>
								<br> <a id='btloadTDB' style='padding-left: 20px; font-size: 12px;'>Charger mon TDB</a> 
								<b id="spinnerLoadTDB" style='padding-left:left;font-size:12px;display:none;'>Chargement en cours<i class="fa fa-spinner fa-spin"></i></b>
								<span style="font-size: smaller; color: blue">(Nombre de candidatures :</span> 
								<span style="font-size: smaller; color: red" data-counter="counterup" id="candidatureCurrentUserCount">0</span>
								<span style="font-size: smaller; color: blue">)</span>
							</div>
						</div>
						<div class="portlet-body">
							<div id="" style="overflow: auto;"></div>
						</div>
					</div>
					<!-- END PORTLET-->
				</div>
			</div>
    
    
    <div class="row widget-row" style='padding-top:15px;'>
      <div class="col-md-12">
        <div class="portlet light tasks-widget">
          <div class="portlet-title">
            <div class="caption caption-md font-red-sunglo">
              <span class="caption-subject theme-font bold uppercase">Stats : </span>

            </div>
          </div>
        </div>

        <div class="portlet light tasks-widget">
          <div class="portlet-title">
            <div class="caption caption-md">
              <span class="caption-subject theme-font">Origines : </span>
              <a id='lienStats' style='padding-left:50px;font-size:12px;' onclick='javascript:backOffice.getOriginesStats();'>Calculer</a>
            </div>
          </div>
        </div>



        <div class="col-md-4" >
          <div id='blocUsersIncoming'>
            <div id="chartUsersIncoming" class="ct-chartUsersIncoming ct-perfect-fourth"></div>
            <p id="spinnerChartUsersIncoming" style='text-align:center; padding-top:30px; padding-bottom:30px; display:none;' >Chargement en cours<i class="fa fa-spinner fa-spin"></i></p>
            <div class="portlet mt-element-ribbon light portlet-fit bg-grey-steel bordered" style='margin-left:10px;'>
              <div class="ribbon ribbon-vertical-right ribbon-shadow ribbon-color-success uppercase">
                <div class="ribbon-sub ribbon-bookmark"></div>
                <i class="fa fa-star"></i>
              </div>
              <div class="portlet-title">
                <div class="caption">
                  <i class=" icon-bar-chart font-green"></i>
                  <span class="caption-subject font-green bold uppercase">Provenance utilisateurs</span>
                </div>
              </div>
              <div class="portlet-body"> Création de comptes provenant de PE.FR ou de LBB </div>
            </div>
          </div>
        </div>

        <div class="col-md-4" >
          <div id='blocCandidaturesButtonIncoming'>
            <div id="chartCandidaturesButtonIncoming" class="ct-chartCandidaturesButtonIncoming ct-perfect-fourth"></div>
            <p id="spinnerChartCandidaturesButtonIncoming" style='text-align:center; padding-top:30px; padding-bottom:30px; display:none;' >Chargement en cours<i class="fa fa-spinner fa-spin"></i></p>
            <div class="portlet mt-element-ribbon light portlet-fit bg-grey-steel bordered" style='margin-left:10px;'>
              <div class="ribbon ribbon-vertical-right ribbon-shadow ribbon-color-success uppercase">
                <div class="ribbon-sub ribbon-bookmark"></div>
                <i class="fa fa-star"></i>
              </div>
              <div class="portlet-title">
                <div class="caption">
                  <i class=" icon-bar-chart font-green"></i>
                  <span class="caption-subject font-green bold uppercase">Import PE.FR/LBB via bouton MEMO</span>
                </div>
              </div>
              <div class="portlet-body"> Candidatures importées depuis le bouton MEMO sur PE.FR ou LBB</div>
            </div>
          </div>
        </div>

        <div class="col-md-4" >
          <div id='blocCandidaturesIncoming'>
            <div id="chartCandidaturesIncoming" class="ct-chartCandidaturesIncoming ct-perfect-fourth"></div>
            <p id="spinnerChartCandidaturesIncoming" style='text-align:center; padding-top:30px; padding-bottom:30px; display:none;' >Chargement en cours<i class="fa fa-spinner fa-spin"></i></p>
            <div class="portlet mt-element-ribbon light portlet-fit bg-grey-steel bordered" style='margin-left:10px;'>
              <div class="ribbon ribbon-vertical-right ribbon-shadow ribbon-color-success uppercase">
                <div class="ribbon-sub ribbon-bookmark"></div>
                <i class="fa fa-star"></i>
              </div>
              <div class="portlet-title">
                <div class="caption">
                  <i class=" icon-bar-chart font-green"></i>
                  <span class="caption-subject font-green bold uppercase">Origine des candidatures</span>
                </div>
              </div>
              <div class="portlet-body"> Candidatures de PE.FR ou de LBB </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row widget-row" style='padding-top:15px;'>
      <div class="col-md-12">

        <div class="portlet light tasks-widget">
          <div class="portlet-title">
            <div class="caption caption-md">
              <span class="caption-subject theme-font">Types de candidatures : </span>
              <a id='lienStats' style='padding-left:50px;font-size:12px;' onclick='javascript:backOffice.getTypesCandidaturesStats();'>Calculer</a>
            </div>
          </div>
        </div>

        <div class="col-md-6" >
          <div id='blocTypeCandidature'>
            <div id="chartTypeCandidature" class="ct-chartTypeCandidature ct-perfect-fourth"></div>
            <p id="spinnerChartTypeCandidature" style='text-align:center; padding-top:30px; padding-bottom:30px; display:none;' >Chargement en cours<i class="fa fa-spinner fa-spin"></i></p>
            <div class="portlet mt-element-ribbon light portlet-fit bg-grey-steel bordered" style='margin-left:10px;'>
              <div class="ribbon ribbon-vertical-right ribbon-shadow ribbon-color-success uppercase">
                <div class="ribbon-sub ribbon-bookmark"></div>
                <i class="fa fa-star"></i>
              </div>
              <div class="portlet-title">
                <div class="caption">
                  <i class=" icon-bar-chart font-green"></i>
                  <span class="caption-subject font-green bold uppercase">Type de candidature</span>
                </div>
              </div>
              <div class="portlet-body"> Candidatures par type</div>
            </div>
          </div>
        </div>

        <div class="col-md-6" >
          <div id='blocCandidatureReseau'>
            <div id="chartCandidatureReseau" class="ct-chartCandidatureReseau ct-perfect-fourth"></div>
            <p id="spinnerChartCandidatureReseau" style='text-align:center; padding-top:30px; padding-bottom:30px; display:none;' >Chargement en cours<i class="fa fa-spinner fa-spin"></i></p>
            <div class="portlet mt-element-ribbon light portlet-fit bg-grey-steel bordered" style='margin-left:10px;'>
              <div class="ribbon ribbon-vertical-right ribbon-shadow ribbon-color-success uppercase">
                <div class="ribbon-sub ribbon-bookmark"></div>
                <i class="fa fa-star"></i>
              </div>
              <div class="portlet-title">
                <div class="caption">
                  <i class=" icon-bar-chart font-green"></i>
                  <span class="caption-subject font-green bold uppercase">Proportion de candidatures réseau</span>
                </div>
              </div>
              <div class="portlet-body"> Pourcentage de candidatures réseau par rapport à l'ensemble des candidatures</div>
            </div>
          </div>
        </div>

        <div class="col-md-6" >
          <div id='blocNbCandidatureReseau'>
            <div id="chartNbCandidatureReseau" class="ct-chartCandidatureReseau ct-perfect-fourth"></div>
            <p id="spinnerChartNbCandidatureReseau" style='text-align:center; padding-top:30px; padding-bottom:30px; display:none;' >Chargement en cours<i class="fa fa-spinner fa-spin"></i></p>
            <div class="portlet mt-element-ribbon light portlet-fit bg-grey-steel bordered" style='margin-left:10px;'>
              <div class="ribbon ribbon-vertical-right ribbon-shadow ribbon-color-success uppercase">
                <div class="ribbon-sub ribbon-bookmark"></div>
                <i class="fa fa-star"></i>
              </div>
              <div class="portlet-title">
                <div class="caption">
                  <i class=" icon-bar-chart font-green"></i>
                  <span class="caption-subject font-green bold uppercase">Nombre de cartes réseau par utilisateurs</span>
                </div>
              </div>
              <div class="portlet-body">Nombre d'utilisateurs assidus du mois en légende ayant des cartes réseau. Survolez chaque couleur des histogrammes pour connaître le nombre de cartes réseau créées par les utilisateurs.</div>
            </div>
          </div>
        </div>

        <div class="col-md-4" >

        </div>
      </div>
    </div>

    <div class="row widget-row" style='padding-top:15px;'>
      <div class="col-md-12">
        <div class="portlet light tasks-widget">
          <div class="portlet-title">
            <div class="caption caption-md font-red-sunglo">
              <span class="caption-subject theme-font bold uppercase">Extract CSV (tous) : </span>
              <a id='lienExtractUserActivities' style='padding-left:50px;font-size:12px;' onclick='javascript:backOffice.getExtractUserActivities();'>Télécharger</a>
              <b id="spinnerExtract" style='padding-left:50px;font-size:12px;display:none;'>Extract en cours<i class="fa fa-spinner fa-spin"></i></b>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- END PAGE BASE CONTENT -->
  </div>
  <!-- END CONTENT -->
</div>
<!-- END CONTAINER -->

<%@ include file="./modals/mdUserActivities.jsp"%>


<%@ include file="./js-admin.jsp"%>

</body>

</html>