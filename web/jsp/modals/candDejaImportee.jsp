<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<div class="modal" id="mdCandDejaImportee" tabindex="-1" role="dialog" aria-labelledby="mdCandDejaImporteeDesc">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close cancelCandDejaImportee" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">Candidature déjà importée</h4>
      </div>
      <div class="modal-body" id="mdCandDejaImporteeDesc">
        Vous avez déjà importé la candidature <span class="mdPoste"></span> sur votre tableau de bord.
        <br /><br />
        Elle se trouve dans la colonne <span class="mdColonne"></span>.
        <br /><br />
        <strong>Souhaitez-vous néanmoins en importer une nouvelle copie ?</strong>

        <br /><br />
        <span class="mdNote">Si vous n'étiez pas en train de procéder à un import veuillez consulter la <a class="openFaqButton">FAQ</a></span>

        <br /><br />

      </div>
      <div class="modal-footer">
        <button type="button" class="btn dark btn-outline cancelCandDejaImportee">Annuler</button>
        <button type="button" id="buttonImportDoublonCandidature" class="btn green">Importer la candidature</button>
      </div>
    </div>
  </div>
</div>