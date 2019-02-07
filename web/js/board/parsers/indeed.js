function ParserIndeed()
{
    //console.log("instantiate Indeed Parser");
}

ParserIndeed.prototype = {

    logo: "indeed.png",
    name: "Indeed",

    //@RG - IMPORT : Les données importées des offres de INDEED sont obligatoirement nomCandidature et descrition et si possible nomSociete, ville, emailContact, logoUrl issues de page HTML.
    parse: function (html) {
        ga('send', {hitType: 'event', eventCategory: 'Candidature', eventAction: 'import', eventLabel: this.name });

        var t = this,
            c = new Candidature(),
            cont = document.createElement("div"),
            el, v, tmp;

        cont.innerHTML = $sc(html);
        cont = $(cont);
        debugCont = cont;

        c.jobBoard = this.name;

        tmp = cont.find("[size]");

        c.nomCandidature = tmp.html();
        c.ville = cont.find(".location").html();

        c.description = cont.find("#desc").html();
        if(!c.description)
            c.description = cont.find("#job_summary").html();

        c.emailContact = getEmailInText(c.description);

        tmp = cont.find(".company");
        if(tmp.length>0)
            c.nomSociete = tmp[0].innerText;
        else
        {
            tmp = cont.find(".location").parent().clone().children().remove().end().text().trim();
            c.nomSociete = tmp.substring(0, tmp.length - 1);
        }
        return c;
    }
}
