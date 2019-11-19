<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<div id="resetPasswordForm"  class="jumbotron text-center createAccountBloc" style="display: none;">
    <div class="content">
        <form class="login-form">
            <h3>Définissez votre nouveau mot de passe</h3>

            <div class="row boundary"></div>

            <div class="alert alert-danger display-hide">
                <span id="resetPasswordMsg">  </span>
            </div>

            <div id="resetPassword"></div>
            <div id="repeatResetPassword"></div>


            <div>Si vous souhaitez renforcer la sécurité de votre mot de passe, nous vous conseillons d'utiliser au minimum une lettre, un chiffre et un caractère spécial.</br><b>Le saviez-vous ?</b> Les phrases secrètes font d'excellents mots de passe (ex :  "J'ai acheté 5 CDs aujourd'hui").</div>

            <div class="form-actions text-center">
                <button type="button" id="buttonResetPassword" class="btn btn-rounded btn-lg green uppercase">Enregistrer</button>
            </div>

            <div class="homeFormSpinner" style="display:none;"><i class="fa fa-spinner fa-spin"></i> Chargement en cours</div>

        </form>
    </div>
</div>
