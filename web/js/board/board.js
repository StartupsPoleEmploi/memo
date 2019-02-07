function Board()
{
    this.init();
}

// gère l'affichage du classeur et des fiches de candidatures
Board.prototype = {

    selectedCandidature: null,
    candidatures: null,
    archiveMode: 0,
    adviceWeight: {
        "": 0, "Conseil : archiver": -1, "Conseil : postuler": 1,
        "Conseil : relancer": 2, "Conseil : remercier": 3,
        "Conseil : se préparer": 4
    },
    getAdviceWeight : function(nA)
    {
        var a  = "";
        if(nA)
            a = nA.substring(nA.indexOf("title='")+7,nA.indexOf("'><span"));

        return this.adviceWeight[a];
    },

    archiveOpts: [{v: CS.SUBTYPES.REPONSE_NEG, t: 'Réponse négative'}, 
    	{v: CS.SUBTYPES.PAS_REPONSE, t: 'Pas de réponse'},
        {v: CS.SUBTYPES.OFFRE_POURVUE, t: 'Offre pourvue'}, {v: CS.SUBTYPES.OFFRE_HORS_LIGNE, t: 'Offre hors ligne'},
        {v: CS.SUBTYPES.INTERESSE_PLUS, t: 'Ca ne m\'intéresse plus'}, {v: CS.SUBTYPES.AI_POSTE, t: 'J\'ai le poste'},
        {v: CS.SUBTYPES.TROUVE_AUTRE_POSTE, t: 'J\'ai trouvé un autre poste'}, {v: CS.SUBTYPES.AUTRE, t: 'Autre'}],

    entretienOpts: [{v: CS.SUBTYPES.ENTRETIEN_PHYSIQUE, t: 'Entretien physique'},
        {v: CS.SUBTYPES.ENTRETIEN_TEL, t: 'Entretien téléphonique'},
        {v: CS.SUBTYPES.ENTRETIEN_VIDEO, t: 'Entretien vidéo'}],
        
    rappelAPostuleOpts: [{v: CS.SUBTYPES.RAPPEL_POSTULE_RELANCE, t: 'Relancer votre candidature'}],
            
    rappelEntretienOpts: [{v: CS.SUBTYPES.RAPPEL_ENTRETIEN_RELANCE, t: 'Relancer après entretien'},
        {v: CS.SUBTYPES.RAPPEL_ENTRETIEN_REMERCIER, t: 'Remercier après entretien'}],

    init : function () {
        var t = this;

        t.parser = new Parser(t);
        t.nextEvents = new NextEvents(t);
        t.searchTools = new SearchTools(t);
        t.timeLine = new TimeLine(t);
        t.form = new CandidatureForm(t);
        t.fileManager = new CandidatureFiles(t);

        $(".boutonCandidature").on("click", $.proxy(t.newCandidature, t));

        //$(".buttonShowCandidatureForm").on("click",$.proxy( t.form.goToCandidatureFormLastStep, t.form));

        // modal pour supprimer une candidature
        $("#formActionArchive").on("click", $.proxy(t.archiveCandidature, t));
        $("#buttonArchiveCandidature").on("click", $.proxy(t.confirmArchiveCandidature, t));

        // modal de refus d'une candidature
        $("#formActionRefused").on("click", $.proxy(t.refusCandidature, t));
        $("#buttonRefusCandidature").on("click", $.proxy(t.confirmRefusCandidature, t));

        // modale d'acceptation de candidature
        $("#formActionAccepted").on("click", $.proxy(t.acceptationCandidature, t));
        $("#buttonAcceptationCandidature").on("click", $.proxy(t.confirmAcceptationCandidature, t));

        // partie édition d'événement
        var seDEvt = $("#seDateEvent");
        seDEvt.datetimepicker({
            format: "DD/MM/YYYY HH:mm",
            locale: "fr",
            showClose: true,
            icons: {close: 'glyphicon glyphicon-ok'}
        });
        t.setEntretienDate = seDEvt.data("DateTimePicker");
        $("#seDateEvent>input").removeAttr("readonly");

        // initialisation des boutons de confirmation de suppression
        $(".buttonRemoveCandidature").on("click", $.proxy(t.confirmRemoveCandidature, t));

        t.quickImport = $("#quickImport");

        t.quickImport.on("input", $.proxy(t.parser.setImportButtonState, t.parser));

        t.parser.setImportButtonState();

        $("#buttonQuickImport").on("click", $.proxy(t.form.importOffre, t.form));
        t.quickImport.keypress(function (evt) {
            if (evt.which == 13) {
                lBR.board.form.importOffre({currentTarget: {id: "buttonQuickImport"}});
            }
        });


        //$("#mdNoCandidatureVideo").on("hidden.bs.modal", $.proxy(t.stopVideo, t));
        $("#buttonSetEntretien").on("click", $.proxy(t.setEntretien, t));

        // Drag & Drop

        if (!memoVars.isVisitor) {
            var el = document.getElementById("listeRelances"),
                p = {
                    group: "candidatures",
                    badges: ["badgeRelances"],
                    cardClass: "relance",
                    onAdd: function (evt) {
                        lBR.board.addCard(evt.item);
                    },
                    onRemove: function (evt) { /*lBR.board.updateCardCount(this.options.badges,-1);*/
                    }
                };
            t.listeRelances = Sortable.create(el, p);

            el = document.getElementById("listeTodos");
            p.cardClass = "brouillon";
            p.badges = ["badgeTodos"];
            this.listeTodos = Sortable.create(el, p);

            el = document.getElementById("listeCandidatures");
            p.cardClass = "candidature";
            p.badges = ["badgeCandidatures"];
            this.listeCandidatures = Sortable.create(el, p);

            el = document.getElementById("listeEntretiens");
            p.cardClass = "entretien";
            p.badges = ["badgeEntretiens"];
            this.listeEntretiens = Sortable.create(el, p);
        }

        /* création des options des modales archives*/
        var opts = "",
            sTy = $(".archiveEventSubType");
        for (var i = 0; i < t.archiveOpts.length; ++i)
            opts += "<option value='" + t.archiveOpts[i].v + "'>" + t.archiveOpts[i].t + "</option>";

        sTy.html(opts);
    },

    addCard: function (card) {
        var t = this,
            list,
            el = $(card),
            idList = el.parent().attr("id"),
            id = card.id.substring(card.id.indexOf('_') + 1),
            c = t.candidatures["" + id],
            action,
            etat;


        switch (idList) {
            case 'listeRelances' :
            {
                list = t.listeRelances;
                etat = CS.ETATS.A_RELANCE;
                action = 'J\'ai relancé';
                break;
            }
            case 'listeEntretiens' :
            {
                list = t.listeEntretiens;
                etat = CS.ETATS.ENTRETIEN;
                action = 'Entretien';
                break;
            }
            case 'listeCandidatures' :
            {
                list = t.listeCandidatures;
                etat = CS.ETATS.A_POSTULE;
                action = 'J\'ai postulé';
                break;
            }
            case 'listeTodos' :
            {
                list = t.listeTodos;
                etat = CS.ETATS.VA_POSTULER;
                action = 'Préparation';
                break;
            }
            default :
            {
                $logErr("ERROR binding etat avec liste deroulante : " + idList + " - " + c.nomCandidature);
                break;
            }
        }

        if (list) {
            t.timeLine.addCandidatureEvent(c, etat);

            c.etat = etat;

            //t.updateCandidatureDates(c,etat);

            t.updateCandidatureState(c);

            t.setCandidature(c);

            t.buildCandidature(c);

            t.updateCandidatureListHeight();

            ga('send', {
                hitType: 'event',
                eventCategory: 'Candidature',
                eventAction: 'ddCandidature',
                eventLabel: action
            });
        }

    },

    /*
     updateCardCount : function(badges,val)
     {
     for(var i=0; i<badges.length; ++i)
     {
     var e = $("#"+badges[i]);
     e.html(eval(e.html())+val);
     }
     },*/

    clearBoard: function () {
        this.selectedCandidature = null;
        this.candidatures = null;
        this.form.initCandidatureForm();

        $("#userLogin").html("");

        this.clearLists();

    },

    clearLists: function () {
        $("#listeTodos").html("");
        $("#listeCandidatures").html("");
        $("#listeRelances").html("");
        $("#listeEntretiens").html("");

        $("#listeTodosM").html("");
        $("#listeCandidaturesM").html("");
        $("#listeRelancesM").html("");
        $("#listeEntretiensM").html("");

        $("#badgeTodos").html("0");
        $("#badgeCandidatures").html("0");
        $("#badgeEntretiens").html("0");
        $("#badgeRelances").html("0");
    },


    // charge les fiches candidatures
    loadBoard: function () {

        $("#homeLandingFromImport").hide();

        this.setLogin();

        var u = lBR.rootURL + '/candidatures';
        if (memoVars.visitorLink)
            u += "?link=" + memoVars.visitorLink;

        this.showBoardSpinner();

        $.ajax({
            type: 'GET',
            url: u,
            dataType: "json",

            success: function (response) {
                if (response.result == "ok") {
                    lBR.board.addCandidaturesToStore(response.candidatures);
                    lBR.board.timeLine.loadCandidatureEvents();
                    lBR.board.startExpiredChecking();
                    lBR.board.startRefreshBoardChecking();
                }
                else
                {
                    lBR.manageError(response,"loadBoard");
                    toastr['error']("Erreur lors du chargement des candidatures", "Une erreur s'est produite " + response.msg);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                console.log('/candidature error: ' + textStatus);
                lBR.board.hideBoardSpinner();

                Raven.captureException("loadBoard ajax error : ",textStatus,errorThrown);
            }
        });
    },


    newCandidature: function (evt, h, s) {
        var t = this,
            etat = s;

        if (h != 1) {
            if (evt && evt.currentTarget && evt.currentTarget.attributes["etat"])
                etat = evt.currentTarget.attributes["etat"].value;
            $Hist({id: "newCandidature", etat: etat, step: '1'});
        }

        t.unselectCandidature();

        t.form.initCandidatureForm();

        t.form.etat.val(etat);

        t.form.displayFormStep("candidatureForm1stStep");

        t.form.showCandidatureForm();

        $("#videoFrameForm").hide();

        // on désactive le lien creer une fiche dans le menu
        lBR.refreshMenu($("#ficheButton"));
    },

    editCandidature: function (h) {
        var t = this,
            c = t.selectedCandidature;

        if (h != 1)
            $Hist({id: "openCandidature", cId: c.id});

        if (!c.descriptionLoaded)
            t.loadCandidature(c);
        else {
            t.form.initCandidatureForm(t.selectedCandidature);
            t.form.showCandidatureForm();
            t.fileManager.showAttachments();
        }
        // On masque les autres pages
        lBR.displayInnerPage();
        
        // on désactive le lien creer une fiche dans le menu
        lBR.refreshMenu($("#ficheButton"));
    },

    loadCandidature: function (c) {

        if($(".candidatureSpinner").length==0)  // on bloque un chargement s'il y en a déjà un en cours
        {
            var u = lBR.rootURL + '/candidatures/' + c.id;

            if (memoVars.visitorLink)
                u += "?link=" + memoVars.visitorLink;

            setTimeout(function () {

                $.ajax({
                    type: 'GET',
                    url: u,
                    dataType: "json",

                    success: function (response) {
                        if (response.result == "ok") {
                            c.descriptionLoaded = 1;
                            var rc = response.candidature;
                            if (rc.description)
                                c.description = rc.description;
                            if (rc.note)
                                c.note = rc.note;
                            lBR.board.form.initCandidatureForm(c);
                            lBR.board.form.showCandidatureForm();

                            lBR.board.loadAttachments(c);
                        }
                        else {
                            toastr['error']("Erreur lors du chargement de la description", "Une erreur s'est produite " + response.msg);
                            lBR.manageError(response,"loadCandidature");
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                        console.log('/candidature error: ' + textStatus);
                        console.log("traitement erreur candidature");
                        Raven.captureException("loadCandidature ajax error : ",textStatus,errorThrown);
                    },
                    complete: function (data) {
                        lBR.board.hideCandidatureSpinner(c.id);
                    }
                })
            }, 50);

            this.showCandidatureSpinner(c.id);
        }
    },

    loadAttachments : function(c) {
        var u = lBR.rootURL + '/attachments/' + c.id;

        if (memoVars.visitorLink)
            u += "?link=" + memoVars.visitorLink;

        $.ajax({
            type: 'GET',
            url: u,
            dataType: "json",

            success: function (response) {
                if (response.result == "ok") {
                    c.attachments = response.attachments;
                    lBR.board.fileManager.showAttachments();
                }
                else {
                    toastr['error']("Erreur lors du chargement des pièces jointes", "Une erreur s'est produite " + response.msg);
                    lBR.manageError(response,"loadAttachments");
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                console.log('/candidature error: ' + textStatus);
                console.log("traitement erreur candidature");
                Raven.captureException("loadAttachments ajax error : ",textStatus,errorThrown);
            }
        });
    },

    displayQuickImportButton: function (s) {
        var bt = $("#quickImportDiv");

        this.parser.setImportButtonState();
        this.quickImport.val("");

        if(!memoVars.isVisitor && s)
            bt.show();
        else
            bt.hide();
    },

    selectCandidature: function (evt) {
        // appelé lors de la sélection d'une candidature dans une des listes
        // récupération de l'id candidature dans le dom de l'objet sélectionné
        // récupération de la candidature correspondante dans la hash des candidatures

        this.unselectCandidature();
        this.selectedCandidature = null;
    },

    unselectCandidature: function () {
        // désélectionne l'éventuelle candidature sélectionnée
        // supprime le style sélectionné s'il y a lieu
        this.selectedCandidature = null;
    },

    setCandidatureExpired: function (c) {
        c.expired = 1;

        var txt = "L'offre pour la candidature " + c.nomCandidature;
        if (c.nomSociete)
            txt += " au sein de la société " + c.nomSociete;
        txt += " a expiré";

        toastr['warning'](txt, "");
    },
    
    refusCandidature: function (evt) {
        evt.stopPropagation();

        var t = this,
            c = t.selectedCandidature,
            h;

        // cas depuis le menu sur la vignette
        if (!c) {
            var elId = evt.currentTarget.attributes['id'].value,
                id = elId.substring(elId.indexOf('_') + 1);

            c = t.candidatures["" + id];
            t.selectedCandidature = c;
        }

        h = c.nomCandidature;

        if (c.nomSociete)
            h += " au sein de la société " + c.nomSociete;

        $(".mdPoste").html(h);
        $(".nextActionComment").val("");    // reset des champs commentaires des actions proposées
        $('#mdRefusCandidature').modal('show');

        ga('send', {
            hitType: 'event',
            eventCategory: 'Candidature',
            eventAction: 'refusCandidature',
            eventLabel: 'direct'
        });
    },

    confirmRefusCandidature: function (evt) {
        $('#mdRefusCandidature').modal('hide');
        this.procArchiveCandidature(CS.SUBTYPES.REPONSE_NEG, $("#refusEventComment").val()); // Pas de sélection de l'utilisateur donc on valorise directement avec la réponse négative
        ga('send', {
            hitType: 'event',
            eventCategory: 'Candidature',
            eventAction: 'refusCandidatureConfirm',
            eventLabel: 'direct'
        });
    },
    
    acceptationCandidature: function (evt) {
        evt.stopPropagation();

        var t = this,
            c = t.selectedCandidature,
            h;

        // cas depuis le menu sur la vignette
        if (!c) {
            var elId = evt.currentTarget.attributes['id'].value,
                id = elId.substring(elId.indexOf('_') + 1);

            c = t.candidatures["" + id];
            t.selectedCandidature = c;
        }

        h = c.nomCandidature;

        if (c.nomSociete)
            h += " au sein de la société " + c.nomSociete;

        $(".mdPoste").html(h);
        $("#acceptationEventComment").val("");    // reset des champs commentaires des actions proposées
        $('#mdAcceptationCandidature').modal('show');

        ga('send', {
            hitType: 'event',
            eventCategory: 'Candidature',
            eventAction: 'acceptationCandidature',
            eventLabel: 'direct'
        });
    },

    confirmAcceptationCandidature: function (evt) {
        $('#mdAcceptationCandidature').modal('hide');
        this.procArchiveCandidature(CS.SUBTYPES.AI_POSTE, $("#acceptationEventComment").val()); // Pas de sélection de l'utilisateur donc on valorise directement avec la réponse positive
        ga('send', {
            hitType: 'event',
            eventCategory: 'Candidature',
            eventAction: 'acceptationCandidatureConfirm',
            eventLabel: 'direct'
        });
    },
    
    archiveCandidature: function (evt) {
        evt.stopPropagation();

        var t = this,
            c = t.selectedCandidature,
            sTy = $("#archiveEventSubType"),
            h;

        // cas depuis le menu sur la vignette
        if (!c) {
            var elId = evt.currentTarget.attributes['id'].value,
                id = elId.substring(elId.indexOf('_') + 1);

            c = t.candidatures["" + id];
            t.selectedCandidature = c;
        }

        h = c.nomCandidature;

        sTy.val(CS.SUBTYPES.REPONSE_NEG); // Préselection par défaut de la raison "Réponse négative"

        if (c.nomSociete)
            h += " au sein de la société " + c.nomSociete;

        $(".mdPoste").html(h);

        $(".nextActionDiv").show();    // affichage de la zone commentaires
        $(".nextActionComment").val("");    // reset des champs commentaires des actions proposées

        $('#mdArchiveCandidature').modal('show');
    },

    confirmArchiveCandidature: function (evt) {
        $('#mdArchiveCandidature').modal('hide');
        this.procArchiveCandidature($("#archiveEventSubType").val(), $("#archiveEventComment").val());
    },

    procArchiveCandidature: function (sTy, cmt) {
        var t = this,
            c = t.selectedCandidature;

        if (!c) {
            toastr['error']("Erreur système", "001");
        }
        else {
            c.archived = 1;

            this.timeLine.saveArchiveCandidatureEvent(c, sTy, cmt);

            this.updateCandidatureState(c);

            t.updateBadge(c.etat, -1);
            t.candidatures["" + c.id] = c;
            t.selectedCandidature = null;
            
            // On ferme la candidature si celle-ci était ouverte
            if (t.editMode) {
            	t.form.cancelCandidatureForm();
            }

            var el = $("#candidature_" + c.id),
                elM = $("#candidatureM_" + c.id),
                dur = 1500;
            
            t.animateArchiveCandidature(el,elM, dur);

            setTimeout(function () { el.remove(); }, dur);
            setTimeout(function () { elM.remove(); }, dur);

            setTimeout(function () { lBR.board.reloadBoardIfEmpty(); }, dur+300);
        }
    },

    animateArchiveCandidature : function(el,elM,dur)
    {
        var elD = el[0],
            pos = elD.getBoundingClientRect();

        // version desktop
        el.css({
            position: "fixed",
            top: pos.y + "px",
            width: pos.width + "px",
            height: pos.height + "px",
            left: pos.x + "px", zIndex: 100000
        });

        el.animate({
            top: '20px',
            left: ($(window).width() - 60) + 'px',
            width: '20px',
            height: '20px',
            opacity: '0.3'
        }, dur);

        $(".animateMenu").toggleClass("glowAnimation");

        setTimeout(function () {
            $(".animateMenu").toggleClass("glowAnimation");
        }, 2000);

        // version réduite
        elM.animate({opacity: '0',}, dur);

    },

    reloadBoardIfEmpty : function()
    {
        if($(".fiche").length==0)
            lBR.showActives();
    },

    restoreCandidature : function(evt)
    {
        evt.stopPropagation();

        var t=this,
            elId = evt.currentTarget.attributes['id'].value,
            id = elId.substring(elId.indexOf('_')+1),
            c = t.candidatures[""+id];

        if(!c)
        {
            toastr['error']("Erreur système","001");
            //$.toaster({ priority : "danger", title : "Erreur système", message : "001"});
        }
        else
        {
            c.archived=0;
            this.updateCandidatureState(c);
            t.updateBadge(c.etat,-1);
            t.candidatures[""+ c.id] = c;
            t.selectedCandidature = null;

            var el = $("#candidature_"+ c.id),
                elM = $("#candidatureM_"+ c.id),
                dur=1500;

            t.animateRestoreCandidature(el,elM,dur)

            setTimeout(function(){el.remove();},dur);
            setTimeout(function(){elM.remove();},dur);

            toastr['success']("Candidature restaurée","");
        }
    },

    animateRestoreCandidature : function(el,elM,dur)
    {
        var tar = $("#activeButtonInBar"),
            tarD = tar[0],
            tarPos = tarD.getBoundingClientRect(),
            elD = el[0],
            pos = elD.getBoundingClientRect();

        // version desktop
        el.css( {
            position: "fixed",
            top: pos.y+"px",
            width: pos.width+"px",
            height: pos.height+"px",
            left: pos.x+"px", zIndex: 100000 } );

        el.animate({
            top: tarPos.top+'px',
            left: tarPos.left+'px',
            width: '20px',
            height: '20px',
            opacity: '0.3'
        },dur);

        // version réduite
        elM.animate({opacity: '0',},dur);
    },


    updateCandidatureState : function(c)
    {
        if(!c)
        {
            toastr['error']("Erreur système","001");
            //$.toaster({ priority : "danger", title : "Erreur système", message : "001"});
        }
        else
        {
            var p = c.getQParam();
            p += "&csrf="+$("#csrf").val();

            $.ajax({
                type: 'POST',
                url: lBR.rootURL + '/candidatures/state',
                data: p,
                dataType: "json",

                success: function (response)
                {
                    if(response.result=="ok")
                    {
                        //toastr['success']("Changement d'état enregistré","");
                    	// MAJ du compteur des priorités
                        lBR.conseils.loadAndShowNbPriorites();
                    }
                    else
                    {
                        toastr['error']("Erreur lors de l'enregistrement du changement d'état","Une erreur s'est produite "+response.msg);
                        lBR.manageError(response,"updateCandidatureState");
                    }
                },
                error: function (jqXHR, textStatus, errorThrown)
                {
                    // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                    console.log('/candidature error: ' + textStatus);
                    console.log("traitement erreur changement d'état candidature");
                    Raven.captureException("updateCandidatureState ajax error : ",textStatus,errorThrown);
                }
            });
        }
    },

    setCandidature : function(c)
    {
        var t = this;

        if(!t.candidatures)
            t.candidatures = {};

        t.candidatures[""+ c.id] = c;
        t.selectedCandidature = c;
    },

    // fixe le bon id pour une candidatures
    setCandidatureId : function(id)
    {
        var t=this, c=t.candidatures["0"];

        c.id = id;
        t.animateId = id;

        if(t.selectedCandidature && t.selectedCandidature.id==0)
            t.selectedCandidature=c;

        t.candidatures[""+id] = c;
        //t.candidatures["0"]=null;
        delete t.candidatures["0"];
        
        $("#candidature_0").remove();
        $("#candidatureM_0").remove();
        t.buildCandidature(c);

        // ajout entrée historique
        $Hist({ id : "openCandidature", cId : c.id });
    },

    animateQuikImportCandidature : function(id)
    {
        var el = $("#candidature_"+id),
            elM = $("#candidatureM_"+id),
            dur = 2000;

        this.animateNewElement(el,elM,dur);
    },

    animateNewElement : function(el,elM,dur)
    {
        el.css("opacity",0);
        el.animate({opacity: '1'},dur);
        elM.css("opacity",0);
        elM.animate({opacity: '1'},dur);
    },

    animateNewCandidature : function(id)
    {
        var el = $("#candidature_"+id),
            elM = $("#candidatureM_"+id),
            dur = 2000;

        this.animateNewElement(el,elM,dur);

        if(lBR.board.animateId==id)
            lBR.board.animateId = null;
    },

    addCandidaturesToStore : function(cs)
    {
        var t=this, c;

        if(!t.candidatures)
            t.candidatures = {};

        for(var i=0; i<cs.length; ++i)
        {
            c = new Candidature(cs[i]);
            t.candidatures[""+ c.id] = c;
        }
    },

    buildCandidatures : function()
    {
        var t=this;

        t.searchTools.updateSourceList();

        t.showBoardSpinner();

        setTimeout(function(){  // setimeout = hack pour permettre l'affichage du spinner

            var t = lBR.board, cs = t.candidatures, ct= 0, c;

            t.clearLists();

            cs = t.sortCandidatures(cs);

            for(var i= 0,l=cs.length; i<l; ++i)
            {
                c = cs[i];
                if(c)
                {
                    if( (t.archiveMode && c.archived) ||
                        (!t.archiveMode && !c.archived) )
                    {
                        ct++;
                        t.buildCandidature(c);
                    }
                }
            }
            // MAJ du compteur de priorites
            lBR.conseils.loadAndShowNbPriorites();
            
            $('#candidatureBoard .tooltipster').tooltipster({
                theme: 'tooltipster-borderless',
                debug : false,
                delay : 100
            });

            t.hideBoardSpinner();

            if(memoVars.cId) // ouverture de la fiche candidature en paramètre, une seule fois
            {
                if(t.candidatures[memoVars.cId])
                {
                    t.selectedCandidature = t.candidatures[memoVars.cId];
                    ga('send', { hitType : 'event', eventCategory : 'Candidature', eventAction : 'openCandidature', eventLabel : 'direct' });
                    t.editCandidature();
                }
                memoVars.cId = 0;
            }
            // bug lors d'un import via bouton MEMO sur PE.FR ou LBB, pour la 1ère candidature importée, le TDB doit être affiché
            if(!lBR.board.archiveMode) {
                lBR.showBreadcrumb("board");
                lBR.showNewCandidatureButtons();
                lBR.board.displayQuickImportButton(this.archiveMode ? 0 : 1);
            }
            $("#createCandidatureForm").hide();
            $("#videoFrameForm").hide();

            $("#boardPanel").show();

            // @RG - ONBOARDING affichage du WelcomeTour si moins de 2 cartes dans le TDB actif 
            if(ct<2 && !t.archiveMode) 
                lBR.onboarding.startWelcomingTour();

            if(t.animateId)
                t.animateNewCandidature(t.animateId);

            t.updateCandidatureListHeight();

            t.searchTools.saveBadgeValues();

            t.searchTools.search();

            if(!memoVars.isVisitor)
                lBR.conseils.giveConseil();

        }, 30);

    },

    sortCandidatures : function(list)
    {
        var cs = {},
            toSort = [],
            c;

        for(k in list)
        {
            c = list[""+k];

            if(c) {
                c.nextAction = (c) ? lBR.board.nextEvents.getNextActionAdvice(c) : "";
                toSort.push(c);
            }
        }

        toSort.sort(this.candidatureSortFunction);

        return toSort;
    },

    candidatureSortFunction : function(a,b)
    {
        var res = 0, dtA, dtB, cA=0, cB=0;
    	// @RG - TRI : le tri des cartes par colonne est le suivant : 1er critère=les cartes "NEW" (créées/modifiées il y a -de 24h), 2ème critère=les cartes avec action (me préparer > remercier > relancer > postuler > supprimer), 3ème critère=les cartes avec une étoile, 4ème critère=les cartes avec une date qui s'affiche sur la carte, de la plus récente à la plus ancienne dans toutes les colonnes
        if(a.etat==b.etat) // tri primaire par état
        {		
            // tri secondaire par conseil
            cA = lBR.board.getAdviceWeight(a.nextAction);
            cB = lBR.board.getAdviceWeight(b.nextAction);

            if(cA==cB)
            {
                // tri tertiaire par état favori
                if(a.rating==b.rating)
                {
                    // tri quaternaire par date
                    switch (a.etat) {
                        case CS.ETATS.VA_POSTULER :
                        {
                            dtA = a.creationDate;
                            dtB = b.creationDate;
                            break;
                        }
                        case CS.ETATS.A_POSTULE :
                        {
                            if (a.lastActivity && a.lastActivity.lastCandidature)
                                dtA = a.lastActivity.lastCandidature;
                            if (b.lastActivity && b.lastActivity.lastCandidature)
                                dtB = b.lastActivity.lastCandidature;
                            break;
                        }
                        case CS.ETATS.A_RELANCE :
                        {
                            if (a.lastActivity && a.lastActivity.lastRelance)
                                dtA = a.lastActivity.lastRelance;
                            if (b.lastActivity && b.lastActivity.lastRelance)
                                dtB = b.lastActivity.lastRelance;
                            break;
                        }
                        case CS.ETATS.ENTRETIEN :
                        {
                            dtA = a.nextEntretien;
                            dtB = b.nextEntretien;
                            break;
                        }
                    }

                    if(!dtA && !dtB)
                        res=0;
                    else if(dtA && dtB)
                    {
                        if(dtA.isBefore(dtB))
                            res=-1;
                        else if(dtB.isBefore(dtA))
                            res=1;
                        //else if dtA.isSame(dtB) inutile car implicite
                    }
                    else if(!dtA)
                        res = -1;
                    else if(!dtB)
                        res = 1;

                    if(!res)
                    {
                        // tri quinternaire par nom
                        res = b.nomCandidature.localeCompare(a.nomCandidature);
                    }
                }
                else
                    res = a.rating - b.rating;
            }
            else
                res = cA-cB;
        }
        else
            res = a.etat - b.etat;

        return res;
    },


    /*
    // affiche le formulaire de création avec msg de bienvenue quand il n'y a pas de candidature active
    // déplace la vidéo de home
    displayStartButton : function(ct)
    {
        var vidDiv = $("#videoFrameForm"), vid = $("#videoFrame");

        if(!memoVars.isVisitor && !ct && !this.archiveMode && lBR.loggedIn && !this.importOnStartupNotConsumed) // importOnStartupNotConsumed empêche de réinitialiser le formulaire lors d'un import on startup
        {
            this.form.displayFormStep("candidatureForm1stStep");
            this.form.initCandidatureForm(null,1);
            this.form.showCandidatureForm();

            vidDiv.show();

            //lBR.hideDashboardButton();
            this.form.hideSaveButton();

            lBR.hideBreadcrumb();   // cache le breadcrumb qui est inutile ici

            lBR.onboarding.startWelcomingTour();
        }
        else
        {
            if(!this.archiveMode) {  // remet le breadCrumb en mode tbb au cas où il était masqué
                lBR.showBreadcrumb("board");
            }

            vidDiv.hide();
        }
    },*/

    updateCandidatureListHeight : function()
    {
        if(!memoVars.isVisitor) {
            var t = this,
                lr = $("#" + t.listeRelances.el.id), lrH = 0,
                lt = $("#" + t.listeTodos.el.id), ltH = 0,
                lc = $("#" + t.listeCandidatures.el.id), lcH = 0,
                le = $("#" + t.listeEntretiens.el.id), leH = 0,
                maxH = 0, h, children, child;

            // suppression de tous les éléments de remplissage
            $(".filler").remove();

            setTimeout(function () {

                children = lr.children();

                for (var i = 0; i < children.length; ++i) {
                    if ($(children[i]).is(":visible"))
                        lrH += $(children[i]).outerHeight(true);
                }

                if (lrH && eval(lrH) > maxH)
                    maxH = lrH;

                children = lt.children();
                for (var i = 0; i < children.length; ++i) {
                    if ($(children[i]).is(":visible"))
                        ltH += $(children[i]).outerHeight(true);
                }

                if (ltH && ltH > maxH)
                    maxH = ltH;

                children = lc.children();
                for (var i = 0; i < children.length; ++i) {
                    if ($(children[i]).is(":visible"))
                        lcH += $(children[i]).outerHeight(true);
                }

                if (lcH && lcH > maxH)
                    maxH = lcH;

                children = le.children();
                for (var i = 0; i < children.length; ++i) {
                    if ($(children[i]).is(":visible"))
                        leH += $(children[i]).outerHeight(true);
                }

                if (leH && leH > maxH)
                    maxH = leH;

                //console.log("maxH : ",maxH, "  --- ",ltH,lcH,lrH,leH);

                if (lrH < maxH)
                    lr.append("<div class='filler hidden-xs' style='height:" + (maxH - lrH) + "px'></div>");
                if (ltH < maxH)
                    lt.append("<div class='filler hidden-xs' style='height:" + (maxH - ltH) + "px'></div>");
                if (lcH < maxH)
                    lc.append("<div class='filler hidden-xs' style='height:" + (maxH - lcH) + "px'></div>");
                if (leH < maxH)
                    le.append("<div class='filler hidden-xs' style='height:" + (maxH - leH) + "px'></div>");


            }, 30);
        }
    },

    updateBadge : function(etat,val)
    {
        var badge;
        switch(eval(etat))
        {
            case CS.ETATS.VA_POSTULER : {
                badge = $("#badgeTodos");
                break;
            }

            case CS.ETATS.A_POSTULE : {
                badge = $("#badgeCandidatures");
                break;
            }

            case CS.ETATS.A_RELANCE : {
                badge = $("#badgeRelances");
                break;
            }

            case CS.ETATS.ENTRETIEN : {
                badge = $("#badgeEntretiens");
                break;
            }
        }

        badge.html(eval(badge.html())+val);

    },

    buildCandidature : function(c,embededAdvice)
    {

        var t=this, hT, h, hM, cl, prt, prtM, dt,
            cId = "candidature_"+ c.id,
            cIdM = "candidatureM_"+ c.id,
            el = $("#"+cId),
            elM = $("#"+cIdM),
            rmId = "removeCandidature_"+ c.id,
            rmIdM = "removeCandidatureM_"+ c.id,
            btId="openCandidature_"+c.id,
            btIdM="openCandidatureM_"+c.id,
            mnId="menuCandidature_"+c.id,
            mnIdM="menuCandidatureM_"+c.id,
            mnIdBt="menuCandidatureBt_"+c.id,
            mnIdBtM="menuCandidatureBtM_"+c.id,
            nextAction;


        // récupération du conseil de nextAction et construction des dates d'événements de la candidature
        if(embededAdvice)
            nextAction = c.nextAction;
        else
            nextAction = (c)?t.nextEvents.getNextActionAdvice(c):"";

        if(t.archiveMode)  // en mode archive on ne donne pas de conseil de nextAction.
            nextAction="";

        if(el && el.length>0)
        {
            t.updateBadge(el.attr("etat"),-1);
            el.remove();
            elM.remove();
        }

        switch(eval(c.etat))
        {
            case CS.ETATS.VA_POSTULER : {
                cl = "brouillon";
                prt = $("#listeTodos");
                prtM = $("#listeTodosM");

                if(c.creationDate)
                    dt = "Créé le "+c.creationDate.format("DD MMM");

                break;
            }

            case CS.ETATS.A_POSTULE : {
                cl = "candidature";
                prt = $("#listeCandidatures");
                prtM = $("#listeCandidaturesM");

                if(c.lastActivity && c.lastActivity.lastCandidature)
                    dt = "Candidature le "+c.lastActivity.lastCandidature.format("DD MMM");

                break;
            }

            case CS.ETATS.A_RELANCE : {
                cl = "relance";
                prt = $("#listeRelances");
                prtM = $("#listeRelancesM");

                if(c.lastActivity && c.lastActivity.lastRelance)
                    dt = "Relancé le "+c.lastActivity.lastRelance.format("DD MMM");

                break;
            }

            case CS.ETATS.ENTRETIEN : {
                cl = "entretien";
                prt = $("#listeEntretiens");
                prtM = $("#listeEntretiensM");

                if(c.nextEntretien)
                    dt = c.nextEntretien;

                break;
            }
        }


        hT = '<div id="';
        h = hT+cId;
        hM = hT+cIdM;

        hT = '" etat="'+ c.etat+'" class="fiche '+cl+'">';
        h += hT+'<div class="dragDots tooltipster" title="Maintenez le bouton de la souris appuyé pour déplacer la carte d\'une colonne à l\'autre"></div>';

        hM += hT;

        // contenu

        hT='<div class="cornerRibbon tooltipster'+(c.rating?' favorite" title="Candidature favorite. Cliquez pour ne plus l\'avoir en favorite"':'" title="Cliquez pour ajouter aux candidatures favorites"')+' id="R';
        h  +=  hT+cId;
        hM += hT+cIdM;
        hT='"></div>';

        hT+=t.getCandidatureTypeLogo(c) +' <div class="titreCandidature tooltipster" id="T';

        h += hT+btId;
        hM += hT + btIdM;

        hT = '" title="'+ c.nomCandidature +'">'+ c.nomCandidature+'</span></div>';

        hT += '<div class="infoVignette" rel="'+ c.id +'">';

        if(dt)
        {
            if (c.etat == CS.ETATS.ENTRETIEN)
                hT += '<div class="dateEntretien"><i class="fa fa-bell"></i> ' + dt.format("ddd DD MMMM")+' à ' + dt.format("HH:mm");
            else
                hT += '<div class="autreDate">'+ dt;
            hT += '</div>';
        }

        hT += '<div class="row"><div class="col-xs-7">';

        if(c.nomSociete)
            hT += '<div class="societe">' + c.nomSociete + '</div>';
        if(c.ville)
            hT += '<div class="lieu">'+c.ville+'</div>';

        hT+='</div><div class="col-xs-5"><table class="pull-right"><tr><td style="text-align: center;">';

        if(c.urlSource)
        {
            hT+='<div title="Ouvrir l&#39offre dans un autre onglet" class="urlSource tooltipster';

            if(c.expired)
                hT+=' expiredSource';

            hT+='">';

            hT+=t.buildCandidatureLogo(c);

            hT+='<div><a target="_blank" href="';

            hT += c.urlSource;

            hT+='"><span>';

            if(c.expired)
                hT+='Hors ligne';
            else
                hT+=t.buildCandidatureLogo(c,1);
            hT+='</span></a></div>';

            hT+='</div>';
        }
        else if(c.logoUrl)
        {
            hT+= t.buildCandidatureLogo(c);
        }

        hT+='</td></tr></table></div></div>';

        h += hT;
        hM += hT;

        // actions
        hT='<div class="row">';

        hT+='<div class="col-xs-5 btnActions actionCol">';

        if(!memoVars.isVisitor)
        {
            hT += '<a href="javascript:;" id="';
            h += hT+mnIdBt;
            hM += hT+mnIdBtM;

            hT = '" class="btnAction tooltipster" title="Actions">';
            hT +='<i class="fa fa-angle-right"></i>Actions</a>';
        }
        hT+='</div>';

        hT+='<div class="col-xs-7 btnActions nextActionCol">';

        h += hT;
        hM += hT;

        if(nextAction)
        {
            var naClass = "";

            /*if(nextAction=="<span class='nextActionTitle'>Conseil :</span> supprimer")
                naClass+=" naSupprimer";*/

            if(!memoVars.isVisitor)
            {
                h+= '<a id="na_';
                hM+= '<a id="naM_';

                hT = c.id + '" cid="' + c.id + '" class="nextAction" caction="' + nextAction + '">' + nextAction + '</a>';
            }
            else
            {
                hT = '<span class="nextAction">' + nextAction + '</span>';
            }
        }
        else
        {
            hT = '<span>&nbsp;</span>';
        }


        hT+='</div></div></div><div class="menuVignette" id="';

        h += hT+mnId;
        hM += hT+mnIdM;

        hT = '" style="display: none" rel="'+ c.id +'"></div></div>';

        h += hT;
        hM += hT;

        prt.prepend(h);
        prtM.prepend(hM);

        $wST(0,1);

        if(!memoVars.isVisitor) {

            if (c.archived)
            {
                $("#" + rmId).on("click", $.proxy(t.removeCandidature, t));
                $("#" + rmIdM).on("click", $.proxy(t.removeCandidature, t));
            }

            if (c.archived)
            {
                $("#" + btId).on("click", $.proxy(t.restoreCandidature, t));
                $("#" + btIdM).on("click", $.proxy(t.restoreCandidature, t));
            }
            else
            {
                $("#" + btId).on("click", $.proxy(t.openCandidature, t));
                $("#" + btIdM).on("click", $.proxy(t.openCandidature, t));
            }

            $("#" + mnIdBt).on("click", $.proxy(t.openCandidatureMenu, t));
            $("#" + mnIdBtM).on("click", $.proxy(t.openCandidatureMenu, t));

            $("#R"+cId).on("click",$.proxy( t.setFavorite, t));
            $("#R"+cIdM).on("click",$.proxy( t.setFavorite, t));
        }

        $("#T"+btId).on("click",$.proxy( t.openCandidature, t));
        $("#T"+btIdM).on("click",$.proxy( t.openCandidature, t));

        $("#"+cIdM).on("click",$.proxy( t.selectCandidature, t));
        $("#"+cId).on("click",$.proxy( t.selectCandidature, t));


        if(nextAction && !memoVars.isVisitor)
        {
            $("#na_"+ c.id).on("click",$.proxy( t.nextEvents.openNextAction, t.nextEvents));
            $("#naM_"+ c.id).on("click",$.proxy( t.nextEvents.openNextAction, t.nextEvents));
        }

        if(t.animateQuick)
        {
            t.animateNewCandidature(c.id);
            t.animateQuick = 0;
        }

        t.updateBadge(c.etat,1);
    },

    getCandidatureTypeLogo : function(c)
    {
        var res = '<i class="cardTypeLogo tooltipster fa ',
            tcs = CS.TYPES_CANDIDATURE;
        switch(eval(c.type))
        {
            case tcs.OFFRE : { res += 'fa-newspaper-o" title="Offre"'; break; }
            case tcs.SPONT : { res += 'fa-envelope-o" title="Candidature spontanée"'; break; }
            case tcs.RESEAU : { res += 'fa-users" title="Contact réseau"'; break; }
            case tcs.AUTRE : { res += 'fa-puzzle-piece" title="Autre"'; break; }
            default : { res += '"'; break; }
        }

        res+= '></i>';

        return res;
    },

    setFavorite : function(evt)
    {
        evt.stopPropagation();

        var t=this,
            elId = evt.currentTarget.attributes['id'].value,
            id = elId.substring(elId.indexOf('_')+1),
            el = $("#"+elId),
            c = t.candidatures[""+id],
            status = (c.rating?0:1);

        c.rating=status;

        var p  = "csrf="+$("#csrf").val();

        $.ajax({
            type: 'POST',
            url: lBR.rootURL + '/candidatures/favorite/'+id+'/'+status,
            data : p,
            dataType: "json",

            success: function (response)
            {
                if(response.result=="ok")
                {
                    if(status)
                        toastr['success']("Candidature ajoutée aux favoris","");
                    else
                        toastr['success']("Candidature retirée des favoris","");
                }
                else
                {
                    toastr['error']("Erreur lors de la mise à jour de la candidature","Une erreur s'est produite "+response.msg);
                    lBR.manageError(response,"setFavorite");

                    /*
                     Restaurer la candidature qui devra être préalablement enregistrée dans un {} des candidatures supprimées
                     */
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                console.log('/candidature error: ' + textStatus);
                console.log("traitement erreur candidature");
                Raven.captureException("setFavorite ajax error : ",textStatus,errorThrown);
            }
        });

        t.toggleFavorite(el,id);
    },

    // on modifie l'affichage favori / pas favori pour les deux versions de la vignettes (mobile / pas mobile)
    toggleFavorite : function(el,id)
    {
        el.toggleClass("favorite"); // toggle sur élément cliqué

        var elId = el.attr("id"),   // identification du pair sur lequel on fait le toggle également
            id2 = "#Rcandidature";

        if(elId.indexOf("M")<0)
            id2+="M";

        $(id2+"_"+id).toggleClass("favorite");
    },

    buildCandidatureLogo : function(c, jobBoardOnly)
    {
        var h = "",
            s = c.urlSource,
            p,
            jB = "",
            l = "source_";

        if(s)
        {
            p = this.parser.getParser(s);

            if(!p.isGeneric)
            {
                l += p.logo;
                jB = p.name;
            }
            else
            {
                jB = "Lien vers l'offre";
            }

            h = "";
            if(l.length>7){
                h += '<a href="'+s+'" target="_blank"><img style="max-width:';
                if(c.logoUrl)
                    h+= '100px" src="'+c.logoUrl;
                else
                    h+= '48px" src="./pic/logos/'+l;

                h+='"  alt="logo '+jB+'"/></a>';
            }
            else
            {
                h+='<a href="'+ s +'" target="_blank" class="btn btn-sm" role="button">';
                h+='<i class="fa fa-link fa-4x"></i></a> ';
            }
        }
        else
        {   // sans lien
            h = "<img style='max-width:100px' src='"+c.logoUrl+"' alt='Logo "+ c.nomSociete+ "' />";
        }

        if(jobBoardOnly)
            h = jB;

        return h;
    },


    openCandidature : function(evt)
    {
        evt.stopPropagation();

        var t=this,
            elId = evt.currentTarget.attributes['id'].value,
            id = elId.substring(elId.indexOf('_')+1),
            c = t.candidatures[""+id];

        t.selectedCandidature = c;
        t.editMode = 1;

        if(elId.charAt(0)=='T')
            ga('send', { hitType : 'event', eventCategory : 'Candidature', eventAction : 'openCandidature', eventLabel : 'titre' });
        else
            ga('send', { hitType : 'event', eventCategory : 'Candidature', eventAction : 'openCandidature', eventLabel : 'editer' });

        t.editCandidature();
    },

    removeCandidature : function(evt)
    {
        evt.stopPropagation();

        var t=this,
            elId = evt.currentTarget.attributes['id'].value,
            id = elId.substring(elId.indexOf('_')+1),
            c = t.candidatures[""+id];
            h = c.nomCandidature;

        t.selectedCandidature = c;

        if(c.nomSociete)
            h+= " au sein de la société "+ c.nomSociete;

        $("#mdRemoveCandidaturePoste").html(h);

        $('#mdRemoveCandidature').modal('show');
    },

    hideModalRemoveOrArchive : function() {
    	$('#mdRemoveCandidature').modal('hide');
        $('#mdArchiveCandidature').modal('hide');
    },
    
    // async : appel ajax en synchrone ou en asynchrone
    confirmRemoveCandidature : function(async)
    {
        var t=this,
            c = t.selectedCandidature;
        
        t.hideModalRemoveOrArchive();
        
        // Si le paramètre async n'est pas renseigné, il est valorisé automatiquement à TRUE
        if (async == undefined)
        	async = true;

        var p = "csrf="+$("#csrf").val();

        $.ajax({
            type: 'DELETE',
            url: lBR.rootURL + '/candidatures/' + lBR.board.selectedCandidature.id,
            data : p,
            dataType: "json",
            async : async,

            success: function (response)
            {
                if(response.result=="ok")
                {
                    toastr['success']("Candidature supprimée","");
                    lBR.board.hideModalRemoveOrArchive();
                }
                else
                {
                    lBR.manageError(response);

                    toastr['error']("Erreur lors de la suppression de la candidature","Une erreur s'est produite "+response.msg);
                    lBR.manageError(response,"confirmRemoveCandidature");

                    //Restaurer la candidature qui devra être préalablement enregistrée dans un {} des candidatures supprimées
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                console.log('/candidature error: ' + textStatus);
                console.log("traitement erreur candidature");
                Raven.captureException("confirmRemoveCandidature ajax error : ",textStatus,errorThrown);
            }
        });

        t.removeCandidatureFromBoard(c);
        t.selectedCandidature = null;
        t.candidatures[""+ c.id] = null;
    },

    removeCandidatureFromBoard : function(c)
    {
        var t=this,
            el = $("#candidature_"+ c.id),
            elM = $("#candidatureM_"+ c.id),
            dur = 1500;

        t.updateBadge(c.etat,-1);

        t.animateRemoveCandidature(el,elM,dur);

        setTimeout(function(){el.remove();},dur);
        setTimeout(function(){elM.remove();},dur);
    },

    animateRemoveCandidature : function(el,elM,dur)
    {
        var elD = el[0],
            pos = elD.getBoundingClientRect();

        // version desktop
        el.css( {
            position: "fixed",
            top: pos.y+"px",
            width: pos.width+"px",
            height: pos.height+"px",
            left: pos.x+"px", zIndex: 100000 } );

        el.animate({
            top: $( window ).height()+'px',
            opacity: '0.3'
        },dur);

        // version réduite
        elM.animate({opacity: '0',},dur);
    },

    setQuickImportDisabledState : function(s)
    {
        var t=this,
            bt = $("#buttonQuickImport"),
            sp = $("#buttonQuickImport > i");
        t.quickImport.prop("disabled",s);

        if(s)
        {
            sp.show();
            bt.addClass("disabled");
        }
        else{
            sp.hide();
            bt.removeClass("disabled");
        }
    },

    hideBoardSpinner : function()
    {
        $("#boardSpinner").hide();
        $("#candidatureBoard").show();
        //console.log("fin hide board spinner");
    },

    showBoardSpinner : function()
    {
        $("#candidatureBoard").hide();
        $("#boardSpinner").show();
        //console.log("fin show board spinner");
    },

    // démarre le processus de vérification des offres expirées
    startExpiredChecking : function()
    {
        if(!memoVars.isVisitor && this.candidatures)
        {
            this.candidaturesToCheck = [];
            for(k in this.candidatures)
            {
                this.candidaturesToCheck.push(k);
            }
            this.checkOffre(0);
        }
    },

    // démarre le processus de vérification du besoin de reload du tableau de bord suite à import
    startRefreshBoardChecking : function()
    {
        if(!lBR.refreshBoardCheckingStarted)
        {
            lBR.refreshBoardCheckingStarted = setInterval(lBR.board.checkForBoardRefresh,5000);
        }
    },

    stopRefreshBoardChecking : function()
    {
        clearInterval(lBR.refreshBoardCheckingStarted);
        lBR.refreshBoardCheckingStarted = 0;
    },

    checkForBoardRefresh : function()
    {
        if(eval(localStorage.getItem("refreshBoardAfterImport")))
        {
            localStorage.setItem("refreshBoardAfterImport",0);
            lBR.board.loadBoard();
        }
    },

    checkOffre : function(idx)
    {
        var cId = this.candidaturesToCheck[idx], c;

        if(lBR.loggedIn && cId)
        {
            c = this.candidatures[cId];
            if(c && c.type==CS.TYPES_CANDIDATURE.OFFRE && c.urlSource && !c.expired && !c.archived && this.parser.getUrlParser(c.urlSource))
            {
                var parser = this.parser.getUrlParser(c.urlSource);

                if( !(parser instanceof ParserLaBonneBoite) &&
                    !(parser instanceof ParserLinkedIn)
                                                                )   // les contrôles ne sont pas pertinents pour tous les importeurs
                {

                    var p = "csrf=" + $("#csrf").val();

                    $.ajax({
                        type: 'POST',
                        url: lBR.rootURL + '/candidatures/checkOffre/' + c.id,
                        data: p,
                        dataType: "html",

                        success: function (response) {
                            if (lBR.loggedIn) {      // pour éviter la suite du process quand user déconnecté
                                var json;
                                try {
                                    json = JSON.parse(response);
                                }
                                catch (err) {
                                    Raven.captureException(err);
                                }

                                if (response == "error" || (json && json.result == "error")) {
                                    //toastr['warning']("Cette offre n'est plus disponible ou n'existe pas", "");
                                }
                                else {
                                    if (json.result == "expired") {
                                        c.expired = 1;
                                        lBR.board.setCandidatureExpired(c);
                                    }
                                }

                                setTimeout(function () {
                                    lBR.board.checkOffre(idx + 1);
                                }, 15000);
                            }

                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                            console.log('/check offre error: ' + textStatus);
                            console.log("traitement erreur check offre");
                            Raven.captureException("checkOffre ajax error : ", textStatus, errorThrown);
                        }
                    });
                }
            }
            else
            {
                //console.log("check pas offre ", c.id, c.urlSource);
                this.checkOffre(idx+1);
            }
        }
        /*else
            console.log("fin check offres");*/
    },

    // modifie les paramètres de l'event entretien suite à drag&drop
    setEntretien : function()
    {
        var t = this,
            evt = this.currentEntretien,
            c = this.candidatures[evt.candidatureId],
            eD = t.setEntretienDate.date();

        if(!eD)
        {
            toastr['warning']("Vous devez renseigner la date de l'entretien","");
        }
        else {
            evt.eventSubType = $("#seEventSubType").val();
            evt.comment = $("#seEventComment").val();
            evt.eventTime = eD;

            this.timeLine.saveCandidatureEventQuery(evt,c);

            $("#mdSetEntretien").modal("hide");

            t.timeLine.setNextEntretien(c,evt);

            t.buildCandidature(c);
        }
    },

    launchImportOnStartup : function()
    {
        this.importOnStartupNotConsumed=1;  // permet de ne pas afficher le formulaire de bienvenu lors d'un import à la volée.

        this.resizePopupOnStartup();

        this.prepareStartupUrl();

        var p = "url=" + Url.encode(memoVars.url), f = this.form;

        f.candidatureType.val(CS.TYPES_CANDIDATURE.OFFRE);
        f.urlSource.setValue(memoVars.url);

        // exécution de l'import, i représente l'action d'importOnStartup
        f.importOffreQuery(p, memoVars.url, "i");

        importOnStartup = 0;
    },

    resizePopupOnStartup : function()
    {
        if(screen.width>800 && (screen.height>window.outerHeight || screen.width>window.outerWidth))
        {
            window.moveTo(0,0);
            window.resizeTo((screen.width-100),(screen.height-100));
        }
    },

    prepareStartupUrl : function()
    {
        memoVars.url = decodeURIComponent(memoVars.url);
        memoVars.url.replace(/\s/gi,'+');
        memoVars.url = memoVars.url.trim();

        if(memoVars.url.toLowerCase().indexOf("http")!=0)
            memoVars.url = "http://"+ memoVars.url;
    },

    isSameUrl : function(cU, u)
    {
        var res = false, id1, id2;

        if(cU && u)
        {
            if (u.indexOf("labonneboite")>=0 && cU.indexOf("labonneboite")>=0)
            {
                if(cU.indexOf("/detail")>-1)
                {
                    id1 = cU.substring(0, cU.indexOf("/detail"));
                    id1 = id1.substring(id1.lastIndexOf("/") + 1);
                }
                if(u.indexOf("/detail")>-1)
                {
                    id2 = u.substring(0, u.indexOf("/detail"));
                    id2 = id2.substring(id2.lastIndexOf("/") + 1);
                }

                if (id1 && id2 && (id1 == id2))
                    res = true;
            }
            else if (cU == u) {

                res = true;
            }
        }

        return res;
    },

    openCandidatureMenu : function(evt)
    {
        var id = evt.currentTarget.id, el = $("#"+id), menu = el.parents(".fiche").find(".menuVignette"),
            menuId = menu.attr("id");

        el.parents(".infoVignette").hide();
        menu.attr("menuopen",1);
        menu.show();

        this.buildCandidatureMenu(menu);

        this.closeOtherCandidatureMenu(menuId);

        if(menuId.indexOf('M')<0)   // on ne lance pas ce timeout sur les vignettes "mobile"
            this.closeCandidatureMenuTimeout(menuId);
    },

    // ferme le menu de candidatue en paramètre
    closeCandidatureMenu : function(menuId)
    {
        var el = $("#"+menuId);

        el.attr("menuopen","");

        el.parents(".fiche").find(".infoVignette").show("slideDown");
        el.parents(".fiche").find(".menuVignette").hide("slideDown");
    },

    // ferme tous les menus de candidature ouverts autre que celui en paramètre
    closeOtherCandidatureMenu : function(menuId)
    {
        var openMenus = $("[menuopen=1].menuVignette"), id;

        for(var i= 0,l=openMenus.length; i<l; ++i)
        {
            id = openMenus[i].id;
            if(id!=menuId)
            {
                this.closeCandidatureMenu(id);
            }
        }
    },

    // ferme un menu de candidature si le curseur n'est pas sur le menu après 5 secondes
    closeCandidatureMenuTimeout : function(menuId)
    {
        setTimeout(function()
        {
            if(!$("#"+menuId+":hover").length)
                lBR.board.closeCandidatureMenu(menuId);
            else
                lBR.board.closeCandidatureMenuTimeout(menuId);

        },5000);
    },

    buildCandidatureMenu : function(menu)
    {
        menu.html("");

        var t = this, id = menu.attr("rel"), h='<ul>',
            edId = "vignetteActionEdit_"+id,
            neId = "vignetteActionNewEvent_"+id,
            acId = "vignetteActionAccepted_"+id,
            reId = "vignetteActionRefused_"+id,
            arId = "vignetteActionArchive_"+id,
            rsId = "vignetteActionRestaurer_"+id,
            efId = "vignetteActionEffacer_"+id;

        t.selectedCandidature = null;

        h+='<li id="'+edId+'" rel="'+id+'"><i class="fa fa-edit"></i> Voir</li>';
        h+='<li id="'+neId+'" rel="'+id+'"><i class="fa fa-calendar-plus-o"></i> Ajouter un événement</li>';

        if(!t.archiveMode)
        {
            h+='<li id="'+acId+'" rel="'+id+'"><i class="fa fa-handshake-o"></i> Gagné</li>';
            h+='<li id="'+reId+'" rel="'+id+'"><i class="fa fa-frown-o"></i> Refus</li>';
            h+='<li id="'+arId+'" rel="'+id+'"><i class="fa fa-trash"></i> Archiver</li>';
        }
        else
        {
            h+='<li id="'+rsId+'" rel="'+id+'"><i class="fa fa-reply"></i> Restaurer</li>';
            h+='<li id="'+efId+'" rel="'+id+'"><i class="fa fa-remove"></i> Effacer</li>';
        }
        h+="<li class='closeMenu'><i class='fa fa-angle-up'></i>Fermer</li>";
        h+='</ul>';

        menu.html(h);

        $("#"+edId).on("click",$.proxy(t.openCandidature, t));
        $("#"+neId).on("click", $.proxy(t.timeLine.openEventEdit, t.timeLine));

        if(!t.archiveMode)
        {
            $("#" + arId).on("click", $.proxy(t.archiveCandidature, t));
            $("#" + reId).on("click", $.proxy(t.refusCandidature, t));
            $("#" + acId).on("click", $.proxy(t.acceptationCandidature, t));
        }
        else
        {
            $("#" + rsId).on("click", $.proxy(t.restoreCandidature, t));
            $("#" + efId).on("click", $.proxy(t.removeCandidature, t));
        }

        $(".closeMenu").on("click", $.proxy(t.closeCandidatureMenu, t, menu[0].id ));
    },

    hideCandidatureSpinner : function(cId)
    {
        $('.infoVignette[rel='+cId+']').show();
        $('.candidatureSpinner').remove();
    },

    showCandidatureSpinner : function(cId)
    {
        var el = $('.infoVignette[rel='+cId+']');
        el.hide();
        el.after('<div class="candidatureSpinner"><i class="fa fa-spinner fa-spin"></i></div>');
    },

    setLogin : function()
    {
        var  l = memoVars.user.login;

        if(memoVars.user && memoVars.user.lastName)
            l = memoVars.user.lastName + " " + memoVars.user.firstName;

        if (memoVars.isVisitor) {
            $("#userLogin").html(l);
        } else {
            $("#userLogin").html("<a id='parametresLien'><i class='glyphicon glyphicon-user' style='padding-right:5px;'></i>" + l + "</a>");
        }
    },

    findCandidatureBySourceId : function(c)
    {
        if(c && c.sourceId && c.sourceId!="null")
        {
            for(k in this.candidatures)
            {
                var src = this.candidatures[k].sourceId;
                if (src && src!="null" && src == c.sourceId)
                    return this.candidatures[k];
            }
        }
        return;
    }

}
