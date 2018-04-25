<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<div class="modal" id="mdRelancerCandidature" tabindex="-1" role="dialog" aria-labelledby="mdRelancerCandidatureDesc">
    <div class="modal-dialog" role="document">
        <div class="modal-content modalRelancerCandidature">
            <button type="button" class="close modalConseil" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <div class="modal-header modalConseil">
                <h4 class="modal-title modalConseil" id="mdRelancerCandidatureDesc">Affirmez votre motivation et obtenez une réponse</h4><br/>
                Vous avez postulé il y a <span class="mdJour"></span> jours, vous pouvez : <br/>
                <ul style="list-style-type: none;">
					<li>&rarr; <span class="mdRelancerContact"></span></li>
					<li>&rarr; <span class="mdModifierRelance"></span></li>
				</ul>
            </div>
            <div class="modal-body">
				<h4 class="modal-title modalConseil">Comment vous y prendre ?</h4><br/>
				<ul style="list-style-type: none;">
					<li>&rarr; <a href="http://blog-experts.cadres.apec.fr/2014/10/06/lart-de-relancer-ses-candidatures/" target="astuces" onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : relancer candidature - l art')">L'art de relancer ses candidatures</a></li>
	                <li>&rarr; <a href="https://www.cadremploi.fr/editorial/conseils/conseils-candidature/detail/article/candidature-relancer-sans-harceler.html" target="astuces" onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : relancer candidature - sans harceler')">Comment relancer sans harceler</a></li>
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
                                <label class="col-md-3 control-label" for="relancerEventComment">Commentaire </label>
                                <div class="col-md-9">
                                    <textarea id="relancerEventComment" placeholder="Commentaire" rows="2" class="form-control nextActionComment"></textarea>
                                </div>
                            </div>
                        </div>
                    </form>

                    <button type="button" id="buttonRelancerCandidature" class="btn green">Valider</button>

                </div>

            </div>
        </div>
    </div>
</div>