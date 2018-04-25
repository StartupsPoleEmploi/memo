<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<div class="modal" id="mdRemoveFile" tabindex="-1" role="dialog" aria-labelledby="mdRemoveFileDesc">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">Supprimer un fichier</h4>
      </div>
      <div class="modal-body" id="mdRemoveFileDesc">

        Vous êtes sur le point de supprimer un fichier.
        <br /><br />
        Ce fichier sera supprimé définitivement.<br />Les éventuelles copies de ce fichier associées à d'autres candidatures ne seront pas effacées.

      </div>
      <div class="modal-footer">
        <button type="button" class="buttonCancelRemoveFile btn dark btn-outline">Annuler</button>
        <button type="button" class="buttonRemoveFile btn green">Confirmer</button>
      </div>
    </div>
  </div>
</div>