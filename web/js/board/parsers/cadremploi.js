function ParserCadremploi()
{
    //console.log("instantiate Cadremploi Parser");
}

ParserCadremploi.prototype = {

    logo: "cadremploi.png",
    name: "Cadremploi",

    //@RG - IMPORT : Les données importées des offres de CADREMPLOI sont obligatoirement nomCandidature et descrition et si possible nomSociete, ville, nomContact, emailContact, telContact, logoUrl issues de page HTML.
    parse: function (html) {

        ga('send', { hitType : 'event', eventCategory : 'Candidature', eventAction : 'import', eventLabel : this.name });

        var t = this,
            c = new Candidature(),
            cont = document.createElement("div"),
            el, v="", tmp;

        cont.innerHTML = html.replace(/\u0092/g,"'").replace(/\u0080/g,'€');
        cont = $(cont);
        debugCont = cont;

        c.jobBoard = this.name;

        // récupération du nomCandidature dans h1
        //f.nomCandidature.setValue(cont.find("[itemprop=title]").text().trim());
        c.nomCandidature = cont.find("span[itemprop=title]").text().trim();

        // récupération nomSociete dans [itemprop=hiringOrganization]>span
        //f.nomSociete.setValue(cont.find("span[itemprop=hiringOrganization]").text().trim());
        tmp = cont.find("[itemprop=hiringOrganization]");
        if (tmp.length > 0) {
            // Il arrive que cette propriété apparaissent 2 fois ds le DOM
            c.nomSociete = tmp[0].textContent.trim();
        } else {
            c.nomSociete = tmp.text().trim();
        }

        //f.ville.setValue(cont.find("[itemprop=jobLocation] > a").text().trim());
        c.ville = cont.find("[itemprop=jobLocation] a").text().trim();

        el = cont.find(".logo img");
        if(el.length>0)
            c.logoUrl = el[0].src;

        tmp = cont.find(".desc__p");

        if($(tmp[1]).html())
            v += "POSTE : "+$rBR($(tmp[1]).html().trim());
        if($(tmp[2]).html())
            v+= "\n\nPROFIL : "+$rBR($(tmp[2]).html().trim());
        if($(tmp[0]).html())
            v+= "\n\nENTREPRISE : "+$rBR($(tmp[0]).html().trim());

        //f.description.val(v);
        c.description = v;

        return c;

    }


}