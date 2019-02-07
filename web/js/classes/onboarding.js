function Onboarding(board)
{
    this.init(board);
}

// gère l'affichage des activités en ligne
Onboarding.prototype = {

    board: null,

    init : function (board) {
        var t=this;
        t.board = board;
    },

    /*openMenuForWelcomeTour : function()
     {
     if(!$(".dropdown-menu-v2").parent().hasClass("open"))
     $(".dropdown-menu-v2").dropdown("toggle");
     },*/

    /*closeMenuFromWelcomeTour : function()
     {
     if($(".dropdown-menu-v2").parent().hasClass("open"))
     $(".dropdown-menu-v2").dropdown("toggle");
     },*/

    /*showMenuForWelcomeTour : function()
     {
     lBR.onboarding.openMenuForWelcomeTour();
     },*/

    showBurgerForWelcomeTour : function()
    {
        $(".introjs-helperLayer").html('<div class="btn-group-img btn-group menuMargin">' +
            $(".menuMargin").clone().html()+
            '</div>');
    },

    showAddButtonForWelcomeTour : function()
    {
        $(".introjs-helperLayer").html($(".boutonCandidature").clone().html());
    },

    showQuickImportForWelcomeTour : function()
    {
        $(".introjs-helperLayer").html("<div class='quickImportDiv'>"+$("#quickImportDiv").clone().html()+"</div>");
    },

    welcomeTourBeforeChange : function(el)
    {
        if(el.className && el.className.indexOf('menuMargin')>=0)
            lBR.onboarding.showBurgerForWelcomeTour();
        else if(el.className && el.className.indexOf('btnHeaderText')>=0)
            lBR.onboarding.showAddButtonForWelcomeTour();
        else if(el.id=="quickImportDiv")
            lBR.onboarding.showQuickImportForWelcomeTour();
        else
            lBR.onboarding.cleanIntroJSHelper();
    },

    welcomeTourExit : function(el)
    {
        //lBR.onboarding.closeMenuFromWelcomeTour();
        lBR.onboarding.cleanIntroJSHelper();
        localStorage.setItem("memoWelcomeTourShown",1);

        if(lBR.onboarding.consentToBeRestored)
        {
            lBR.privacy.showBannerNoAnimation();
            lBR.onboarding.consentToBeRestored = 0;
        }
    },

    cleanIntroJSHelper : function()
    {
        $(".introjs-helperLayer").html("");
    },

    // hack de repositionnement des fenêtres intro.js qui parfois se positionnent mal
    refresh : function()
    {
        try
        {
            setTimeout(function(){
                lBR.onboarding.introJs.refresh();   // rafraichissement du positionnement une fois que toutes les assets sont affichées pour que le calcul de position soit mieux fait par intro.js

                setTimeout(function() { // hack de positionnement dans les cas où introjs pétzouille
                    var el = $(".introjs-tooltip")[0], bCR, y, mT, x, w, sW, mL;

                    if(el) {
                        bCR = el.getBoundingClientRect();
                        y = bCR.top;
                        mT = el.style.marginTop;
                        x = bCR.x;
                        w = bCR.width;
                        sW = window.innerWidth;
                        mL = parseInt(el.style.marginLeft);

                        if (y < 0)  // si débordement vers le haut on force à 50px de marge top positive
                            el.style.marginTop = "50px";

                        if((x+w)>sW)    // si débordement sur la gauche on recentre. 20 est arbitraire un recentrage complet serait approprié
                            el.style.marginLeft = (20+mL-(x+w-sW))+"px";
                    }

                    if(memoVars.user && memoVars.user.firstName)
                        $("#introUserName").html("Bonjour "+memoVars.user.firstName+",<br />").fadeIn("slow");

                },350);
            },50);
        }
        catch(err){/* erreur non bloquante */}
    },

    startWelcomingTour : function()
    {
        var show = !localStorage.getItem("memoWelcomeTourShown"),
            sW = $(window).width(),
            eltSelector = "#quickImportDiv";

        // @RG Condition d'affichage du welcoming tour. Largeur de l'écran supérieure à 320px, on est sur l'affichage du tableau de bord, le welcomeTour n'a pas déjà été affiché et on est pas en mode visiteur
        if(!memoVars.isVisitor && sW >= 320 && show && lBR.currentPage=="boardPage")
        {
            if(lBR.privacy.isBannerVisible)
            {
                lBR.onboarding.consentToBeRestored = 1;
                setTimeout(function(){lBR.privacy.hideBannerNoAnimation();},1000);
            }

            this.introJs = new introJs();

            this.introJs.onbeforechange(lBR.onboarding.welcomeTourBeforeChange);
            this.introJs.onchange(lBR.onboarding.refresh);
            this.introJs.onexit(lBR.onboarding.welcomeTourExit);
            this.introJs.onskip(function () {
            });

            var steps = [
                {
                    intro: "<div class='welcomeTourTitle'><span id='introUserName' style='display:none'></span>Avec MEMO importez vos offres d'emploi depuis n'importe quel site</div><div class='introImgOffice'><img class='importMemoOffice' src='./pic/onboarding/importsMemo_office.png' alt='Importez dans MEMO depuis tous les sites' ></div>"
                },
                {
                    element: "#quickImportDiv",
                    intro: "<div class='welcomeTourText'>Collez le lien de l'offre d'emploi (url) ici, puis cliquez sur \"Importer\".</div>"
                },
                {
                    element: ".btn.btn-md.btnHeaderText",
                    intro: "<div class='welcomeTourTitle'>MEMO regroupe toutes vos démarches</div><div class='welcomeTourText'>Utilisez le bouton <strong style='color:#000'>+</strong> pour les ajouter</div><div class='introImgBoard'><img class='importMemoBoard' src='./pic/onboarding/importsMemo_board.png' alt='Enregistrez vos démarches' ></div>"
                },
                {
                    element: ".menuMargin",
                    intro: "<div class='welcomeTourText'>D'autres actions vous attendent,<br />découvrez-les dans le menu !<span class='introYouTube'><br /><br />Besoin d'aide ?<br />Regardez notre vidéo de démonstration : </span></div><div class='youtubeBg' onclick='javascript:window.open(\"https://www.youtube.com/watch?v=Cr-hCaqO298\",\"memoYouTube\");'></div>"
                }
            ];

            if(sW<=780)
            {
                steps.splice(1,1);
                eltSelector = ".btn.btn-md.btnHeaderText";
            }

            this.introJs.setOptions(
                {
                    steps: steps,
                    showBullets: false,
                    showStepNumbers: false,
                    tooltipPosition: "top",
                    showBullets : true,
                    hidePrev : true,
                    hideNext : true,
                    nextLabel : "Suivant",
                    prevLabel : "Précédent",
                    doneLabel : "Fermer"
                }
            );

            this.introJs.start();
        }
    },

    resetOnboarding : function()
    {
        localStorage.removeItem("memoWelcomeTourShown");
    }


}

