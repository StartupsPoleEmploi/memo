function ParserKeljob()
{
    //console.log("instantiate Keljob Parser");
}

ParserKeljob.prototype = {

    logo: "keljob.png",
    name: "Keljob",

    //@RG - IMPORT : Les données importées des offres de KELJOB sont obligatoirement nomCandidature et descrition et si possible nomSociete, ville, emailContact, logoUrl issues de page HTML.
    parse : function (html) {
        ga('send', {hitType: 'event', eventCategory: 'Candidature', eventAction: 'import', eventLabel: this.name });

        var t = this,
            c = new Candidature(),
            cont = document.createElement("div"),
            el, v, tmp;

        cont.innerHTML = html;
        cont = $(cont);
        debugCont = cont;

        c.jobBoard = this.name;

        // récupération du nomCandidature
        el = cont.find("h1");
        if (el && el.length)
            c.nomCandidature = el[0].innerHTML;
        else
            c.nomCandidature = "Candidature Keljob";

        c.nomSociete = $(cont.find("ul.side-bar > li")[4]).text().trim();

        // le lieu comporte de multiples espaces inutiles parfois sous forme &nbsp;
        tmp = $(cont.find("ul.side-bar > li")[2]).text().trim();
        tmp = tmp.replace(/[\r\n]/g, "").trim();
        tmp = tmp.split(" ");

        v = "";
        for (var i = 0; i < tmp.length; ++i)
            v += tmp[i] ? tmp[i].trim() + " " : "";

        //f.ville.setValue(v.trim());
        c.ville = v.trim();
        if (c.ville.startsWith("Voir les localisations"))
            c.ville = c.ville.substring(23);

        // logo
        v = "";
        el = cont.find("ul.side-bar > li:nth-child(6) > img");

        if (el.length > 0)
            c.logoUrl = el[0].src;

        // récupération de description dans [itemprop=description] -> nettoyer les br
        tmp = cont.find(".job-paragraph");

        if ($(tmp[0]).html())
            v += "Entreprise : " + $rP($(tmp[0]).html().trim()) + "\n\n";
        if ($(tmp[1]).html())
            v += "Poste : " + $rP($(tmp[1]).html().trim()) + "\n\n";
        if ($(tmp[2]).html())
            v += "Profil : " + $rP($(tmp[2]).html().trim()) + "\n\n";

        // tentative d'extraction d'email contact dans description -> chercher @
        c.emailContact = getEmailInText(v);

        //f.description.val(v);
        c.description = v;

        return c;
    }
}