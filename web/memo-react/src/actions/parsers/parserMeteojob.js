import Candidature from '../../classes/candidature';
import { getEmailInText } from '../../components/utils';
import $ from 'jquery';

class ParserMeteoJob {

    logo = "meteojob.png";
    name = "MeteoJob";

    //@RG - IMPORT : Les données importées des offres de METEOJOB sont obligatoirement nomCandidature et descrition et si possible nomSociete, ville, logoUrl issues de page HTML.
    parse = html => {
        window.gtag('event', 'import', { event_category: 'Candidature', event_label: this.name });     

        var t = this,
            c = new Candidature(),
            cont = document.createElement("div"),
            el, v = "", tmp;

        cont.innerHTML = html;
        cont = $(cont);
        window.debugCont = cont;

        c.jobBoard = this.name;

        // NomCandidature
        el = cont.find("h1");
        if (el && el.length)
            c.nomCandidature = el[0].innerHTML;

        // NomSociete
        el = cont.find("section>h3>span");
        if (el && el.length)
            c.nomSociete = el.text().trim();

        // Description
        tmp = cont.find("section");
        if(tmp.find(".company-links")) {
        	// retrait du bloc d'autres offres
        	tmp.find(".company-links").remove();
        }
        for (var i = 0, l = tmp.length; i < (l - 1); ++i) {
        	el = tmp[i].innerHTML.trim();
            v += el;
        }
        c.description = v;

        // Logo
        tmp = cont.find(".logo>a>span>img");
        if (tmp.length > 0)
            c.logoUrl = "https://www.meteojob.com" + tmp.attr("src");

        // Email
        if (c.description) {
	        // tentative d'extraction d'email contact dans description -> chercher @
	        c.emailContact = getEmailInText(c.description);
        }
        
        return c;
    }
}

export default ParserMeteoJob;