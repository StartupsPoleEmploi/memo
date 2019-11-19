<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<!-- BEGIN HEADER -->
<header class="page-header navbar-fixed-top">
    <nav class="navbar">
        <div class="container-fluid">
            <div class="havbar-header">
                <!-- BEGIN LOGO -->
                <div class="logoSmall" id="logoSmall"></div>
                <div class="logoPE hidden-xs"><a href="http://www.pole-emploi.fr" target="_blank"><img src="./pic/logos/pe.png" alt="logo pole emploi" /></a></div>

                <div class="hidden-xs headerFiller">&nbsp;</div> 

                <div id="quickImportDiv">
                    <input type="text" placeholder="Coller ici le lien Internet de l'offre" id="quickImport" class="form-control" />
                    <button class="btn green" id="buttonQuickImport" type="button"><i class="fa fa-spinner fa-spin" style="display:none;"></i> Importer</button>
                </div>

                <!-- END LOGO -->

                <!-- BEGIN TOPBAR ACTIONS -->
                <div class="topbar-actions">
                	 <button id='buttonRetourConseiller' type="button" style="border-radius:5px !important; height:40px; margin-right:10px;" class="btn btn-outline dark">Retour Espace Conseiller </button>
                	 
                    <!-- BEGIN USER PROFILE -->
                    <!--<a id="logoutButton"><i class="icon-key"></i> Se déconnecter </a>-->
					<span id="badgePrioritesB" class="badge badgePriorites"></span>
                    <div class="btn-group-img btn-group menuMargin">
						
                        <a class="btn btn-sm dropdown-toggle" data-toggle="dropdown" data-hover="dropdown" data-close-others="true"><i class="fa fa-navicon fa-2x animateMenu"></i><div>Menu</div></a>
                        
                        <ul class="dropdown-menu-v2" role="menu">

                            <li class="userLogin">
                                <span id="userLogin"></span>
                            </li>
							<li>
                                <a id="prioritesButton">
  									<span id="badgePriorites" class="badge badgePriorites"></span>
  									<i id="iconeMenuPriorites" class="fa fa-calendar-check-o" aria-hidden='true'></i>
  									Vos Priorités
  								</a>
                            </li>

                            <li class="hidden-xs">
                                <a id="calendarButton"><i class="fa fa-calendar"></i>  Calendrier</a>
                            </li>

                            <li>
                                <a id="conseilButton"><i class="fa fa-book"></i>  Mes conseils </a>
                            </li>
                            <li>
                                <a id="ficheButton"><i class="fa fa-plus"></i>  Ajouter une candidature</a>
                            </li>
                            <li>
                                <a id="shareBoardButton" style="display:block !important;"><i class="fa fa-share"></i> Partager son tableau de bord</a>
                            </li>
                            
                            <li>
                                <a id="logoutButton" ><i class="glyphicon glyphicon-log-out"></i> Se déconnecter</a>
                            </li>

                            <li class='disabled menuBorderTop'>
                                <a id="activeButton" class="menuDisabled"><i class="fa fa-table"></i>  Tableau de bord</a>
                            </li>
                            <li>
                                <a id="archiveButton" ><i class="fa fa-trash"></i> Candidatures terminées</a>
                            </li>
                            <li>
                                <a id="activitesButton" ><i class="fa fa-list-alt"></i> Journal de vos activités</a>
                            </li>
                            <li>
                                <a id="videoButton" ><i class="fa fa-youtube-play"></i> Comment ça marche</a>
                            </li>
							<li>
								<a id="parametresButton"><i class="fa fa-wrench"></i> Paramètres</a>
                            </li>
                            <li>
                                <a id="faqButton"><i class="fa fa-question"></i> Foire aux questions</a>
                            </li>
                            <li>
                                <a id="boButton" style="display:<%=isAdmin?"block":"none"%>" ><i class="fa fa-dashboard"></i> Back Office</a>
                            </li>

                        </ul>
                    </div>



                    <!-- END USER PROFILE -->
                </div>
                <!-- END TOPBAR ACTIONS -->

                <div class="boutonCandidatureXS boutonCandidature" etat="0">
                    <a class="btn btn-md btnHeaderText tooltipster" title="Ajouter une nouvelle candidature">
                        <i class="fa fa-plus"></i>
                        <div>Ajouter</div>
                    </a>
                </div>

            </div>
        </div>
        <!--/container-->

        <div id="breadcrumb">
            <div id="breadcrumbContent">
                <a id="activeButtonInBar"><i class="fa fa-table"></i> Tableau de bord</a> <span id="breadcrumbLinks"></span>

                <div id="searchInput">
                    <div class="visible-md visible-lg visible-sm">

                        <div class="searchInputDeco">
                            <input type="text" class="memoSearchInput form-control" placeholder="Rechercher dans mes candidatures" />

                            <i id="searchSpinner" style="display:none;" class="fa fa-spinner fa-spin"></i>

                            <a class="doRemoveSearch" class="tooltipster" title="Annuler la recherche en cours" style="display: none;">
                                <i class="fa fa-remove"></i>
                            </a>

                            <a id="doSearch" class="tooltipster" title="Lancer la recherche">
                                <i class="fa fa-search"></i>
                            </a>
                        </div>

                        <a class="openFilter tooltipster" title="Filtrer l'affichage des candidatures">Filtrer</a>
                    </div>

                    <div class="visible-xs">
                        <a class="openFilter tooltipster" title="Rechercher">
                            <i class="fa fa-search"></i>
                        </a>

                        <a class="doRemoveSearch tooltipster" title="Annuler la recherche en cours" style="display: none;">
                            <i class="fa fa-remove"></i>
                        </a>
                    </div>

                </div>
                <div class="hidden-xs" id="hideFilter">
                    <a class="hideFilterForm">
                        Masquer les filtres
                    </a>
                </div>

                <div id="filterForm" class="row">
                    <div class="visible-xs col-xs-12">
                        <a class="hideFilterForm">
                            Masquer les filtres
                        </a>
                    </div>

                    <div class="visible-sm visible-xs col-xs-12 col-sm-6">
                        <label for="selectFiltreEtat">Filtrer par Etat</label>
                        <br />
                        <select id="selectFiltreEtat">
                            <option value="">Tous les états de candidature</option>
                            <option value="0">Je vais postuler</option>
                            <option value="1">J'ai postulé</option>
                            <option value="2">J'ai relancé</option>
                            <option value="3">Entretien</option>
                        </select>
                    </div>
                    <div class="col-md-3 col-xs-12 col-sm-6">
                        <label for="selectFiltreType">Filtrer par type</label>
                        <br />
                        <select id="selectFiltreType">
                            <option value="">Tous les types de candidature</option>
                            <option value="2">Offres</option>
                            <option value="1">Candidatures spontanées</option>
                            <option value="3">Opportunités réseau</option>
                            <option value="4">Autres</option>
                        </select>
                    </div>
                    <div class="col-md-3 col-xs-12 col-sm-6">
                        <label for="selectFiltreSource">Filtrer par source</label>
                        <br />
                        <select id="selectFiltreSource">
                            <option value="">Toutes les sources d'offre</option>
                        </select>
                    </div>
                    <div class="col-md-1 col-xs-12 col-sm-6">
                        <label for="cbFiltreFavoris">Favoris</label>
                        <br />
                        <input id="cbFiltreFavoris" type="checkbox" />
                    </div>

                    <div class="col-md-5 col-xs-12 col-sm-6">

                        <div class="searchInputDeco">
                            <input type="text" class="memoSearchInput form-control" placeholder="Rechercher dans mes candidatures" />
                            <i class="fa fa-search"></i>
                        </div>

                        <div><btn class="btn green" id="doSearchFilter">Lancer la recherche</btn></div>
                    </div>

                </div>

            </div>
        </div>

    </nav>
</header>