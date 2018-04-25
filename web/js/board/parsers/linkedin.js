function ParserLinkedIn()
{
    //console.log("instantiate LinkedIn Parser");
}

ParserLinkedIn.prototype = {

    logo: "linkedin.png",
    name: "LinkedIn",

    //@RG - IMPORT : Les données importées des offres de LINKEDIN sont obligatoirement nomCandidature et descrition et si possible nomSociete, ville, nomContact, logoUrl issues de page HTML.
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

        // récupération du nomCandidature dans h1
        c.nomCandidature = cont.find("h1").text().trim();
        c.nomSociete = cont.find(".company").text().trim();
        c.ville = cont.find("[itemprop=addressLocality]").text().trim();

        c.description = cont.find("[itemprop=description]").text().trim();

        return c;
    }
}