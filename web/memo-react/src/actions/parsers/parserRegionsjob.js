import Candidature from '../../classes/candidature';
import $ from 'jquery';

class ParserRegionsJob {

    logo = "regionsjob.png";
    name = "RegionsJob";

    parse = html => {
        window.gtag('event', 'import', { event_category: 'Candidature', event_label: this.name });     

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

export default ParserRegionsJob;