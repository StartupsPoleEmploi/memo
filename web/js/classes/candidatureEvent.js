function CandidatureEvent(evt)
{
    if(evt)
        this.init(evt);
}


CandidatureEvent.prototype = {

    eventType : null,
    /*eventTypes : { 1 : "Je dois relancer", 2 : "Echange de mail", 3 : "Entretien", 4 : "J'ai postulé",
     5 : "J'ai relancé", 6 : "Archiver", 7 : "Rappel", 8 : "Note",   9 : "Maintenir actif", 10 : "J'ai préparé", 11 : "J'ai remercié"},*/

    eventSubType : null,
     /*eventSubTypes : { 1 : "Entretien physique", 2 : "Entretien téléphonique", 3 : "Entretien vidéo",
        4 : "Réponse négative" , 5 : "Pas de réponse", 6 : "Offre pourvue",
        7 : "Offre hors ligne" , 8 : "Ca ne m\'intéresse plus", 9 : "J\'ai le poste", 10 : "J\'ai trouvé un autre poste" },*/

    id : 0,
    candidatureId : null,
    eventTime : null,
    idDivPriorite : null,


    comment : null,
    isVirtual : 0,


    init : function(evt)
    {
        var t=this;
        $.extend(t,evt);
        if(evt.eventTime)
            t.eventTime = moment(evt.eventTime);
    },

    getQParam : function()
    {
        var evt = this,
            p = "";

        if(evt.id)
            p+="id="+ evt.id+"&";

        p+="candidatureId="+ evt.candidatureId+"&";

        // on supprime les scripts pour le champ commentaire
        evt.comment = $sc(evt.comment);
        
        if(evt.comment)
            p+="comment="+ Url.encode(evt.comment)+"&";

        p+="eventType="+ evt.eventType+"&";

        if(evt.eventSubType)
            p+="eventSubType="+ evt.eventSubType+"&";

        if(evt.eventTime)
            p+="eventTime="+ evt.eventTime.valueOf()+"&";

        return p;
    }
}

