<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<div id="boardPanel" class="mt-element-step marginTop60">

    <div id="boardSpinner" class="text-center">Nous procédons au chargement de vos données, merci de patienter :)<br /><i class="fa fa-spinner fa-spin"></i></div>

    <div id="candidatureBoard" class="row step-line" style="display:none;">

        <!--- colonne j'ai un entretien -->
        <div class="col-md-3 col-md-push-9 mt-step-col entretien last">
            <div class="mt-step-number bg-white">J'ai un entretien <span id="badgeEntretiens" class="visible-lg-inline badge badgeEntretien">0</span></div>
            <div class="mt-step-title"></div>

            <div class="listeLongue hidden-xs hidden-sm" id="listeEntretiens"></div>
            <div class="listeLongue visible-xs visible-sm" id="listeEntretiensM"></div>
        </div>

        <!-- Colonne Je Vais postuler -->
        <div class="col-md-3 col-md-pull-3 mt-step-col brouillon first">
            <div class="mt-step-number bg-white ">Je vais postuler <span id="badgeTodos" class="visible-lg-inline badge badgeBrouillon">0</span></div>
            <div class="mt-step-title"></div>

            <div class="listeLongue hidden-xs hidden-sm" id="listeTodos"></div>
            <div class="listeLongue visible-xs visible-sm" id="listeTodosM"></div>
        </div>

        <!-- Colonne j'ai postulé -->
        <div class="col-md-3 col-md-pull-3 mt-step-col candidature">
            <div class="mt-step-number bg-white">J'ai postulé <span id="badgeCandidatures" class="visible-lg-inline badge badgeCandidature">0</span></div>
            <div class="mt-step-title"></div>

            <div class="listeLongue hidden-xs hidden-sm" id="listeCandidatures"></div>
            <div class="listeLongue visible-xs visible-sm" id="listeCandidaturesM"></div>
        </div>

        <!-- colonne J'ai relancé -->
        <div class="col-md-3 col-md-pull-3 mt-step-col relance">
            <div class="mt-step-number bg-white">J'ai relancé <span id="badgeRelances" class="visible-lg-inline badge badgeRelance">0</span></div>
            <div class="mt-step-title"></div>

            <div class="listeLongue hidden-xs hidden-sm" id="listeRelances"></div>
            <div class="listeLongue visible-xs visible-sm" id="listeRelancesM"></div>
        </div>

    </div>

    <div class="text-center hidden-xs faitGlisser"><span class="faitGlisserTBB">Tableau de bord</span><span class="faitGlisserArc">Candidatures terminées</span><br />(vous pouvez faire glisser vos candidatures d'une colonne à l'autre)</div>

</div>