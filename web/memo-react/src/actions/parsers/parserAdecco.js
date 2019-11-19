import Candidature from '../../classes/candidature';
import { getEmailInText } from '../../components/utils';
import $ from 'jquery';

class ParserAdecco {

    logo = "adecco.png";
    name = "Adecco";

    //@RG - IMPORT : Les données importées des offres de ADECCO sont obligatoirement nomCandidature et descrition et si possible nomSociete, ville, logoUrl issues de page HTML.
    parse = html =>  {
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
        
        // Ville
        el = cont.find("#lblCity");
        if (el && el.length)
            c.ville = el.text().trim();

        // Description
        el = cont.find(".VacancyDescription>p");
        if(el.length > 0) {
        	c.description = el.html();
        }

        // Email
        if (c.description) {
	        // tentative d'extraction d'email contact dans description -> chercher @
	        c.emailContact = getEmailInText(c.description);
        }
        
        return c;
    }
}

export default ParserAdecco;