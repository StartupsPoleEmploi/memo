function ParserJobAlim(subParser)
{
    //console.log("instantiate "+subParser+" Parser");
    if(subParser=="jobalim")
    {
        this.logo = "jobalim.png";
        this.name = "Jobalim.com";
    }
    else
    {
        this.logo = "vitijob.png";
        this.name = "Vitijob.com";
    }
}


ParserJobAlim.prototype = {

    logo: null,
    name: null,

    //@RG - IMPORT : Les données importées des offres de JOBALIMVITIJOB sont obligatoirement nomCandidature et descrition et si possible nomSociete, ville, emailContact, logoUrl issues de page HTML.
    parse : function (html) {
        ga('send', {
            hitType: 'event',
            eventCategory: 'Candidature',
            eventAction: 'import',
            eventLabel: this.name
        });

        var t = this,
            c = new Candidature(),
            cont = document.createElement("div"),
            el, v = "", r = 0, tmp, ref;

        cont.innerHTML = html;
        cont = $(cont);
        debugCont = cont;

        c.jobBoard = this.name;

        tmp = cont.find("[itemprop=title]").html();
        ref = cont.find("[itemprop=title] > div").text().trim();

        if (ref)
            c.nomCandidature = tmp.substring(0, tmp.indexOf("<div")).trim();
        else if (tmp)
            c.nomCandidature = tmp.trim();
        else
            c.nomCandidature = "Candidature JobalimVitijob";

        tmp = cont.find("#info_entreprise_titre > p > img").attr("src");
        if (tmp && !tmp.endsWith("logo/")) {
            c.logoUrl = ((this.name=="Vitijob.com")?"https://www.vitijob.com/":"") + tmp;
            r = 1;
        }

        tmp = $(cont.find("#info_entreprise_titre > p")[0 + r]).text();   // le nom de l'entreprise
        if (tmp) {
            if (tmp.startsWith("Entreprise"))
                tmp = tmp.substring(10);


            tmp = tmp.split('\n');
            c.nomSociete = tmp[0];
            c.ville = "";
            for (var i = 1; i < tmp.length; ++i)
                c.ville += tmp[i] + " ";
            c.ville = c.ville.trim();
        }

        // ville
        if (!c.ville)
            el = $(cont.find("#info_entreprise_titre > p")[1 + r]).html();   // l'adresse de l'entreprise
        if (el) {
            tmp = el.trim();
            var addr = tmp.substring(17);
            c.ville = addr.substring(addr.indexOf("<br>") + 4);
        }

        if (cont.find("#info_entreprise_titre > p").length > (r + 4))
            v = "<strong>Entreprise :</strong><br />" + $(debugCont.find("#info_entreprise_titre > p")[r + 3]).html().trim();

        if (addr)
            v += "<br /><br /><strong>Adresse  :</strong><br />" + addr;

        v += cont.find("[itemprop=description]").html();

        v += $(cont.find("[id=offre_desc]")[0]).html();

        v += $(cont.find("[id=offre_desc]")[1]).html();

        if (ref)
            v += "<br />" + ref;

        v = v.replace(/<p>/gi, "");
        v = v.replace(/<\/p>/gi, "");
        //v = v.replace(/<br\s*[\/]?>\s*<br\s*[\/]?>/gi, "<br>");
        //v = v.replace(/\r?\n//gi, "");

        c.description = v;
        c.emailContact = getEmailInText(v);

        return c;
    }

}