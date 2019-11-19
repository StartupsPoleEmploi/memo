<%@ page contentType="text/html;charset=UTF-8" language="java" %>



<div id="createAccountForm"  class="jumbotron text-center createAccountBloc" style="display: none;">
    <div class="content">
        <form class="login-form">
            <h3>Créez votre compte</h3>

			<div class="row boundary"></div>

            <div class="row rgpdDeny" style="display:none;">
                Vous n'avez pas accepté la politique de confidentialité.
                <br /><br />
                La connexion à MEMO n'est possible que si vous acceptez cette politique de confidentialité.
                <br /><br />
                <button type="button" class="btn green">J'ACCEPTE LA POLITIQUE<br class="visible-xs" /> DE CONFIDENTIALITE</button>
                <br />
                <a>En savoir plus</a>
                <br /><br />
            </div>

            <div class="row rgpdConsent">

                <div class="col-xs-12">
                    <div class="row">

                        <div class="connectTitle">Avec Pôle emploi</div>

                        <table class="extConnect">
                            <tr>
                                <td>
                                    <a class="peConnectButton">
                                        <img src="./pic/logos/logo-pe-connect.svg" alt="Bouton pour se connecter avec son compte Pôle Emploi" />
                                    </a>
                                    <div style="margin-top:20px">
                                        Utilisez vos identifiants Pôle emploi pour
                                        <br>
                                        créer votre compte en quelques clics
                                    </div>
                                </td>
                            </tr>
                        </table>

                    </div>
                </div>

                <div class="col-xs-12">

                    <div class="connectTitle connectTitleBorder">Avec votre E-mail</div>

                    <div class="alert alert-danger display-hide">
                        <span id="createAccountMsg">  </span>
                    </div>

                    <div id="accountLoginEmail"></div>

                    <div id="accountLoginPassword"></div>
                    <div id="accountRepeatLoginPassword"></div>

                    <div id="cguCheckDiv" class="checkbox">
                        <label for="cguCheck">
                            <input type="checkbox" id="cguCheck"> J'ai bien pris connaissance des <a class="openCguButton">conditions générales d'utilisation</a>
                        </label>
                    </div>

                    <div>Si vous souhaitez renforcer la sécurité de votre mot de passe, nous vous conseillons d'utiliser au minimum une lettre, un chiffre et un caractère spécial.<br /><b>Le saviez-vous ?</b> Les phrases secrètes font d'excellents mots de passe (ex :  "J'ai acheté 5 CDs aujourd'hui").</div>

                    <div class="form-actions text-center">
                        <button type="button" id="buttonCreateAccount" class="btn btn-rounded btn-lg green">S'inscrire</button>
                    </div>
                </div>



            </div>

			<div class="connectAction connectTitleBorder">Déjà inscrit ? <a class="btnHeaderConnect">Se connecter</a></div>

            <div class="homeFormSpinner" style="display:none;"><i class="fa fa-spinner fa-spin"></i> Chargement en cours</div>

        </form>
    </div>
</div>
