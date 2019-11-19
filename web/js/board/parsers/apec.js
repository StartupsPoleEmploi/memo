function ParserApec()
{
    //console.log("instantiate APEC Parser");
}

ParserApec.prototype = {

    logo : "apec.png",
    name : "APEC",

    //@RG - IMPORT : Les données importées des offres de l'APEC sont obligatoirement nomCandidature et descrition et si possible nomSociete, ville, nomContact, logoUrl issues de leur API retournant un flux JSON.
    parse : function(html)
    {
        ga('send', { hitType : 'event', eventCategory : 'Candidature', eventAction : 'import', eventLabel : this.name });

        var t = this,
            c = new Candidature(),
            cont = JSON.parse(html),
            el, v, tmp = "";

        debugCont = cont;

        c.jobBoard = this.name;
        c.nomCandidature = cont.intitule;

        v = cont.nomCommercialEtablissement;
        if(!v)
            v = cont.nomCompteEtablissement;
        if(v)
            c.nomSociete = v;

        c.description = cont.texteHtml;

        if(cont.texteHtmlProfil)
            c.description += "<br /><strong>PROFIL RECHERCHE :</strong><br />"+cont.texteHtmlProfil;
        if(cont.texteHtmlEntreprise)
            c.description += "<br /><strong>ENTREPRISE :</strong><br />"+cont.texteHtmlEntreprise;
        if(cont.texteProcessRecrutement)
            c.description += "<br /><strong>PROCESSUS DE RECRUTEMENT :</strong><br />"+cont.texteProcessRecrutement;

        v = "";
        if(cont.prenomInterlocuteur)
            v += cont.prenomInterlocuteur+" ";
        if(cont.nomInterlocuteur)
            v += cont.nomInterlocuteur+" ";

        if(!v && cont.interlocuteurSuiviPrenom)
        {
            v += cont.interlocuteurSuiviPrenom+" ";

            if(cont.interlocuteurSuiviNom)
                v += cont.interlocuteurSuiviNom+" ";
        }

        if(v && cont.interlocuteurSuiviFonction)
            v+= "("+cont.interlocuteurSuiviFonction+")";

        if(v)
            c.nomContact = v;

        if(cont.lieux && cont.lieux.length>0)
            c.ville = cont.lieux[0].libelleLieu;

        tmp = "";
        if(cont.referenceClientOffre)
            tmp += "- Référence Société : "+cont.referenceClientOffre+"\r\n";
        if(cont.salaireTexte)
            tmp+="- Salaire : "+cont.salaireTexte+"\r\n";
        if(cont.adresseUrlCandidature)
            tmp+="- Adresse pour postuler en ligne : "+cont.adresseUrlCandidature+"\r\n";

        if(tmp)
            c.description+="\r\n\r\n"+tmp;

        v = cont.logoEtablissement;
        if(v)
            c.logoUrl = "https://www.apec.fr/files/live/mounts/images/"+v;

        return c;
    }
}