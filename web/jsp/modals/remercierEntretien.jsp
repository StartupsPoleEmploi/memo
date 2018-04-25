<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<div class="modal" id="mdRemercierEntretien" tabindex="-1" role="dialog" aria-labelledby="mdRemercierEntretienDesc">
    <div class="modal-dialog" role="document">
        <div class="modal-content modalRemercierEntretien">
        	<button type="button" class="close modalConseil" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <div class="modal-header">
                <h4 class="modal-title modalConseil" id="mdRemercierEntretienDesc">Confirmez votre intérêt et distinguez-vous</h4><br/>
                <div style='text-align:center;'><span class="mdRemercierContact"></span></div>
            </div>
            <div class="modal-body">
                <h4 class="modal-title modalConseil">Comment vous y prendre ?</h4><br/>
                Les principes de base :
				<ul style="list-style-type: none;">
					<li>&rarr; <a href="http://www.lexpress.fr/emploi/conseils-emploi/lettre-de-remerciement-apres-un-entretien-d-embauche_1609017.html" target="astuces" onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : remercier - lettre')">Rédiger une lettre de remerciement après un entretien</a></li>
                </ul>
                Des conseils d'experts en vidéo :
				<ul style="list-style-type: none;">
					<li>&rarr; <a href="http://www.academyk.org/gerer-l-apres-entretien-de-recrutement-mc15.html" target="astuces" onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : remercier - gérer')">Gérer l’après-entretien </a>(2min)</li>
					<li>&rarr; <a href="http://www.academyk.org/entretien-avec-un-manager-apres-l-entretien-4-4-mc96.html" target="astuces" onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : remercier - 2nd entretien')">Remercier après un second entretien </a>(2min)</li>
                </ul>
                Pour avoir un retour du recruteur :
				<ul style="list-style-type: none;">
					<li>&rarr; <a href="https://fidbak.fr/" target="astuces" onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : remercier - fidbak')">FIDBAK</a></li>
                </ul>
            </div>
            <div class="modal-footer modalConseil">
                <button type="button" class="btn dark btn-outline" data-dismiss="modal">Pas maintenant</button>
                <button type="button" class="btn green nextActionButton">J'ai remercié</button>

                <div class="nextActionDiv">
                    <br />
                    <form class="form-horizontal">
                        <div class="form-body">

                            <div class="form-group">
                                <label class="col-md-3 control-label" for="remercierEntretienComment">Commentaire </label>
                                <div class="col-md-9">
                                    <textarea id="remercierEntretienComment" placeholder="Commentaire" rows="2" class="form-control"></textarea>
                                </div>
                            </div>
                        </div>
                    </form>

                    <button type="button" id="buttonRemercierEntretien" class="btn green">Valider</button>

                </div>

            </div>
        </div>
    </div>
</div>