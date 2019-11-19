<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<div id="parametresPage" class="marginTop60" style="display:none;">

    <div id="parametresPageContainer">

        <div class="pageTitle"><span>Paramètres</span></div>

		<div class="row">
        <div class="col-md-12 col-xs-12" id="parametresForm">
	        <form class="form-horizontal" >
	            <div class="form-body">
	
					<div class="formBloc">
	                	<label for="changePasswordBlock">Mon compte</label>
	                	<div class="form-group" id="changePasswordBlock">
		                    <label class="col-md-5 col-sm-6 col-xs-12 control-label" for="modifierMotDePasseButton">Pour modifier votre mot de passe :</label>
		                    <div class="col-md-5 col-sm-6 col-xs-4 ">
								<div class="visible-xs"><br /></div>
		                        <button type="button" id="modifierMotDePasseButton" class="btn green">Modifier votre mot de passe</button>
								<div class="visible-xs"><br /></div>
		                    </div>
	                	</div>

						<div class="form-group">
							<label class="col-md-5 col-sm-6 col-xs-12 control-label" for="modifierEmailButton">Pour modifier votre adresse e-mail :</label>
							<div class="col-md-5 col-sm-6 col-xs-4 ">
								<div class="visible-xs"><br /></div>
								<button type="button" id="modifierEmailButton" class="btn green">Modifier votre adresse e-mail</button>
								<div class="visible-xs"><br /></div>
							</div>
						</div>

		                <div class="form-group">
		                	<label class="col-md-5 col-sm-6 col-xs-12 control-label" for="supprimerCompteButton">Pour supprimer définitivement votre compte : </label>
							<div class="col-md-5 col-sm-6 col-xs-4 ">
								<div>
									<div class="visible-xs"><br /></div>
									<button type="button" id="supprimerCompteButton" class="btn green">Supprimer votre compte</button>
								</div>
							</div>
						</div>
					</div>

					<div id="userInfo" class="formBloc">
						<label for="userInfo">Mes informations</label>
						<div></div>
						<div><br />Vous pouvez mettre à jour ces informations sur le site de <a href="https://candidat.pole-emploi.fr/candidat/mescoordonnees/consultation" target="poleemploi">Pôle emploi</a>.<br />Elles seront mises à jour sur Memo à votre prochaine connexion avec votre compte Pôle emploi</div>
					</div>

					  <div class="formBloc">
						<label for="receiveEmail">Notifications</label>
						<div class="form-group">
							<label class="col-md-5 col-sm-6 col-xs-12 control-label" for="receiveEmail">Recevoir des conseils/rappels par email : </label>
							<div class="col-md-5 col-sm-6 col-xs-4 ">
								<div class="visible-xs"><br /></div>
								<input name="updateNotificationState" type="checkbox" id="receiveEmailForm" />
							</div>
						</div>
					</div>
					
					 <div class="formBloc">
						<label for="consentAccess">Accès conseiller</label>
						<div class="form-group">
							<label class="col-md-5 col-sm-6 col-xs-12 control-label" for="consentAccess">Autoriser les conseillers Pôle emploi à consulter votre espace Memo</label>
							<div class="col-md-5 col-sm-6 col-xs-4 ">
								<div class="visible-xs"><br /></div>
								<input name="updateConsentState" type="checkbox" id="consentAccessForm" />
							</div>
						</div>
					</div> 

					<div class="formBloc">
	                	<label for="extractTDBButton">Tableau de bord</label>
	                	<div class="form-group" id="extractTDBBlock">
		                    <label class="col-md-5 col-sm-6 col-xs-12 control-label" for="extractTDBButton">Vous pouvez exporter les données de votre tableau de bord dans un format compatible avec les tableurs dont Excel et Open Office Calc</label>
		                    <div class="col-md-5 col-sm-6 col-xs-4 ">
								<div class="visible-xs"><br /></div>
		                        <button type="button" id="extractTDBButton" class="btn green">Télécharger</button>
								<div class="visible-xs"><br /></div>
		                    </div>
	                	</div>
					</div>
	            </div>
	        </form>
		</div>
		</div>
		
        <div class="formButtons" style="display: block;">
            <button type="button" class="btn dark btn-outline parametresFormCancel">Fermer</button>
            <!--  <button type="button" class="btn green buttonSaveParametres">Enregistrer</button>-->
        </div>
        

    </div>

</div>