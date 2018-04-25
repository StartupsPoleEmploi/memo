function CandidatureForm(board)
{
    this.init(board);
}

CandidatureForm.prototype = {

    board: null,

    init: function (board) {
        var t = this;
        t.board = board;

        // Par défaut le spinner n'est pas affiché
        this.hideTunnelSpinner();

        $(".boutonSave").on("click", $.proxy(t.saveCandidature, t, 0));
        // evt de la modale d'édition du tunnel
        $("#editTunnelCheck").on("click", function () {
            localStorage.setItem("editTunnelOk", 1)
        });

        t.candidatureType = $("#candidatureType");
        t.candidatureType.on("change", $.proxy(t.changeCandidatureType, t));
        t.candidatureType.on("change", $.proxy(t.registerChange, t));

        $("#candidatureDataColumn i.fa-edit,.boutonEdit").on("click", $.proxy(t.displayEditableForm, t));

        $(".buttonCancelChanges").on("click", $.proxy(t.cancelChanges, t));
        $(".buttonSaveChanges").on("click", $.proxy(t.saveChanges, t));

        $("#buttonImportDoublonCandidature").on("click", $.proxy(t.followUpImport, t, true));
        $(".cancelCandDejaImportee").on("click", $.proxy(t.followUpImport, t, false));
        $("#mdCandDejaImportee .openFaqButton").on("click", $.proxy(t.openCandDejaImporteeFaq, t));

        var fctEnterCh = function (evt) {
            lBR.board.form.registerChange();
            if (evt.which == 13) {
                lBR.board.form.saveCandidature(1);
            }
        };

        t.logoUrl = $("#logoUrl");

        var p = {
            id: 'nomCandidature',
            type: 1,
            lTag: 'Titre ou poste de la candidature * (obligatoire)',
            tagOnTop: 1,
            errMsg: "Vous devez renseigner le titre de la candidature (maximum 128 caractères)",
            tag: 'Titre ou poste de la candidature',
            max: 128,
            isMetronic: false,
            nulValue: false,
            keyPressFct: fctEnterCh

        };
        t.nomCandidature = new TextField(p);

        p.id = 'nomCandidatureTunnel';
        p.keyPressFct = function (evt) {
            if (evt.which == 13) {
                lBR.board.form.goToStepContact();
            }
        };
        t.nomCandidatureTunnel = new TextField(p);

        p = {
            id: 'nomSociete',
            type: 1,
            lTag: 'Nom de la société',
            tagOnTop: 1,
            errMsg: 'Le texte est trop grand (maximum 128 caractères)',
            max: 128,
            isMetronic: false,
            tag: 'Société',
            nulValue: 1,
            keyPressFct: fctEnterCh
        };
        t.nomSociete = new TextField(p);

        p = {
            id: 'numSiret',
            type: 1,
            lTag: 'SIRET',
            tagOnTop: 1,
            errMsg: 'Le texte est trop grand (maximum 20 caractères)',
            max: 20,
            isMetronic: false,
            tag: 'Numéro de siret',
            nulValue: 1,
            keyPressFct: fctEnterCh
        };
        t.numSiret = new TextField(p);
        
        var renderLogoAutoComplete = function (item, search) {
            default_logo = 'https://s3.amazonaws.com/clearbit-blog/images/company_autocomplete_api/unknown.gif';

            if (item.logo == null) {
                logo = default_logo;
            } else {
                logo = item.logo + '?size=25';
            }
            container = '<div class="autocomplete-suggestion" data-src="' + (item.logo ? item.logo : '') + '" data-domain="' + item.domain + '" data-name="' + item.name + '" data-val="' + search + '">';
            container += '<span class="icon"><img align="center" src="' + logo + '" onerror="this.src=\'' + default_logo + '\'"></span> ';
            container += item.name + ' <span class="domain">(' + item.domain + ')</span></div>';
            return container;
        };

        var selectLogoAutoComplete = function (e, term, item) {
            lBR.board.form.updateFormLogo(item);
        };

        var sourceLogoAutoComplete = function (term, response) {
            $.getJSON('https://autocomplete.clearbit.com/v1/companies/suggest', {query: term}, function (data) {
                response(data);
            });
        };

        $('#nomSocieteF').autoComplete({
            minChars: 1,
            source: sourceLogoAutoComplete,
            renderItem: renderLogoAutoComplete,
            onSelect: selectLogoAutoComplete
        });

        p.id = 'nomSocieteTunnel';
        p.keyPressFct = function (evt) {
            if (evt.which == 13) {
                lBR.board.form.goToStepContact();
            }
        };
        t.nomSocieteTunnel = new TextField(p);

        $('#nomSocieteTunnelF').autoComplete({
            minChars: 1,
            source: sourceLogoAutoComplete,
            renderItem: renderLogoAutoComplete,
            onSelect: selectLogoAutoComplete
        });

        t.etat = $("#etat");
        $("#etat").on("change", $.proxy(t.registerChange, t));

        t.ville = new TextField({
            id: 'ville',
            type: 1,
            lTag: 'Lieu',
            tagOnTop: 1,
            errMsg: 'Le texte est trop grand (maximum 255 caractères)',
            max: 255,
            isMetronic: false,
            tag: 'Lieu',
            keyPressFct: fctEnterCh
        });

        p = {
            id: 'nomContact',
            type: 1,
            isMetronic: false,
            lTag: 'Nom de la personne à contacter',
            tagOnTop: 1,
            errMsg: 'Le texte est trop grand (maximum 255 caractères)',
            max: 255,
            tag: 'Nom de la personne à contacter',
            keyPressFct: fctEnterCh
        };
        t.nomContact = new TextField(p);

        var fctEnter = function (evt) {
            if (evt.which == 13) {
                lBR.board.form.goToStepProgress();
            }
        };

        p = {
            id: 'nomContactTunnel',
            type: 1,
            isMetronic: false,
            lTag: 'Nom de la personne à contacter * (obligatoire)',
            tagOnTop: 1,
            errMsg: 'Vous devez renseigner le nom de la personne (maximum 255 caractères)',
            max: 255,
            tag: 'Nom de la personne à contacter',
            nulValue: false,
            keyPressFct: fctEnter
        };

        t.nomContactTunnel = new TextField(p);

        p = {
            id: 'emailContact',
            type: 4,
            tagOnTop: 1,
            isMetronic: false,
            max: 128,
            errMsg: 'L\'adresse email doit être correctement formée et faire moins de 128 caractères',
            lTag: 'Adresse email de la personne à contacter',
            tag: 'Adresse email de la personne à contacter',
            keyPressFct: fctEnterCh
        };
        t.emailContact = new TextField(p);

        p.id = 'emailContactTunnel';
        p.keyPressFct = fctEnter;
        t.emailContactTunnel = new TextField(p);

        p = {
            id: 'telContact',
            type: 1,
            tagOnTop: 1,
            max: 24,
            errMsg: 'Le numéro est trop grand (maximum 24 caractères)',
            isMetronic: false,
            lTag: 'Numéro de téléphone de la personne à contacter',
            tag: 'Numéro de téléphone',
            keyPressFct: fctEnterCh
        };
        t.telContact = new TextField(p);

        p.id = 'telContactTunnel';
        p.keyPressFct = fctEnter;
        t.telContactTunnel = new TextField(p);

        t.urlSource = new TextField({
            id: 'urlSource',
            type: 1,
            tagOnTop: 1,
            isMetronic: false,
            lTag: 'Lien Internet de l\'offre',
            tag: 'Lien'
        });

        t.urlSource0 = new TextField({
            id: 'urlSource0',
            type: 1,
            isMetronic: false,
            button: {
                id: 'buttonImportCandidature0',
                tag: 'Enregistrer',
                //onClick : t.importOffre,
                onClick: t.goToForm,
                scope: t
            },
            //lTag : 'Lien vers l\'offre',
            tag: 'Coller ici le lien Internet de l&#39;offre',
            keyPressFct: function (evt) {
                if (evt.which == 13) {
                    var bt = $("#buttonImportCandidature0");
                    if (!bt.hasClass("disabled"))
                    //lBR.board.form.importOffre({currentTarget : {id : "buttonImportCandidature0"}});
                        lBR.board.form.goToStepProgress();
                }
            }
        });

        t.urlSource0.field.on("input", $.proxy(t.board.parser.setImportButtonState, t.board.parser));
        t.urlSource0.field.on("click", $.proxy(t.setDisabledBlocTunnel, t));
        $("#radioTunnelInst").change($.proxy(t.setDisabledBlocTunnel, t));

        t.titrePosteTunnel = new TextField({
            id: 'titrePosteTunnel',
            type: 1,
            isMetronic: false,
            button: {
                id: 'buttonMemoriserManuelTunnel',
                tag: 'Enregistrer',
                //onClick : t.importOffre,
                onClick: t.goToStepWithOffreManuel,
                scope: t
            },
            //lTag : 'Lien vers l\'offre',
            tag: 'Titre ou poste de l&#39;offre',
            keyPressFct: function (evt) {
                if (evt.which == 13) {
                    var bt = $("#buttonMemoriserManuelTunnel");
                    if (!bt.hasClass("disabled"))
                        lBR.board.form.goToStepProgress();
                }
            }
        });
        t.titrePosteTunnel.field.on("input", $.proxy(t.setMemoriserManuelButtonState, t));
        t.titrePosteTunnel.field.on("click", $.proxy(t.setDisabledBlocTunnel, t));
        $("#radioTunnelManu").change($.proxy(t.setDisabledBlocTunnel, t));

        // Par défaut, le bloc manuellement est grisé
        $('#tunnelManuellement').addClass('tunnelBlocDisabled');

        t.description = $("#description");
        t.description.on("keypress", $.proxy(t.registerChange, t));
        t.note = $("#note");
        t.note.on("keypress", $.proxy(t.registerChange, t));


        $("#goTo2ndStepWithOffre").on("click", $.proxy(t.goTo2ndStepWithOffre, t));
        $("#goToStepSpontane").on("click", $.proxy(t.goTo2ndStepSpontane, t));
        $("#goToStepContact").on("click", $.proxy(t.goToStepContact, t));
        $("#goToStepAutre").on("click", $.proxy(t.goToStepAutre, t));
        $("#goToStepProgress,#goToStepProgress2,#goToStepProgress3").on("click", $.proxy(t.goToStepProgress, t));
        $(".goToForm").on("click", $.proxy(t.goToForm, t));
        $(".goToStepEntretien").on("click", $.proxy(t.goToStepEntretien, t));
        $(".saveCandidatureTunnel").on("click", $.proxy(t.saveCandidatureTunnel, t));

        $("#buttonSaveCandidature2").on("click", $.proxy(t.saveCandidature, t, 0));
        $(".candidatureFormCancel").on("click", $.proxy(t.cancelCandidatureForm, t));
        $(".btnPrevious").on("click", $.proxy(t.goBack, t));

        var dEet = $("#ftDateEvent");
        if (dEet && dEet.length) {
	        dEet.datetimepicker({
	            format: "DD/MM/YYYY HH:mm",
	            locale: "fr",
	            showClose: true,
	            icons: {close: 'glyphicon glyphicon-ok'}
	        });
	        t.dateEntretien = dEet.data("DateTimePicker");
	        t.dateEntretien.date(new Date());
	        $("#ftDateEvent>input").removeAttr("readonly");
        }
    },

    showCandidatureForm: function (h) {
        var t = this;

        t.board.displayQuickImportButton(0);
        lBR.hideNewCandidatureButtons();
        // On masque les boutons spécifiques au tunnel
        $("#formButtonsTunnel").hide();

        this.hideSaveButton();
        lBR.showBreadcrumb("candidatureForm");
        //lBR.showDashboardButton();

        $("#boardPanel").hide();
        $("#createCandidatureForm").show();

        $wST(0);

        if (lBR.board.selectedCandidature && lBR.board.selectedCandidature.archived) {
            $("#createCandidatureForm").css('background', '#6b787f');
        } else {
            $("#createCandidatureForm").css('background', '#e6e6e6');
        }

        // On désactive le lien de création de fiche dans le menu
        lBR.refreshMenu($("#ficheButton"));

        //$('#createCandidatureForm').modal({backdrop: "static"});
    },

    cancelCandidatureForm: function (h) {
        this.tunnelType = null; // raz

        if (this.hasChange) {
            this.afterChangeSave = "showActives";
            this.showUnsavedModal();
        }
        else {
            if (h != 1) {
                if (this.board.archiveMode)
                    $Hist({id: "archivedCandidatures"});
                else
                    $Hist({id: "activeCandidatures"});
            }

            /*if(!lBR.board.archiveMode)    // masquage du bouton de retour au tableau de bord sauf dans le cas Archives
             lBR.hideDashboardButton();
             this.hideSaveButton();
             lBR.hideArchiveButton();*/
            if (lBR.board.archiveMode)    // modification du fil d'Ariane si corbeille
                lBR.showBreadcrumb("archives");
            else
                lBR.hideBreadcrumb();

            if (!memoVars.isVisitor) {
                if (!this.board.archiveMode) {
                    lBR.showNewCandidatureButtons();
                }
                this.board.displayQuickImportButton(this.board.archiveMode ? 0 : 1);
            }
            else {
                lBR.hideNewCandidatureButtons();
            }

            $("#createCandidatureForm").hide();
            lBR.displayInnerPage();
            $("#boardPanel").show();

            this.board.buildCandidatures();

            this.board.selectedCandidature = null;

            this.board.editMode = 0;

            if (this.board.archiveMode)
                lBR.refreshMenu($("#archiveButton"), $("#ficheButton")); // on désactive les liens corbeille et creer une fiche dans le menu
            else
                lBR.refreshMenu($("#activeButton")); // on désactive les lien tableau de bord dans le menu

            $wST(0);
        }
    },

    initCandidatureForm : function (candidature, onStart, doNotResetTunnel) {
        var c = candidature,
            t = this;

        t.resetErrorMessage();
        t.hasChange = 0;

        if (!t.tunnelType)
            $("#candidatureFormProgress").hide();
        else // mode tunnel, affichage de la progress bar
            $("#candidatureFormProgress").show();

        $("#candidatureFormColumn").show();
        $("#candidatureDataColumn").hide();

        $("#urlSourceComment").hide();
        $("#urlSourceComment").html("");

        t.setOffreFieldDisabledState(false);

        t.nomCandidature.setValue((c && c.nomCandidature) ? c.nomCandidature : "");
        t.nomSociete.setValue((c && c.nomSociete) ? c.nomSociete : "");
        t.numSiret.setValue((c && c.numSiret) ? c.numSiret : "");

        t.candidatureType.val((c && c.type) ? c.type : CS.TYPES_CANDIDATURE.OFFRE);
        t.etat.val((c && c.etat) ? c.etat : CS.ETATS.VA_POSTULER);
        t.ville.setValue((c && c.ville) ? c.ville : "");
        t.urlSource.setValue((c && c.urlSource) ? c.urlSource : "");
        $("#sourceId").val((c && c.sourceId) ? c.sourceId: "");
        $("#jobBoard").val((c && c.jobBoard) ? c.jobBoard: "");
        t.urlSource0.setValue("");

        t.changeCandidatureType();
        t.board.parser.setImportButtonState();
        t.setMemoriserManuelButtonState();

        t.nomContact.setValue((c && c.nomContact) ? c.nomContact : "");
        t.emailContact.setValue((c && c.emailContact) ? c.emailContact : "");
        t.telContact.setValue((c && c.telContact) ? c.telContact : "");
        t.logoUrl.val((c && c.logoUrl) ? c.logoUrl : "");
        //$("#formLogoSociete").html((c && c.logoUrl) ? t.buildFormLogoUrl(c.logoUrl) : "");
        t.buildFormLogoUrl((c && c.logoUrl)? c.logoUrl:"","#formLogoSociete");

        if (!doNotResetTunnel) {
            t.nomContactTunnel.setValue("");
            t.titrePosteTunnel.setValue("");
            t.emailContactTunnel.setValue("");
            t.telContactTunnel.setValue("");
            t.nomSocieteTunnel.setValue("");
            t.nomCandidatureTunnel.setValue("");
            t.buildFormLogoUrl("","#formLogoSocieteTunnel");
        }

        t.description.val((c && c.description) ? c.description : "");
        t.note.val((c && c.note) ? c.note : "");

        if (c)       // édition on affiche le formulaire directement
        {
            t.showCandidatureFormLastStep();
            t.showCandidatureData(c);
        }
        else {           // création on passe par le tunnel de création
            t.showCandidatureFormFirstStep(onStart);
            t.hideArchiveButtons();
            t.hideEditButton();
        }

        t.setCandidatureFormTitle(c);

        if (!memoVars.isVisitor) {
            if (c && c.archived) {
                t.setFormIsEditable(0);
            }
            else {
                t.setFormIsEditable(1);
            }
        }

        t.board.fileManager.showAttachments();
    },

    showCandidatureData: function (c) {
        var t = this,
            col = $("#candidatureDataColumn"),
            editBts = $("#candidatureDataColumn i.fa-edit,.boutonEdit,.boutonEvt"),
            v;

        // affichage ou non des boutons d'accès au formulaire
        if (memoVars.isVisitor || this.board.archiveMode) {
            editBts.hide();
            t.hideArchiveButtons();
        }
        else {
            editBts.show();
            t.showArchiveButtons();
        }

        $("#candidatureFormColumn").hide();

        $("#cdCandidatureName").html(c.nomCandidature);

        v = "Candidature spontanée";
        if (c.type == CS.TYPES_CANDIDATURE.OFFRE)
            v = "Offre en ligne";
        else if (c.type == CS.TYPES_CANDIDATURE.RESEAU)
            v = "Opportunité réseau";
        else if (c.type == CS.TYPES_CANDIDATURE.AUTRE)
            v = "Autre type";
        $("#cdCandidatureType").html(v);

        v = "Je vais postuler";
        if (c.etat == CS.ETATS.A_POSTULE)
            v = "J'ai postulé";
        else if (c.etat == CS.ETATS.A_RELANCE)
            v = "J'ai relancé";
        else if (c.etat == CS.ETATS.ENTRETIEN)
            v = "J'ai un entretien";
        $("#cdEtatCandidature").html(v);

        // bloc url, société, lieu, contact

        if (c.urlSource) {
            v = $("#cdUrlSource");
            v.attr("href", c.urlSource);

            v.html(c.urlSource);
            if (c.expired)
                v.attr("class", "expiredSource");
            else
                v.attr("class", "");

            $("#cdUrlSource").show();
        }
        else
            $("#cdUrlSource").hide();

        if (c.nomSociete)
            $("#cdNomSociete").html(c.nomSociete);
        else
            $("#cdNomSociete").html("");

        if (c.numSiret)
            $("#cdNumSiret").html(c.numSiret);
        else
            $("#cdNumSiret").html("");
        
        if (c.logoUrl)
            $("#cdNomSociete").append("<br /><img src='" + c.logoUrl + "' />");

        if (c.ville)
            $("#cdVille").html(c.ville);
        else
            $("#cdVille").html("");

        v = "";
        if (c.nomContact || c.emailContact || c.telContact) {
            if (c.nomContact)
                v += c.nomContact;

            if (c.telContact) {
                if (v)
                    v += "<br />";
                v += "<a href='tel:" + c.telContact + "'>" + c.telContact + "</a>";
            }

            if (c.emailContact) {
                if (v)
                    v += "<br />";
                v += "<a href='mailto:" + c.emailContact + "'>" + c.emailContact + "</a>";
            }

            $("#cdContactInfo").html(v);
        }
        else
            $("#cdContactInfo").html(v);

        // bloc description / note

        if (c.description) {
            $("#cdDescription").html(c.description.replace(/[\r\n]/g, '<br />'));
            $("#cdDescription").linkify();
        }
        else
            $("#cdDescription").html("");

        if (c.note) {
            $("#cdNote").html(c.note.replace(/[\r\n]/g, '<br />'));
            $("#cdNote").linkify();
        }
        else
            $("#cdNote").html("");

        // affichage de la colonne
        col.show();
    },

    displayEditableForm: function (e, h) {
        if (h != 1)
            $Hist({id: "editCandidature", cId: this.board.selectedCandidature.id});

        $("#candidatureFormColumn").show();
        $("#candidatureDataColumn").hide();

        this.showSaveButton();
        this.hideEditButton();
        //lBR.hideArchiveButtons();

        this.setDescriptionHeight();

        if (e) {
            var focusEl = $("#" + e.currentTarget.attributes.boomtarget.value);
            focusEl.focus();
            $wST(focusEl.offset().top - 150);
        }
        else
            setTimeout(function () {
                $wST(0);
            }, 30);    // hack pour permettre le scrolling sinon le redraw écrase le scrolltop
    },

    setDescriptionHeight: function () {
        setTimeout(function () {

            var t = lBR.board.form;
            t.description.height(80);
            t.description.height(t.description[0].scrollHeight);
            t.note.height(80);
            t.note.height(t.note[0].scrollHeight);
        }, 30);
    },

    setFormIsEditable: function (editable) {
        if (editable) {
            $("#buttonSaveCandidature2").show();
            //this.showSaveButton();
            $("#eventForm").show();

            $("#candidatureForm textarea").removeAttr("readonly");
            $("#candidatureForm input").removeAttr("readonly");
            $("#candidatureForm select").removeAttr("disabled");
        }
        else {
            $("#buttonSaveCandidature2").hide();
            $("#eventForm").hide();
            $("#candidatureForm textarea").attr("readonly", "1");
            $("#candidatureForm input").attr("readonly", "1");
            $("#candidatureForm select").attr("disabled", "1");
        }

    },

    setCandidatureFormTitle: function (c) {
        var el = $("#candidatureTitle");

        if (c) {
            n = c.nomCandidature;
            if (c.nomSociete)
                n += " chez " + c.nomSociete;
        } else {
            // Mode tunnel
            n = "Edition de la candidature"
        }

        el.html(n);
    },

    goToCandidatureFormLastStep: function (h) {
        var t = this, cT = t.candidatureType;
        if (h != 1) {
            $Hist({id: "newCandidature", etat: CS.ETATS.VA_POSTULER});
            if (!h)  // suite à import
                cT.val(2);
            else
                cT.val(h.currentTarget.attributes['rel'].value);
        }

        t.changeCandidatureType();
        t.showCandidatureFormLastStep();
    },

    showCandidatureFormLastStep: function () {
        // On masque le spinner
        this.hideTunnelSpinner();

        //$("#candidatureForm1stStep").hide();
        this.displayFormStep("candidatureForm");

        $("#candidatureForm").show();

        if (!memoVars.isVisitor) {
            if (this.tunnelType == null) {
                // On n'est pas en mode Tunnel
                $("#buttonSaveCandidature2").show();
                this.showSaveButton();
            }

            if (!this.board.selectedCandidature)
            {
                $("#formActionNewEvent").hide();
                $("#formActionManageAttachment").hide();
            }
        }
        if (this.tunnelType == null) {
            // On n'est pas en mode Tunnel
            $("#formButtons").show();
        }

        //lBR.showDashboardButton();
        lBR.showBreadcrumb("candidatureForm");
        $("#videoFrameForm").hide();

        this.board.timeLine.showTimeLine();

        this.displayBlocEtat();

        $wST(0);
    },

    displayBlocEtat: function ()    // affiche le bloc de formulaire état + type
    {
        var b = $("#formBlocEtat");
        if (this.board.selectedCandidature)
            b.show();
        else
            b.hide();
    },

    showSaveButton: function () // affichage du bouton d'enregistrement de candidature dans le header de la page
    {
        $(".boutonSave").show();
    },

    hideSaveButton: function () {
        $(".boutonSave").hide();
    },

    hideEditButton: function () {
        $(".boutonEdit").hide();
    },

    showEditButton: function () {
        $(".boutonEdit").hide();
    },

    showArchiveButtons: function () {
        $(".boutonArchiver").show();
    },

    hideArchiveButtons: function () {
        $(".boutonArchiver").hide();
    },

    showCandidatureFormFirstStep: function (onStart) {
        var noC = $("#noCardWelcomeMsg"), newC = $("#newCardMsg");
        $("#candidatureForm").hide();

        lBR.displayInnerPage();

        if (onStart) {
            noC.show();
            // On masque le 1er écran du tunnel
            $("#candidatureForm1stStep").hide();
        }
        else {
            noC.hide();

            $("#candidatureForm1stStep").show();
            newC.show();
            this.hideSaveButton();
            $("#formButtons").hide();

            $wST(0);
        }
    },

    resetErrorMessage: function () {
        var t = this;
        t.nomCandidature.hideError();
        t.nomSociete.hideError();
        t.ville.hideError();
        t.nomContact.hideError();
        t.emailContact.hideError();
        t.telContact.hideError();
    },

    saveCandidatureTunnel: function (evt)        // keepOpen : 0 ou absent, on retourne au tableau, 1 on reste en mode édit, 2 on bascule en mode données de la fiche
    {
        var etat = evt.currentTarget.value;
        this.etat.val(etat);
        this.saveCandidature();
    },


    autoSaveCandidature : function () {
        var t = this, tO = 0;

        if (!t.logoUrl.val() && t.nomSociete.getValue())
            tO = 100;

        setTimeout(function () {
            lBR.board.form.saveCandidature(1);
        }, tO);
    },

    saveCandidature : function (keepOpen, async)        // keepOpen : 0 ou absent, on retourne au tableau, 1 on reste en mode édit, 2 on bascule en mode données de la fiche
    {												   // async : appel ajax en synchrone ou en asynchrone
        var t = this,
            c = t.board.selectedCandidature,
            nC = t.nomCandidature.getValue(),
            nS = t.nomSociete.getValue(),
            numS = t.numSiret.getValue(),
            ville = t.ville.getValue(),
            nomC = t.nomContact.getValue(),
            emailC = t.emailContact.getValue(),
            telC = t.telContact.getValue(),
            v, ok = true,
            evt, candId;

        // Si le paramètre async n'est pas renseigné, il est valorisé automatiquement à TRUE
        if (async == undefined)
        	async = true;
        
        t.resetErrorMessage();

        $wST(0);

        t.hasChange = 0;    // raz des modifications non enregistrées

        if (!c) {
            c = new Candidature();
        }

        if (nC.length > 128 || nS.length > 128 || numS.length > 20 || ville.length > 255 || nomC.length > 255 || emailC.length > 128 || telC.length > 24) {
            ok = false;

            if (nC.length > 128)
                t.nomCandidature.showError();
            if (nS.length > 128)
                t.nomSociete.showError();
            if (numS.length > 20)
                t.numSiret.showError();
            if (ville.length > 255)
                t.ville.showError();
            if (nomC.length > 255)
                t.nomContact.showError();
            if (emailC.length > 128)
                t.emailContact.showError();
            if (telC.length > 24)
                t.telContact.showError();
        }

        if (!nC) {
            ok = false;
            t.nomCandidature.showError();
        }

        if (!t.emailContact.check()) {
            ok = false;
            t.emailContact.showError();
        }

        if (ok) {
            c.nomCandidature = nC;
            c.nomSociete = nS;
            c.numSiret = numS;
            // suppression des scripts
            c.description = t.description.val();
            c.note = t.note.val();
            c.etat = eval(t.etat.val());
            c.type = eval(t.candidatureType.val());
            c.ville = ville;
            //c.pays = t.pays.getValue();
            c.nomContact = nomC;
            c.rating=0;

            c.emailContact = emailC;
            c.telContact = telC;
            
            if(!c.urlSource)
            	c.urlSource = t.urlSource.getValue().trim();
            
            if (c.urlSource && c.urlSource.indexOf("http") != 0)
                c.urlSource = "http://" + c.urlSource;
            
            if (!c.creationDate)
        		c.creationDate = moment();
            
            c.sourceId = $("#sourceId").val();
            c.jobBoard = $("#jobBoard").val();

            c.logoUrl = t.logoUrl.val();
            if (c.logoUrl.length > 255)
                c.logoUrl = "";

            p = c.getQParam();
            p += "&csrf="+$("#csrf").val();

            $.ajax({
                type: 'POST',
                url: lBR.rootURL + '/candidatures',
                data: p,
                async: async,
                dataType: "json",

                success: function (response) {
                    if (response.result == "ok") {
                    	candId = response.id;
                        toastr['success']("Candidature enregistrée", "");

                        if (!c.id) {
                            lBR.board.setCandidatureId(eval(response.id));

                            // A la création, un evennement est ajouté si la candidature de l'utilisateur est déjà avancée
                            if (c.etat > CS.ETATS.VA_POSTULER) {
                                /*
                                 * 1 : "Je dois relancer", 2 : "Echange de mail", 3 : "Entretien", 4 : "J'ai postulé", 5 : "J'ai relancé", 6 : "Supprimer", 7 : "Rappel", 8 : "Note",   9 : "Maintenir actif", 10 : "J'ai préparé", 11 : "J'ai remercié"},
                                 */
                                evt = new CandidatureEvent();
                                evt.candidatureId = c.id;
                                evt.eventTime = moment();
                                if (c.etat == CS.ETATS.A_POSTULE) {
                                    evt.eventType = CS.TYPES.AI_POSTULE;
                                } else if (c.etat == CS.ETATS.A_RELANCE) {
                                    evt.eventType = CS.TYPES.AI_RELANCE;
                                } else if (c.etat == CS.ETATS.ENTRETIEN) {
                                    evt.eventType = CS.TYPES.ENTRETIEN;

                                    if (lBR.board.form.tunnelType) {
                                        evt.eventSubType = $("#ftEventSubType").val();
                                        evt.eventTime = lBR.board.form.dateEntretien.date();
                                    }
                                    else
                                        evt.eventSubType = CS.SUBTYPES.ENTRETIEN_PHYSIQUE;
                                }

                                // ajout de l'evenemment
                                lBR.board.timeLine.saveCandidatureEventQuery(evt, c);
                                // on associe le nouvel evt à la candidature
                                lBR.board.timeLine.addEventToCandidature(c, evt);
                            } else {
                            	// MAJ du compteur des priorités
                                lBR.conseils.loadAndShowNbPriorites();
                            }
                        }

                        if (!keepOpen) {       // on ferme le formulaire
                            lBR.board.form.cancelCandidatureForm();//dd$('#mdCreateCandidatureForm').modal('hide');
                            lBR.refreshMenu($("#activeButton")); // on désactive le lien du tableau de bord dans le menu
                        }
                        else if (keepOpen == 2)        // on reste ouvert mais en mode texte
                        {
                            $Hist({id: "openCandidature", cId: c.id});
                            lBR.board.form.initCandidatureForm(c);
                            lBR.board.form.hideSaveButton();
                        }
                    }
                    else {
                        toastr['error']("Erreur lors de l'enregistrement de la candidature", "Une erreur s'est produite " + response.msg);
                        lBR.manageError(response,"saveCandidature");
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                    toastr['error']("Erreur lors de l'enregistrement de la candidature", "Une erreur s'est produite " + errorThrown);
                    console.log('/candidature error: ' + textStatus);
                    console.log("traitement erreur candidature");
                }
            });

            t.board.parser.logUrlToGA(c);
            t.board.setCandidature(c);

            t.board.animateId = "0";

            if (keepOpen == 1) {
                t.board.selectedCandidature = c;
                t.board.timeLine.showTimeLine();
                t.setCandidatureFormTitle(c);
                $("#formActionNewEvent").show();
                $("#formActionManageAttachment").show();
            }

            t.board.buildCandidature(c);

            t.board.displayStartButton(1);
        }
        else {
            if (!keepOpen)
                toastr['warning']("", "Le formulaire comporte des erreurs, veuillez corriger les valeurs des champs en rouge");
            else
                toastr['warning']("", "L'import n'a pas pu récupérer toutes les données nécessaires. Cliquez sur Ajouter pour compléter le formulaire manuellement");
        }

        t.board.importOnStartupNotConsumed = 0; // permet de réinit le formulaire si 0 candidature

        return candId;
    },

    // fonction appelée depuis l'import rapid et depuis le tunnel de création de candidature option import d'offre
    importOffre: function (evt, etat, async) {
        var t = this,
            u = t.urlSource.getValue().trim(),
            p, bt = "f", et = etat || 0, cand = null;
        
        if(evt) {
	        if (evt.currentTarget.id == "buttonImportCandidature0") {
	            bt = "t";   // f pour formulaire, t pour tunnel, q pour rapide, f deprecated
	            u = t.urlSource0.getValue().trim();
	        }
	        else if (evt.currentTarget.id == "buttonQuickImport") {
	            bt = "q";
	            u = t.board.quickImport.val().trim();
	            t.board.selectedCandidature = null;
	        }
        }

        if (!u) {
            toastr['warning']("Vous devez renseigner l'adresse de l'offre", "");
        }
        else {
            if (u.toLowerCase().indexOf("http") != 0)
                u = "http://" + u;

            p = "url=" + Url.encode(u);

            if (!t.board.parser.getUrlParser(u))
                p += "&generic=1";

            if (bt != "q") {
                t.setOffreFieldDisabledState(true);
                this.etat.val(et);
            }
            else {
                t.initCandidatureForm();
                t.urlSource.setValue(u);
                t.board.setQuickImportDisabledState(true);
            }

            cand = t.importOffreQuery(p, u, bt, async);

        }
        return cand;
    },
    
    importOffreQuery: function (p, u, bt, async) {
    	var cand = null;
    	
    	// Si le paramètre async n'est pas renseigné, il est valorisé automatiquement à TRUE
        if (async == undefined)
        	async = true;

    	$.ajax({
            type: 'POST',
            url: lBR.rootURL + '/candidatures/offre',
            data: p,
            async: async,
            dataType: "html",

            success: function (response) {
                var json,
                    html = $sc(response);

                try {
                    json = JSON.parse(response);
                }
                catch (err) {
                }

                if (response == "error" || response == "expired" || (json && json.result == "error") || (json && json.result == "expired") )
                {
                    lBR.board.form.hideTunnelSpinner();

                    if (u.indexOf('linkedin.com') >= 0)
                        toastr['warning']("L'import des offres Linkedin est bloqué pour le moment. Veuillez remplir le formulaire à la main. Avec nos excuses :-(", "");
                    else
                        toastr['warning']("Cette offre n'est plus disponible ou n'existe pas", "");

                    lBR.board.form.showFormParseError(u, bt);
                }
                else {
                	cand = lBR.board.parser.parseOffre(html, u, async);
                	if (cand)
                		cand.creationDate = moment();

                    var existingCand = lBR.board.findCandidatureBySourceId(cand);

                    lBR.board.form.importFollowUpData = { cand:cand, bt:bt, u:u, existingCand : existingCand };

                    if(existingCand)
                        lBR.board.form.openCandDejaImporteeModal(existingCand);
                    else
                        lBR.board.form.followUpImport(true);
                }

                lBR.board.form.setOffreFieldDisabledState(false);
                lBR.board.setQuickImportDisabledState(false);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                console.log('/import offre error: ' + textStatus);
                console.log("traitement erreur import offre");

                lBR.board.form.setOffreFieldDisabledState(false);
                lBR.board.setQuickImportDisabledState(false);
            }
        });
    	return cand;
    },

    openCandDejaImporteeModal : function(c)
    {
        $("#mdCandDejaImporteeDesc .mdPoste").text(c.nomCandidature);

        var txt = "Je vais postuler";
        if(c.etat == CS.ETATS.A_POSTULE)
            txt = "J'ai postulé";
        else if (c.etat == CS.ETATS.A_RELANCE)
            txt = "J'ai relancé";
        else if (c.etat == CS.ETATS.ENTRETIEN)
            txt = "J'ai un entretien";

        if(c.archived)
            txt += " dans les candidatures terminées";

        $("#mdCandDejaImporteeDesc .mdColonne").text(txt);

        $("#mdCandDejaImportee").modal({
            backdrop: 'static',
            keyboard: false
        });
    },

    followUpImport : function(save)
    {
        var t=this, d = t.importFollowUpData;

        $("#mdCandDejaImportee").modal("hide");

        if(save) {
            if (d.bt == "t")         // import tunnel
            {
                t.registerChange(); // pr afficher la modal de sortie
                t.urlSource.setValue(d.u);
                t.showCandidatureFormLastStep();
            }
            else {
                lBR.board.selectedCandidature = d.cand;
                t.autoSaveCandidature();
            }

            if (d.bt == "q")         // import rapide
            {
                lBR.board.quickImport.val("");
                lBR.board.animateQuick = 1;
            }

            if (d.bt == "i")         // importOnStartup = import déclenché après cnx ou création de compte
                lBR.board.buildCandidatures();
        }
        else
        {
            t.cancelCandidatureForm();
            t.hideTunnelSpinner();
            lBR.refreshMenu($("#activeButton")); // on désactive le lien du tableau de bord dans le menu
        }
    },

    openCandDejaImporteeFaq : function()
    {
        this.followUpImport(false);
        lBR.showFaq("faq5_6");
    },

    setOffreFieldDisabledState: function (s) {
        var t = this;
        t.urlSource.field.prop("disabled", s);
        t.description.prop("disabled", s);
        t.ville.field.prop("disabled", s);
        t.nomContact.field.prop("disabled", s);
        t.emailContact.field.prop("disabled", s);
        t.telContact.field.prop("disabled", s);
        t.nomSociete.field.prop("disabled", s);
        t.nomCandidature.field.prop("disabled", s);

    },

    // affichage ou masquage du système d'import d'offre dans le cas de candidature spontanées ou de réseau
    changeCandidatureType: function () {
        var ty = this.candidatureType.val(), uS = $("#urlSourceBloc");

        if (ty == CS.TYPES_CANDIDATURE.OFFRE)
            uS.show();
        else
            uS.hide();
    },

    showFormParseError: function (u, bt) {
        ga('send', {
            hitType: 'event',
            eventCategory: 'Candidature',
            eventAction: 'import',
            eventLabel: 'parserNotAvailable',
            value: u
        });

        this.initCandidatureForm();
        this.urlSource.setValue(u); // pour conserver l'url saisi dans form édition

        if (bt != "t") // import rapide hors du tunnel
        {
            this.showCandidatureForm();
            this.goToCandidatureFormLastStep();
            this.board.parser.warnTeam(u);
        } else { // import dans tunnel
            form.registerChange(); // pr afficher la modal de sortie
            this.showCandidatureFormLastStep();
        }
    },

    registerChange: function () {
        this.hasChange = 1;
    },

    registerUnchange: function () {
        this.hasChange = 0;
    },

    cancelChanges: function () {
        $("#mdUnsavedCandidature").modal("hide");
        this.hasChange = 0;
        this.proceedAfterChange();
    },

    saveChanges: function () {
        $("#mdUnsavedCandidature").modal("hide");
        if (this.controlTunnel()) {
            this.saveCandidature(0);
            this.proceedAfterChange();
        }

    },

    showUnsavedModal: function () {
        $("#mdUnsavedCandidature").modal("show");
    },

    proceedAfterChange: function () {
        var t = this,
            aC = t.afterChangeSave;

        if (aC) {
            if (aC == "showActives")
                lBR.showActives();
            else if (aC == "logoutUser")
                lBR.logoutUser();
            else if (aC == "showParametres")
                lBR.showParametres();
            else if (aC == "showShareLink")
                lBR.showShareLink();
            else if (aC == "showArchives")
                lBR.showArchives();
            else if (aC == "showVideo")
                lBR.showVideo();
            else if (aC == "history")
                history.go(-1);

            t.afterChangeSave = null;
        }
    },

    openCandidatureFormStep: function (s) {
        switch (s.step) {
            case "1" :
            {
                lBR.board.newCandidature(null, 1, s.etat);
                this.displayFormStep("candidatureForm1stStep");
                break;
            }
            case "offre" :
            {
                this.goTo2ndStepWithOffre(1);
                break;
            }
            case "spont" :
            {
                this.goTo2ndStepSpontane(1);
                break;
            }
            case "contact" :
            {
                this.goToStepContact(1);
                break;
            }
            case "autre" :
            {
                this.goToStepAutre(1);
                break;
            }
            case "progress" :
            {
                this.goToStepProgress(1, s);
                break;
            }
            case "entretien" :
            {
                this.goToStepEntretien(1, s);
                break;
            }
            case "form" :
            {
                this.goToForm(null, 1, s);
                break;
            }

            default:
            {
                lBR.board.newCandidature(null, 1, s.etat);
                this.showCandidatureFormLastStep();
            }
        }
    },

    // affiche l'étape url du tunnel d'import d'offre
    goTo2ndStepWithOffre: function (h) {
        this.tunnelControl = 'offre';
        this.tunnelType = CS.TYPES_CANDIDATURE.OFFRE;

        this.displayFormStep("candidatureForm2ndStepWithOffre");

        if (h != 1) {
            $Hist({id: "newCandidature", step: "offre", tunnelType: this.tunnelType});
            // Par défaut, on rend actif le bloc instantanement
            lBR.board.form.urlSource0.field.focus();
            $("#radioTunnelInst").prop("checked", true);
            $("#tunnelInstantanement").removeClass('tunnelBlocDisabled');
            // Par défaut, on désactive le bloc manuellement
            $("#radioTunnelManu").prop("checked", false);
            $("#tunnelManuellement").addClass('tunnelBlocDisabled');
        } else { // history
            lBR.board.form.urlSource0.setValue(this.urlSource.getValue());
            lBR.board.parser.setImportButtonState();
        }
    },

    // affiche l'étape du tunnel pour le type SPONTANE
    goTo2ndStepSpontane: function (h) {
        this.tunnelType = CS.TYPES_CANDIDATURE.SPONT;
        if (h != 1) {
            $Hist({id: "newCandidature", step: "spont", tunnelType: this.tunnelType});
        }
        this.tunnelControl = 'spont';

        this.displayFormStep("candidatureFormStepJob");
    },

    // pour le type AUTRE, on redirige vers le formulaire récap 
    goToStepAutre: function (h) {
        this.tunnelType = CS.TYPES_CANDIDATURE.AUTRE;

        this.tunnelControl = 'autre';

        this.goToForm(null, 0, this);
    },

    // pour le type OFFRE manuel, on redirige vers le formulaire récap
    goToStepWithOffreManuel: function (h) {
        // Pour le tunnel manuel, on récupère le nom du poste
        this.nomCandidatureTunnel.setValue(this.titrePosteTunnel.getValue());

        this.goToForm();
    },

    // affiche l'étape du sous formulaire de contact
    goToStepContact: function (h) {
        this.tunnelType = CS.TYPES_CANDIDATURE.RESEAU;
        if (h != 1) {
            $Hist({id: "newCandidature", step: "contact"});
        }

        this.tunnelControl = 'contact';

        this.displayFormStep("candidatureFormStepContact");
    },

    // affiche le formulaire en préremplissant certains champs selon le contexte
    goToForm: function (evt, h, s) {
        if (h == 1 || this.controlTunnel()) {
            this.tunnelControl = 'form';
            // On masque les écrans précédemment affichés avant le formulaire d'édition
            $("#candidatureForm2ndStepWithOffre,#candidatureFormStepContact,#candidatureFormStepJob").hide();

            if (this.tunnelType == CS.TYPES_CANDIDATURE.OFFRE) {
                var u = this.urlSource0.getValue();
                if (u) {
                    // Affichage du spinner
                    this.showTunnelSpinner();
                }
            }

            setTimeout(function () {  // setimeout = hack pour permettre l'affichage du spinner
                var tunnelTypeH, nomCandidatureH, nomSocieteH, numSiretH, villeH, nomContactH, emailContactH, telContactH, descriptionH, noteH;
                form = lBR.board.form;

                if (h != 1) // enregistrement de paramètres riches pour l'historique pour reconstituer le tunnel
                {
                    $Hist({
                        id: "newCandidature",
                        step: "form",
                        tunnelType: form.tunnelType,
                        nomContact: form.nomContactTunnel.getValue(),
                        emailContact: form.emailContactTunnel.getValue(),
                        telContact: form.telContactTunnel.getValue(),
                        nomCandidature: form.nomCandidatureTunnel.getValue(),
                        nomSociete: form.nomSocieteTunnel.getValue(),
                        numSiret: form.numSiret.getValue(),
                        url: form.urlSource0.getValue()
                        //typeEntretien : $("#ftEventSubType").val()
                    });
                } else { // récup des données historique
                    tunnelTypeH = form.tunnelType;
                    nomCandidatureH = form.nomCandidature.getValue();
                    nomSocieteH = form.nomSociete.getValue();
                    numSiretH = form.numSiret.getValue();
                    villeH = form.ville.getValue();
                    nomContactH = form.nomContact.getValue();
                    emailContactH = form.emailContact.getValue();
                    telContactH = form.telContact.getValue();
                    descriptionH = form.description.val();
                    noteH = form.note.val();
                }

                // modale
                if (!eval(localStorage.editTunnelOk)) {
                    $('#editTunnelCheck').prop("checked", false);
                    $('#mdEditTunnel').modal('show');
                }

                if (form.tunnelType == CS.TYPES_CANDIDATURE.OFFRE && form.urlSource0.getValue() != "") {
                    form.importOffre({currentTarget: {id: "buttonImportCandidature0"}}, 0);
                }
                else {
                    form.initCandidatureForm(null, null, 1);

                    form.candidatureType.val(form.tunnelType ? form.tunnelType : CS.TYPES_CANDIDATURE.OFFRE);

                    $("#urlSourceBloc").hide();

                    form.showCandidatureFormLastStep();

                    form.setDescriptionHeight();

                    if (h != 1) { // On récupère les données saisies dans les écrans précédents du tunnel
                        if (form.tunnelType == CS.TYPES_CANDIDATURE.RESEAU) {
                            form.nomCandidature.setValue(form.nomContactTunnel.getValue());
                            form.nomContact.setValue(form.nomContactTunnel.getValue());
                            form.emailContact.setValue(form.emailContactTunnel.getValue());
                            form.telContact.setValue(form.telContactTunnel.getValue());
                            form.registerChange(); // pr afficher la modal de sortie
                        } else if (form.tunnelType == CS.TYPES_CANDIDATURE.SPONT) {
                            form.nomCandidature.setValue(form.nomCandidatureTunnel.getValue());
                            form.nomSociete.setValue(form.nomSocieteTunnel.getValue());
                            $("#formLogoSociete").html($("#formLogoSocieteTunnel").html());
                            if ($("#formLogoSocieteTunnel img").length > 0)
                                form.logoUrl.val($("#formLogoSocieteTunnel img")[0].src);
                            form.registerChange(); // pr afficher la modal de sortie
                        } else if (form.tunnelType == CS.TYPES_CANDIDATURE.OFFRE) {
                            form.nomCandidature.setValue(form.nomCandidatureTunnel.getValue());
                            form.numSiret.setValue(form.numSiret.getValue());
                            form.registerChange(); // pr afficher la modal de sortie
                        }
                    } else {   // reconstitution des données du tunnel suite à navigation depuis l'historique
                        form.tunnelType = tunnelTypeH;
                        form.nomCandidature.setValue(nomCandidatureH);
                        form.nomSociete.setValue(nomSocieteH);
                        form.numSiret.setValue(numSiretH);
                        form.ville.setValue(villeH);
                        form.nomContact.setValue(nomContactH);
                        form.emailContact.setValue(emailContactH);
                        form.telContact.setValue(telContactH);
                        form.description.val(descriptionH)
                        form.note.val(noteH);
                    }
                }
                // On masque le bouton de sauvegarde  
                form.hideSaveButton();
                // En mode tunnel, on masque les boutons de bas de page "Fermer"/"Enregistrer"
                $("#formButtons").hide();
                // On affiche les boutons spécifiques au tunnel
                $("#formButtonsTunnel").show();
            }, 30);
        }
    },

    // affiche l'étape de sélection de l'état de la candidature : "Ou en êtes vous dans votre candidature"
    goToStepProgress: function (h) {
        var form = lBR.board.form;

        if (h == 1 || this.controlTunnel()) {
            this.board.selectedCandidature = null;  // raz selectedCandidature pour éviter un edit sur une candidature existante depuis un formulaire vierge en navigant dans l'historique

            if (h != 1)
                $Hist({id: "newCandidature", step: "progress"});

            this.tunnelControl = "progress";

            this.displayFormStep("candidatureFormStepProgress");
        }
    },

    goToStepEntretien: function (h, s) {
        if (h == 1 || this.controlTunnel()) {
            this.board.selectedCandidature = null;  // raz selectedCandidature pour éviter un edit sur une candidature existante depuis un formulaire vierge en navigant dans l'historique

            var u = this.urlSource0.getValue();

            if (h != 1) {
                $Hist({id: "newCandidature", step: "entretien", url: u});
            }

            if (s) {
                this.urlSource0.setValue(s.url);
                // renseigner le reste à travers les autres formulaires
            }

            this.tunnelControl = 'entretien';

            this.displayFormStep("candidatureFormStepEntretien");
        }
    },

    // affiche le bon bloc de formulaire et masque tous les autres
    displayFormStep: function (step) {
        $("#candidatureForm1stStep,#candidatureForm2ndStepWithOffre,#candidatureFormStepContact,#candidatureFormStepJob,#candidatureForm,#candidatureFormStepProgress,#candidatureFormStepEntretien").hide();
        $("#" + step).show();
    },

    // applique les contrôles sur les champs du tunnel en fonction du contexte courant (this.tunnelControl)
    controlTunnel: function () {
        var res = 1, t = this, tc = t.tunnelControl,
            nC = t.nomCandidature,
            numST = t.numSiret,
            nCT = t.nomCandidatureTunnel,
            nST = t.nomSocieteTunnel,
            nCtT = t.nomContactTunnel,
            tCT = t.telContactTunnel,
            eC = t.emailContact,
            eCT = t.emailContactTunnel,
            dE = t.dateEntretien;

        nC.hideError();
        nCT.hideError();
        numST.hideError();
        nST.hideError();
        nCtT.hideError();
        tCT.hideError();
        eCT.hideError();
        $("#formTunnelDateEntretienErr").hide();

        if (tc) {
            if (tc == 'form') {
                if (!nC.check()) {
                    res = 0;
                    nC.showError();
                }
                if(!eC.check())
                {
                    res = 0;
                    eC.showError();
                }
                if(!numST.check())
                {
                    res = 0;
                    numST.showError();
                }

                if(!res)
                {// scrolling vers le haut de page
                    $wST(0);
                }
            } else if (tc == 'spont') {
                if (!nCT.check()) {
                    res = 0;
                    nCT.showError();
                }

                if (!nST.check()) {
                    res = 0;
                    nST.showError();
                }
            }
            else if (tc == 'contact') {
                if (!nCtT.check()) {
                    res = 0;
                    nCtT.showError();
                    $wST(0);
                }

                if (!tCT.check()) {
                    res = 0;
                    tCT.showError();
                }

                if (!eCT.check()) {
                    res = 0;
                    eCT.showError();
                }
            }
            else if (tc == 'entretien') {
                if (!dE.date()) {
                    res = 0;
                    $("#formTunnelDateEntretienErr").show();
                }
            }
        }

        return res;
    },

    goBack: function () {
        this.registerUnchange();
        history.go(-1);
    },

    showTunnelSpinner: function () {
        $("#candidatureFormStepProgress").hide();
        $("#candidatureFormStepEntretien").hide();
        $("#candidatureSpinner").show();
        //console.log("fin show board spinner");
    },

    hideTunnelSpinner: function () {
        $("#candidatureSpinner").hide();
        //console.log("fin hide board spinner");
    },

    setMemoriserManuelButtonState: function () {
        var t = this,
            bt = $("#buttonMemoriserManuelTunnel"),
            u = t.titrePosteTunnel.getValue();

        if (u)
            bt.removeClass("disabled");
        else
            bt.addClass("disabled");
    },

    setDisabledBlocTunnel: function (evt) {
        var t = this,
            blocTI = $("#tunnelInstantanement"),
            radioTI = $("#radioTunnelInst"),
            btTI = $("#buttonImportCandidature0"),
            blocTM = $("#tunnelManuellement"),
            radioTM = $("#radioTunnelManu"),
            btTM = $("#buttonMemoriserManuelTunnel");

        evt.stopPropagation();

        if (evt.currentTarget.id == 'radioTunnelManu' || evt.currentTarget.id == 'titrePosteTunnelF') {
            // on active le bloc Manuel
            radioTI.prop("checked", false);
            blocTI.addClass('tunnelBlocDisabled');
            // On place le focus dans la zone de texte
            t.titrePosteTunnel.field.focus();

            // on désactive le bloc instantané
            radioTM.prop("checked", true);
            blocTM.removeClass('tunnelBlocDisabled');
            t.urlSource0.field.val('');
            btTI.addClass('disabled');
        } else {
            // on active le bloc instantané
            radioTM.prop("checked", false);
            blocTM.addClass('tunnelBlocDisabled');
            // On place le focus la zone de texte
            t.urlSource0.field.focus();

            // on désactive le bloc manuel
            radioTI.prop("checked", true);
            blocTI.removeClass('tunnelBlocDisabled');
            t.titrePosteTunnel.field.val('');
            btTM.addClass('disabled');
        }
    },

    updateFormLogo: function (logo) {
        var logoUrl,
            company;

        if (logo) {
            logoUrl = logo.data('src');
            company = logo.data('name');
        }

        this.logoUrl.val(logoUrl ? logoUrl : "");

        $("#nomSocieteF,#nomSocieteTunnelF").val(company);

        this.buildFormLogoUrl(logoUrl,"#formLogoSociete,#formLogoSocieteTunnel");
    },

    buildFormLogoUrl: function (logoUrl,container)
    {
        var el = $(container);
        if(logoUrl)
        {
            var h = "<table><tr><td><img src=" + logoUrl + " /></td>";

            h+="<td><i class='fa fa-remove tooltipster'  title='Supprimer ce logo' onclick='javascript:lBR.board.form.removeLogo();'></i></td></table>";

            el.html(h);

            $(container+' .tooltipster').tooltipster({
                theme: 'tooltipster-borderless',
                debug : false,
                delay : 100
            });
        }
        else
            el.html("");
    },

    // suppression du logo associé à la société
    removeLogo : function()
    {
        var el = $("#formLogoSociete,#formLogoSocieteTunnel"),
            img = $("#formLogoSociete img,#formLogoSocieteTunnel img")
            dur = 400;

        this.logoUrl.val(""); // raz du champ de formulaire caché

        // animation sur l'effacement
        img.animate({
            opacity: '0'
        },dur);
        setTimeout(function(){el.html("");},dur);

    },
    
    initTest : function(c, url) {
    	this.nomCandidature = new TextField({});
    	this.nomCandidature.field = $('<div></div>');
    	this.nomSociete = new TextField({});
    	this.nomSociete.field = $('<div></div>');
    	this.ville = new TextField({});
    	this.ville.field = $('<div></div>');
    	this.nomContact = new TextField({});
    	this.nomContact.field = $('<div></div>');
    	this.emailContact = new TextField({});
    	this.emailContact.field = $('<div></div>');
    	this.telContact = new TextField({});
    	this.telContact.field = $('<div></div>');
    	
    	this.description = $('<div></div>');
    	this.logoUrl = $('<div></div>');
    	this.note = $('<div></div>');
    	this.etat = $('<div></div>');
    	this.candidatureType = $('<div></div>');	
    	
    	if (c) {
	    	this.nomCandidature = new TextField({});
	    	this.nomCandidature.field = $('<div></div>');
	    	this.nomCandidature.setValue(c.nomCandidature);
	    	this.nomSociete = new TextField({});
	    	this.nomSociete.field = $('<div></div>');
	    	this.nomSociete.setValue(c.nomSociete);
	    	//this.description = new TextField({});
	    	this.description = $('<div></div>');
	    	this.description.val(c.description);
	    	this.ville = new TextField({});
	    	this.ville.field = $('<div></div>');
	    	this.ville.setValue(c.ville);
	    	this.nomContact = new TextField({});
	    	this.nomContact.field = $('<div></div>');
	    	this.nomContact.setValue(c.nomContact);
	    	this.emailContact = new TextField({});
	    	this.emailContact.field = $('<div></div>');
	    	this.emailContact.setValue(c.emailContact);
	    	this.telContact = new TextField({});
	    	this.telContact.field = $('<div></div>');
	    	this.telContact.setValue(c.telContact);
	    	this.logoUrl = $('<div></div>');
	    	this.logoUrl.val(c.logoUrl);
	    	
	    	this.note = $('<div></div>');
	    	this.note.val("");
	    	this.etat = $('<div></div>');
	    	this.etat.val(CS.ETATS.VA_POSTULER);
	    	this.candidatureType = $('<div></div>');
	    	this.candidatureType.val(CS.TYPES_CANDIDATURE.OFFRE);
    	} 
    	
    	this.urlSource = new TextField({});
    	this.urlSource.field = $('<div></div>');
    	this.urlSource.setValue(url);
    	
    }
	

}