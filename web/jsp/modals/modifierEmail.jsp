<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<div class="modal" id="mdModifierEmail" tabindex="-1" role="dialog" aria-labelledby="mdModifierEmailDesc">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="mdModifierEmailDesc">Modifier votre adresse e-mail</h4>
      </div>
      <div class="modal-body">

          <form class="modifierEmailForm">
              <div class="form-body">

                <div class="alert alert-danger display-hide">
					<span id="modifierEmailMsg">  </span>
				</div>
                  
               	<div class="formBloc" id="mdModifierEmailPass">
                    Cette opération nécessite que vous redonniez votre mot de passe : <br /><br />
               		<div id="checkPasswordInput"></div>
               	</div>

               	<div class="formBloc" style='border-bottom:0px;padding-bottom:0px;'>
                    Renseignez votre nouvelle adresse e-mail : <br /><br />
               		<div id="newEmailInput"></div>
               	</div>

			</div>
		</form>

      </div>
      <div class="modal-footer">
        <button type="button" class="btn dark btn-outline" data-dismiss="modal">Annuler</button>
        <button type="button" id="enregistrerEmailButton" class="btn green">Enregistrer</button>
      </div>
    </div>
  </div>
</div>