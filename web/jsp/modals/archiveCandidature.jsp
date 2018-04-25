<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<div class="modal" id="mdArchiveCandidature" tabindex="-1" role="dialog" aria-labelledby="mdArchiveCandidatureDesc">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">Supprimer de mon tableau de bord</h4>
      </div>
      <div class="modal-body" id="mdArchiveCandidatureDesc">

        Vous êtes sur le point de supprimer de votre tableau de bord la candidature pour le poste <span class="mdPoste"></span>.<br /><br />
        Celle-ci sera placée dans <strong>"candidatures terminées"</strong>. Vous pourrez la supprimer définitivement ou la restaurer depuis cet espace.

      </div>
      <div class="modal-footer">
        
        <div class="nextActionDiv">
          <br />
          <form class="form-horizontal">
            <div class="form-body">

              <div class="form-group">
                <label class="col-md-3 control-label" for="archiveEventSubType">Motif </label>
                <div class="col-md-9">
                  <select id="archiveEventSubType" class="form-control archiveEventSubType"></select>
                </div>
              </div>

              <div class="form-group">
                <label class="col-md-3 control-label" for="archiveEventComment">Commentaire </label>
                <div class="col-md-9">
                  <textarea id="archiveEventComment" placeholder="Commentaire" rows="2" class="form-control nextActionComment"></textarea>
                </div>
              </div>
            </div>
          </form>
		
		  <button type="button" class="btn dark btn-outline" data-dismiss="modal">Annuler</button>
          <button type="button" id="buttonArchiveCandidature" class="btn green">Valider</button>

        </div>

      </div>
    </div>
  </div>
</div>