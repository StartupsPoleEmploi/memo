<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<div class="modal" id="mdRelancerEntretien" tabindex="-1" role="dialog" aria-labelledby="mdRelancerEntretienDesc">
    <div class="modal-dialog" role="document">
        <div class="modal-content modalRelancerEntretien">
        	<button type="button" class="close modalConseil" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <div class="modal-header modalConseil">
                <h4 class="modal-title modalConseil" id="mdRelancerEntretienDesc">Pas de réponse ? Reprenez la main !</h4><br/>
                Vous avez passé un entretien il y a <span class="mdJourEntretien"></span> jours, vous pouvez : <br/>
                <ul style="list-style-type: none;">
					<li>&rarr; <span class="mdRelancerEntretienContact"></span></li>
					<li>&rarr; <span class="mdModifierEntretienRelance"></span></li>
				</ul>
            </div>
            <div class="modal-body">
				<h4 class="modal-title modalConseil">Comment vous y prendre ?</h4><br/>
				<ul style="list-style-type: none;">
					<li>&rarr; <a href="http://www.lexpress.fr/emploi/conseils-emploi/comment-relancer-un-recruteur-apres-un-entretien_1500653.html" target="astuce" onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : relancer entretien recruteur')">Comment relancer un recruteur</a></li>
                	<li>&rarr; <a href="http://www.welcometothejungle.co/articles/6-astuces-pour-relancer-un-recruteur" target="astuce" onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : relancer entretien astuce')">6 astuces pour relancer un recruteur</a></li>
                </ul>
            </div>
            <div class="modal-footer modalConseil">
                <button type="button" class="btn dark btn-outline" data-dismiss="modal">Pas maintenant</button>
                <button type="button" class="btn green nextActionButton">J'ai relancé</button>

                <div class="nextActionDiv">
                    <br />
                    <form class="form-horizontal">
                        <div class="form-body">

                            <div class="form-group">
                                <label class="col-md-3 control-label" for="relanceEntretienComment">Commentaire </label>
                                <div class="col-md-9">
                                    <textarea id="relanceEntretienComment" placeholder="Commentaire" rows="2" class="form-control nextActionComment"></textarea>
                                </div>
                            </div>
                        </div>
                    </form>

                    <button type="button" id="buttonRelancerEntretien" class="btn green">Valider</button>

                </div>

            </div>
        </div>
    </div>
</div>