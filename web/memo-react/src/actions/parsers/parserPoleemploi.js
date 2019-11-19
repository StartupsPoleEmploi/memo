import Candidature from '../../classes/candidature';
import $ from 'jquery';

class ParserPoleEmploi {

    logo = "poleemploi.png";
    name = "Pôle Emploi";

    //@RG - IMPORT : Les données importées des offres de POLE EMPLOI sont obligatoirement nomCandidature et descrition et si possible nomSociete, ville, nomContact, emailContact, telContact, logoUrl issues de page HTML.
    parse = html => {
        window.gtag('event', 'import', { event_category: 'Candidature', event_label: this.name });     

        var t = this,
            c = new Candidature(),
            cont = document.createElement("div"),
            el, v, nC;

        cont.innerHTML = html;
        cont = $(cont);
        window.debugCont = cont;

        c.jobBoard = this.name;

        // Titre
        el = cont.find(".t2.title");
        if (el && el.length > 0)
            c.nomCandidature = el[0].innerText;
        else
            c.nomCandidature = "Candidature Pole Emploi";

        // Lieu
        el = cont.find(".t4.title-complementary");
        if (el.length > 0)
        {
            c.ville = el[0].innerText;
            v = c.ville.indexOf("Localiser avec Mappy");
            if(v>=0)
                c.ville = c.ville.substring(0, v-3).trim();
        }

        // Nom société
        el = cont.find(".media-body>h4.t4.title");
        if (el.length > 0)
            c.nomSociete = el[0].innerText;

        // Nom et Email contact
        el = cont.find(".modal-apply>div.apply-block>dl>dd");
        if (el.length > 0) {
            nC = el[0].innerText;
            if (nC.indexOf("Courriel") >= 0)
                nC = el[0].innerText.substring(0, el[0].innerText.indexOf("Courriel"));
            c.nomContact = nC;
        }
        if (el.length > 1) {
            if (el[1].hasChildNodes()) {
                if (el[1].children[0].getAttribute("href").indexOf('mailto') >= 0)
                    c.emailContact = el[1].children[0].innerText;
                else if (el[1].children[0].getAttribute("href").indexOf('tel') >= 0)
                    c.telContact = el[1].children[0].innerText;
            }
        }

        // Description
        el = cont.find(".description");
        if (el.length > 0)
            c.description = el[0].innerText;

        el = cont.find(".description-aside>dl>dd");
        if (el.length > 0) {
            for (var i = 0; i < el.length; ++i) {
                c.description += "\n" + el[i].innerText;
            }
        }

        el = cont.find(".skill-list>li>span>span");
        if (el.length > 0) {
            c.description += "\n PROFIL SOUHAITÉ : \n"
            for (var i = 0; i < el.length; ++i) {
                c.description += "\n" + el[i].innerText;
            }
        }

        el = cont.find(".media img");
        if (el.length > 0)
            c.logoUrl = el[0].src;

        return c;
    }
}

export default ParserPoleEmploi;