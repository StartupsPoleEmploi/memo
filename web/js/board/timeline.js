function TimeLine(board)
{
    this.init(board);
}

TimeLine.prototype = {

    board : null,

    eventSubTypes : { 1 : "Entretien physique", 2 : "Entretien téléphonique", 3 : "Entretien vidéo",
        4 : "Réponse négative" , 5 : "Pas de réponse", 6 : "Offre pourvue",
        7 : "Offre hors ligne" , 8 : "Ca ne m\'intéresse plus", 9 : "J\'ai le poste", 10 : "J\'ai trouvé un autre poste", 11 : "Autre" },

	eventTypes : { 1 : "Je dois relancer", 2 : "Echange de mail", 3 : "Entretien", 4 : "J'ai postulé",
        5 : "J'ai relancé", 6 : "Supprimer", 7 : "Rappel", 8 : "Note",   9 : "Maintenir actif", 10 : "J'ai préparé", 11 : "J'ai remercié"},

    init : function(board)
    {
        var t=this;
        t.board = board;

        // partie édition d'événement
        $("#edEventType").on("change", $.proxy(t.changeEdEventForm, t));
        var dEdEvt = $("#edDateEvent");
        dEdEvt.datetimepicker({format : "DD/MM/YYYY HH:mm", locale : "fr", showClose : true, icons : {close: 'glyphicon glyphicon-ok'}});
        t.editDateEvenement = dEdEvt.data("DateTimePicker");
        $("#edDateEvent>input").removeAttr("readonly");

        // boutons d'actions
        $("#buttonEditCandidatureEvent").on("click",$.proxy( t.editCandidatureEvent, t));
        $("#buttonSaveCandidatureEvent").on("click",$.proxy( t.saveCandidatureEvent, t));
        $(".buttonRemoveCandidatureEvent").on("click",$.proxy( t.removeCandidatureEvent, t));
        $("#newEventButton,#formActionNewEvent").on("click", $.proxy(t.openEventEdit, t));
    },

    showTimeLine : function()
    {
        var c=this.board.selectedCandidature,
            tL = $("#timeLine"),
            cF = $("#candidatureForm"),
            cFC = $("#candidatureFormColumn");

        if(c)
        {
            cF.removeClass("newCandidatureMode");
            /*this.resetEventForm();
            this.changeEventForm();*/
            cFC.attr("class","col-xs-12 col-md-8");
            tL.show();

            this.showCandidatureEvents(c);
        }
        else
        {
            tL.hide();
            cF.addClass("newCandidatureMode");
            cFC.attr("class","col-xs-12");
        }
    },

    initEdEventForm : function() {
    	var opts = "",
    		vTypes = this.eventTypes;
    		eventType = $("#edEventType"),
    		etat = lBR.board.selectedCandidature.etat;
    		
		// Initialisation de la liste des types d'evt
		opts += "<option value='"+CS.TYPES.ECHANGE_MAIL+"'>"+vTypes[2]+"</option>";
		opts += "<option value='"+CS.TYPES.ENTRETIEN+"'>"+vTypes[3]+"</option>";
        opts += "<option value='"+CS.TYPES.AI_POSTULE+"'>"+vTypes[4]+"</option>";
        opts += "<option value='"+CS.TYPES.AI_PREPARE+"'>"+vTypes[10]+"</option>";
        opts += "<option value='"+CS.TYPES.AI_RELANCE+"'>"+vTypes[5]+"</option>";
        opts += "<option value='"+CS.TYPES.AI_REMERCIE+"'>"+vTypes[11]+"</option>";
        if (etat != CS.ETATS.VA_POSTULER && etat != CS.ETATS.A_RELANCE) {
        	// Le rappel est proposé si la candidature n'est pas à l'état VA_POSTULER ni A_RELANCE
        	opts += "<option value='"+CS.TYPES.RAPPEL+"'>"+vTypes[7]+"</option>";
		}
        opts += "<option value='"+CS.TYPES.NOTE+"'>"+vTypes[8]+"</option>";
        opts += "<option value='"+CS.TYPES.ARCHIVER+"'>"+vTypes[6]+"</option>";
        eventType.html(opts);
    },
    
    // mise à jour du formulaire d'ajout d'event en fonction du type / sous type choisi
    changeEdEventForm : function()
    {
        var t=this,
        	etat = lBR.board.selectedCandidature.etat,
            eSTR = $("#edEventSubTypeRow"),
            ty = $("#edEventType").val(), v,
            eventSubType = $("#edEventSubType"), showEventSubType = 0,
            values = [{ v : 0, t : '' }], opts = "", typeLabel = "Raison" ;
        
        $('#labelDateEvent').text('Date');
        $("#edEventComment").val("");
        switch(eval(ty))
        {
        	case CS.TYPES.ENTRETIEN : {  // Entretien
        		// @RG - EVENEMENT : A l'ajout d'un evenement, la séléction du type 'ENTRETIEN' rafraichit la modale afin de valoriser le nouveau champ obligatoire 'Forme' sous la forme d'une liste déroulante
        		showEventSubType = 1;
                values = t.board.entretienOpts;
                typeLabel = "Forme";
                $('#labelDateEvent').append(' * (obligatoire)');
                break; }
            case CS.TYPES.ARCHIVER : { // Archiver
            	// @RG - EVENEMENT : A l'ajout d'un evenement, la séléction du type 'ARCHIVER' (Candidature terminée) rafraichit la modale afin de valoriser le nouveau champ obligatoire 'Raison' sous la forme d'une liste déroulante
            	showEventSubType = 1;
                values = t.board.archiveOpts;
                break; }
            case CS.TYPES.RAPPEL : { // Rappel
            	// @RG - EVENEMENT : A l'ajout d'un evenement, la séléction du type 'RAPPEL' rafraichit la modale afin de valoriser le nouveau champ obligatoire 'Type' sous la forme d'une liste déroulante. Cette liste déroulante est contextualisée par l'état de la candidature (La valeur 'Relancer votre candidature' pour l'état 'A POSTULE' et les valeurs 'Relancer après entretien' ou 'Remercier après entretien pour l'état 'ENTRETIEN') 
            	showEventSubType = 1;
                typeLabel = "Type";
                $('#labelDateEvent').append(' * (obligatoire)');
                // @RG - EVENEMENT : A l'ajout d'un evenement de 'RAPPEL' la liste déroulante du type est contextualisée par l'état de la candidature : la valeur 'Relancer votre candidature' pour l'état 'A POSTULE' et les valeurs 'Relancer après entretien' ou 'Remercier après entretien pour l'état 'ENTRETIEN'
                if(etat == CS.ETATS.ENTRETIEN) {
                	values = t.board.rappelEntretienOpts;
                	$("#edEventComment").val("Faire une relance suite à votre entretien");
                } else {
                	values = t.board.rappelAPostuleOpts;
                	$("#edEventComment").val("Faire une relance");
                }
                break; 
            }
        }

        if(showEventSubType)
            eSTR.show();
        else
            eSTR.hide();

        for(var i = 0; i<values.length; ++i)
            opts += "<option value='"+values[i].v+"'>"+values[i].t+"</option>";

        eventSubType.html(opts);

        $("#edEventSubTypeRow>label").html(typeLabel);

    },

    /*resetEventForm : function()
    {
        $("#eventComment").val("");
        $("#eventType").val(CS.TYPES.NOTE);
    },*/

    // enregistrement d'un event de candidature
    saveCandidatureEvent : function(cEvt)
    {
        // Afficher je dois relancer si aucun event explicite futur pour je dois relancer et si event création de plus d'une semaine et si candidature .etat est "j'ai postulé"

        var t=this,
            c = t.board.selectedCandidature,
            evt = new CandidatureEvent(),
            ty = $("#eventType").val(),
            sTy = $("#eventSubType").val(),
            comment = $("#eventComment").val(),
            eventTime = t.dateEvenement.date(),
            v = "newEvent";

        evt.candidatureId= c.id;
        evt.comment= comment;
        evt.eventType = ty;
        evt.eventSubType = sTy;
        evt.eventTime = eventTime?eventTime:moment();

        t.saveCandidatureEventQuery(evt,c);

        ga('send', {hitType: 'event', eventCategory : 'Candidature', eventAction: v, eventLabel: $("#eventType option:selected").text()});

        t.addEventToCandidature(c,evt);

        t.showTimeLine();

        t.changeCandidatureFromEvent(evt);
    },

    // enregistrement d'un event de candidature
    editCandidatureEvent : function(cEvt)
    {
        var t=this,
            c = t.board.selectedCandidature,
            evt= new CandidatureEvent(),
            cT = cEvt.currentTarget,
            id = cT.attributes['eventId'].value,
            idDivPrio = null,
            ty = $("#edEventType").val(),
            sTy = $("#edEventSubType").val(),
            sTyRappel = $("#edEventSubTypeRappel").val(),
            comment = $("#edEventComment").val(),
            eventTime = t.editDateEvenement.date(),
            v = "editEvent";

        if(cT.attributes['idDivPrio']) 
        	idDivPrio =  cT.attributes['idDivPrio'].value;
        
        if(!eventTime && ty == CS.TYPES.ENTRETIEN) {
            toastr['warning']("Vous devez renseigner la date de l'entretien","");
        } else {
        	evt.id = id;
            evt.candidatureId= c.id;
            evt.idDivPriorite = idDivPrio;
            evt.comment= comment;
            evt.eventType = ty;
            evt.eventSubType = sTy;
            evt.eventTime = eventTime?eventTime:moment();
            if (ty == CS.TYPES.RAPPEL) {
            	// On modifie le rappel s'il existe déjà sinon on l'ajoute
                evt = this.addOrUpdateEventRappel(c.events, evt);
            }

            if(evt) {
	            t.saveCandidatureEventQuery(evt,c);
	
	            ga('send', {hitType: 'event', eventCategory : 'Candidature', eventAction: v, eventLabel: $("#eventType option:selected").text()});
	
	            // prochain entretien
	            c.events = c.events || [];
	            c.events[evt.id] = evt;
	
	            t.setNextEntretien(c,evt);
	
	            t.showTimeLine();
	
	            t.changeCandidatureFromEvent(evt);
            }
        }
    },

    // enregistrement d'un event d'archivage suite à archivage
    saveArchiveCandidatureEvent : function(c, sTy, cmt)
    {
        var evt = new CandidatureEvent();
        evt.candidatureId = c.id;
        evt.eventType = CS.TYPES.ARCHIVER;
        evt.comment = cmt?cmt:$("#archiveEventComment").val() ;
        evt.eventSubType = sTy?sTy:$("#archiveEventSubType").val();
        evt.eventTime = moment();

        this.saveCandidatureEventQuery(evt, c)

        this.addEventToCandidature(c,evt);
    },

    saveCandidatureEventQuery : function(evt, c) {
        var evtRappel,
            lastActivity,
            lE,
    	    p = evt.getQParam();

        p += "&csrf="+$("#csrf").val();

        //console.log("event : ",evt,p);

        $.ajax({
            type: 'POST',
            url: lBR.rootURL + '/candidatures/event',
            data: p,
            dataType: "json",

            success: function (response) {
                if (response.result == "ok") {
                    toastr['success']("Evénement enregistré", "");

                    if (!evt.id || evt.id=="0")
                        lBR.board.timeLine.setEventCandidatureId(c.id, response.id);

                    if(evt.eventType==CS.TYPES.ENTRETIEN) {
                    	// @RG - EVENEMENT : A l'enregistrement d'un evt de type 'ENTRETIEN', un email est envoyé à l'utilisateur avec un rendez-vous de calendrier correspondant à la date de l'entretien
                        lBR.board.timeLine.sendInterviewCalendar(response.id);
                    }
                    
                    if(evt.eventType==CS.TYPES.AI_POSTULE || evt.eventType==CS.TYPES.ENTRETIEN) {
                    	// @RG - EVENEMENT : A l'enregistrement d'un evt de type 'AI_POSTULE', un evt rappel de type 'RELANCE CANDIDATURE' est enregistré automatiquement 
                    	// @RG - EVENEMENT : A l'enregistrement d'un evt de type 'ENTRETIEN', 2 evts rappels de type 'REMERCIER' et 'RELANCE ENTRETIEN' sont enregistrés automatiquement
                    	lBR.board.timeLine.saveCandidatureEventRappels(c);
                	} else if(evt.eventType==CS.TYPES.AI_RELANCE) {
                    	if(c.etat == CS.ETATS.A_RELANCE) {
                    		// On récupère le rappel correspondant et on le supprime si la relance est postérieure à la date de candidature
	                    	evtRappel = lBR.board.timeLine.getRappel(c.events, CS.SUBTYPES.RAPPEL_POSTULE_RELANCE);
	                    	if(evtRappel) {
		                    	lastActivity = lBR.board.nextEvents.getLastActivity(c);
		                    	lC = lastActivity.lastCandidature;
		                        if(evt.eventTime.isAfter(lC)) {
		                        	// @RG - EVENEMENT : A l'enregistrement d'un evt de type 'AI_RELANCE', si la candidature est à l'état 'A_POSTULE' (à ce niveau du code l'état de la candidature est déjà passé à l'état 'A_RELANCE'), et dispose d'un evt rappel de type 'RELANCE CANDIDATURE' avec une date postérieure à la date de la dernière candidature, celui-ci est supprimé
		                        	lBR.board.timeLine.removeCandidatureEventRappel(c, evtRappel);
		                        }
	                    	}
                    	} else if (c.etat == CS.ETATS.ENTRETIEN) {
	                    	// On récupère le rappel correspondant et on le supprime si la relance est postérieure à la date du dernier entretien
	                    	evtRappel = lBR.board.timeLine.getRappel(c.events, CS.SUBTYPES.RAPPEL_ENTRETIEN_RELANCE);
	                    	if(evtRappel) {
		                    	lastActivity = lBR.board.nextEvents.getLastActivity(c);
		                        lE = lastActivity.lastEntretien;
		                        if(evt.eventTime.isAfter(lE)) {
		                        	// @RG - EVENEMENT : A l'enregistrement d'un evt de type 'AI_RELANCE', si la candidature est à l'état 'ENTRETIEN' et dispose d'un evt rappel de type 'RELANCE ENTRETIEN' avec une date postérieure à la date du dernier entretien, celui-ci est supprimé
		                        	lBR.board.timeLine.removeCandidatureEventRappel(c, evtRappel);
		                        }
	                    	}
                    	}
                    } else if(evt.eventType==CS.TYPES.AI_REMERCIE) {
                    	// On récupère le rappel correspondant et on le supprime si la relance est postérieure au dernier entretien
                    	evtRappel = lBR.board.timeLine.getRappel(c.events, CS.SUBTYPES.RAPPEL_ENTRETIEN_REMERCIER);
                    	if(evtRappel) {
	                    	lastActivity = lBR.board.nextEvents.getLastActivity(c);
	                        lE = lastActivity.lastEntretien;
	                        if(evt.eventTime.isAfter(lE)) {
	                        	// @RG - EVENEMENT : A l'enregistrement d'un evt de type 'AI_REMERCIE', si la candidature est à l'état 'ENTRETIEN' et dispose d'un evt rappel de type 'RELANCE ENTRETIEN' avec une date postérieure à la date du dernier entretien, celui-ci est supprimé
	                        	lBR.board.timeLine.removeCandidatureEventRappel(c, evtRappel);
	                        }
                    	}
                    }

                   	// MAJ des priorités
                    lBR.conseils.loadAndShowNbPriorites();
                    // Désactivation de la priorité si celle-ci a été effectuée
                    if (evt.idDivPriorite)
                    	lBR.conseils.disablePriorite(evt.idDivPriorite, evt.eventType)
                }
                else {
                    toastr['error']("Erreur lors de l'enregistrement de l'événement", "Une erreur s'est produite " + response.msg);
                    lBR.manageError(response,"saveCandidatureEventQuery");
                }

                $('#mdEditEvent').modal('hide');
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                toastr['error']("Erreur lors de l'enregistrement de l'événément", "Une erreur s'est produite " + errorThrown);
                console.log('/candidature error: ' + textStatus);
                console.log("traitement erreur candidature");
            }
        });
    },

    sendInterviewCalendar : function(eventId)
    {
        var p = "csrf="+$("#csrf").val();

        $.ajax({
            type: 'POST',
            url: lBR.rootURL + '/candidatures/entretien/'+eventId,
            data : p,
            dataType: "json",

            success: function (response) {
                if (response.result != "ok") {
                    toastr['warning']("Erreur lors de l'envoi du rendez-vous dans votre calendrier", "Une erreur s'est produite " + response.msg);
                    lBR.manageError(response,"sendInterviewCalendar");
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                toastr['warning']("Erreur lors de l'envoi du rendez-vous dans votre calendrier", "Une erreur s'est produite " + errorThrown);
                console.log('/candidature error: ' + textStatus);
                console.log("traitement erreur candidature");
            }
        });

    },

    // ajout d'un event en fonction d'un drag & drop
    addCandidatureEvent : function(c,etat)
    {
        //console.log("addCandidatureEvent ",etat, c.etat);

        if(etat> c.etat)
        {

            var t = this,
                evt = new CandidatureEvent(),
                et = etat;

            evt.candidatureId = c.id;

            if(etat==CS.ETATS.A_POSTULE)
                et = CS.TYPES.AI_POSTULE;
            else if (etat==CS.ETATS.A_RELANCE)
                et = CS.TYPES.AI_RELANCE;

            evt.eventType = et;

            evt.comment = "";
            evt.eventTime = moment();

            evt.eventSubType = (etat == CS.ETATS.ENTRETIEN)?CS.SUBTYPES.ENTRETIEN_PHYSIQUE:0;

            p = evt.getQParam();

            p += "&csrf="+$("#csrf").val();

            $.ajax({
                type: 'POST',
                url: lBR.rootURL + '/candidatures/event',
                data: p,
                dataType: "json",

                success: function (response) {
                    if (response.result == "ok") {
                        var tl = lBR.board.timeLine;
                        toastr['success']("Evénement enregistré", "");
                        evt.id = response.id;
                        tl.setEventCandidatureId(c.id, evt.id);

                        if(evt.eventType==CS.TYPES.AI_POSTULE) {
                        	var lastActivity = lBR.board.nextEvents.getLastActivity(c), lC = lastActivity.lastCandidature;
                        	tl.saveCandidatureEventRappelRelancerCand(c, lC);
                    	}
                        
                        if(evt.eventType==CS.TYPES.ENTRETIEN)
                            tl.promptInfoEntretien(evt);
                        
                        // MAJ des priorités
                        lBR.conseils.loadAndShowNbPriorites();

                    }
                    else {
                        toastr['error']("Erreur lors de l'enregistrement de l'événement", "Une erreur s'est produite " + response.msg);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                    toastr['error']("Erreur lors de l'enregistrement de l'événément", "Une erreur s'est produite " + errorThrown);
                    console.log('/candidature error: ' + textStatus);
                    console.log("traitement erreur candidature");
                }
            });

            t.addEventToCandidature(c, evt);
        }
    },

    // affiche la modale de demandes de précisions sur l'entretien ajouté par drag & drop
    promptInfoEntretien : function(evt)
    {
        var b = this.board;
        b.currentEntretien = evt;

        $("#seEventSubType").val(CS.SUBTYPES.ENTRETIEN_PHYSIQUE);
        $("#seEventComment").val("");
        b.setEntretienDate.date(new Date());

        $("#mdSetEntretien").modal({backdrop: "static"});
    },

    // mise à jour de la candidature suite à l'ajout d'un event
    changeCandidatureFromEvent : function(evt)
    {
        var t = this,
            c = t.board.selectedCandidature,
            save = false,
            now = moment(), eT = evt.eventTime;

        switch(eval(evt.eventType))
        {
            case CS.TYPES.ENTRETIEN : {
                // si pas entretien alors entretien et save
                if(c.etat< CS.ETATS.ENTRETIEN) {
                    c.etat = CS.ETATS.ENTRETIEN;
                    save = true;
                }

                break;
            }

            case CS.TYPES.AI_POSTULE : {
                // si etat < postulé alors postulé et save
                if(c.etat<CS.ETATS.A_POSTULE)
                {
                    c.etat = CS.ETATS.A_POSTULE;
                    save = true;
                }
                break;
            }

            case CS.TYPES.AI_RELANCE : {
                // si etat < relancé alors relancé et save
                if(c.etat< CS.ETATS.A_RELANCE)
                {
                    c.etat = CS.ETATS.A_RELANCE;
                    save = true;
                }
                break;
            }

            case CS.TYPES.ARCHIVER: {

                // si pas archivé alors archivé et save
                if(!c.archived || c.archived<1)
                {
                    c.archived = 1;
                    save = true;
                }
                break;
            }
        }

        if(save) {
            t.board.form.etat.val(c.etat);
            t.board.updateCandidatureState(c);
            //t.board.buildCandidatures();  // appel à buildCandidature au cas où les conditions d'une suggestion de préparation seraient réunies

            if(!evt.src)   // à faire uniquement dans le cas du formulaire et pas dans le cas du changement d'état depuis le tableau de bord
                t.board.form.initCandidatureForm(c);
        }

        if( (c.archived && t.board.archiveMode) ||
            (!c.archived && !t.board.archivedMode) )
            t.board.buildCandidature(c);
        else
            t.board.removeCandidatureFromBoard(c);
    },

    // donne l'id retourné par le serveur à un nouvel événement
    setEventCandidatureId : function(cId, evtId)
    {
        var t=this,
            c = t.board.candidatures[cId],
            e = c.events["0"];

        e.id = evtId;
        c.events[e.id] = e;
        c.events["0"] = null;

        $("#rmEvt_0").attr("id","rmEvt_"+ e.id);
        $("#edEvt_0").attr("id","edEvt_"+ e.id);

    },

    // association d'événements chargés à leurs candidatures
    addEventsToCandidatures : function(events)
    {
        var t=this,
            c, cs = t.board.candidatures, evt;

        for(var i= 0, l=events.length; i<l; ++i)
        {
            evt = new CandidatureEvent(events[i]);
            c = cs[evt.candidatureId];

            if(c)
            {
                if(!c.events)
                    c.events = {};

                c.events[evt.id] = evt;

                // prochain entretien
                t.setNextEntretien(c,evt);
            }
        }
    },

    // ajout d'un événément à une candidature
    addEventToCandidature : function(c, evt)
    {
        var t=this;

        if(!c.events)
            c.events = {};

        t.setNextEntretien(c,evt);

        c.events[evt.id] = evt;
    },

    setNextEntretien : function(c, evt)
    {
        // prochain entretien
        if(evt.eventType==CS.TYPES.ENTRETIEN)
        {
            var cNE = c.nextEntretien, now = moment(), eT = evt.eventTime;
            if(!cNE)
                c.nextEntretien = eT;
            else
            {
                if( (cNE.isBefore(now) && eT.isAfter(cNE)) ||
                    (cNE.isAfter(now) && eT.isAfter(now) && eT.isBefore(cNE))
                )
                    c.nextEntretien = eT;
            }
        }
    },

    // chargement des events d'une candidature
    loadCandidatureEvents : function()
    {
        var u = lBR.rootURL + '/candidatures/events';
        if(memoVars.visitorLink)
            u+="?link="+memoVars.visitorLink;
        $.ajax({
            type: 'GET',
            url: u,
            dataType: "json",

            success: function (response)
            {
                lBR.board.hideBoardSpinner();

                if(response.result=="ok")
                {
                    lBR.board.timeLine.addEventsToCandidatures(response.events);

                    if(!memoVars.isVisitor && importOnStartup)       // s'il y a une url à importer à la connexion elle sera traitée ici et le buildCandidatures lui sera déféré.
                        lBR.board.launchImportOnStartup();
                    else
                        lBR.board.buildCandidatures();
                }
                else
                {
                    toastr['error']("Erreur lors du chargement des événements des candidatures","Une erreur s'est produite "+response.msg);
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                console.log('/candidature event error: ' + textStatus);
                lBR.board.hideBoardSpinner();
            }
        });
    },

    // affichage des events d'une candidature
    showCandidatureEvents : function(c)
    {
        var events = [], e, html="", before, after, bfCt= 0, afCt= 0, t=this, now = moment()/*, rappels = this.board.nextEvents.getRappels(c)*/;

        for( k in c.events)
        {
            if(c.events[k])
            {
                events.push(c.events[k]);
            }
        }
        //events = events.concat(rappels);

        events.sort(function(a,b){return b.eventTime - a.eventTime; });

        after = $("#pastTimeline");
        after.html("<div class='todo-tasklist'></div>");
        after= $("#pastTimeline>.todo-tasklist");

        before = $("#futureTimeline");
        before.html("<div class='todo-tasklist'></div>");
        before= $("#futureTimeline>.todo-tasklist");

        for(var i= 0, l=events.length; i<l; ++i)
        {
            e = events[i];

            html = "<div class='todo-tasklist-item eventType"+ e.eventType+"'>";

            //if(!e.isVirtual)
                html+="<div id='evtInfo_"+ e.id+"'>";

            html+="<div class='todo-tasklist-item-title'>";

            if(e.eventType==CS.TYPES.ENTRETIEN)
            {
                if(e.eventSubType)
                    html+= t.eventSubTypes[e.eventSubType];
                else
                    html+= "Entretien";
            }
            else if(e.eventType==CS.TYPES.ARCHIVER)
                html+="Suppression. Motif : "+t.eventSubTypes[e.eventSubType];
            else
                html+= t.eventTypes[e.eventType];
            html+="</div>";


            if(e.comment)
                html+= "<div class='todo-tasklist-item-text'>"+e.comment+"</div>";

            /*if(e.isVirtual)
             html+= "<div class='todo-tasklist-item-text'>VIRTUEL</div>";*/

            html+="<div class='todo-tasklist-controls pull-left'>";
            if(e.eventTime)
                html+= "<span class='todo-tasklist-date'><i class='fa fa-calendar'></i>"+e.eventTime.format("DD/MM/YYYY HH:mm")+"</span>";
            html+="</div>";

            if(!memoVars.isVisitor)
            {
                html+="<div class='todo-tasklist-controls pull-right'>";
                
                if(e.eventType!=CS.TYPES.MAINTENIR)
                	html+="<i id='edEvt_"+e.id+"' class='eventEdit fa fa-edit' title='Modifier'></i>";
                
                html+="<i id='rmEvt_"+e.id+"' class='eventRemove fa fa-remove' title='Supprimer'></i>";
                html+="</div>";
            }

            html+= "</div>";

            if(now > e.eventTime)
            {
                afCt++;
                after.append(html);
            }
            else
            {
                bfCt++;
                before.append(html);
            }
        }

        if(!memoVars.isVisitor)
        {
            $(".eventRemove").on("click", $.proxy(t.showRemoveEvent, t));
            $(".eventEdit").on("click", $.proxy(t.openEventEdit, t));
        }


        if(bfCt)
            before.prepend("<div class='timelineTitle'>Evénements à venir</div>");
        if(afCt)
            after.prepend("<div class='timelineTitle'>Evénements passés</div>");

        if(c.creationDate)
            after.append("<div class='autreDate'>Créé le "+c.creationDate.format('ddd DD MMMM YYYY')+" à " + c.creationDate.format('HH:mm')+"</div>");
    },

    openEventEdit : function(evt)
    {
        evt.stopPropagation();

        var t=this,
            c = t.board.selectedCandidature,
            cT = evt.currentTarget,
            elId = cT.attributes['id'].value,
            id,evnt;

        if(!c || elId.startsWith("vignetteActionNewEvent_")>0)
        {
            elId = evt.currentTarget.attributes['id'].value;
            id = elId.substring(elId.indexOf('_') + 1);

            c = t.board.candidatures["" + id];
            t.board.selectedCandidature = c;
            elId = "newEventButton";
        }

        // Init de la liste déroulante des types d'evt
        this.initEdEventForm();
        if(elId=="newEventButton" || elId=="formActionNewEvent" || elId=="newEventButtonRappelRelanceCandidature" || elId=="newEventButtonRappelRelanceEntretien")
        {
        	// Création d'un evt
            var eT = CS.TYPES.ECHANGE_MAIL, eST = null;
            if (elId=="newEventButton" || elId=="formActionNewEvent") {
	            // Préselection du type selon l'état
            	if(c.etat==CS.ETATS.VA_POSTULER)
	                eT = CS.TYPES.AI_POSTULE;
	            else if(c.etat==CS.ETATS.A_POSTULE)
	                eT = CS.TYPES.AI_RELANCE;
	            else if(c.etat==CS.ETATS.A_RELANCE)
	                eT = CS.TYPES.ENTRETIEN;
	            // Type evt
	            $("#edEventType").val(eT);
	            $("#edEventType").attr('disabled', false); // On active la modification du type
	            // Sous type evt
	            t.changeEdEventForm(); // MAJ du sous type en fonction du type
	            $("#edEventSubType").attr('disabled', false); // On active la modification du sous-type
	            $("#edEventComment").val(""); // Commentaire mis à vide
            } else {
            	eT = CS.TYPES.RAPPEL;
            	if (elId=="newEventButtonRappelRelanceCandidature") {
            		eST = CS.SUBTYPES.RAPPEL_POSTULE_RELANCE;
            		$("#edEventComment").val("Faire une relance");
            		
            	} else { 
            		eST = CS.SUBTYPES.RAPPEL_ENTRETIEN_RELANCE;
            		$("#edEventComment").val("Faire une relance suite à votre entretien");
            	}
            	// Type evt
	            $("#edEventType").val(eT);
	            $("#edEventType").attr('disabled', true); // On désactive la modification du type
	            // Sous type evt
	            t.changeEdEventForm(); // MAJ du sous type en fonction du type
	            $("#edEventSubType").attr('disabled', true); // On désactive la modification du sous-type
            }
            t.editDateEvenement.date(new Date()); // Date courante
            $("#mdEditEvent h4").html("Ajouter un événement");
            id=0;
        }
        else
        {
        	// Modification d'un evt
            id = elId.substring(elId.indexOf('_') + 1);
            evnt = c.events[id];
            // Type evt
            $("#edEventType").val(evnt.eventType);
            $("#edEventType").attr('disabled', true); // On désactive la modification du type
            // Sous type evt
            t.changeEdEventForm(); // MAJ du sous type en fonction du type
            $("#edEventSubType").val(evnt.eventSubType);
            $("#edEventSubType").attr('disabled', true); // On désactive la modification du sous-type
            if (evnt.eventType == CS.TYPES.RAPPEL) {
            	$("#edEventSubTypeRappel").val(evnt.eventSubType);
            }
            $("#edEventComment").val(evnt.comment);
            t.editDateEvenement.date(evnt.eventTime);
            $("#mdEditEvent h4").html("Modifier un événement");
        }

        $("#buttonEditCandidatureEvent").attr("eventId",id);
        $("#buttonEditCandidatureEvent").attr("idDivPrio", null);

        $('#mdEditEvent').modal('show');
    },

    showRemoveEvent : function(evt)
    {
        var t=this,
            c = t.board.selectedCandidature,
            elId = evt.currentTarget.attributes['id'].value;


        $(".buttonRemoveCandidatureEvent").attr("id","c"+elId);

        $('#mdRemoveCandidatureEvent').modal('show');
    },

    removeCandidatureEvent : function(evt)
    {
        var t=this,
            c = t.board.selectedCandidature,
            elId = evt.currentTarget.attributes['id'].value,
            id = elId.substring(elId.indexOf('_')+1),
            p = "csrf="+$("#csrf").val();

        $.ajax({
            type: 'DELETE',
            url: lBR.rootURL + '/candidatures/' + c.id+'/events/'+id,
            data : p,
            dataType: "json",

            success: function (response)
            {
                if(response.result=="ok")
                {
                    toastr['success']("Evénement supprimé","");

                    $('#mdRemoveCandidatureEvent').modal('hide');
                }
                else
                {
                    toastr['error']("Erreur lors de la suppression de l'événement","Une erreur s'est produite "+response.msg);
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                console.log('/candidature error: ' + textStatus);
                console.log("traitement erreur candidature");
            }
        });

        c.events[""+id]=null;
        t.showTimeLine();
    },
    
    // Retourne null si l'evt n'a pas été modifié
    addOrUpdateEventRappel : function(events, evt) {
    	var res = evt;
    	
    	for(i in events) {
            if(events[i] && events[i].eventSubType == evt.eventSubType) {
            	if (events[i].eventTime.isSame(evt.eventTime)  && events[i].comment == evt.comment) {
            		res = null
            	} else {
            		events[i].eventTime = evt.eventTime; // MAJ de l'heure de l'evt
            		events[i].comment = evt.comment; // MAJ du commentaire de l'evt
            		res = events[i];
            	}      	
        		break;
            }
        }
    	return res
    },
    
    // définit les événements de rappel à ajouter dans la timeLine d'une candidature
    saveCandidatureEventRappels : function(c)
    {
        var lastActivity = lBR.board.nextEvents.getLastActivity(c),
            rappels = [], now = moment(),
            lR = lastActivity.lastRelance,
            lC = lastActivity.lastCandidature,
            lA = lastActivity.lastActivity,
            lE = lastActivity.lastEntretien,
            lM = lastActivity.lastMerci,
            evts = c.events,
            evt, tmp, refreshTimeline = false;

        if(!lC)
            lC = c.lastUpdate;

        // ajouter un rappel de relance si candidature sans relance faite
        if(now.diff(lA,'days')<=20)
        {
        	// @RG - EVENEMENT : L'enregistrement automatique d'un evt de rappel a lieu si la dernière activité de la candidature ne dépasse pas les 20j
            if(c.etat==CS.ETATS.A_POSTULE && (!lR || lR.isBefore(lC)))
            {
            	this.saveCandidatureEventRappelRelancerCand(c, lC);
            }

            if(c.etat==CS.ETATS.ENTRETIEN && lE && (!lM || lM.isBefore(lE)))
            {
            	// @RG - EVENEMENT : A l'enregistrement automatique d'un evt de rappel de type 'REMERCIER', la date du rappel est valorisée par "date evt 'ENTRETIEN'" + 1j
                evt = new CandidatureEvent();
                evt.candidatureId= c.id;
                tmp = moment(lE);
                evt.eventTime = moment.max(tmp.add(1,"days"));
                evt.eventType = CS.TYPES.RAPPEL;
                evt.eventSubType = CS.SUBTYPES.RAPPEL_ENTRETIEN_REMERCIER;
                evt.comment = "Remercier le recruteur pour l'entretien";
                
                // On recherche si l'evt existe déjà ou non
                evt = this.addOrUpdateEventRappel(c.events, evt);
                if(evt) 
                	// ajout ou modification de l'evenemment si celui-ci existe déjà
	            	this.saveCandidatureEventRappelQuery(evt,c);
            }

            if(c.etat==CS.ETATS.ENTRETIEN && lE && (!lR || lR.isBefore(lE))) {
            	// @RG - EVENEMENT : A l'enregistrement automatique d'un evt de rappel de type 'RELANCE ENTRETIEN', la date du rappel est valorisée à "date evt 'A POSTULE'" + 4j
                evt = new CandidatureEvent();
                evt.candidatureId= c.id;
                tmp = moment(lE);
                evt.eventTime = moment.max(tmp.add(4, "days"));
                evt.eventType = CS.TYPES.RAPPEL;
                evt.eventSubType = CS.SUBTYPES.RAPPEL_ENTRETIEN_RELANCE;
                evt.comment = "Faire une relance suite à votre entretien";
                
                // On recherche si l'evt existe déjà ou non
                evt = this.addOrUpdateEventRappel(c.events, evt);
                if(evt) 
	                // ajout de l'evenemment
	            	this.saveCandidatureEventRappelQuery(evt,c);
            }
        }

        //return rappels;
    },
    
    saveCandidatureEventRappelQuery : function(evt, c) {

        var p = evt.getQParam();
        p += "&csrf="+$("#csrf").val();

        $.ajax({
            type: 'POST',
            url: lBR.rootURL + '/candidatures/eventRappel',
            data: p,
            dataType: "json",

            success: function (response) {
                if (response.result == "ok") {
                	toastr['success']("Evénement de rappel enregistré", "");
                	evt.id = response.id;
                	c.events["0"] = evt;
                    lBR.board.timeLine.setEventCandidatureId(c.id, response.id);
                    lBR.board.timeLine.addEventToCandidature(c,evt);
                    lBR.board.timeLine.showTimeLine();
                }
                else {

                    lBR.manageError(response,"saveCandidatureEventRappelQuery");

                    toastr['error']("Erreur lors de l'enregistrement de l'événement de rappel", "Une erreur s'est produite " + response.msg);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                toastr['error']("Erreur lors de l'enregistrement de l'événément de rappel", "Une erreur s'est produite " + errorThrown);
                console.log('/candidature error: ' + textStatus);
                console.log("traitement erreur candidature");
            }
        });
    },
    
    saveCandidatureEventRappelRelancerCand : function(c, lC) {
    	var evt, tmp;
    	
    	// @RG - EVENEMENT : A l'enregistrement automatique d'un evt de rappel de type 'RELANCE CANDIDATURE', la date du rappel est valorisée par "date evt 'A POSTULE'" + 7j
        evt = new CandidatureEvent();
        evt.candidatureId= c.id;
        tmp = moment(lC);
        evt.eventTime = moment.max(tmp.add(7,"days"));
        evt.eventType = CS.TYPES.RAPPEL;
        evt.eventSubType = CS.SUBTYPES.RAPPEL_POSTULE_RELANCE;
        evt.comment = "Faire une relance";

        // On recherche si l'evt existe déjà ou non
        evt = this.addOrUpdateEventRappel(c.events, evt);
        if(evt) 
            // ajout ou modification de l'evenemment si celui-ci existe déjà
        	this.saveCandidatureEventRappelQuery(evt,c);
    },
    
    saveCandidatureEventRappelRelancerEntr : function(evt, c) {
    	
    },
    
    
    getRappel : function(events, evtSubType) {
    	var evt = null;
    	if(events) {
    		for (i in events) {
    			if(events[i] && events[i].eventType == CS.TYPES.RAPPEL && events[i].eventSubType == evtSubType) {
    				evt = events[i];
    				break;
    			}
    		}
    	}
    	return evt;
    },
    
    removeCandidatureEventRappel : function(c, evt)
    {
        var t=this,
            p = "csrf="+$("#csrf").val();

        $.ajax({
            type: 'DELETE',
            url: lBR.rootURL + '/candidatures/'+c.id+'/events/'+evt.id,
            data : p,
            dataType: "json",

            success: function (response)
            {
                if(response.result=="ok")
                {
                    toastr['success']("Evénement de rappel supprimé","");
                    c.events[""+evt.id]=null;
                    lBR.board.timeLine.showTimeLine();
                }
                else
                {
                    lBR.manageError(response,"removeCandidatureEventRappel");
                    toastr['error']("Erreur lors de la suppression de l'événement de rappel","Une erreur s'est produite "+response.msg);
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                console.log('/candidature error: ' + textStatus);
                console.log("traitement erreur candidature");
            }
        });

        
    }
    
}

