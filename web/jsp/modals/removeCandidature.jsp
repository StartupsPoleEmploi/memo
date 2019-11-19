<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<div class="modal" id="mdRemoveCandidature" tabindex="-1" role="dialog" aria-labelledby="mdRemoveCandidatureDesc">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">Supprimer une candidature</h4>
      </div>
      <div class="modal-body" id="mdRemoveCandidatureDesc">

        Vous êtes sur le point de supprimer définitivement la candidature pour le poste <span id="mdRemoveCandidaturePoste" class="mdPoste"></span>

      </div>
      <div class="modal-footer">
        <button type="button" class="btn dark btn-outline" data-dismiss="modal">Annuler</button>
        <button type="button" class="buttonRemoveCandidature btn green">Confirmer</button>
      </div>
    </div>
  </div>
</div>