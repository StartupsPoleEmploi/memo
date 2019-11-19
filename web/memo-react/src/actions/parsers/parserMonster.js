import Candidature from '../../classes/candidature';
import { $ , getEmailInText } from '../../components/utils';

class ParserMonster {

    logo = "monster.png";
    name = "Monster";

    //@RG - IMPORT : Les données importées des offres de MONSTER sont obligatoirement nomCandidature et descrition et si possible nomSociete, ville, emailContact, logoUrl issues de page HTML.
    // plusieurs formats différents
    parse = html => {
        window.gtag('event', 'import', { event_category: 'Candidature', event_label: this.name });     

        var t = this,
            c = new Candidature(),
            cont,
            el, v, tmp;

        try
        {
            cont = JSON.parse(html)
        }
        catch (err)
        {
            // hack pour firefox
            var debut="",
                jobDesc="",
                fin="";

            debut = html.substring(0,html.indexOf("\"jobDescription\":\""));
            jobDesc = html.substring(html.indexOf("\"jobDescription\":\"")+18, html.indexOf("\",\"wrapIntoFrame\""));
            fin  = html.substring(html.indexOf("\"wrapIntoFrame\""));

            cont = JSON.parse(debut + fin);
            cont.jobDescription = jobDesc;
        }

        window.debugCont = cont;

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
export default ParserMonster;