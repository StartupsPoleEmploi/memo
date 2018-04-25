<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<div class="modal" id="mdAcceptationCandidature" tabindex="-1" role="dialog" aria-labelledby="mdAcceptationCandidatureDesc">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">J'ai eu le poste</h4>
      </div>
      <div class="modal-body" id="mdAcceptationCandidatureDesc">

        Félicitations, vous avez été accepté(e) pour le poste <span class="mdPoste"></span>.<br /><br />
        Cette action placera la candidature dans <strong>"candidatures terminées"</strong>.<br />
        Vous pourrez la supprimer définitivement ou la restaurer depuis cet espace.

      </div>
      <div class="modal-footer">       
        
          <br />
          <form class="form-horizontal">
            <div class="form-body">
              <div class="form-group">
                <label class="col-md-3 control-label" for="acceptationEventComment">Commentaire </label>
                <div class="col-md-9">
                  <textarea id="acceptationEventComment" placeholder="Commentaire" rows="2" class="form-control nextActionComment"></textarea>
                </div>
              </div>
            </div>
          </form>
          
		  <button type="button" class="btn dark btn-outline" data-dismiss="modal">Annuler</button>
          <button type="button" id="buttonAcceptationCandidature" class="btn green">Valider</button>

      </div>
    </div>
  </div>
</div>