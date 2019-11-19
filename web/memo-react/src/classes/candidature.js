import moment from 'moment';
import 'moment/locale/fr';
import { $sc } from '../components/utils.js';
import { Url } from '../components/utils.js';
import { getLastActivity } from '../actions/nextEvents';
import { setNextEntretien } from '../actions/loadBoard';
import { Constantes as CS } from '../constantes';


class Candidature {
    
    constructor(c)
    {
        if(c)
        {
            let t=this;
            Object.assign(t,c);

            if(c.lastUpdate)
                t.lastUpdate = moment(c.lastUpdate).locale('fr');  //t.lastUpdate = moment(c.lastUpdate,"YYYY-MM-DD HH:mm");
            if(c.creationDate)
                t.creationDate = moment(c.creationDate).locale('fr');  //t.creationDate = moment(c.creationDate,"YYYY-MM-DD HH:mm");
            if(c.urlSource)
                t.urlSource = $sc(t.urlSource);
            if(c.sourceId)
                t.sourceId = $sc(t.sourceId);
            if(c.logoUrl)
                t.logoUrl = $sc(t.logoUrl);
            if(c.jobBoard)
                t.jobBoard = $sc(t.jobBoard);
            if(c.nomCandidature)
                t.nomCandidature= $sc(t.nomCandidature);
            if(c.nomSociete)
                t.nomSociete= $sc(t.nomSociete);
            if(c.numSiret)
                t.numSiret= $sc(t.numSiret);
            if(c.emailContact)
                t.emailContact= $sc(t.emailContact);
            if(c.nomContact)
                t.nomContact= $sc(t.nomContact);
            if(c.telContact)
                t.telContact= $sc(t.telContact);
            if(c.description)
                t.description= $sc(t.description);
            if(c.note)
                t.note= $sc(t.note);
            if(c.ville)
                t.ville= $sc(t.ville);
        }
    }

    // ajoute un événément à la candidature et mets à jours les lastActivity et nextEntretien
    addEvent(event)
    {
        if(!this.events)
            this.events = {};

        this.events[event.id] = event;
        this.lastActivity = getLastActivity(this);
        
        if(event.eventType==CS.TYPES.ENTRETIEN)
            setNextEntretien(this,event);
    }

    getQParam()
    {
        var c = this,
            p = "";

        if(c.id)
            p+="id="+ c.id+"&";

        if(c.nomCandidature)
            p+="nomCandidature="+ Url.encode($sc(c.nomCandidature))+"&";
        if(c.nomSociete)
            p+="nomSociete="+ Url.encode($sc(c.nomSociete))+"&";
        if(c.numSiret)
            p+="numSiret="+ Url.encode($sc(c.numSiret))+"&";
        if(c.description) {
            // on supprime les scripts pour le champ description
            c.description = $sc(c.description);
            p+="description="+ Url.encode(c.description)+"&";
        }
        if(c.note) {
        	// on supprime les scripts pour le champ note
            c.note = $sc(c.note);
            p+="note="+ Url.encode(c.note)+"&";
        }

        p+="etat="+ c.etat+"&";
        p+="type="+ c.type+"&";

        if(c.ville)
            p+="ville="+ Url.encode($sc(c.ville))+"&";

        if(c.nomContact)
            p+="nomContact="+ Url.encode($sc(c.nomContact))+"&";
        if(c.emailContact)
            p+="emailContact="+ Url.encode($sc(c.emailContact))+"&";
        if(c.telContact)
            p+="telContact="+ Url.encode($sc(c.telContact))+"&";
        if(c.urlSource)
            p+="urlSource="+ Url.encode($sc(c.urlSource))+"&";
        if(c.sourceId)
            p+="sourceId="+ Url.encode($sc(c.sourceId))+"&";
        if(c.jobBoard)
            p+="jobBoard="+ Url.encode($sc(c.jobBoard))+"&";

        if(c.logoUrl)
        {
            c.logoUrl = $sc(c.logoUrl);
            p+="logoUrl="+Url.encode(c.logoUrl)+"&";
        }

        if(c.archived)
            p+="archived="+ c.archived+"&";

        return p;
    }
}
export default Candidature;