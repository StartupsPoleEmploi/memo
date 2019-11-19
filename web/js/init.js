var lBR = new leBonRythme();

$(document).ready(function(){

    $.ajaxSetup({ cache: false });

    lBR.init();

    if(window.parent === window.self)   // pour empêcher de charger les actions ci-dessous dans la frame de tentative de cnx  si l'utilisateur a une session PE ouverte
    {
        if (memoVars.uLI)
            lBR.initBoard();

        if (memoVars.isVisitor)

            lBR.buildVisitorDisplay();
        	lBR.buildConseillerDisplay();
    }

});