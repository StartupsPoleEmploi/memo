<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<div class="modal" id="mdUnsavedCandidature" tabindex="-1" role="dialog" aria-labelledby="mdUnsavedCandidatureDesc">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">Enregistrer vos modifications ?</h4>
      </div>
      <div class="modal-body" id="mdUnsavedCandidatureDesc">

        Vous avez des modifications non enregistrées.<br /><br />
        Ces modifications seront perdues si vous continuez votre navigation.

      </div>
      <div class="modal-footer">
        <button type="button" class="btn dark btn-outline" data-dismiss="modal">Annuler</button>
        <button type="button" class="buttonSaveChanges btn green">Enregistrer les modifications</button>
        <button type="button" class="buttonCancelChanges btn green">Ignorer les modifications</button>
      </div>
    </div>
  </div>
</div>