<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<div id="forgottenPasswordForm"  class="jumbotron text-center createAccountBloc" style="display: none;">
    <div class="content">
        <form class="login-form">
            <h3>Mot de passe oublié</h3>

            <p>Renseignez votre adresse email de login pour récupérer votre mot de passe</p>

            <div class="alert alert-danger display-hide">
                <span id="forgottenPasswordMsg">  </span>
            </div>

            <div id="fpLoginEmail"></div>

            <div id="fpResult" style="display:none;"></div>

            <div class="form-actions text-center">
                <button type="button" id="buttonGetPassword" class="btn btn-rounded btn-lg green uppercase">Valider</button>
            </div>
            <div class="homeFormSpinner" style="display:none;"><i class="fa fa-spinner fa-spin"></i> Chargement en cours</div>

        </form>
    </div>
</div>