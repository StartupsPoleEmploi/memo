function ParserMeteoJob()
{
    //console.log("instantiate Meteojob Parser");
}

ParserMeteoJob.prototype = {

    logo: "meteojob.png",
    name: "MeteoJob",

    //@RG - IMPORT : Les données importées des offres de METEOJOB sont obligatoirement nomCandidature et descrition et si possible nomSociete, ville, logoUrl issues de page HTML.
    parse : function (html) {
        ga('send', {hitType: 'event', eventCategory: 'Candidature', eventAction: 'import', eventLabel: this.name });

        var t = this,
            c = new Candidature(),
            cont = document.createElement("div"),
            el, v = "", tmp;

        cont.innerHTML = html;
        cont = $(cont);
        debugCont = cont;

        c.jobBoard = this.name;

        c.nomCandidature = cont.find("[itemprop=title]").text().trim();

        c.nomSociete = cont.find("[itemprop=name]").text().trim();

        c.ville = cont.find("[itemprop=addressLocality]").text().trim();

        tmp = cont.find("section");
        for (var i = 0, l = tmp.length; i < (l - 1); ++i) {

            el = tmp[i].innerHTML.trim();

            if (el.indexOf("<ul class=\"links-list mtop-md nombot") >= 0)
                el = el.substring(0, el.indexOf("<ul class=\"links-list mtop-md nombot")) + "</div>";
            v += el;
        }
        c.description = v;

        tmp = cont.find("[itemProp=contentUrl]");
        if (tmp.length > 0)
            c.logoUrl = "https://www.meteojob.com" + tmp.attr("src");

        return c;
    }
}