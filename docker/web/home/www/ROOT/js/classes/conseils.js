function Conseils(board)
{
	this.init(board);
}

// gère l'affichage des conseils perso et des priorités
Conseils.prototype = {

	board: null,

	prioritesRemercierEntretien: Array(),
	prioritesRelancerEntretien: Array(),
	prioritesPreparerEntretien: Array(),
	prioritesRelancerCandidature: Array(),
	prioritesPostuler: Array(),
	nbPriorites: 0,
	//prioritesArchiver: null,
    
    init : function (board) {
		var t=this, v, ls = localStorage;
		t.board = board;

		v = ls.getItem("lastNudgeReseauDisplay");
		if(v)
			t.lastNudgeReseauDisplay  = new moment(eval(v));

		t.doNotShowNudgeReseau = ls.getItem("doNotShowNudgeReseau");

		$("#buttonCancelConseilNudgeReseau").on("click", $.proxy(t.cancelConseilNudgeReseau, t));
		$("#btDiscoverConseilReseau").on("click", $.proxy(t.showConseilsReseau, t));

		$(".conseilsClose").on("click", $.proxy(t.closeConseils, t));
        $(".prioritesFormCancel").on("click", $.proxy(this.cancelPriorites, this));
    },
    
    loadAndShowPrioritesAndNbPriorites : function() {
    	// MAJ des priorites
    	this.loadPriorites(lBR.board.candidatures);
    	
    	// MAJ de nbPriorite
    	lBR.conseils.loadNbPriorites();
    	
    	// Reset de la liste des prios
    	$("#prioritesForm").html("");
    	
    	// @RG - PRIORITES : Affichage des actions à mener en priorité (même principe que le mail des priorités du Lundi matin, à la différence que cette liste s’actualise en temps réel et qu’elle reprend toutes les cartes qui ont un conseil (sauf le conseil supprimer)
    	// Affichage des priorités
        if(lBR.conseils.nbPriorites > 0) {
            if (lBR.conseils.prioritesRemercierEntretien)
            	lBR.conseils.showPrioritesByType(lBR.conseils.prioritesRemercierEntretien, "<b>Remerciez</b> le recruteur suite à l'entretien pour ", 
            			"J'ai remercié", CS.TYPES.AI_REMERCIE, "btnPrioriteEntretien");
            if (lBR.conseils.prioritesRelancerEntretien)
            	lBR.conseils.showPrioritesByType(lBR.conseils.prioritesRelancerEntretien, "<b>Relancez</b> le recruteur suite à l'entretien pour ",
            			"J'ai relancé", CS.TYPES.AI_RELANCE, "btnPrioriteEntretien");
            if (lBR.conseils.prioritesPreparerEntretien)
            	lBR.conseils.showPrioritesByType(lBR.conseils.prioritesPreparerEntretien, "<b>Préparez</b> votre entretien pour ",
            			"J'ai préparé", CS.TYPES.AI_PREPARE, "btnPrioriteEntretien");
            if (lBR.conseils.prioritesRelancerCandidature)
            	lBR.conseils.showPrioritesByType(lBR.conseils.prioritesRelancerCandidature, "<b>Relancez votre candidature</b> : ",
            			"J'ai relancé", CS.TYPES.AI_RELANCE, "btnPrioriteRelancer");
            if (lBR.conseils.prioritesPostuler)
            	lBR.conseils.showPrioritesByType(lBR.conseils.prioritesPostuler, "<b>Postulez</b> à l'offre de ",
            			"J'ai postulé", CS.TYPES.AI_POSTULE, "btnPrioritePostuler");
        } else {
        	// @RG - PRIORITES : Si aucune priorité identifiée, le message 'Pour le moment, vous n'avez pas d actions prioritaires à effectuer.' est affiché
        	$("#prioritesForm").append("<span id='msgAucunePriorite'>Pour le moment, vous n'avez pas d'actions prioritaires à effectuer.</span>");
        }
        // Affichage du compteur
    	lBR.conseils.showNbPriorites();
    	
    	// @RG - GA : sonde d'ouverture de la modale pour ajouter un evt depuis les priorites
        ga('send', { hitType : 'event', eventCategory : 'Priorites', eventAction : 'affichage', eventLabel : 'liste'});
                
    },
    
    resetPriorites : function() {
    	this.nbPriorites = 0;
    	
    	this.prioritesRemercierEntretien = Array();
    	this.prioritesRelancerEntretien = Array();
    	this.prioritesPreparerEntretien = Array();
    	this.prioritesPostuler = Array();
    	this.prioritesRelancerCandidature = Array();
    },
    
    loadPriorites : function(tabCandidatures)
    {

        var c, lastActivity, nE, lE, lC, lR, lA, lP, lM, lRA,
        	now = moment();

        this.resetPriorites();
        // Parcours des candidatures
        for(var key in tabCandidatures) {
	        c = tabCandidatures[key];
        	if (c && !c.archived) {
		        lastActivity = lBR.board.nextEvents.getLastActivity(c);
		        nE = lastActivity.nextEntretien;
	            lE = lastActivity.lastEntretien;
	            lC = lastActivity.lastCandidature;
	            lR = lastActivity.lastRelance;
	            lRA = lastActivity.lastRelanceAlert;
	            lA = lastActivity.lastActivity;
	            lP = lastActivity.lastPreparation;
	            lM = lastActivity.lastMerci;
	            
		        c.lastActivity = lastActivity;
		
		        if(now.diff(lA,'days')>30)  {     
		        	
		        } else {
		
		            switch (eval(c.etat)) {
		                case CS.ETATS.VA_POSTULER  :  {
		                	// @RG - PRIORITE : La priorité 'Postuler' est affichée, si candidature à l'état 'VA_POSTULER' (=  @RG-CONSEIL)
		                	lBR.conseils.prioritesPostuler[c.id] = c;
		                    break;
		                }
		                case CS.ETATS.A_POSTULE  : {
	                        if( (lRA && now.isAfter(lRA)) ||     // si une alerte
	                            (!lRA && lC && (
	                                ( c.type == CS.TYPES_CANDIDATURE.OFFRE && now.diff(lC,'days')>=7 ) ||
	                                ( c.type == CS.TYPES_CANDIDATURE.RESEAU && now.diff(lC,'days')>=14 ) ||
	                                ( (c.type == CS.TYPES_CANDIDATURE.SPONT || c.type == CS.TYPES_CANDIDATURE.AUTRE) && now.diff(lC,'days')>=21 ) )
	                            )
	                          )
	                        {
	                            // @RG - PRIORITE : La priorité 'Relancer Candidature' est affiché, si candidature à l'état 'A_POSTULE' et une relance programmée est échue. Ou si pas de relance et la date dépasse une durée dépendant du type de candidature (=  @RG-CONSEIL)
	                            lBR.conseils.prioritesRelancerCandidature[c.id] = c;
	                        }
	
		                    break;
		                }
		                case CS.ETATS.ENTRETIEN : {
		                    if( nE && now.isBefore(nE) )
		                    {   
		                    	// @RG - PRIORITE : La priorité 'Se préparer' est affiché, si la candidature est à l'état 'ENTRETIEN' et s'il y a un entretien dans le futur positionné et qu'il n'y pas déjà eu d'evt 'J'ai préparé' (=  @RG-CONSEIL)
		                        if(!lP || !lE || !lP.isBefore(lE))
		                        	lBR.conseils.prioritesPreparerEntretien[c.id] = c;
		                    }
		                    else
		                    {
		                        if(lE && now.diff(lE,'days')>4)   
		                        {
		                        	// @RG - PRIORITE : La priorité 'Relancer Entretien' est affiché, si la candidature est à l'état 'ENTRETIEN' et si entretien passé depuis 4 jours et qu'il n'y pas déjà eu d'evt 'J'ai relancé' (=  @RG-CONSEIL)
		                            if(!lR || lR.isBefore(lE) )
		                            	lBR.conseils.prioritesRelancerEntretien[c.id] = c;
		                        }
		                        else if(lE && now.diff(lE,'hours')>0)  
		                        {
		                        	// @RG - PRIORITE : La priorité 'Remercier' est affiché, si la candidature est à l'état 'ENTRETIEN' et si entretien passé depuis moins de 4 jours et qu'il n'y pas déjà eu d'evt 'J'ai remercié' (=  @RG-CONSEIL)
		                            if(!lM || lM.isBefore(lE) )
		                            	lBR.conseils.prioritesRemercierEntretien[c.id] = c;
		                        }
		                    }
		                }
		            }
		        }
	        }
        }
    },
    
    showPriorites : function(h) {
    	
    	
    	if(lBR.board.form.hasChange)
        {
            lBR.board.form.afterChangeSave = "showPriorites";
            lBR.board.form.showUnsavedModal();
        }
        else
        {
            var t = this;

            if (h != 1)
                $Hist({id: "priorites"});

            // Retrait du mode archive
            lBR.board.archiveMode = 0;
        	$("body").removeClass("archives");
        	
            // Elements/Pages masqués
        	lBR.hideNewCandidatureButtons();
        	lBR.board.displayQuickImportButton(0);

			$("#boardPanel").hide();
			$("#createCandidatureForm").hide();

			lBR.displayInnerPage("#prioritesPage");

        	// Fil d'ariane
            lBR.showBreadcrumb("priorites");

            // MAJ du menu : on désactive le lien des priorites
            lBR.refreshMenu($("#prioritesButton"));
            
            // MAJ des priorites et affichage
            lBR.conseils.loadAndShowPrioritesAndNbPriorites();
        }
    },
    
    showPrioritesByType : function(tabPriorites, txtPrio, txtButtonPrio, typePrio, classButton) {
	    var h, btOpenCandId, btNewEventCandId, priorite;
	    
	    if (tabPriorites) {
			for(var idPriorite in tabPriorites) {
				priorite = tabPriorites[idPriorite];
				h = "<div id='priorite_" + typePrio + "_" + priorite.id + "' class='form-group'>";
				btOpenCandId = "prioOpenCand_" + priorite.id;
				btNewEventCandId = "prioNewEventCand-" + typePrio + "_" + priorite.id;
				h += 	"<div class='row'>";
				h += 		"<div class='col-md-8 col-xs-12' style='padding-top:5px;'>";
				h += 			"<span>" + txtPrio + "<a id='" + btOpenCandId + "' class='txtCandidature'>" + priorite.nomCandidature + "</a> ";
				
				if(priorite.nomSociete)
					h += " chez " + priorite.nomSociete;
				
				h += 			"</span>";
				h += 		"</div>";
				
				if (!memoVars.isVisitor) {
					// en mode visiteur, pas de bouton d'action
					h += "<div class='col-md-4 col-xs-12' style='text-align: center;'>";
					h += 	"<button id='" + btNewEventCandId + "' type='button' class='btn " + classButton + "'>" + txtButtonPrio + "</button>";
			    	h += "</div>";
				}
				h += 	"</div>";
				h += 	"<div class='row'>";
				h += 		"<div class='col-xs-4'></div><div class='col-xs-4'><div class='prioriteSeparator'></div></div><div class='col-xs-4'></div>";
				h += 	"</div>";
				h += "</div>";
				// ajout de la priorité au DOM
				$("#prioritesForm").append(h);
				$("#" + btOpenCandId).on("click", $.proxy(lBR.board.openCandidature, lBR.board));
				$("#" + btNewEventCandId).on("click", $.proxy(lBR.conseils.openNewEvent, lBR.conseils));
			}
	    }
    },
    
    loadAndShowNbPriorites : function() {
    	this.loadPriorites(lBR.board.candidatures);
    	this.loadNbPriorites();
    	this.showNbPriorites();
    },
    
    loadNbPriorites : function() {
    	this.nbPriorites = 0;
    	if(lBR.conseils.prioritesRemercierEntretien && lBR.conseils.prioritesRemercierEntretien.length>0)
    		this.nbPriorites += Object.keys(lBR.conseils.prioritesRemercierEntretien).length;
    	if(lBR.conseils.prioritesRelancerEntretien && lBR.conseils.prioritesRelancerEntretien.length>0)
    		this.nbPriorites += Object.keys(lBR.conseils.prioritesRelancerEntretien).length;
    	if(lBR.conseils.prioritesPreparerEntretien && lBR.conseils.prioritesPreparerEntretien.length>0)
    		this.nbPriorites += Object.keys(lBR.conseils.prioritesPreparerEntretien).length;
    	if(lBR.conseils.prioritesRelancerCandidature && lBR.conseils.prioritesRelancerCandidature.length>0)
    		this.nbPriorites += Object.keys(lBR.conseils.prioritesRelancerCandidature).length;
    	if(lBR.conseils.prioritesPostuler && lBR.conseils.prioritesPostuler.length>0)
    		this.nbPriorites += Object.keys(lBR.conseils.prioritesPostuler).length;
    },
    
    showNbPriorites : function() {    	
    	// @RG - PRIORITES : un compteur permet à l’utilisateur de savoir combien de candidatures sont « en attente d’action ». Il se met à jour immédiatement après chaque action réalisée.
    	if(this.nbPriorites > 0) {
    		$('#iconeMenuPriorites').hide();
    		// Badge ds menu
    		$('#badgePriorites').text(this.nbPriorites);
    		$('#badgePriorites').show(); 
    		// Badge du burger
    		$('#badgePrioritesB').text(this.nbPriorites);
    		$('#badgePrioritesB').show(); 
    		badgePrioritesB
    	} else {
    		$('#badgePriorites').hide();
    		$('#badgePrioritesB').hide();
    		$('#iconeMenuPriorites').show();
    	}
    },
    
    cancelPriorites : function(h) {
        if(this.hasChange)
        {
            this.afterChangeSave = "showPriorites";
            this.showUnsavedModal();
        }
        else
        {
            if (h != 1) {
            	$Hist({id: "activeCandidatures"});
            }

            if (!memoVars.isVisitor) {
            	lBR.showNewCandidatureButtons();
            	lBR.board.displayQuickImportButton(1);
            }
            
            $("#prioritesPage").hide();
            $("#boardPanel").show();

            lBR.refreshMenu($("#activeButton")); // on désactive les lien tableau de bord dans le menu
            
            lBR.board.buildCandidatures();

            lBR.board.selectedCandidature = null;
            
            $wST(0);
        }
    },
    
    openNewEvent : function(evt)
    {
        evt.stopPropagation();

        var t=this,
	        cT = evt.currentTarget,
	        elId = cT.attributes['id'].value, 
            candId,
            elIdDivPrio,
        	// liste déroulante des types d'evt
    		opts = "",
    		eventType = $("#edEventType");

        elIdDivPrio = elId.substring(elId.indexOf('-')+1);
        // Ajout d'un evt depuis les priorités 
        candId = elId.substring(elId.indexOf('_')+1);
    	eT = elId.substring(elId.indexOf('-')+1, elId.indexOf('_'));
        c = lBR.board.candidatures[""+candId];
        lBR.board.selectedCandidature = c;
        	
		// Init du type d'evt
		opts += "<option value='"+eT+"'>"+CS.TYPES_LIBELLE[eT]+"</option>";
        eventType.html(opts);
        $("#edEventType").attr('disabled', true); // On désactive la modification du type
        $("#edEventSubType").attr('disabled', true); // On désactive la modification du sous-type
    
        var dEdEvt = $("#edDateEvent");
        dEdEvt.datetimepicker({format : "DD/MM/YYYY HH:mm", locale : "fr", showClose : true, icons : {close: 'glyphicon glyphicon-ok'}});
        editDateEvenement = dEdEvt.data("DateTimePicker");
        editDateEvenement.date(new Date()); // Date courante
        
        $("#mdEditEvent h4").html("Ajouter un événement");
        $("#buttonEditCandidatureEvent").attr("eventId",0);
        // Passage de l'id de div de la prio pr le fadeTo
        $("#buttonEditCandidatureEvent").attr("idDivPrio", elIdDivPrio);
        $('#mdEditEvent').modal('show');
        
        // @RG - GA : sonde d'ouverture de la modale pour ajouter un evt depuis les priorites
        ga('send', { hitType : 'event', eventCategory : 'Priorites', eventAction : 'ouvertureEvt', eventLabel : CS.TYPES_LIBELLE[eT]});
    },
    
    disablePriorite : function(idDivPrio, typeEvt) {
        // @RG - GA : sonde d'ajout d'un evt depuis les priorites
        ga('send', { hitType : 'event', eventCategory : 'Priorites', eventAction : 'ajoutEvt', eventLabel : CS.TYPES_LIBELLE[typeEvt] });
        
    	if (idDivPrio) {
    		$('#priorite_'+idDivPrio).fadeToggle(3000);
    		$('#priorite_'+idDivPrio).find('*').unbind('click');
    		
        	// Affichage des priorités
            if(lBR.conseils.nbPriorites == 0) {
            	// Reset de la liste des prios
            	$("#prioritesForm").html("");
            	$("#prioritesForm").append("<span id='msgAucunePriorite'>Pour le moment, vous n'avez pas d'actions prioritaires à effectuer.</span>");
            }
    	} 
    },

	giveConseil : function()
	{
		var t=this,
			iCRR = t.isConseilReseauRequired();

		// @RG - CONSEIL : Affichage de la modale d'incitation à créer des fiches réseau si l'état des cartes le justifie ET l'utilisateur n'a pas demandé à ne plus voir ce conseil, et l'utilisateur n'a pas vu cette modale depuis plus de 9 jours
		if(!t.doNotShowNudgeReseau && (!t.lastNudgeReseauDisplay || new moment().diff(t.lastNudgeReseauDisplay,'days')>9) && iCRR)
		{
			ga('send', { hitType : 'event', eventCategory : 'Conseils', eventAction : 'affichageIncitationReseau' });

			$("#mdConseilNudgeReseau").modal("show");
			t.lastNudgeReseauDisplay = new moment();
			localStorage.setItem("lastNudgeReseauDisplay", new Date().getTime());
		}

		if(!iCRR)
			$("#conseilButton").hide();
	},

	// @RG - CONSEIL : Détermination des conditions d'affichage des incitations à créer des fiches réseau (pas plus de 1 carte réseau active, au moins 8 candidatures actives ou archivées)
	isConseilReseauRequired : function()
	{
		var cs = this.board.candidatures, res=true, reseauCt = 0, total = 0;
		for(k in cs)
		{
			total++;
			if(cs[k].type==CS.TYPES_CANDIDATURE.RESEAU && !cs[k].archived)
			{
				reseauCt++;
			}

			if(reseauCt>1)
			{
				res=false;
				break;
			}
		}

		if(total<8)
			res = false;

		return res;
	},

	show : function()
	{
		ga('send', { hitType : 'event', eventCategory : 'Conseils', eventAction : 'ouverture' });

		// l'écran des conseils n'est jamais consulté en archiveMode
		lBR.board.archiveMode = 0;
		$("body").removeClass("archives");

		// elements masqués
		lBR.hideNewCandidatureButtons();
		lBR.board.displayQuickImportButton(0);
		//$("#preferencePage").hide();
		$("#boardPanel").hide();
		$("#createCandidatureForm").hide();

		lBR.displayInnerPage("#conseilsPage");

		lBR.showBreadcrumb("conseils");
	},


	showConseilsReseau : function()
	{
		ga('send', { hitType : 'event', eventCategory : 'Conseils', eventAction : 'openFromIncitation' });
		this.cancelConseilNudgeReseau();
		$("#mdConseilNudgeReseau").modal("hide");
		lBR.showConseils();
	},

	cancelConseilNudgeReseau : function()
	{
		if($("#cbConseilNudgeReseauHide")[0].checked)
			localStorage.setItem("doNotShowNudgeReseau",1);
	},

	closeConseils : function()
	{
		lBR.showActives();
	}

}
