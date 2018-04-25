<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<div class="modal" id="mdModifierMotDePasse" tabindex="-1" role="dialog" aria-labelledby="mdModifierMotDePasseDesc">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="mdModifierMotDePasseDesc">Modifier votre mot de passe</h4>
      </div>
      <div class="modal-body">

          <form class="motDePasseForm">
              <div class="form-body">

				<div class="alert alert-danger display-hide">
					<span id="modifierMotDePasseMsg">  </span>
				</div>
                  
               	<div class="formBloc">
                    Cette opération nécessite que vous redonniez votre mot de passe : <br /><br />
               		<div id="lastPasswordInput"></div>
               	</div>
               	<div class="formBloc" style='border-bottom:0px;padding-bottom:0px;'>
                    Votre nouveau mot de passe doit comporter au moins 12 caractères.<br /><br />
               		<div id="newPasswordInput"></div>
               	</div>
               	<div class="formBloc">
               		<div id="newConfirmPasswordInput"></div>
               	</div>

                <b>Le saviez-vous ?</b> Les phrases secrètes font d'excellents mots de passe (ex :  "La nuit les chats miaulent").

			</div>
		</form>

      </div>
      <div class="modal-footer">
        <button type="button" class="btn dark btn-outline" data-dismiss="modal">Annuler</button>
        <button type="button" id="enregistrerMotDePasseButton" class="btn green">Enregistrer</button>
      </div>
    </div>
  </div>
</div>