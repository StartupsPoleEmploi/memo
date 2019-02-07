function NextEvents(board)
{
    this.init(board);
}

NextEvents.prototype = {

    board : null,

    init : function(board)
    {
        this.board=board;

        /* Bouton d'actions des modales */
        this.initProposedActionButtons();
    },

    getNextActionAdvice : function(c)
    {

        var lastActivity, nE, lE, lC, lR, lA, lP, lM, lRA,
        	now = moment(),
        	res="";

        if (c && !c.archived) {
	        lastActivity = this.getLastActivity(c);
	        nE = lastActivity.nextEntretien;
            lE = lastActivity.lastEntretien;
            lC = lastActivity.lastCandidature;
            lR = lastActivity.lastRelance;
            lRA = lastActivity.lastRelanceAlert;
            lA = lastActivity.lastActivity;
            lP = lastActivity.lastPreparation;
            lM = lastActivity.lastMerci;
            
	        c.lastActivity = lastActivity;
	
	        /*if(c.etat==0) {
	         console.log("lA : ", (lA)?lA.toString():"", "   ---   nE : ",nE?nE.toString():"","  ----   lE : ",lE?lE.toString():"");
	         console.log("lC : ", (lC)?lC.toString():"", "   ---   lR : ",lR?lR.toString():"", "  ---- ",c );
	
	         console.log("diff now last activ : ",now.diff(lA,'days'));
	         }*/
	
	        if(now.diff(lA,'days')>30)  {     
	        	// @RG - CONSEIL : Le conseil 'Supprimer' est affiché, si aucune activité sur la candidature depuis 30 jours 
	            res = "<span class='tooltipster' title='Conseil : archiver'><span class='nextActionTitle'>Conseil :</span> archiver</span>";
	        } else {
	
	            switch (eval(c.etat)) {
	                case CS.ETATS.VA_POSTULER  :   
	                {
	                	// @RG - CONSEIL : Le conseil 'Postuler' est affiché, si candidature à l'état 'VA_POSTULER'
	                	res = "<span class='tooltipster' title='Conseil : postuler'><span class='nextActionTitle'>Conseil :</span> postuler</span>";
	                    break;
	                }
	                case CS.ETATS.A_POSTULE  :
	                {
                        if( (lRA && now.isAfter(lRA)) ||     // si une alerte
                            (!lRA && lC && (
                                ( c.type == CS.TYPES_CANDIDATURE.OFFRE && now.diff(lC,'days')>=7 ) ||
                                ( c.type == CS.TYPES_CANDIDATURE.RESEAU && now.diff(lC,'days')>=14 ) ||
                                ( (c.type == CS.TYPES_CANDIDATURE.SPONT || c.type == CS.TYPES_CANDIDATURE.AUTRE) && now.diff(lC,'days')>=21 ) )
                            )
                          )
                        {
                            // @RG - CONSEIL : Le conseil 'Relancer Candidature' est affiché, si candidature à l'état 'A_POSTULE' et une relance programmée est échue. Ou si pas de relance et la date dépasse une durée dépendant du type de candidature
                            res = "<span class='tooltipster' title='Conseil : relancer'><span class='nextActionTitle'>Conseil :</span> relancer</span>";
                        }

	                    break;
	                }
	                case CS.ETATS.ENTRETIEN :
	                {
	                    if( nE && now.isBefore(nE) )
	                    {   
	                    	// @RG - CONSEIL : Le conseil 'Se préparer' est affiché, si la candidature est à l'état 'ENTRETIEN' et s'il y a un entretien dans le futur positionné et qu'il n'y pas déjà eu d'evt 'J'ai préparé'
	                        if(!lP || !lE || !lP.isBefore(lE))
	                            res = "<span class='tooltipster' title='Conseil : se préparer'><span class='nextActionTitle'>Conseil :</span> se préparer</span>";
	                    }
	                    else
	                    {
	                        if(lE && now.diff(lE,'days')>4)   
	                        {
	                        	// @RG - CONSEIL : Le conseil 'Relancer Entretien' est affiché, si la candidature est à l'état 'ENTRETIEN' et si entretien passé depuis 4 jours et qu'il n'y pas déjà eu d'evt 'J'ai relancé'
	                            if(!lR || lR.isBefore(lE) )
	                                res = "<span class='tooltipster' title='Conseil : relancer'><span class='nextActionTitle'>Conseil :</span> relancer</span>";
	                        }
	                        else if(lE && now.diff(lE,'hours')>0)  
	                        {
	                        	// @RG - CONSEIL : Le conseil 'Remercier' est affiché, si la candidature est à l'état 'ENTRETIEN' et si entretien passé depuis moins de 4 jours et qu'il n'y pas déjà eu d'evt 'J'ai remercié'
	                            if(!lM || lM.isBefore(lE) )
	                                res = "<span class='tooltipster' title='Conseil : remercier'><span class='nextActionTitle'>Conseil :</span> remercier</span>";
	                        }
	                    }
	                }
	            }
	        }
        }

        return res;
    },

    getLastActivity : function(c)
    {
        var res =  { lastActivity : null, lastCandidature : null, lastRelance: null,
                lastEntretien : null, nextEntretien : null, lastPreparation : null, lastMerci : null, lastRelanceAlert : null },
            evt, now = moment();

        if(c.events)
        {
            for(k in c.events)
            {
                evt = c.events[k];
                if(evt)
                {
                    /*{ 1 : "Je dois relancer", 2 : "Echange de mail", 3 : "Entretien", 4 : "J'ai postulé",
                     5 : "J'ai relancé", 6 : "Archiver", 7 : "Rappel", 8 : "Note" }*/

                    if (evt.eventType == CS.TYPES.ENTRETIEN && (!res.lastEntretien || evt.eventTime.isAfter(res.lastEntretien)))
                        res.lastEntretien = evt.eventTime;
                    else if (evt.eventType == CS.TYPES.AI_PREPARE && (!res.lastPreparation || evt.eventTime.isAfter(res.lastPreparation)))
                        res.lastPreparation = evt.eventTime;
                    else if (evt.eventType == CS.TYPES.AI_REMERCIE && (!res.lastMerci || evt.eventTime.isAfter(res.lastMerci)))
                        res.lastMerci = evt.eventTime;
                    else if (evt.eventType == CS.TYPES.AI_POSTULE && (!res.lastCandidature || evt.eventTime.isAfter(res.lastCandidature)))
                        res.lastCandidature = evt.eventTime;
                    else if (evt.eventType == CS.TYPES.AI_RELANCE && (!res.lastRelance || evt.eventTime.isAfter(res.lastRelance)))
                        res.lastRelance = evt.eventTime;
                    else if (evt.eventType == CS.TYPES.RAPPEL && evt.eventSubType == CS.SUBTYPES.RAPPEL_POSTULE_RELANCE && (!res.lastRelanceAlert || evt.eventTime.isBefore(res.lastRelanceAlert)))
                        res.lastRelanceAlert = evt.eventTime;

                    if (evt.eventType == CS.TYPES.ENTRETIEN) // détermination du nextEntretien
                    {
                        if (now.diff(evt.eventTime, 'days') <= 0) {   // l'entretien est dans le futur
                            if (!res.nextEntretien || (evt.eventTime.isBefore(res.nextEntretien)))       // cet entretien est plus proche dans le temps qu'un autre entretien
                                res.nextEntretien = evt.eventTime;
                        }
                    }

                    if(!res.lastActivity || evt.eventTime.isAfter(res.lastActivity))
                        res.lastActivity = evt.eventTime;
                }
            }
        }

        if(c.etat==CS.ETATS.A_POSTULE && !res.lastCandidature)
            res.lastCandidature = c.creationDate;

        // détermination de last activity sur la candidature par rapport aux events enregistrés
        var mmts = [];
        if(res.lastRelance)
            mmts.push(res.lastRelance);
        if(res.lastCandidature)
            mmts.push(res.lastCandidature);
        if(res.lastEntretien)
            mmts.push(res.lastEntretien);
        if(res.nextEntretien)
            mmts.push(res.nextEntretien);
        if(res.lastPreparation)
            mmts.push(res.lastPreparation);
        if(res.lastMerci)
            mmts.push(res.lastMerci);
        if(res.lastActivity)
        	mmts.push(res.lastActivity);
        if(mmts.length>0)
            res.lastActivity = moment.max(mmts);
        if(!res.lastActivity)
            res.lastActivity = c.lastUpdate;

        return res;
    },

    // fourni les événements virtuels à ajouter dans la timeLine d'une candidature
    getRappels : function(c)
    {
        var lastActivity = this.getLastActivity(c),
            rappels = [], now = moment(),
            lR = lastActivity.lastRelance,
            lC = lastActivity.lastCandidature,
            lA = lastActivity.lastActivity,
            lE = lastActivity.lastEntretien,
            lM = lastActivity.lastMerci,
            evts = c.events,
            evt, tmp, tmp2;

        if(!lC)
            lC = c.lastUpdate;

        // ajouter un rappel de relance si candidature sans relance faite
        if(now.diff(lA,'days')<=20)
        {
            if(c.etat==CS.ETATS.A_POSTULE && (!lR || lR.isBefore(lC)))
            {
                evt = new CandidatureEvent();
                tmp = moment(lC);
                tmp2 = moment(now);
                evt.eventTime = moment.max(tmp.add(7,"days"));
                evt.eventType = CS.TYPES.RAPPEL;
                evt.comment = "Faire une relance";
                evt.isVirtual = 1;

                rappels.push(evt);
            }

            if(c.etat==CS.ETATS.ENTRETIEN && lE && (!lM || lM.isBefore(lE)))
            {
                evt = new CandidatureEvent();
                tmp = moment(lE);
                tmp2 = moment(now);
                evt.eventTime = moment.max(tmp.add(1,"days"));
                evt.eventType = CS.TYPES.RAPPEL;
                evt.comment = "Remercier le recruteur pour l'entretien";
                evt.isVirtual = 1;

                rappels.push(evt);
            }

            if(c.etat==CS.ETATS.ENTRETIEN && lE && (!lR || lR.isBefore(lE))) {
                evt = new CandidatureEvent();
                tmp = moment(lE);
                tmp2 = moment(now);
                evt.eventTime = moment.max(tmp.add(4, "days"));
                evt.eventType = CS.TYPES.RAPPEL;
                evt.comment = "Faire une relance suite à votre entretien";
                evt.isVirtual = 1;

                rappels.push(evt);
            }
        }

        return rappels;
    },


    openNextAction : function(evt)
    {
        evt.stopPropagation();

        var t=this,
            b = t.board,
            cT = evt.currentTarget,
            action = cT.attributes["caction"].value,
            id = cT.attributes["cid"].value, 
            c = b.candidatures[id];
        
        b.selectedCandidature = c;

        if(action=="<span class='tooltipster' title='Conseil : se préparer'><span class='nextActionTitle'>Conseil :</span> se préparer</span>")
            t.openPreparer();
        else if(action=="<span class='tooltipster' title='Conseil : relancer'><span class='nextActionTitle'>Conseil :</span> relancer</span>")
        {
            if(c.etat==CS.ETATS.ENTRETIEN)
                t.openRelancerEntretien(c);
            else
                t.openRelancerCandidature(c);
        }
        else if(action=="<span class='tooltipster' title='Conseil : archiver'><span class='nextActionTitle'>Conseil :</span> archiver</span>")
            t.openArchiverCandidature(evt);
        else if(action=="<span class='tooltipster' title='Conseil : postuler'><span class='nextActionTitle'>Conseil :</span> postuler</span>")
            t.openPostulerCandidature();
        else if(action=="<span class='tooltipster' title='Conseil : remercier'><span class='nextActionTitle'>Conseil :</span> remercier</span>")
            t.openRemercierEntretien(c);

        $(".nextActionComment").val("");    // reset des champs commentaires des actions proposées
        
        if(action!="<span class='tooltipster' title='Conseil : archiver'><span class='nextActionTitle'>Conseil :</span> archiver</span>") { // Pr simplifier la suppression, le composant commentaire est directement affiché
        	$(".nextActionDiv").hide();    // reset de l'affichage des commentaires des actions proposées
        } else {
        	$(".nextActionDiv").show(); 
        }

        //console.log("open next action : ",action, id);
    },

    openRelancerEntretien : function(c)
    {
    	var t=this,
    	b = t.board,
    	// récupération de la date du dernier entretien physique
		lastActivity = this.getLastActivity(c),
    	now = moment(),
    	lE = lastActivity.lastEntretien, h = "", cEvt;
	
		//console.log("openRelancerEntretien");
		
	    if(lE) {
	    	// @RG - CONSEIL : Dans le conseil 'Relancer Entretien', la différence de jour entre ajourd'hui et la date du dernier entretien de la candidature est affiché
			h = now.diff(lE,'days');
	    } 
	    $(".mdJourEntretien").html(h);
		
	    h = "";
	    if((c.emailContact && c.emailContact.length) || (c.telContact && c.telContact.length)) {
	    	// @RG - CONSEIL : Dans le conseil 'Relancer Entretien', l'email et/ou le téléphone sont affichés s'ils sont renseignés
	    	h = "relancer tout de suite ";
	    	if(c.emailContact && c.emailContact.length && c.telContact && c.telContact.length) {
	    		h += "sur <a href='mailto: " + c.emailContact + "' target='_blank' onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : relancer entretien - mailto') +"'>" + c.emailContact + "</a> ou au <a href='tel: " + c.telContact + "' target='_blank' onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : relancer entretien - tel') +"'>" + c.telContact + "</a>";
	    	} else if (c.emailContact && c.emailContact.length){
	    		h += "sur <a href='mailto: " + c.emailContact + "' target='_blank' onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : relancer entretien - mailto') +"'>" + c.emailContact + "</a>";
	    	} else {
	    		h += "au <a href='tel: " + c.telContact + "' target='_blank' onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : relancer entretien - tel') +"'>" + c.telContact + "</a>";
	    	}       	
	    } else {
	    	if(c.type != CS.TYPES_CANDIDATURE.RESEAU) {
	    		h = "relancer en retrouvant les coordonnées de l'entreprise <a href='http://www.google.fr/";
	        	if (c.nomSociete) {
	        		// @RG - CONSEIL : Dans le conseil 'Relancer Entretien', si aucune donnée de contact et si le nom de la societé est renseignée et si la candidature n'est pas de type 'RESEAU alors la recherche google des coordonnées de l'entreprise est propoposée 
	        		h += "#q=" + c.nomSociete;
	        	}
	        	h += "' target='_blank' onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : relancer entretien - google') +"'>ici</a>";
	    	} else {
	    		// @RG - CONSEIL : Dans le conseil 'Relancer Entretien', si aucune données de contact et si la candidature est du type 'RESEAU', alors 'relancer votre contact' est affiché
	    		h = "relancer votre contact" 
	    	}
	    }
        $(".mdRelancerEntretienContact").html(h);
	    
	    if(b.timeLine) {
	    	cEvt = b.timeLine.getRappel(c.events, CS.SUBTYPES.RAPPEL_ENTRETIEN_RELANCE);
	    	if(cEvt) { 
	    		// @RG - CONSEIL : Dans le conseil 'Relancer Entretien', si un evt de rappel de type 'RELANCE ENTRETIEN' existe, alors 'modifier la date de votre rappel de relance' est affiché. Au clic sur le lien 'modifier', l'evt de rappel correspondant est affiché pour être modifié.
	        	h = "<a id='edEvt_" + cEvt.id + "' class='lienModifierRappelRelancerEntretien' onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil relancer entretien : modifier rappel') +"'>modifier</a> la date de votre rappel de relance";
	        	$(".mdModifierEntretienRelance").html(h);
	    	} else {
	    		// @RG - CONSEIL : Dans le conseil 'Relancer Entretien', s'il n'existe pas d'evt de rappel de type 'RELANCE ENTRETIEN', alors le lien 'définir un rappel de relance' est affiché. Au clic sur le lien, la modale d'ajout d'un evt de rappel est affichée.
	    		h = "<a id='newEventButtonRappelRelanceEntretien' class='lienModifierRappelRelancerEntretien' onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil relancer entretien : ajouter rappel') +"'>définir un rappel de relance</a>";
	        	$(".mdModifierEntretienRelance").html(h);
	    	}
	    	$(".lienModifierRappelRelancerEntretien").on("click", $.proxy(t.openModifierRappelRelancerEntretien, t));
	    }
	    
        $('#mdRelancerEntretien').modal('show');
        
        ga('send', {hitType: 'event', eventCategory : 'Candidature', eventAction: 'nextAction', eventLabel: 'Ouverture conseil : relancer entretien'});
    },
    
    openModifierRappelRelancerEntretien : function(evt) {
    	var b = this.board;
    	$('#mdRelancerEntretien').modal('hide');
    	b.timeLine.openEventEdit(evt);
    },
    
    relancerEntretien : function()
    {
        var t = this,
            b = t.board,
            tl = b.timeLine,
            ty = CS.TYPES.AI_RELANCE,
            c = b.selectedCandidature,
            evt = t.getNextActionEvt(c,ty,"relanceEntretienComment");

        $('#mdRelancerEntretien').modal('hide');

        tl.saveCandidatureEventQuery(evt,c);
        tl.addEventToCandidature(c,evt);
        b.buildCandidatures();

        ga('send', {hitType: 'event', eventCategory : 'Candidature', eventAction: 'nextAction', eventLabel: 'J\ai relancé (entretien)'});
    },

    openRemercierEntretien : function(c)
    {
        var h;
        
    	//console.log("open remercier entretien");
        
        h = "Vous pouvez remercier ";
        // @RG - CONSEIL : Dans le conseil 'Remercier', l'email et/ou le numéro de téléphone du contact sont affichés lorsqu'ils sont renseignés. Sinon une recherche google pré-rempli du nom de la société s'il existe est affiché pour trouver un contact de l'employeur  
        if((c.emailContact && c.emailContact.length) || (c.telContact && c.telContact.length)) {
        	h += "tout de suite ";
        	if(c.emailContact && c.emailContact.length && c.telContact && c.telContact.length) {
        		h += "sur <a href='mailto: " + c.emailContact + "' target='_blank' onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil remercier : mailto') +"'>" + c.emailContact + "</a> ou au <a href='tel: " + c.telContact + "' target='_blank' onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil remercier : tel') +"'>" + c.telContact + "</a>";
        	} else if (c.emailContact && c.emailContact.length){
        		h += "sur <a href='mailto: " + c.emailContact + "' target='_blank' onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil remercier : mailto') +"'>" + c.emailContact + "</a>";
        	} else {
        		h += "au <a href='tel: " + c.telContact + "' target='_blank' onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil remercier : tel') +"'>" + c.telContact + "</a>";
        	}       	
        } else {
        	h += "l'employeur en retrouvant les coordonnées de l'entreprise sur <a href='http://www.google.fr/";
        	// @RG - CONSEIL : Dans le conseil 'Remercier', si ni l'email, ni le numéro de tel sont renseignés, le lien de la recherche google est pré-renseigné que pour les sociétés non identifiées comme jobbard/boite d'interim
            if(c.nomSociete && CS.JOBBOARD.indexOf(c.nomSociete.toLowerCase())<0)  
        		h += "#q=" + c.nomSociete;
        	h += "' target='_blank' onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : remercier - google') +"'>ici</a>"
        }
        $(".mdRemercierContact").html(h);
        
        $('#mdRemercierEntretien').modal('show');
        
        ga('send', {hitType: 'event', eventCategory : 'Candidature', eventAction: 'nextAction', eventLabel: 'Ouverture conseil : remercier'});
    },

    remercierEntretien : function()
    {
        var t = this,
            b = t.board,
            tl = b.timeLine,
            ty = CS.TYPES.AI_REMERCIE,
            c = b.selectedCandidature,
            evt = t.getNextActionEvt(c,ty,"remercierEntretienComment");

        $('#mdRemercierEntretien').modal('hide');

        tl.saveCandidatureEventQuery(evt,c);
        tl.addEventToCandidature(c,evt);
        b.buildCandidatures();

        ga('send', {hitType: 'event', eventCategory : 'Candidature', eventAction: 'nextAction', eventLabel: 'J\ai remercié'});
    },


    openArchiverCandidature : function()
    {
        //console.log("open supprimer candidature");
        $('#mdArchiverCandidature').modal('show');
        ga('send', {hitType: 'event', eventCategory : 'Candidature', eventAction: 'nextAction', eventLabel: 'Ouverture conseil : archiver'});
    },

    archiverCandidature : function()
    {
        $('#mdArchiverCandidature').modal('hide');
        this.board.procArchiveCandidature($("#archiverEventSubType").val(),$("#archiverEventComment").val());

        ga('send', {hitType: 'event', eventCategory : 'Candidature', eventAction: 'nextAction', eventLabel: 'Archiver'});
    },

    maintenirCandidature : function()
    {
        $('#mdArchiverCandidature').modal('hide');

        var t = this,
            b = t.board,
            tl = b.timeLine,
            ty = CS.TYPES.MAINTENIR,
            c = b.selectedCandidature,
            evt = t.getNextActionEvt(c,ty,"archiverEventComment");

        tl.saveCandidatureEventQuery(evt,c);
        tl.addEventToCandidature(c,evt);
        b.buildCandidatures();

        ga('send', {hitType: 'event', eventCategory : 'Candidature', eventAction: 'nextAction', eventLabel: 'Maintenir actif'});
    },

    openRelancerCandidature : function(c)
    {
    	var t=this,
        	b = t.board,
        	// récupération de la date de la dernière candidature de cette candidature
    		lastActivity = this.getLastActivity(c),
	    	now = moment(),
	    	lC = lastActivity.lastCandidature, h ="", cEvt;
    	
    	//console.log("openRelancerCandidature");
    	
        if(lC) {
        	// @RG - CONSEIL : Dans le conseil 'Relancer Candidature', la différence de jour entre ajourd'hui et le dernier envoie de la candidature est affiché
    		h = now.diff(lC,'days');
        } 
        $(".mdJour").html(h);
    	
        if(b.timeLine) {
        	cEvt = b.timeLine.getRappel(c.events, CS.SUBTYPES.RAPPEL_POSTULE_RELANCE);
        	if(cEvt) { 
        		// @RG - CONSEIL : Dans le conseil 'Relancer Candidature', si un evt de rappel de type 'RELANCE CANDIDATURE' existe, alors 'modifier la date de votre rappel de relance' est affiché. Au clic sur le lien 'modifier', l'evt de rappel correspondant est affiché pour être modifié.
	        	h = "<a id='edEvt_" + cEvt.id + "' class='lienModifierRappelRelancer' onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil relancer candidature : modifier rappel') +"'>modifier</a> la date de votre rappel de relance";
	        	$(".mdModifierRelance").html(h);
        	} else {
	    		// @RG - CONSEIL : Dans le conseil 'Relancer Candidature', s'il n'existe pas d'evt de rappel de type 'RELANCE CANDIDATURE', alors le lien 'définir un rappel de relance' est affiché. Au clic sur le lien, la modale d'ajout d'un evt de rappel est affichée.
	    		h = "<a id='newEventButtonRappelRelanceCandidature' class='lienModifierRappelRelancer' onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil relancer candidature : ajouter rappel') +"'>définir un rappel de relance</a>";
	        	$(".mdModifierRelance").html(h);
	    	}
        	$(".lienModifierRappelRelancer").on("click", $.proxy(t.openModifierRappelRelancer, t));
        }
        
        h = "";
        if((c.emailContact && c.emailContact.length) || (c.telContact && c.telContact.length)) {
        	// @RG - CONSEIL : Dans le conseil 'Relancer Candidature', l'email et/ou le téléphone sont affichés s'ils sont renseignés
        	h = "relancer tout de suite ";
        	if(c.emailContact && c.emailContact.length && c.telContact && c.telContact.length) {
        		h += "sur <a href='mailto: " + c.emailContact + "' target='_blank' onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil relancer candidature : mailto') +"'>" + c.emailContact + "</a> ou au <a href='tel: " + c.telContact + "' target='_blank' onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil relancer candidature : tel') +"'>" + c.telContact + "</a>";
        	} else if (c.emailContact && c.emailContact.length){
        		h += "sur <a href='mailto: " + c.emailContact + "' target='_blank' onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil relancer candidature : mailto') +"'>" + c.emailContact + "</a>";
        	} else {
        		h += "au <a href='tel: " + c.telContact + "' target='_blank' onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil relancer candidature : tel') +"'>" + c.telContact + "</a>";
        	}       	
        } else {
        	if(c.type != CS.TYPES_CANDIDATURE.RESEAU) {
        		h = "relancer en retrouvant les coordonnées de l'entreprise <a href='http://www.google.fr/";
	        	if (c.nomSociete) {
	        		// @RG - CONSEIL : Dans le conseil 'Relancer Candidature', si aucune donnée de contact et si la candidature n'est pas de type 'RESEAU et si le nom de la societé est renseignée et qu'elle n'appartient pas à la blacklist alors la recherche google des coordonnées de l'entreprise est propoposée
	        		h += "#q=" + c.nomSociete;
	        	} 
	        	h += "' target='_blank' onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : relancer candidature : google') +"'>ici</a>";
        	} else {
        		// @RG - CONSEIL : Dans le conseil 'Relancer Candidature', si aucune données de contact et si la candidature est du type 'RESEAU', alors 'relancer votre contact' est affiché
        		h = "relancer votre contact" 
        	}
        }
        $(".mdRelancerContact").html(h);
        
        $('#mdRelancerCandidature').modal('show');
        
        ga('send', {hitType: 'event', eventCategory : 'Candidature', eventAction: 'nextAction', eventLabel: 'Ouverture conseil : relancer candidature'});
    },

    openModifierRappelRelancer : function(evt) {
    	var b = this.board;
    	$('#mdRelancerCandidature').modal('hide');
    	b.timeLine.openEventEdit(evt);
    },
    
    getNextActionEvt : function(c,ty,cmtField)
    {
        var evt = new CandidatureEvent();

        evt.candidatureId = c.id;
        evt.eventType = ty;
        evt.eventTime = moment();
        evt.comment = $("#"+cmtField).val();
        evt.src = "board";

        return evt;
    },

    relancerCandidature : function(evt)
    {
        var t = this,
            b = t.board,
            tl = b.timeLine,
            ty = CS.TYPES.AI_RELANCE,
            c = b.selectedCandidature,
            evt = t.getNextActionEvt(c,ty,"relancerEventComment");

        $('#mdRelancerCandidature').modal('hide');

        tl.saveCandidatureEventQuery(evt,c);
        tl.addEventToCandidature(c,evt);
        tl.changeCandidatureFromEvent(evt);

        ga('send', {hitType: 'event', eventCategory : 'Candidature', eventAction: 'nextAction', eventLabel: 'J\'ai relancé'});
    },

    openPostulerCandidature : function()
    {
        var c = this.board.selectedCandidature,
            url = c.urlSource, 
            emailContact = c.emailContact,
            nomSociete = c.nomSociete, h = "";

        //console.log("openPostulerCandidature");
        
        // @RG - CONSEIL : Dans le conseil 'Postuler', le lien 'Découvrez entreprise' est affiché si le nom de la socité est connu et qu'il n'appartient pas à la liste des jobboards
        if(nomSociete && CS.JOBBOARD.indexOf(nomSociete.toLowerCase())<0) {
        	h = "<a class='lienSociete' href='http://www.google.fr/#q=" + nomSociete + "' target='_blank' onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil postuler : google') +"'>Découvrez l\'entreprise</a>";
        }
        $(".mdSociete").html(h);
        	
    	// @RG - CONSEIL : Dans le conseil 'Postuler', le lien 'postulez ici' est affiché si la candidatures est de type 'OFFRE' et lorsque l'url existe et lorsque la société n'appartient pas à la liste des jobboards d. Sinon si l'email existe, le lien 'postulez sur emailContact' est affiché
        h = "";

        if(c.type == CS.TYPES_CANDIDATURE.OFFRE)
        {
        	if(url && !c.expired)
                h += "<b><a class='lienPostuler' href='" + url + "' target='_blank' onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : postuler - postulez ici') +"'>Postulez ici</a></b>";
        }
        else if (emailContact)
            h += "<b><a class='lienPostuler' href='mailto:" + emailContact + "' target='_blank' onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil postuler : mailto') +"'>Postulez sur " + emailContact + "</a></b>";

        if(h && $(".mdSociete").html())
            h = " et "+h;

    	$(".mdPostuler").html(h);
        
        $('#mdPostulerCandidature').modal('show');
        
        ga('send', {hitType: 'event', eventCategory : 'Candidature', eventAction: 'nextAction', eventLabel: 'Ouverture conseil : postuler'});
    },

    postulerCandidature : function()
    {
        var t = this,
            b = t.board,
            tl = b.timeLine,
            ty = CS.TYPES.AI_POSTULE,
            c = b.selectedCandidature,
            evt = t.getNextActionEvt(c,ty,"postulerEventComment");
        
        $('#mdPostulerCandidature').modal('hide');

        tl.saveCandidatureEventQuery(evt,c);
        tl.addEventToCandidature(c,evt);
        tl.changeCandidatureFromEvent(evt);

        ga('send', {hitType: 'event', eventCategory : 'Candidature', eventAction: 'nextAction', eventLabel: 'J\'ai postulé'});
    },

    openPreparer : function()
    {
    	var c = this.board.selectedCandidature,
        lieuSociete = c.ville,
        nomSociete = c.nomSociete, h = "";
    	
        //console.log("openPreparer");
        if(lieuSociete) {
        	// @RG - CONSEIL : Dans le conseil 'Se préparer', le lien 'préparez votre trajet ici' est affiché si le lieu de la société est renseigné
        	h = "\"Rien ne sert de courir, il faut partir à point\": la préparation de votre entretien commence dès votre porte : " + 
        			"<a class='lienTrajet' href='https://www.google.fr/maps/dir//" + lieuSociete + "' target='itineraire' onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : se préparer - itinéraire') +"'>Préparez votre trajet ici</a>";
        }
        $(".mdTrajet").html(h);
        
        $('#mdPreparerEntretien').modal('show');
        
        ga('send', {hitType: 'event', eventCategory : 'Candidature', eventAction: 'nextAction', eventLabel: 'Ouverture conseil : se préparer'});
    },

    preparerCandidature : function()
    {
        var t = this,
            b = t.board,
            tl = b.timeLine,
            ty = CS.TYPES.AI_PREPARE,
            c = b.selectedCandidature,
            evt = t.getNextActionEvt(c,ty,"preparerEventComment");

        $('#mdPreparerEntretien').modal('hide');

        tl.saveCandidatureEventQuery(evt,c);
        tl.addEventToCandidature(c,evt);
        b.buildCandidatures();

        ga('send', {hitType: 'event', eventCategory : 'Candidature', eventAction: 'nextAction', eventLabel: 'J\'ai préparé'});
    },

    initProposedActionButtons : function()
    {
        var t=this;
        $("#buttonArchiverCandidature").on("click",$.proxy( t.archiverCandidature, t));
        $("#buttonConserverCandidature").on("click",$.proxy( t.maintenirCandidature, t));
        $("#buttonPreparerCandidature").on("click",$.proxy( t.preparerCandidature, t));
        $("#buttonPostulerCandidature").on("click",$.proxy( t.postulerCandidature, t));
        $("#buttonRelancerCandidature").on("click",$.proxy( t.relancerCandidature, t));
        $("#buttonRelancerEntretien").on("click",$.proxy( t.relancerEntretien, t));
        $("#buttonRemercierEntretien").on("click",$.proxy( t.remercierEntretien, t));

        $(".nextActionButton").on("click",$.proxy( t.toggleComment, t, 1));
    },

    toggleComment : function(on)
    {
        var d = $(".nextActionDiv");

        if(on)
            d.show();
        else
            d.hide();
    }
}
