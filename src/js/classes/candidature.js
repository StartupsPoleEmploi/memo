function Candidature(c)
{
    if(c)
        this.init(c);
}


Candidature.prototype = {

    id : 0,
    userId : null,

    events : null,

    descriptionLoaded : null,

    init : function(c)
    {
        var t=this;
        $.extend(t,c);

        if(c.lastUpdate)
            t.lastUpdate = moment(c.lastUpdate);  //t.lastUpdate = moment(c.lastUpdate,"YYYY-MM-DD HH:mm");
        if(c.creationDate)
            t.creationDate = moment(c.creationDate);  //t.creationDate = moment(c.creationDate,"YYYY-MM-DD HH:mm");
        if(c.urlSource)
            t.urlSource = $sc(t.urlSource);
        if(c.sourceId)
            t.sourceId = $sc(t.sourceId);
        if(c.logoUrl)
            t.logoUrl = $sc(t.logoUrl);
        if(c.jobBoard)
            t.jobBoard = $sc(t.jobBoard);
    },

    getQParam : function()
    {
        var c = this,
            p = "";

        if(c.id)
            p+="id="+ c.id+"&";

        
        if(c.nomCandidature)
            p+="nomCandidature="+ Url.encode(c.nomCandidature)+"&";
        if(c.nomSociete)
            p+="nomSociete="+ Url.encode(c.nomSociete)+"&";
        if(c.numSiret)
            p+="numSiret="+ Url.encode(c.numSiret)+"&";
        if(c.description) {
            // on supprime les scripts pour le champ description
            c.description = $sc(c.description);
            p+="description="+ Url.encode(c.description)+"&";
        }
        if(c.note) {
        	// on supprime les scripts pour le champ description
            c.note = $sc(c.note);
            p+="note="+ Url.encode(c.note)+"&";
        }

        p+="etat="+ c.etat+"&";
        p+="type="+ c.type+"&";

        if(c.ville)
            p+="ville="+ Url.encode(c.ville)+"&";
        /*if(c.pays)
            p+="pays="+ Url.encode(c.pays)+"&";*/
        if(c.nomContact)
            p+="nomContact="+ Url.encode(c.nomContact)+"&";

        if(c.emailContact)
            p+="emailContact="+ Url.encode(c.emailContact)+"&";
        if(c.telContact)
            p+="telContact="+ Url.encode(c.telContact)+"&";
        if(c.urlSource)
            p+="urlSource="+ Url.encode(c.urlSource)+"&";
        if(c.sourceId)
            p+="sourceId="+ Url.encode(c.sourceId)+"&";
        if(c.jobBoard)
            p+="jobBoard="+ Url.encode(c.jobBoard)+"&";

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

