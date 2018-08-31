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

        // NomCandidature
        el = cont.find("h1");
        if (el && el.length)
            c.nomCandidature = el[0].innerHTML;

        // NomSociete
        el = cont.find("section>h3>span");
        if (el && el.length)
            c.nomSociete = el.text().trim();

        // Description
        tmp = cont.find("section");
        if(tmp.find(".company-links")) {
        	// retrait du bloc d'autres offres
        	tmp.find(".company-links").remove();
        }
        for (var i = 0, l = tmp.length; i < (l - 1); ++i) {
        	el = tmp[i].innerHTML.trim();
            v += el;
        }
        c.description = v;

        // Logo
        tmp = cont.find(".logo>a>span>img");
        if (tmp.length > 0)
            c.logoUrl = "https://www.meteojob.com" + tmp.attr("src");

        // Email
        if (c.description) {
	        // tentative d'extraction d'email contact dans description -> chercher @
	        c.emailContact = getEmailInText(c.description);
        }
        
        return c;
    }
}