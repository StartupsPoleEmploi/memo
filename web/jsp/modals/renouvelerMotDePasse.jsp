<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<div class="modal" id="mdRenouvelerMotDePasse" tabindex="-1" role="dialog" aria-labelledby="mdRenouvelerMotDePasseDesc">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title" id="mdRenouvelerMotDePasseDesc">Renouveler votre mot de passe</h4>
            </div>
            <div class="modal-body">

                <div class="form-body">

                    Votre mot de passe n'a pas été modifiée depuis plus de 6 mois.
                    <br /><br />
                    Nous vous encourageons vivement à le renouveler.

                </div>

            </div>
            <div class="modal-footer">
                <button type="button" class="btn dark btn-outline" data-dismiss="modal">Pas maintenant</button>
                <button type="button" id="renouvelerMotDePasseButton" class="btn green">Modifier mon mot de passe</button>
            </div>
        </div>
    </div>
</div>