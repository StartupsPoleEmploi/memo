<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<div class="modal" id="mdArchiverCandidature" tabindex="-1" role="dialog" aria-labelledby="mdArchiverCandidatureDesc">
    <div class="modal-dialog" role="document">
        <div class="modal-content modalSupprimer">
        	<button type="button" class="close modalConseil" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <div class="modal-header modalConseil">
                <h4 class="modal-title modalConseil">Déplacer vers "candidatures terminées"</h4>
            </div>
            <div class="modal-body" style='text-align:center;' id="mdArchiverCandidatureDesc">
                Il n'y a pas eu d'activité sur cette candidature depuis 30 jours. <br />
                Voulez-vous la déplacer dans <strong>"candidatures terminées"</strong> ?<br />
                Vous pourrez la supprimer définitivement ou la restaurer depuis cet espace.<br />
            </div>
            <div class="modal-footer modalConseil">

                <div class="nextActionDiv">
                    <br />
                    <form class="form-horizontal">
                        <div class="form-body">

                            <div class="form-group">
                                <label class="col-md-3 control-label" for="archiverEventSubType">Motif </label>
                                <div class="col-md-9">
                                    <select id="archiverEventSubType" class="form-control archiveEventSubType"></select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="col-md-3 control-label" for="archiverEventComment">Commentaire </label>
                                <div class="col-md-9">
                                    <textarea id="archiverEventComment" placeholder="Commentaire" rows="2" class="form-control nextActionComment"></textarea>
                                </div>
                            </div>
                        </div>
                    </form>
                    <br />
					<button type="button" id="buttonConserverCandidature" class="btn dark btn-outline">Pas maintenant</button>
                    <button type="button" id="buttonArchiverCandidature" class="btn green">Valider</button>

                </div>

            </div>
        </div>
    </div>
</div>