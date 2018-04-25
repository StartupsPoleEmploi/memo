<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<div class="modal" id="mdPEAMError" tabindex="-1" role="dialog" aria-labelledby="mdPEAMErrorDesc">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="mdPEAMErrorDesc">Erreur de connexion à Pôle emploi</h4>
      </div>
      <div class="modal-body">

          <form class="motDePasseForm">
              <div class="form-body">
              <%if (PEAMError != null && PEAMError.equals("1")) { %>
	                Un problème s'est produit lors de votre tentative de connexion à MEMO via votre compte Pôle Emploi.<br /><br />
	                Veuillez réessayer.<br /><br />
	                Si le problème persiste, merci de contacter le service MEMO.
	          <%} else { %>
	          		Votre adresse électronique définie dans votre espace personnel de Pôle Emploi doit être valide pour utiliser le service MEMO. <br /><br />
	                Validez votre adresse et veuillez réessayer.<br /><br />
	                Si le problème persiste, merci de contacter le service MEMO.
	          <%} %>
			</div>
		</form>

      </div>
      <div class="modal-footer">
        <button type="button" class="btn dark btn-outline" data-dismiss="modal">Fermer</button>
      </div>
    </div>
  </div>
</div>