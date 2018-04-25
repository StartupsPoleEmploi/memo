<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<div class="modal" id="mdPreparerEntretien" tabindex="-1" role="dialog" aria-labelledby="mdPreparerEntretienDesc">
    <div class="modal-dialog" role="document">
        <div class="modal-content modalPreparerEntretien">
        	<button type="button" class="close modalConseil" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <div class="modal-header modalConseil">
                <h4 class="modal-title modalConseil" id="mdPreparerEntretienDesc">Apprenez à vous vendre pour assurer pendant l'entretien</h4><br/>
                <div style='text-align:center;'><span class="mdTrajet"></span></div>
            </div>
            <div class="modal-body">
				
				<h4 class="modal-title modalConseil">Comment vous y prendre ?</h4><br/>
				
                <div style='padding-left:30px'>
	                Apprendre en ligne les incontournables :
	                <ul style="list-style-type: none;">
						<li>&rarr; <a href="http://www.emploi-store.fr/portail/services/bABaEntretien" target="baba" onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : preparer - B.A BA')">B.A BA de l'entretien</a> (20min)</li>
	                </ul>
	                Testez-vous :
	                <ul style="list-style-type: none;">
						<li>&rarr; <a href="http://www.emploi-store.fr/portail/services/monEntretienVirtuel" target="entretienVirtuel" onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : preparer - simulateur')">Simulateur - Mon entretien virtuel</a> (45min)</li>
						<li>&rarr; <a href="http://www.emploi-store.fr/portail/services/monEntretienDEmbauche" target="entretienEmbauche" onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : preparer - serious game')">Serious game - Mon entretien d'embauche</a> (45min)</li>
						<li>&rarr; <a href="http://www.emploi-store.fr/portail/services/meteojobMonEntretienDEmbauche" target="meteoJobEntretien" onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : preparer - quiz entretien')">Quiz - Mon entretien d’embauche</a> (15min)</li>
						<li>&rarr; <a href="http://www.emploi-store.fr/portail/services/commentSHabillerPourUnEntretien#" target="habits" onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : preparer - quiz s\'habiller')">Quiz - S’habiller pour un entretien</a> (5min)</li>
	                </ul>
	                Des conseils d'experts en vidéo :
	                <ul style="list-style-type: none;">
						<li>&rarr; <a href="http://www.academyk.org/entretien-de-recrutement-adoptez-la-bonne-attitude-mc7.html" target="attitude" onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : preparer - bonne attitude')">Adoptez la bonne attitude en entretien</a> (5min)</li>
	                </ul>
	                Inspirez-vous de la communauté :
	                <ul style="list-style-type: none;">
						<li>&rarr; <a href="http://www.emploi-store.fr/portail/services/glassdoor" target="question" onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : preparer - questions en entretien')">Questions posées lors des entretiens</a></li>
	                </ul>
				</div>
            </div>
            <div class="modal-footer modalConseil">
                <button type="button" class="btn dark btn-outline" data-dismiss="modal">Pas maintenant</button>
                <button type="button" class="btn green nextActionButton">J'ai fini ma préparation</button>

                <div class="nextActionDiv">
                    <br />
                    <form class="form-horizontal">
                        <div class="form-body">

                            <div class="form-group">
                                <label class="col-md-3 control-label" for="preparerEventComment">Commentaire </label>
                                <div class="col-md-9">
                                    <textarea id="preparerEventComment" placeholder="Commentaire" rows="2" class="form-control nextActionComment"></textarea>
                                </div>
                            </div>
                        </div>
                    </form>

                    <button type="button" id="buttonPreparerCandidature" class="btn green">Valider</button>

                </div>

            </div>
        </div>
    </div>
</div>