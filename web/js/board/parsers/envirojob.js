function ParserEnviroJob()
{
    //console.log("instantiate Envirojob Parser");
}

ParserEnviroJob.prototype = {

    logo: "envirojob.png",
    name: "Envirojob",

    parse: function (html) {
        //console.log("enviro");
        ga('send', {hitType: 'event', eventCategory: 'Candidature', eventAction: 'import', eventLabel: this.name });

        var t = this,
            c = new Candidature(),
            cont = document.createElement("div"),
            el, v, tmp, logo = "";

        cont.innerHTML = html;
        cont = $(cont);
        debugCont = cont;

        c.jobBoard = this.name;

        tmp = cont.find(".nouveau_titre").html();

        //console.log("tmp1 ",tmp);
        if (tmp)
            c.nomCandidature = tmp.substring(0, tmp.indexOf("<br>")).trim();
        else
            c.nomCandidature = "Candidature Envirojob";


        // nomSociete
        el = cont.find("tr:eq(3) p").html();
        if (el)
            c.nomSociete = el.trim();

        el = cont.find(".nouveau_logo");

        if (el.length)
            c.logoUrl = el[0].src;

        v = c.nomSociete + "<br />" + logo + cont.find("tr:eq(3) div").html();

        // ville
        el = cont.find("tr:eq(5) td").html();
        if (el)
            tmp = el.trim();

        //console.log("tmp3 ",tmp);

        v += tmp;

        if (tmp && tmp.indexOf("<strong>Localisation") >= 0) {
            tmp = tmp.substring(tmp.indexOf("<strong>Localisation"));
            tmp = tmp.substring(tmp.indexOf("</strong>") + 9);

            if (tmp.indexOf("<strong>") > -1 && tmp.indexOf("<strong>") < tmp.indexOf("</p"))
                c.ville = tmp.substring(0, tmp.indexOf("<strong>")).trim();
            else
                c.ville = tmp.substring(0, tmp.indexOf("</p>")).trim();
        }

        // description
        el = cont.find(".nouveau_ref_date").html();
        if (el)
            c.description = v + "<br />" + el.trim();  // on colle la référence + date de publication dans la valeur de description
        else
            c.description = v;


        return c;
    }
}