function ParserMonster()
{
    //console.log("instantiate Monster Parser");
}

ParserMonster.prototype = {

    logo: "monster.png",
    name: "Monster",

    //@RG - IMPORT : Les données importées des offres de MONSTER sont obligatoirement nomCandidature et descrition et si possible nomSociete, ville, emailContact, logoUrl issues de page HTML.
    // plusieurs formats différents
    parse : function (html) {
        ga('send', {hitType: 'event', eventCategory: 'Candidature', eventAction: 'import', eventLabel: this.name });

        var t = this,
            c = new Candidature(),
            cont = document.createElement("div"),
            el, v, tmp;

        cont.innerHTML = html;
        cont = $(cont);
        debugCont = cont;

        c.jobBoard = this.name

        var fork = cont.find("#jobcopy");

        // format 1
        if (fork.length > 0) {
            // nomCandidature
            el = cont.find("#jobcopy > h1").html()
            if (el)
                c.nomCandidature = el.trim();
            else
                c.nomCandidature = "Candidature Monster";

            // nomSociete
            el = cont.find("[itemprop=name]").html();
            if (el)
                c.nomSociete = el.trim();

            // ville
            el = cont.find("[itemprop=jobLocation]").html();
            if (el)
                c.ville = el.trim();

            // récupération de description dans [itemprop=description] -> nettoyer les br
            tmp = cont.find("#TrackingJobBody");
            v = tmp.html();
            v = $rP(v);
            v = $rBR(v);
            tmp.html(v);
            v = tmp.text();

            v += "\n\n";

            tmp = cont.find("#jobsummary_content > dl > dt,dd");
            //el = cont.find("#jobsummary_content > dl > dd > span");

            for (var i = 0; i < tmp.length; ++i) {
                if (tmp[i].nodeName == "DT")
                    v += "\n- " + tmp[i].innerHTML + " :";
                else {
                    v += " " + tmp[i].firstChild.innerHTML
                }
            }

            v = $rNBSP(v);

            c.description = v;
        }
        else    // format 2
        {
            fork = cont.find("h1.title");

            if(fork.length>0)
            {
                c.nomCandidature = fork.text();
                c.ville = cont.find("h2.subtitle").text();

                el = debugCont.find("#JobDescription span p>font, #JobDescription span p b u font, #JobDescription span p>a>font>span:nth(0)");

                v = "";
                for(var i=0, l=el.length; i<l; ++i)
                {
                    if(el[i].parentNode.nodeName == "U")
                        v+="<br /><strong>"+el[i].innerHTML+"</strong><br />";
                    else if(el[i].innerHTML=="&nbsp;")
                        v+="<br />";
                    else if(el[i].parentNode.nodeName == "FONT")
                        v+="<br /> "+el[i].innerHTML+" ";
                    else
                        v+="<br />"+el[i].innerHTML;
                }

                if(!v)
                    v = cont.find("#TrackingJobBody").html();

                c.description = v;
            }
            else {
                if (cont.find("#CJT-title").length > 0) {
                    c.nomCandidature = cont.find("h1").text();

                    tmp = cont.find("#CJT-logo > img");
                    if (tmp.length > 0 && tmp.attr("title")) {
                        c.nomSociete = tmp.attr("title");
                        c.logoUrl = tmp.attr("src");
                    }
                }
                else if (cont.find("#CJT-jobtitle").length > 0) {
                    c.nomCandidature = cont.find("h1").text();

                    tmp = cont.find("#CJT-logo > img");
                    if (tmp.length > 0 && tmp.attr("title")) {
                        c.nomSociete = tmp.attr("title");
                        c.logoUrl = tmp.attr("src");
                    }

                    if (cont.find("[itemprop=jobLocation] > span").length)
                        c.ville = cont.find("[itemprop=jobLocation] > span").html();
                }
                else {
                    tmp = "Candidature Monster";
                    el = cont.find(".opening > h2").html();
                    if (el) {
                        tmp = el.trim();
                        if (tmp)
                            v = tmp.lastIndexOf(" - ");
                    }

                    if (v > -1) {
                        c.nomCandidature = tmp.substring(0, v).trim();
                        c.nomSociete = tmp.substring(v + 3).trim();
                    }
                    else
                        c.nomCandidature = tmp;

                    //f.ville.setValue(cont.find("[itemprop=jobLocation]").html());
                    el = cont.find(".opening > h3").html();
                    if (el)
                        c.ville = el.trim();
                }
                // récupération de description dans [itemprop=description] -> nettoyer les br
                tmp = cont.find("#TrackingJobBody");

                if (tmp.length > 0) {
                    v = tmp.html();
                    v = $rBR(v);
                    tmp.html(v);
                    v = tmp.text();

                    v += "\n\n";

                    tmp = cont.find("#JobSummary > dl > dt,dd");
                    //el = cont.find("#jobsummary_content > dl > dd > span");

                    for (var i = 0; i < tmp.length; ++i) {
                        if (tmp[i].nodeName == "DT")
                            v += "\n- " + tmp[i].innerHTML + " :";
                        else {
                            v += " " + tmp[i].innerHTML
                        }
                    }

                    v = $rNBSP(v);

                    c.description = v;
                }
                else if (cont.find("#JobDescription").length > 0) {
                    tmp = cont.find("#JobDescription");
                    c.description = tmp.html().trim();
                } else if (cont.find("#CJT-jobdcp").length > 0) {
                    tmp = cont.find("#CJT-jobdcp > div > ul > li > p");
                    if (tmp.length > 0) {
                        v = "";
                        for (var i = 0; i < tmp.length; ++i) {
                            v += "\n- " + tmp[i].innerHTML;
                        }
                        v = $rNBSP(v);
                        c.description = v;
                    }
                }


            }
        }

        // tentative d'extraction d'email contact dans description -> chercher @
        c.emailContact = getEmailInText(c.description);

        return c;
    }
}