function ParserRegionsJob()
{
    //console.log("instantiate Regions Job Parser");
}

ParserRegionsJob.prototype = {

    logo: "regionsjob.png",
    name: "RegionsJob",

    parse: function (html) {
        ga('send', {hitType: 'event', eventCategory: 'Candidature', eventAction: 'import', eventLabel: this.name});

        var t = this,
            c = new Candidature(),
            cont = document.createElement("div"),
            el, v = "", tmp;

        cont.innerHTML = html;
        cont = $(cont);
        debugCont = cont;


        c.jobBoard = this.name;
        if (debugCont.find("#annonce-chartee-detail").length > 0) {
            throw "annonce-chartee-detail";
        }

        c.nomCandidature = cont.find(".annonce>div>div>h1>strong").text().trim();

        c.nomSociete = cont.find("section.right-entreprise>div>a").text().trim();

        c.ville = cont.find("div.head>dl>span>dd>a").text().trim();
        if (!c.ville) {
            tmp = cont.find("div.head>dl>span>dd");
            if (tmp.length > 0)
                c.ville = $(tmp[0]).text().trim();
        }

        v = cont.find("#annonce-detail").html();
        if (v && v.indexOf('<p class=\"center') > -1)
            v = v.substring(0, v.indexOf('<p class=\"center'));

        c.description = v;

        el = cont.find(".lien-entreprise img").attr("data-original");
        if (el)
            c.logoUrl = el;

        return c;
    }
}