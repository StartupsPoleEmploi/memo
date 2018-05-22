<%@ page contentType="text/html;charset=UTF-8" language="java" %>


<div id="connectionPage"  class="jumbotron text-center createAccountBloc" style="display: none;">
    <div class="content">
        <form class="login-form" method="post" name="loginForm" action="/blank.html" target="loginTarget">
            <h3>Accédez à votre compte</h3>

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
                    <div class="col-xs-12 connectTitle">Avec Pôle emploi</div>

                    <table class="extConnect">
                        <tr>
                            <td>
                                <a class="peConnectButton">
                                    <img src="./pic/logos/logo-pe-connect.svg" />
                                </a>
                            </td>
                        </tr>
                    </table>

                    <div class="col-xs-12 connectTitle connectTitleBorder" >Avec votre E-mail</div>

                    <div class="col-xs-12">
                        <div id="loginPasswordRenewed" style="display: none;">Votre nouveau mot de passe a été sauvegardé. Connectez-vous pour accéder à votre tableau de bord.</div>

                        <div class="alert alert-danger display-hide">
                            <span id="loginMsg">  </span>
                        </div>

                        <div id="loginEmail"></div>
                        <div id="loginPassword"></div>

                        <div class="form-actions text-center">
                            <button type="button" id="accountLoginButton" class="btn btn-rounded btn-lg green">Se connecter</button>
                        </div>

                        <div class="connectAction row">

                            <div class="col-xs-12 col-sm-6"><a id="buttonForgottenPassword" class="forget-password"><span>Mot de passe oublié</span></a></div>
                            <div class="col-xs-12 col-sm-6">Pas encore inscrit ? <a id="loginNoAccount">S'inscrire</a></div>
                        </div>

                        <div class="homeFormSpinner" style="display:none;"><i class="fa fa-spinner fa-spin"></i> Chargement en cours</div>

                    </div>

                </div>


                <div class="col-xs-12">
                    <div class="row createBoundary">

                        <div class="col-xs-12 connectTitleBorder connectTitle">Avec Facebook</div>

                        <table class="extConnect">
                            <tr>
                                <td>
                                    <fb:login-button scope="public_profile,email" data-size="large" login_text="Avec Facebook" onlogin="checkLoginState();"></fb:login-button>
                                    <div class="fbStatus"></div>
                                </td>
                            </tr>
                        </table>

                    </div>
                </div>
            </div>

        </form>
        <iframe id="loginTarget" name="loginTarget" style="display: none;"></iframe>
        <div id="peDisconnect" style="display: none;"></div>
    </div>
</div>