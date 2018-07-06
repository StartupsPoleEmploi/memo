<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<div id="createCandidatureForm" style="display:none;" class="marginTop60">

	<div id="candidatureSpinner" class="text-center"><b>Nous sauvegardons toutes les informations de l'offre !</b><br /><br />Vous les garderez sous la main, même lorsque l'offre ne sera plus en ligne.<i class="fa fa-spinner fa-spin"></i></div>
	
	<%@ include file="./form/step0NewUser.jsp"%>

    <%@ include file="./form/step1.jsp"%>

    <%@ include file="./form/step2WithOffre.jsp"%>

    <%@ include file="./form/stepJob.jsp"%>

    <%@ include file="./form/stepContact.jsp"%>

    <%@ include file="./form/stepProgress.jsp"%>

    <%@ include file="./form/stepEntretien.jsp"%>

    <%@ include file="./form/video.jsp"%>

    <div id="candidatureForm" style="display:none;">

        <div id="uploadFileOnFormInfo" style="display:none;">

            Glissez le fichier sur la fiche candidature pour l'ajouter dans MEMO

        </div>

        <div id="formActions" class="formActions">

            <div id="formActionSave" class="boutonSave tooltipster" title="Enregistrer les modifications">
                <i class="fa fa-save"></i>
                <div>Sauver</div>
            </div>

            <div id="formActionEdit" class="boutonEdit tooltipster" title="Modifier la candidature" boomtarget="nomCandidatureF">
                <i class="fa fa-edit"></i>
                <div>Modifier</div>
            </div>

            <div id="formActionManageAttachment" class="boutonEvt tooltipster" title="Gérer les pièces jointes">
                <i class="fa fa-paperclip"></i>
                <!--<i class="fa fa-clock-o"></i>-->
                <div>Fichiers</div>
            </div>

            <div id="formActionNewEvent" class="boutonEvt tooltipster" title="Ajouter un événement">
                <i class="fa fa-calendar-plus-o"></i>
                <!--<i class="fa fa-clock-o"></i>-->
                <div>Ajouter</div>
            </div>

            <div id="formActionAccepted" class="boutonArchiver tooltipster" title="J'ai eu le poste">
                <!--<i class="fa fa-trophy"></i>-->
                <i class="fa fa-handshake-o"></i>
                <div>Gagné</div>
            </div>

            <div id="formActionRefused" class="boutonArchiver tooltipster" title="Je n'ai pas eu le poste">
                <!--<i class="fa fa-thumbs-o-down"></i>-->
                <i class="fa fa-frown-o"></i>
                <div>Refus</div>
            </div>

            <div id="formActionArchive" class="boutonArchiver tooltipster" title="Supprimer de mon tableau de bord">
                <i class="fa fa-trash"></i>
                <div>Suppr.</div>
            </div>
        </div>

        <div class="pageTitle">
        	<h1 id="candidatureTitle">&nbsp;</h1>
        </div>

		<div id='candidatureFormProgress' class="mt-element-step" style="width: 60%;margin: auto; margin-bottom: 15px;">
			<div class="row step-default">
		      <div class="col-md-4 bg-grey mt-step-col active" style="padding-top:7px; padding-bottom:7px;border-right: 1px solid #eef1f5;">
		          <div class="mt-step-number bg-white font-grey" style="margin: auto auto 0px;font-size:10px;padding: 3px 8px;">1</div>
		          <div class="mt-step-title font-grey-cascade" style="text-align:left;font-size:12px !important;font-weight:bold;margin-top: 5px;margin-bottom:0px;">Type de candidature</div>
		      </div>
		      <div class="col-md-2 bg-grey mt-step-col active" style="padding-top:7px; padding-bottom:7px;">
		          <div class="mt-step-number bg-white font-grey" style="margin: auto auto 0px;font-size:10px;padding: 3px 8px;">2</div>
		          <div class="mt-step-title font-grey-cascade" style="text-align:left;font-size:12px !important;font-weight:bold;margin-top: 5px;margin-bottom:0px;">Edition</div>
		      </div>
		      <div class="col-md-2 bg-grey mt-step-col active" style="padding-top:7px; padding-bottom:7px; border-right: 2px solid #eef1f5;">
		          <div class="mt-step-number bg-white font-grey" style="margin: auto auto 0px;font-size:10px;padding: 3px 8px;">3</div>
		          <div class="mt-step-title font-grey-cascade" style="text-align:left;font-size:12px !important;margin-top: 5px;margin-bottom:0px;">&nbsp;</div>
		      </div>
		      <div class="col-md-2 bg-grey mt-step-col" style="padding-top:7px; padding-bottom:7px;">
		          <div class="mt-step-number bg-white font-grey" style="margin: auto auto 0px;font-size:10px;padding: 3px 8px;">4</div>
		          <div class="mt-step-title font-grey-cascade" style="text-align:left;font-size:12px !important;font-weight:bold;margin-top: 5px;margin-bottom:0px;">Avancement</div>
		      </div>
		      <div class="col-md-2 bg-grey mt-step-col " style="padding-top:7px; padding-bottom:7px;">
		          <div class="mt-step-number bg-white font-grey" style="margin: auto auto 0px;font-size:10px;padding: 3px 8px;">5</div>
		          <div class="mt-step-title font-grey-cascade" style="text-align:left;font-size:12px !important;margin-top: 5px;margin-bottom:0px;">&nbsp;</div>
		      </div>
		  </div>
		</div>
		
        <div class="row">

        <div class="col-md-8 col-xs-12" id="candidatureDataColumn" style="display: none;">
            <form class="form-horizontal" style="margin-top: -10px;">
                <div class="form-body">

                    <div class="formBloc">

                        <div class="form-group">
                            <label>Titre de la candidature</label>
                            <div id="cdCandidatureName"></div>
                        </div>

                    </div>

                    <div class="formBloc" id="formBlocSoc">

                        <div class="form-group" id="cdUrlSourceRow">
                            <label>Lien Internet de l'offre</label>
                            <div><a href="" id="cdUrlSource" target="_blank"></a></div>
                        </div>

                        <div class="form-group" id="cdNomSocieteRow">
                            <label>Nom de la société</label>
                            <div id="cdNomSociete"></div>

                            <input type="hidden" id="logoUrl" value=""/>
                        </div>
                        
                        <div class="form-group" id="cdNumSiretRow">
                            <label>SIRET</label>
                            <div id="cdNumSiret"></div>
                        </div>

                        <div class="form-group" id="cdVilleRow">
                            <label>Lieu</label>
                            <div id="cdVille"></div>
                        </div>

                        <div class="form-group" id="cdContactRow">
                            <label>Personne à contacter</label>
                            <div id="cdContactInfo"></div>
                        </div>
                    </div>


                    <div class="formBloc" id="formBlocDesc">

                        <div class="form-group" id="cdDescriptionRow">
                            <label for="cdDescription">Description de la candidature</label>
                            <div id="cdDescription"></div>
                        </div>

                        <div class="form-group" id="cdNoteRow">
                            <label for="cdNote">Notes diverses</label>
                            <div id="cdNote"></div>
                        </div>

                    </div>

                    <div class="formBloc lastFormBloc">

                        <div class="form-group">
                            <label>Type de candidature</label>
                            <div id="cdCandidatureType"></div>
                        </div>

                        <div class="form-group">
                            <label>Où en êtes-vous avec cette offre d'emploi ?</label>
                            <div></div>
                            <div id="cdEtatCandidature"></div>
                            <div id="cdEtatCandidatureMedaillon"></div>
                        </div>
                    </div>

                </div>
            </form>

        </div>

        <div class="col-md-8 col-xs-12" id="candidatureFormColumn">
            <form class="form-horizontal" style="margin-top: -10px;">
                <div class="form-body">

                    <div class="formBloc">

                        <div id="nomCandidature"></div>

                    </div>

                    <div class="formBloc" id="urlSourceBloc">
                        <div id="urlSourceComment"></div>
                        <div id="urlSource"></div>
                        <input type="hidden" id="sourceId" />
                        <input type="hidden" id="jobBoard" />
                    </div>

                    <div class="formBloc">

                        <div id="nomSociete"></div>

                        <div id="formLogoSociete"></div>

                        <div id="numSiret"></div>

                        <div id="ville"></div>

                        <div id="nomContact"></div>
                        <div id="emailContact"></div>
                        <div id="telContact"></div>
                    </div>


                    <div class="formBloc lastFormBloc">

                        <div class="form-group">
                          <label for="description">Description de la candidature</label>
                          <div>
                              <div class="tfErr" id="descriptionError" style="display: none;">La note est trop grande (maximum 65535 caractères)</div>
                              <textarea id="description" placeholder="Description" rows="7" class="form-control"></textarea>
                          </div>
                        </div>

                        <div class="form-group">
                          <label for="note">Notes diverses</label>
                          <div>
                              <div class="tfErr" id="noteError" style="display: none;">La note est trop grande (maximum 65535 caractères)</div>
                              <textarea id="note" placeholder="Divers" rows="3" class="form-control"></textarea>
                          </div>
                        </div>

                    </div>

                    <div class="formBloc lastFormBloc" id="formBlocEtat">
                        <div class="form-group">
                            <label for="candidatureType">Type de candidature</label>
                            <div>
                                <select id="candidatureType" class="form-control">
                                    <option value="1">Candidature spontanée</option>
                                    <option value="2">Réponse à une offre</option>
                                    <option value="3">Opportunité dans mon réseau</option>
                                    <option value="4">Autre</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="etat">Où en êtes-vous avec cette offre d'emploi ?</label>
                            <div>
                                <select id="etat" class="form-control">
                                    <option value="0">Je vais postuler</option>
                                    <option value="1">J'ai postulé</option>
                                    <option value="2">J'ai relancé</option>
                                    <option value="3">J'ai un entretien</option>
                                </select>
                                <label for="etat" id="medaillonEtat"></label>
                            </div>
                        </div>
                    </div>

                    </div>
                </form>
        </div>

        <div class="col-md-4 col-xs-12" id="timeLine">

            <form class="form-horizontal">
                <div id="eventForm" class="form-body">

                    <div class="text-center"><button type="button" id="newEventButton" class="btn green"><i class="fa fa-calendar-plus-o" style="font-size:20px;"></i> Ajouter un événement</button></div>

                </div>
            </form>

            <div id="futureTimeline"></div>

            <div id="pastTimeline"></div>

        </div>


        <div id="fileList" class="col-xs-12" style="display: none;">

        </div>

        </div>


        <div class="formButtons" id="formButtons">
            <button type="button" class="btn dark btn-outline candidatureFormCancel" data-dismiss="modal">Fermer</button>
            <button type="button" id="buttonSaveCandidature2" class="btn green">Enregistrer</button>
            <br /><br />
        </div>
        
        <div class="formButtons" id="formButtonsTunnel" style="display:none;">
    		<button type="button" class="btn btn-outline dark btnPrevious">Retour</button> <button type="button" id="goToStepProgress" class="btn green">Etape suivante</button>
    		<br /><br />
  		</div>


    </div>

</div>