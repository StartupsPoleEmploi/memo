import Candidature from '../../classes/candidature';
import { $rBR } from '../../components/utils';
import $ from 'jquery';

class ParserCadremploi {

    logo = "cadremploi.png";
    name = "Cadremploi";

    //@RG - IMPORT : Les données importées des offres de CADREMPLOI sont obligatoirement nomCandidature et descrition et si possible nomSociete, ville, nomContact, emailContact, telContact, logoUrl issues de page HTML.
    parse = html => {

        window.gtag('event', 'import', { event_category: 'Candidature', event_label: this.name });     

        var t = this,
            c = new Candidature(),
            cont = document.createElement("div"),
            el, v="", tmp;

        cont.innerHTML = html.replace(/\u0092/g,"'").replace(/\u0080/g,'€');
        cont = $(cont);
        window.debugCont = cont;

        c.jobBoard = this.name;

        // récupération du nomCandidature dans h1.position

        c.nomCandidature = cont.find(".titre-offre").contents()[0].data.trim();

        // récupération nomSociete dans <a id="js-offres-entreprise"...
        tmp = cont.find("#js-offres-entreprise");
        if (tmp.length > 0)
            c.nomSociete = tmp.text().trim();

        c.ville = cont.find("#js-offres-localisation").html().trim();

        el = cont.find("#js-logo-entreprise img");
        if(el.length>0)
            c.logoUrl = el[0].src;

        tmp = cont.find(".desc__p");

        if($(tmp[1]).html())
            v += "POSTE : "+$rBR($(tmp[1]).html().trim());
        if($(tmp[2]).html())
            v+= "\n\nPROFIL : "+$rBR($(tmp[2]).html().trim());
        if($(tmp[0]).html())
            v+= "\n\nENTREPRISE : "+$rBR($(tmp[0]).html().trim());


        if(v.indexOf("<p>Localisation")>=0)
        {
            tmp = v.substr(0, v.indexOf("<p>Localisation")).trim();
            tmp += "\n\n"+(v.substr(v.lastIndexOf("</div>")+6)).trim();
            v = tmp;
        }

        //f.description.val(v);
        c.description = v;

        return c;

    }


}

export default ParserCadremploi;