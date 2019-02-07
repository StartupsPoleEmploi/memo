<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<div class="modal" id="mdPostulerCandidature" tabindex="-1" role="dialog" aria-labelledby="mdPostulerCandidatureDesc">
    <div class="modal-dialog" role="document">
        <div class="modal-content modalPostulerCandidature">
        	<button type="button" class="close modalConseil" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <div class="modal-header modalConseil">
                <h4 class="modal-title modalConseil" id="mdPostulerCandidatureDesc">N'attendez pas et profitez-en pour retenir l'attention</h4><br/>
                <div style='text-align:center;'><span class="mdSociete"></span><span class="mdPostuler"></span></div> 
            </div>
            <div class="modal-body">

                <h4 class="modal-title modalConseil">Comment vous y prendre ?</h4><br/>
				
				<div style='padding-left:30px'>
	                Apprenez en ligne les incontournables :
	                <ul style="list-style-type: none;">
						<li>&rarr; <a href="http://www.contratdapprentissage.fr/comment-faire-une-lettre-de-motivation.php" target="astuces" onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : postuler - LM')">Comment faire une lettre de motivation</a></li>
		                <li>&rarr; <a href="https://www.emploi-store.fr/portail/services/bABaCvLettreDeMotivation" target="astuces" onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : postuler - B.A BA')">B.A BA CV et lettre de motivation </a>(1h)</li>
                        <li>&rarr; <a href="http://www.eotim.com/Cabinet-de-recrutement-informatique-et-IT-%C3%A0-Paris-et-Caen/eotips-38-le-pitch-mail-ou-la-nouvelle-lettre-de-motivation-1493214324657.html" target="astuces" onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : postuler - pitch')">Écrire un bon pitch mail</a></li>
	                </ul>
	                Des conseils d'expert en vidéo :
	                <ul style="list-style-type: none;">
	                	<li>&rarr; <a href="http://www.academyk.org/ecrire-une-lettre-de-motivation-percutante-mc40.html" target="lmp" onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : postuler - LM percutante')">Écrire une lettre de motivation percutante</a> (5min)</li>
	                	<li>&rarr; <a href="http://www.academyk.org/bien-communiquer-par-email-avec-un-recruteur-mc5.html?_=46554036" target="email" onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : postuler - communiquer')">Bien communiquer par e-mail avec un recruteur</a> (4min)</li>
	                </ul>
					Partez sur un modèle efficace :
	                <ul style="list-style-type: none;">
	                	<li>&rarr; <a href="https://www.emploi-store.fr/portail/services/outilDeCreationDeCvDesignPdfGratuit" target="cvDesign" onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : postuler - CV design')">CV DesignR</a> / <a href="https://www.canva.com/fr_fr/creer/cv/" target="canva">Canva</a></li>
	                	<li>&rarr; <a href="https://www.emploi-store.fr/portail/services/emailEtLettreDeMotivation" target="lm" onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : postuler - modèles')">Modèles de lettres de motivation à personnaliser</a></li>
	                </ul>
					Pour aller plus loin :
	                <ul style="list-style-type: none;">
	                	<li>&rarr; <a href="https://www.emploi-store.fr/portail/services/glassdoor" target="cvpe" onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : postuler - glassdoor')">Les avis des employés de l’entreprise </a>(Glassdoor)</li>
	                	<li>&rarr; <a href="https://www.emploi-store.fr/portail/services/quiConsulteVotreCv" target="cvpe" onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : postuler - tilkee')">Qui consulte votre CV ? </a>(Tilkee)</li>
	                </ul>
				</div>
            </div>
            <div class="modal-footer modalConseil">
                <button type="button" class="btn dark btn-outline" data-dismiss="modal">Pas maintenant</button>
                <button type="button" id="buttonPostulerToggle" class="btn green nextActionButton">J'ai postulé</button>

                <div class="nextActionDiv">
                    <br />
                    <form class="form-horizontal">
                        <div class="form-body">

                            <div class="form-group">
                                <label class="col-md-3 control-label" for="postulerEventComment">Commentaire </label>
                                <div class="col-md-9">
                                    <textarea id="postulerEventComment" placeholder="Commentaire" rows="2" class="form-control nextActionComment"></textarea>
                                </div>
                            </div>
                        </div>
                    </form>

                    <button type="button" id="buttonPostulerCandidature" class="btn green">Valider</button>

                </div>

            </div>
        </div>
    </div>
</div>