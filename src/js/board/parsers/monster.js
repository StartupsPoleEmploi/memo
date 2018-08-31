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
            cont = JSON.parse(html),
            el, v, tmp;

        debugCont = cont;
        
        // Joabboard
        c.jobBoard = this.name
        
        tmp = cont.companyInfo;
        if (tmp) {
        	// NomCandidature
        	v = tmp.companyHeader;
        	if(v)
        		c.nomCandidature = v;
        	else
        		c.nomCandidature = "Candidature Monster";

        	// NomSociete
	        v = tmp.name;
	        if(v)
	        	c.nomSociete = v;

	        // Ville
	        v = tmp.jobLocation
	        if(v)
	        	c.ville = v;
            
            // Logo
            v = tmp.logo;
            if(v)
            	c.logoUrl = v.src;
        }
        
        // Description
        v = cont.jobDescription;
        if(v)
        	c.description = v;

        // Description
        v = cont.jobIdentification;
        if(v)
        	c.sourceId = v;

        // Email
        if (c.description) {
	        // tentative d'extraction d'email contact dans description -> chercher @
	        c.emailContact = getEmailInText(c.description);
        }

        return c;
    }
}