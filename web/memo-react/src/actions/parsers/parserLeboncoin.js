import Candidature from '../../classes/candidature';
import { getEmailInText, $rBR } from '../../components/utils';
import $ from 'jquery';

class ParserLeBonCoin {

    logo = "leboncoin.png";
    name = "Leboncoin";

    //@RG - IMPORT : Les données importées des offres de LEBONCOIN sont obligatoirement nomCandidature et descrition et si possible nomSociete, ville, emailContact issues de page HTML.
    parse = html => {
        window.gtag('event', 'import', { event_category: 'Candidature', event_label: this.name });     

        var t = this,
            c = new Candidature(),
            cont = document.createElement("div"),
            el, v;

        cont.innerHTML = html;
        cont = $(cont);
        window.debugCont = cont;

        c.jobBoard = this.name;

        // récupération du nomCandidature dans h1
        el = cont.find("h1").html();
        if (el)
            c.nomCandidature = el.trim();
        else
            c.nomCandidature = "Candidature Leboncoin";


        // récupération de description dans [data-qa-id=adview_description_container] span
        v = cont.find("[data-qa-id=adview_description_container] span").html();
        v = $rBR(v);

        // tentative d'extraction d'email contact dans description -> chercher @
        c.emailContact = getEmailInText(v);

        c.ville = cont.find("[data-qa-id=adview_location_informations] span").text();

        // suite description :
        v += "\n\n";

        var rt = "[data-qa-id=", key;

        key = rt+"criteria_item_custom_ref]";
        if(cont.find(key).length>0)
            v += cont.find(key+" div div:nth-child(1)").text()+" : "+cont.find(key+" div div:nth-child(2)").text()+"\n";

        key = rt+"criteria_item_jobcontract]";
        if(cont.find(key).length>0)
            v += cont.find(key+" div div:nth-child(1)").text()+" : "+cont.find(key+" div div:nth-child(2)").text()+"\n";

        key = rt+"criteria_item_jobfield]";
        if(cont.find(key).length>0)
            v += cont.find(key+" div div:nth-child(1)").text()+" : "+cont.find(key+" div div:nth-child(2)").text()+"\n";

        key = rt+"criteria_item_jobduty]";
        if(cont.find(key).length>0)
            v += cont.find(key+" div div:nth-child(1)").text()+" : "+cont.find(key+" div div:nth-child(2)").text()+"\n";

        key = rt+"criteria_item_jobexp]";
        if(cont.find(key).length>0)
            v += cont.find(key+" div div:nth-child(1)").text()+" : "+cont.find(key+" div div:nth-child(2)").text()+"\n";

        key = rt+"criteria_item_jobtime]";
        if(cont.find(key).length>0)
            v += cont.find(key+" div div:nth-child(1)").text()+" : "+cont.find(key+" div div:nth-child(2)").text()+"\n";

        // entreprise
        try // 2 formats de représentation de l'entreprise. cas d'un block "storebox" ou cas d'un bloc moins identifié
        {
            if(cont.find("[data-qa-id=adview_contact_container] [data-qa-id=storebox_container]").length>0)
            {
                // logo
                if (cont.find("[data-qa-id=storebox_logo] img").length > 0)
                    c.logoUrl = cont.find("[data-qa-id=storebox_logo] img").attr("src");

                c.nomSociete = cont.find("[data-qa-id=storebox_title]").text();

                let val = cont.find("[data-qa-id=storebox_siren]").text();

                if (val)
                    c.numSiret = val.substring(val.indexOf("SIREN") + 5).trim();

                v += "Adresse : "+cont.find("[data-qa-id=storebox_address]").text();
            }
            else
            {
                // logo
                if (cont.find("[data-qa-id=adview_sticky_image] img").length > 0)
                    c.logoUrl = cont.find("[data-qa-id=adview_sticky_image] img").attr("src");

                c.nomSociete = cont.find("[data-qa-id=adview_contact_container] div:nth-child(1) div:nth-child(2) div:nth-child(1)").text();

                let val = cont.find("[data-qa-id=adview_contact_container] div:nth-child(1) div:nth-child(2) div:nth-child(2)").text();

                if (val)
                    c.numSiret = val.substring(val.indexOf("SIREN") + 5).trim();
            }
        }
        catch(err){  }

        c.description = v;

        return c;
    }
}

export default ParserLeBonCoin;