import introJs from 'intro.js';
import $ from 'jquery';
import { MEMO, userStore } from '../index.js';
import moment from 'moment';
import { Constantes as CS } from '../constantes.js';

// mets à jour les columnOrders en fonction de l'état d'une candidature
export function reorderColumnsFromCandidatureChange(user,c)
{
    const newColumnName = "column-"+(c.archived?"archive":"active")+"-"+c.etat;
    let filteredNewColumnName = "";
    
    if(MEMO.dashboardFilters)
        filteredNewColumnName = newColumnName+'-filtered';
        
    // si la candidature n'est pas déjà dans la bonne colonne
    if(user.columnOrder[newColumnName].indexOf(c.id)<0)
    {
        for(let k in user.columnOrder)
        {
            if(k===newColumnName)
            {
                //console.log("insertion nouvelle colonne ",k);
                user.columnOrder[k].unshift(c.id);    // insère la candidature en tête de colonne complète
            }
            else if(k===filteredNewColumnName)
            {
                user.columnOrder[k].unshift(c.id);    // insère la candidature en tête de colonne filtered
            }
            else
            {
                if(user.columnOrder[k].indexOf(c.id)>=0)  // si la candidature est dans la colonne on le retire
                {
                    //console.log("suppression depuis colonne ",k);
                    user.columnOrder[k].splice(user.columnOrder[k].indexOf(c.id),1);
                }
            }
        }
    }
    /*else
        console.log("pas de changement de colonne");*/
    
}

// mets à jour les columnOrders suite à une suppression de candidature
export function reorderColumnsFromCandidatureRemoval(user,c)
{
    const oldColumnName = "column-archive-"+c.etat;

    //console.log("suppression depuis colonne ",oldColumnName);
    user.columnOrder[oldColumnName].splice(user.columnOrder[oldColumnName].indexOf(c.id),1);

    if(MEMO.dashboardFilters)
        user.columnOrder[oldColumnName+"-filtered"].splice(user.columnOrder[oldColumnName+"-filtered"].indexOf(c.id),1);
}


// lancement du welcome tour
export function startTour()
{
    window.introJs = introJs();
        
    // les étapes du welcome tour
    const steps = [
        {
            intro: "<div class='welcomeTourTitle'>Avec MEMO importez vos offres d'emploi depuis n'importe quel site</div><div class='introImgOffice'><img class='importMemoOffice' src='./pic/onboarding/importsMemo_office.png' alt='Importez dans MEMO depuis tous les sites' /></div>"
        },
        {
            element: ".quickImportField",
            intro: "<div class='welcomeTourText'>Collez le lien de l'offre d'emploi (url) ici, puis cliquez sur \"Importer\".</div>"
        },
        {
            element: ".brouillon .newCandidatureButton",
            intro: "<div class='welcomeTourTitle'>MEMO regroupe toutes vos démarches</div><div class='welcomeTourText'>Utilisez les boutons <strong style='color:#000'>+ Ajouter une candidature</strong> pour les ajouter</div>",
            position: 'bottom'
        },
        {
            element: ".headerMenuBt",
            intro: "<div class='welcomeTourText'>D'autres actions vous attendent,<br />découvrez-les dans le menu !</div>"
        }
    ];

    // suppression de la deuxième étape lorsque la taille de l'écran fait que le champ mis en avant n'est pas affiché
    if($(window).width()<=780)
        steps.splice(1,1);

    // fixation des optins dont les étapes
    window.introJs.setOptions(
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

    // déclenchement du welcome tour
    window.introJs.start();
}

// @RG - CONSEIL : Détermination des conditions d'affichage des incitations à créer des fiches réseau (pas plus de 1 carte réseau active, au moins 8 candidatures actives ou archivées)
export function isConseilReseauRequired()
{
    let cs = MEMO.user.candidatures, res=true, reseauCt = 0, total = 0;
    for(let k in cs)
    {
        total++;
        if(cs[k] && cs[k].type==CS.TYPES_CANDIDATURE.RESEAU && !cs[k].archived)
        {
            reseauCt++;
        }

        if(reseauCt>1)
        {
            res=false;
            break;
        }
    }

    if(total<8)
        res = false;

    /*console.log("isConseilReseauRequired : ",res,reseauCt);

    res  = true;*/
    return res;
}

// détermine si les conditions d'affichage de la modale d'incitation à faire des démarches réseau sont réunies
export function shouldShowConseilReseau()
{
    let lastNudgeReseauDisplay = localStorage.getItem("lastNudgeReseauDisplay");
    lastNudgeReseauDisplay = lastNudgeReseauDisplay?new moment(eval(lastNudgeReseauDisplay)):null;

    const doNotShowNudgeReseau = localStorage.getItem("doNotShowNudgeReseau");

    let res = false;

    // @RG - CONSEIL : Affichage de la modale d'incitation à créer des fiches réseau si l'état des cartes le justifie ET l'utilisateur n'a pas demandé à ne plus voir ce conseil, et l'utilisateur n'a pas vu cette modale depuis plus de 9 jours
    if(!doNotShowNudgeReseau && (!lastNudgeReseauDisplay || new moment().diff(lastNudgeReseauDisplay,'days')>9) && isConseilReseauRequired())
    {
        localStorage.setItem("lastNudgeReseauDisplay", new Date().getTime());
        res = true;
    }
        
    //console.log("shouldShowConseilResau : ",doNotShowNudgeReseau,lastNudgeReseauDisplay,res);

    return res;
}

// détermine si les conditions d'affichage du welcome tour sont remplies
export function shouldShowWelcomeTour(isVisitor)
{
    //console.log("----- isVisitor ",isVisitor," ---- width ",$(window).width()," ---- LS ",localStorage.getItem("memoWelcomeTourShown")," ----- Cands ",Object.keys(MEMO.user.candidatures).length);

    // @RG Condition d'affichage du welcoming tour. si moins de 2 cartes dans le TDB actif 
    // et Largeur de l'écran supérieure à 320px, le welcomeTour n'a pas déjà été affiché et on est pas en mode visiteur
    if(  !isVisitor && 
        $(window).width() >= 320 && 
        !localStorage.getItem("memoWelcomeTourShown") && 
        Object.keys(MEMO.user.candidatures).length<2  )
        return true;
    else   
        return false;
}