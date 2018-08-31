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

        tmp = cont.find(".span-titre-1").html();

        //console.log("tmp1 ",tmp);
        if (tmp)
            c.nomCandidature = tmp.trim();
        else
            c.nomCandidature = "Candidature Envirojob";


        // nomSociete
        el = cont.find(".span-titre-5").html();
        if (el)
            c.nomSociete = el.trim();

        el = cont.find(".nouveau_logo");

        if (el.length)
            c.logoUrl = el[0].src;

        v = c.nomSociete + "<br />" + logo + cont.find(".span-titre-5").html();

        // description
        el = cont.find("#divPubCarre");
        if (el)
            c.description = el.parent().html().trim(); 
        else
            c.description = v;


        return c;
    }
}