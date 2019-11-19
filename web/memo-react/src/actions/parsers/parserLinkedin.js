import Candidature from '../../classes/candidature';
import $ from 'jquery';

class ParserLinkedIn {

    logo = "linkedin.png";
    name = "LinkedIn";

    //@RG - IMPORT : Les données importées des offres de LINKEDIN sont obligatoirement nomCandidature et descrition et si possible nomSociete, ville, nomContact, logoUrl issues de page HTML.
    parse = html => {
        window.gtag('event', 'import', { event_category: 'Candidature', event_label: this.name });     

        var t = this,
            c = new Candidature(),
            cont = document.createElement("div"),
            el, v, tmp;

        cont.innerHTML = html;
        cont = $(cont);
        window.debugCont = cont;

        c.jobBoard = this.name;

        // récupération du nomCandidature dans h1
        c.nomCandidature = cont.find("h1").text().trim();
        c.nomSociete = cont.find(".company").text().trim();
        c.ville = cont.find("[itemprop=addressLocality]").text().trim();

        c.description = cont.find("[itemprop=description]").text().trim();

        return c;
    }
}

export default ParserLinkedIn;