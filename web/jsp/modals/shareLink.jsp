<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<div class="modal" id="mdShareLink" tabindex="-1" role="dialog" aria-labelledby="mdShareLinkDesc">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title" id="mdShareLinkDesc">Partager son tableau de bord</h4>
            </div>
            <div class="modal-body">

                Communiquez le lien ci-dessous aux personnes à qui vous souhaitez montrer votre tableau de bord :

                <div id="shareLinkDiv" class="input-group">
                    <textarea id="shareLink" readonly onclick="this.focus();this.select()"></textarea>
                </div>
                <div id="shareLinkSpinner"><i class="fa fa-spinner fa-spin"></i> Chargement en cours</div>

                Vous restez le seul à pouvoir modifier votre tableau de bord.
                <br /><br /><strong>Ce lien est valable 30 jours</strong>.

            </div>
            <div class="modal-footer">
                <button type="button" class="btn dark btn-outline" data-dismiss="modal">Fermer</button>
                <button id="shareLinkCopyButton" data-clipboard-target="#shareLink" data-clipboard-action="copy" type="button" class="btn green" >Copier le lien</button>
            </div>
        </div>
    </div>
</div>