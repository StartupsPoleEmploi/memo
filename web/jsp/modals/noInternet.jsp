<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<div class="modal" id="mdNoInternet" tabindex="-1" role="dialog" aria-labelledby="mdNoInternetDesc">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="mdNoInternetDesc">Problème de connexion</h4>
      </div>
      <div class="modal-body">

          <form class="motDePasseForm">
              <div class="form-body">
                Attention, vous n'êtes pas connecté à internet. Vos actions d'enregistrement ne seront pas prises en compte. <br />
			</div>
		</form>

      </div>
      <div class="modal-footer">
        <button type="button" class="btn dark btn-outline" data-dismiss="modal">Fermer</button>
      </div>
    </div>
  </div>
</div>