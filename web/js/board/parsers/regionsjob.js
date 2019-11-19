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
            cont = JSON.parse(html);

        c.jobBoard = this.name;

        if(cont) {
        	c.nomCandidature = cont.title;
        	c.description = cont.description;
        	if(cont.hiringOrganization) {
        		c.nomSociete = cont.hiringOrganization.name;
        		c.logoUrl = cont.hiringOrganization.logo;
        	}
        	if(cont.jobLocation && cont.jobLocation.address) {
        		c.ville = cont.jobLocation.address.addressLocality;
        	}
        }        	
        
        return c;
    }
}