import Candidature from '../../classes/candidature';
import { getEmailInText, $sc, $rBR, $rP, $rNBSP } from '../../components/utils';
import $ from 'jquery';

class ParserVivastreet {

    logo = "vivastreet.png";
    name = "Vivastreet";

    //@RG - IMPORT : Les données importées des offres de VIVASTREET sont obligatoirement nomCandidature et descrition et si possible nomSociete, ville, emailContact, logoUrl issues de page HTML.
    parse = html => {
        window.gtag('event', 'import', { event_category: 'Candidature', event_label: this.name });     

        var t = this,
            c = new Candidature(),
            cont = document.createElement("div"),
            el, v, tmp, k, v1;

        cont.innerHTML = $sc(html);
        cont = $(cont);
        window.debugCont = cont;

        c.jobBoard = this.name;

        // description id
        v = cont.find(".shortdescription").html();
        v = $rBR(v);
        v = $rP(v);
        v = $rNBSP(v);

        c.description = v;

        c.emailContact = getEmailInText(v);

        // nomCandidature
        el = cont.find("h1");
        if (el.length > 0) {
            c.nomCandidature = el.html().trim();
            tmp = cont.find(".kiwii-width-full.kiwii-padding-top-xxsmall.kiwii-clear-both td");
        }
        else {
            c.nomCandidature = cont.find(".kiwii-font-xlarge.kiwii-font-weight-bold > div").html().trim();
            tmp = cont.find(".spec-block td");
        }

        v = "";
        for (var i = 0; i < tmp.length; i = i + 2) {
            k = tmp[i].innerHTML.trim();
            v1 = tmp[i + 1].innerHTML.trim();

            if (k == "Ville/Code postal") {
                v1 = $rBR(tmp.find("div").html(), ", ");
                c.ville = v1
            }
            else if (k == "Raison sociale")
                c.nomSociete = v1;

            if (i > 0)
                v += "\n";
            v += k + " : " + v1;
        }

        c.description += "\n\n" + v;

        el = cont.find(".vs-detail-logo");
        if (el.length > 0)
            c.logoUrl = el[0].src;

        return c;
    }
}

export default ParserVivastreet;