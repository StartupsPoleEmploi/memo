<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<div class="modal" id="mdAttachmentManager" tabindex="-1" role="dialog" aria-labelledby="mdAttachmentManagerDesc">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="mdAttachmentManagerDesc">Gestion des pièces jointes</h4>
      </div>
      <div class="modal-body">

        <div class="tfErr" id="fileDropError"></div>

        <div id="fileDropZone">
          <div class="dzPrompt">Déposez un fichier ici<span><br />ou cliquez pour sélectionner un fichier</span></div>
          <div class="dzSpinner"><i class="fa fa-spinner fa-spin"></i><span><br />Copie en cours, merci de patienter</span></div>
          <div class="dzDone">Téléchargement terminé</div>
        </div>

        <div class="hiddenFileInput">
          <input name="importFileInput" type="file" id="importFileInput"/>
        </div>

        <div id="mdFileList"></div>


      </div>
      <div class="modal-footer">


        <button type="button" class="btn dark btn-outline" data-dismiss="modal">Fermer</button>

      </div>
    </div>
  </div>
</div>