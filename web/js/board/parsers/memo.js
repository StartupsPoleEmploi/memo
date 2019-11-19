function ParserMemo()
{
    
}

ParserMemo.prototype = {

    logo: "MEMO.png",
    name: "MEMO",

    //@RG - IMPORT : Les données importées des offres sont obligatoirement nomCandidature et descrition et si possible nomSociete, ville, nomContact, logoUrl issues de leur API retournant un flux JSON.
    parse : function(html)
    {

        ga('send', { hitType : 'event', eventCategory : 'Candidature', eventAction : 'import', eventLabel : this.name  });

        var t = this,
            cont = JSON.parse(html),
            c = new Candidature(),
            el, v, tmp = "";

        debugCont = cont;
        
        c.sourceId = cont.jobId ;
        
        c.jobBoard = cont.jobBoard;
        
        c.nomCandidature = cont.jobTitle;
        
        c.description = cont.description;
        
        if(cont.name)
        	c.nomSociete = cont.name;
        
        if(cont.siretNumber)
        	c.numSiret = cont.siretNumber;
       
        if(cont.location)
        	c.ville = cont.location;
        
        if(cont.urlSource)
        	c.urlSource = cont.urlSource;
        
        if(cont.contactPhoneNumber)
        	c.telContact = cont.contactPhoneNumber;
        
        if(cont.email && isEmail(cont.email))
        	c.emailContact = cont.email;
        
        if(cont.contactName)
        	c.nomContact = cont.contactName;
        
        if(cont.contactPhoneNumber)
        	c.telContact = cont.contactPhoneNumber;       
        
        if(cont.logoUrl)
        	c.logoUrl=cont.logoUrl;  
        	
        return c;
    }


}