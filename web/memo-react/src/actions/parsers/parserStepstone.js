import Candidature from '../../classes/candidature';
import { getEmailInText, $rRN } from '../../components/utils';
import $ from 'jquery';

class ParserStepStone {

    constructor(subParser)
    {
        if(subParser=="stepstone")
        {
            this.logo = "stepstone.png";
            this.name = "StepStone";
        }
        else if(subParser=="marketvente")
        {
            this.logo = "marketvente.png";
            this.name = "Marketvente.fr";
        }
    }
    
    //@RG - IMPORT : Les données importées des offres de STEPSTONE sont obligatoirement nomCandidature et descrition et si possible nomSociete, ville, emailContact, logoUrl issues de page HTML.
    parse = html => {
        window.gtag('event', 'import', { event_category: 'Candidature', event_label: this.name });     

        var c = new Candidature(),
            cont = document.createElement("div"),
            el, v, tmp;

        cont.innerHTML = html;
        cont = $(cont);
        window.debugCont = cont;

        c.jobBoard = this.name;

        c.nomCandidature = cont.find("h1.listing__job-title").text().trim();
        c.nomSociete = cont.find(".listing__company-name").text().trim();

        c.ville = cont.find(".listing__top-info li").first().text().trim()

        tmp = "";
        if(cont.find("#company-intro").length>0)
        {   // format description d'un bloc

            tmp += cont.find("#company-intro").html();
            tmp += cont.find("#job-tasks").html();
            tmp += cont.find("#job-requim").html();
            tmp += cont.find("#company-weoffer").html();

            // logo
            if(cont.find(".topLogo img").length>0)
                c.logoUrl = "http://www.stepstone.fr"+cont.find(".topLogo img").attr("src");
        }
        else
        {   // format description avec des pavés séparés verticalement
            var cards = cont.find(".offer__content .offer__section .card__body");

            for (var i = 0; i < cards.length; ++i) {
                tmp += $(cards[i]).html();
            }

            // logo
            try
            {
                v = window.debugCont.find(".listing__profile-logo-image")[0].style.backgroundImage;
                c.logoUrl = "http://www.stepstone.fr"+v.substring(5, v.length-2);
            }catch(err){}

        }
        c.description = $rRN(tmp);

        // tentative d'extraction d'email contact dans description -> chercher @
        c.emailContact = getEmailInText(c.description);

        return c;
    }
}

export default ParserStepStone;