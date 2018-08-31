function leBonRythme(){}

leBonRythme.prototype = {

    modals : ["mdCreateAccountForm", "mdCreateCandidatureForm", "mdRemoveCandidature","mdArchiveCandidature", "mdRefusCandidature",
                "mdArchiverCandidature", "mdPostulerCandidature", "mdPreparerEntretien", "mdRelancerCandidature", "mdAcceptationCandidature",
                "mdRelancerEntretien", "mdShareLink", "mdRemercierEntretien", "mdRemoveCandidatureEvent", "mdRemoveFile", "mdAttachmentManager",
                "mdEditEvent","mdNoCandidatureVideo","mdCGU","mdSetEntretien", "mdModifierMotDePasse", "mdSupprimerCompte", "mdRenouvelerMotDePasse", 
                "mdNoInternet", "mdConseilNudgeReseau", "mdPrivacyInfo", "mdPrivacyPolicy"],
    currentPage : "homePage",
    board : null,
    conseils : null,
    loggedIn : null,

    doorbellInitiated : null,

    init : function()
    {
        $Hist({ id : "homePage" });

        var t=this;

        t.rootURL = memoVars.rootURL+"rest";
        if (t.rootURL.indexOf('8080')>0)
        	t.rootURL = "http://boomerang:8080/rest";
        
        t.displayImportLandingPage();

        t.privacy = new Privacy();
        t.privacy.initPrivacyInfo();

        t.board = new Board();
        t.conseils = new Conseils(t.board);
        t.activites = new Activites(t.board);

        $(window).bind('beforeunload', function()
        {
            if(lBR.board && lBR.board.form && lBR.board.form.hasChange) {
                lBR.board.form.showUnsavedModal();
                return 'Vous avez des modifications non enregistrées. Souhaitez-vous continuer et perdre vos modifications ?';
            }
            else return;
        });

        t.parametres = new Parametres();

        $("body").on("click", $.proxy(t.stopVideo, t));

        $("#btnHeaderConnect,.btnHeaderConnect").on("click",$.proxy(this.showConnectionPage,this));

        $(".openCguButton").on("click", $.proxy(this.showCGU,this));

        $("#logoHomeHeader").on("click", $.proxy(this.showHome,this));

        $(".peConnectButton").on("click", $.proxy(this.showPEConnectPage,this));
        
        $("#logoSmall").on("click", $.proxy(this.showActives,this));
        $(".boutonTableau").on("click", $.proxy(this.showActives,this));

        $("#btnHeaderStart,.btnHeaderStart").on("click",$.proxy(this.showCreateAccountForm,this));
        $(".btnImportLandingStart").on("click",$.proxy(function(){lBR.hideImportLandingPage();lBR.showCreateAccountForm();},this));

        $("#accountLoginButton").on("click",$.proxy(this.accountLogin,this));
        $("#loginNoAccount").on("click",$.proxy(this.showCreateAccountForm,this));

        $("#goToStep1").on("click",$.proxy( t.board.newCandidature, t.board, null, 0, 0));
        $("#videoButton2").on("click", $.proxy(this.showVideo,this));
        
        // liens du menu
        // Par défaut, le lien du tableau de bord n'est pas cliquable car à l'init, le tableau de bord est déjà affiché
        //$("#activeButton").on("click", $.proxy(this.showActives,this));
        $("#activeButtonInBar").on("click", $.proxy(this.showActives,this));
        $("#prioritesButton").on("click",$.proxy( t.conseils.showPriorites, t.board, null, 0, 0));
        $("#ficheButton").on("click",$.proxy( t.board.newCandidature, t.board, null, 0, 0));
        $("#archiveButton").on("click", $.proxy(this.showArchives,this));
        // En consultation de TDB, la page parametres n'est pas accessible
        if(!memoVars.isVisitor)
        	$("#userLogin").on("click", $.proxy(this.showParametres,this));
        $("#parametresButton").on("click", $.proxy(this.showParametres,this));
        $("#faqButton,.openFaqButton,.doorbell-button").on("click", $.proxy(this.showFaq,this));
        $("#videoButton").on("click", $.proxy(this.showVideo,this));
        // lien du BO pour les admins
        $("#boButton").on("click", $.proxy(this.openBackOffice,this));
        $("#shareBoardButton").on("click", $.proxy(this.showShareLink,this));
        $("#logoutButton").on("click",$.proxy(this.logoutUser,this));
        $("#conseilButton").on("click",$.proxy(this.showConseils,this));

        $("#renouvelerMotDePasseButton").on("click", $.proxy(this.parametres.openModifierMotDePasse,this.parametres));

        t.initCopyShareLinkButton();

        // bouton d'envoi de la requête de création de compte
        $("#buttonCreateAccount").on("click",$.proxy( t.createAccount, t));

        // bouton de requête du mot de passe oublié
        $("#buttonGetPassword").on("click",$.proxy( t.getPassword, t));

        // bouton de reset de mot de passe
        $("#buttonResetPassword").on("click",$.proxy( t.saveNewPassword, t));

        $(".forget-password").on("click",$.proxy(this.showForgottenPasswordForm,this));

        moment.locale("fr");        // ?

        // champ de textes
        t.loginEmail = new TextField({
            id : 'loginEmail',
            type : 4,
            tag : 'Votre e-mail',
            lTag : 'Votre e-mail',
            name : 'login',
            isMetronic : true,
            nulValue : false,
            keyPressFct : function(evt){
                if(evt.which==13) {
                    lBR.accountLogin();
                }
            }
        } );

        t.loginPassword = new TextField({
            id : 'loginPassword',
            type : 5,
            tag : 'Mot de passe',
            lTag : 'Mot de passe',
            name : 'password',
            isMetronic : true,
            nulValue : false,
            keyPressFct : function(evt){
                if(evt.which==13) {
                    lBR.accountLogin();
                }
            }
        } );

        t.accountLoginEmail = new TextField({
            id : 'accountLoginEmail',
            type : 4,
            tag : 'Votre e-mail',
            lTag : 'Votre e-mail',
            isMetronic : true,
            nulValue : false
        } );

        t.fpLoginEmail= new TextField({
            id : 'fpLoginEmail',
            type : 4,
            tag : 'Votre e-mail',
            lTag : 'Votre e-mail',
            isMetronic : true,
            nulValue : false
        } );

        var fct = function()
        {
            var aLP = lBR.accountLoginPassword,
                aRLP = lBR.accountRepeatLoginPassword,
                v = aLP.field.val(),
                pear = aLP;
            if(this.id == aLP.id)
                pear = aRLP;
            if(v == "" || v != aRLP.field.val())
            {
                pear.setError();
                return false;
            }
            else
            {
                pear.setOK();
                return true;
            }
        };
        t.accountLoginPassword = new TextField({
            id : 'accountLoginPassword',
            type : 5,
            tag : 'Mot de passe (minimum 12 caractères)',
            lTag : 'Mot de passe (minimum 12 caractères)',
            min : 12,
            max : 50,
            ctrl : fct,
            nulValue : false
        } );

        t.accountRepeatLoginPassword = new TextField({
            id : 'accountRepeatLoginPassword',
            type : 5,
            tag : 'Répéter le mot de passe',
            lTag : 'Répéter le mot de passe',
            ctrl : fct,
            nulValue : false
        } );

        fct = function()
        {
            var rP = lBR.resetPassword,
                rRP = lBR.repeatResetPassword,
                v = rP.field.val(),
                pear = rP;
            if(this.id == rRP.id)
                pear = rRP;
            if(v == "" || v != rRP.field.val())
            {
                pear.setError();
                return false;
            }
            else
            {
                pear.setOK();
                return true;
            }
        };
        t.resetPassword = new TextField({
            id : 'resetPassword',
            type : 5,
            tag : 'Mot de passe (minimum 12 caractères)',
            lTag : 'Mot de passe (minimum 12 caractères)',
            min : 12,
            max : 50,
            ctrl : fct,
            nulValue : false
        } );

        t.repeatResetPassword = new TextField({
            id : 'repeatResetPassword',
            type : 5,
            tag : 'Répéter le mot de passe',
            lTag : 'Répéter le mot de passe',
            ctrl : fct,
            nulValue : false
        } );

        t.initHistoryNavigation();

        if(memoVars.openFaqOnStartup)
            t.showFaq();

        if(memoVars.PEAMError)
            t.showPEAMError();

        if(memoVars.resetToken)
            t.showPasswordResetPage();

        // utilisateur non connecté, ce n'est pas un affichage de tableau de bord d'un tiers, l'utilisateur a un cookie de session PE, cette webapp n'est pas dans un iframe
        if(!memoVars.uLI && !memoVars.isVisitor && Cookies.get("idutkes") && window.parent === window.self)
            this.attemptToPeConnectUser();

        // test cas MEMO chargé dans une iframe et connecté via PEAM, on connecte l'utilisateur sur la page parente et on charge son tableau de bord
        if(window.parent !== window.self)
        {
            if(window.self.location.href.indexOf("PEAMConnect=1")>=-1)
            {
                parent.memoVars = memoVars;

                if(memoVars.uLI)
                {
                    parent.lBR.setCsrf($("#csrf").val());
                    parent.lBR.initBoard();
                }
            }
        }
    },

    // gère la navigation via les boutons back / next du navigateur
    initHistoryNavigation : function()
    {
        window.onpopstate = function()
        {
            var s = history.state, id, cId;

            if(lBR.noHistory)
            {
                lBR.noHistory = 0;
            }
            else if(lBR.board.form.hasChange)
            {
                lBR.noHistory = 1;

                lBR.board.form.afterChangeSave = "history";
                lBR.board.form.showUnsavedModal();

                history.go(1);
            }
            else
            {
                lBR.hideAllModals();

                if (s) {
                    id = s.id;

                    if (!memoVars.uLI || id == "homePage" ||
                        id == "connectionPage" ||
                        id == "createAccountForm" ||
                        id == "forgottenPasswordForm") {
                        lBR.showHome(1);

                        if (id == "createAccountForm")
                            lBR.showCreateAccountForm(1);
                        else if (id == "forgottenPasswordForm")
                            lBR.showForgottenPasswordForm(1);
                        else if (id == "connectionPage")
                            lBR.showConnectionPage(1);
                    }
                    else
                    {
                        if (id == "openCandidature" || id == "editCandidature") {
                            lBR.board.selectedCandidature = lBR.board.candidatures["" + s.cId];
                            lBR.board.editCandidature(1);

                            if (id == "editCandidature")
                                lBR.board.form.displayEditableForm(null, 1);
                        }
                        else if (id == "newCandidature") {
                            lBR.board.form.openCandidatureFormStep(s);
                        }
                        else if (id == "boardPage" || id == "activeCandidatures") {
                            lBR.goToPage("boardPage", 1);
                            lBR.showActives(1);
                        }
                        else if (id == "archivedCandidatures") {
                            lBR.goToPage("boardPage", 1);
                            lBR.showArchives(1);
                        }
                        else if (id == "parametres") {
                            lBR.goToPage("boardPage", 1);
                            lBR.showParametres(1);
                        }
                        else if (id == "priorites") {
                            lBR.goToPage("boardPage", 1);
                            lBR.conseils.showPriorites(1);
                        }
                        else if (id == "activites") {
                            lBR.goToPage("boardPage", 1);
                            lBR.activites.showActivites(1);
                        }
                        else if (id == "conseils") {
                            lBR.goToPage("boardPage", 1);
                            lBR.showConseils(1);
                        }
                    }

                    if (id == "privacyInfo") {
                        lBR.privacy.showPrivacyInfo(1);
                    }
                    else if (id == "privacyPolicy") {
                        lBR.privacy.showPrivacyPolicy(1);
                    }
                }
            }
        }
    },

    // masque le gros logo en accueil chargement et affiche soit la landing avec des paramètres modifiés soit la home normale
    displayImportLandingPage : function()
    {
        if(memoVars.url && getAccountSource(memoVars.url))
        {
            if(memoVars.jobTitle && memoVars.jobTitle!="null")
            {
                $("#importLandingTitle").text(memoVars.jobTitle);
                $("#importLandingHeader").show();
            }
            else
                $("#importLandingHeader").hide();

            $("#homeLandingFromImport").show();
        }
        else
        {
            $("#homeHeader").show();
            $("#homePage").show();
            this.showDoorbell();
        }

        $("#welcomeLogo").hide();
    },

    hideImportLandingPage : function()
    {
        if(importOnStartup)
            this.board.resizePopupOnStartup();
        $("#homeLandingFromImport").hide();
        $("#homeHeader").show();
        $("#homePage").show();
        this.showDoorbell();
    },

    showDoorbell : function()
    {
        if(!this.doorbellInitiated)
        {
            $(".doorbell-button").show();
            (function(d, t) {
                var g = d.createElement(t);g.id = 'doorbellScript';g.type = 'text/javascript';g.async = true;g.src = 'https://embed.doorbell.io/button/8059?t='+(new Date().getTime());(d.getElementsByTagName('head')[0]||d.getElementsByTagName('body')[0]).appendChild(g);
            }(document, 'script'));
            this.doorbellInitiated = true;
        }
    },

    accountLogin : function(async)
    {
    	// Si le paramètre async n'est pas renseigné, il est valorisé automatiquement à TRUE
        if (async == undefined)
        	async = true;
        
        document.loginForm.submit();

        var t =this,
            lE = t.loginEmail,
            lP = t.loginPassword, p;

        if(lE.check() && lP.check())
        {
            $('.alert-danger', $('.login-form')).hide();
            $('#loginPasswordRenewed').hide();

            p = "loginEmail=" + lE.getQParam() + "&loginPassword=" + lP.getQParam();

            $(".homeFormSpinner").show();
            $("#accountLoginButton").hide();
            $(".connectAction").hide();

            $.ajax({
                type: 'POST',
                url: this.rootURL + '/account/accountLogin',
                data: p,
                async: async,
                dataType: "json",

                success: function (response) {

                    if(response.result=="ok")
                    {
                        lBR.setCsrf(response.csrf);
                        //$("#csrf").val(response.csrf);
                        memoVars.user = response.user;
                        lBR.initBoard(lE.getValue());
                        lBR.resetLoginForm();
                        lBR.checkPasswordChange();
                        $wST(0);
                    }
                    else
                    {
                        if(response.result=="error" && response.msg=="systemError")
                        {
                            $("#loginMsg").html("Un problème technique empêche la connexion. Veuillez réessayer ultérieurement. Si le problème persiste vous pouvez contacter l'équipe MEMO avec le bouton 'Avis ou commentaire'.");
                            lBR.manageError(response,"accountLogin");
                        }
                        else {
                            //$.toaster({ priority : "warning", title : "Mauvais mot de passe", message : "Mauvais mot de passe"});
                            $("#loginMsg").html("Mauvais mot de passe ou erreur dans l'adresse e-mail");
                        }
                        $('.alert-danger', $('.login-form')).show();
                        $wST(200);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('/login/account error: ' + textStatus);
                    $wST(250);
                    Raven.captureException("accountLogin ajax error : ",textStatus,errorThrown);
                },
                complete: function()
                {
                    $(".homeFormSpinner").hide();
                    $("#accountLoginButton").show();
                    $(".connectAction").show();
                }
            });
        }
        else
        {
            $("#loginMsg").html("Veuillez renseigner votre adresse email et votre mot de passe");
            $('.alert-danger', $('.login-form')).show();
            $wST(250);
        }
    },

    logoutUser : function()
    {
        if(lBR.board.form.hasChange)
        {
            lBR.board.form.afterChangeSave = "logoutUser";
            lBR.board.form.showUnsavedModal();
        }
        else
        {
            this.logoutFromPE();
            this.resetDisplayFromLogout();

            $.ajax({
                type: 'POST',
                url: this.rootURL + '/account/logout',
                dataType: "json",

                success: function (response) {
                    //console.log(response);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('/logout error: ' + textStatus);
                    Raven.captureException("logoutUser ajax error : ",textStatus,errorThrown);
                }
            });
        }
    },

    resetDisplayFromLogout : function()
    {
        this.loggedIn = false;

        $("#csrf").val("");
        this.clearUserValues();

        this.showActives();
        this.board.clearBoard();
        this.board.stopRefreshBoardChecking();
        this.board.searchTools.resetSearchForm();
        memoVars.uLI = 0;

        $("body").removeClass("loggedIn");

        var vid = $("#videoFrame"), prt = vid.parent().attr("id");
        if (!prt == "bloc3")
            vid.appendTo("#bloc3");

        this.board.form.hideSaveButton();   // masquage du bouton enregistrer suite à son réaffichage dans clearBoard -> initForm

        this.showHome();

        $('.alert-danger', $('.login-form')).hide();
    },

    clearUserValues : function()
    {
        memoVars.user = {};

        if(this.parametres)
            this.parametres.clearUserInfo();
    },

    // déconnecte les utilisateurs connectés via le bouton PE
    logoutFromPE : function()
    {
        if(memoVars.user && memoVars.user.isPEAM)
        {
            var ifr = document.createElement("iframe");
            ifr.setAttribute("src",'https://authentification-candidat.pole-emploi.fr/compte/deconnexion');
            $("#peDisconnect").html(ifr);
        }
    },

    refreshMenu : function(lienDisabled, lien2Disabled)
    {
        // suppression des effets sur tous les boutons
        $("#ficheButton, #activeButton, #archiveButton, #parametresButton, #prioritesButton, #conseilButton, #activitesButton")
            .off("click")
            .removeClass("menuDisabled")
            .parent().removeClass("disabled");

        $("#ficheButton").removeClass("menuDisabled2");

        // réactivation des événements de chaque bouton
        $("#ficheButton").on("click", $.proxy(this.board.newCandidature,this.board));
        $("#activeButton").on("click", $.proxy(this.showActives,this));
        $("#archiveButton").on("click", $.proxy(this.showArchives,this));
        $("#parametresButton").on("click", $.proxy(this.showParametres,this));
        $("#prioritesButton").on("click", $.proxy(this.conseils.showPriorites,this));
        $("#conseilButton").on("click", $.proxy(this.showConseils,this));
        $("#activitesButton").on("click", $.proxy(this.activites.showActivites,this));

        // le lien principal est surligné pour indiquer qu'on est dans la section correspondante
        if (lienDisabled) {
            lienDisabled.addClass("menuDisabled");
	        lienDisabled.parent().addClass("disabled");
	        lienDisabled.off("click");
        }

        // le lien secondaire optionnel est désactivé pour montrer que l'action n'est pas disponible
        if (lien2Disabled) {
            lien2Disabled.addClass("menuDisabled2");
        	lien2Disabled.parent().addClass("disabled");
        	lien2Disabled.off("click");
        }
    },
    
    showArchives : function(h)
    {
        var b = this.board;

        if(b.form.hasChange)
        {
            b.form.afterChangeSave = "showArchives";
            b.form.showUnsavedModal();
        }
        else
        {
            this.showBreadcrumb("archives");

            b.archiveMode = 1;

            b.form.cancelCandidatureForm(1);

            if (h != 1)
                $Hist({id: "archivedCandidatures"});

            $("#noCardWelcomeMsg").hide(); // si le TDB est vide
            
            $("body").addClass("archives");
            this.hideNewCandidatureButtons();

            // liens du menu
            // On désactive le lien corbeille et création de fiche dans le menu
            this.refreshMenu($("#archiveButton"), $("#ficheButton"));

            this.displayInnerPage();
            
            this.board.displayQuickImportButton(0);

            b.buildCandidatures();
   
        }
    },

    showActives : function(h)
    {
        var b = this.board;

        if(b.form.hasChange)
        {
            b.form.afterChangeSave = "showActives";
            b.form.showUnsavedModal();
        }
        else
        {
            this.hideBreadcrumb();

            b.archiveMode = 0;

            b.form.cancelCandidatureForm(1);    // masque le formulaire et reconstruit le tableau de bord

            if (h != 1)
                $Hist({id: "activeCandidatures"});

            $("body").removeClass("archives");

            this.board.form.hideSaveButton();

            if (!memoVars.isVisitor) {
                this.showNewCandidatureButtons();
                this.board.displayQuickImportButton(1);
            }
            else {
                this.hideNewCandidatureButtons();
            }

            // On désactive le lien de visualisation du TDB dans le menu 
            this.refreshMenu($("#activeButton"));

            this.displayInnerPage();
        }
    },

    openBackOffice : function()
    {
        window.open("./jsp/bo.jsp","classBO");
    },

    hideNewCandidatureButtons : function()
    {
        $(".boutonCandidature").hide();
    },

    showNewCandidatureButtons : function()
    {
        if (!memoVars.isVisitor) {
            $(".boutonCandidature").show();
        }
    },

    facebookLogin : function(fbResponse)
    {
        var p = "loginEmail=" + fbResponse.email + "&facebookId=" + fbResponse.id,
            source = getAccountSource();
        if(source)
            p += "&source="+source;

        $.ajax({
            type: 'POST',
            url: this.rootURL + '/account/facebookLogin',
            data: p,
            dataType: "json",

            success: function (response) {
                //$.toaster({ priority : "success", title : "Connnexion", message : "Vous êtes connecté à votre espace via Facebook"});
                //toastr['success']("Connnexion","Vous êtes connecté à votre espace via Facebook");

                //$("#csrf").val(response.csrf);
                lBR.setCsrf(response.csrf);
                lBR.initBoard(fbResponse.email);

                if(response.msg=="userCreated" && source)
                    lBR.logEventToGA('event', 'User creation', 'Source', source);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('/login/account error: ' + textStatus);
                Raven.captureException("facebookLogin ajax error : ",textStatus,errorThrown);
            }
        });

    },

    // Here we run a very simple test of the Graph API after login is
    // successful.  See statusChangeCallback() for when this call is made.
    facebookAuthentication : function(noLogin)
    {
        FB.api('/me?fields=email,last_name,first_name', function(response)
        {
            lBR.user = {
                lastName: response.last_name,
                fistName: response.first_name
            }

            $('.fbStatus').html('Merci de vous être connecté, ' + response.first_name+' '+response.last_name + '!');

            if(!noLogin)
                lBR.facebookLogin(response);
        });
    },

    showCreateAccountForm : function(h)
    {
        $('.alert-danger', $('.login-form')).hide();

        $('#btnHeaderStart').hide();
        $('#btnHeaderConnect').show();

        this.goToPage("createAccountForm",h);

        $wST(0);
    },


    showConnectionPage : function(h)
    {
        $('.alert-danger', $('.login-form')).hide();

        $('#btnHeaderConnect').hide();
        $('#btnHeaderStart').show();

        this.goToPage("connectionPage",h);

        $wST(0);
    },


    createAccount : function()
    {
        var  t=this,
             aLP = t.accountLoginPassword,
             aLE = t.accountLoginEmail,
             err = '',
             ok = 1;

        if(!aLE.check())
        {
            ok = 0;
            err += "Le champ email doit contenir une adresse email correcte<br />";
            //$.toaster({ priority : "warning", title : "Email incorrect", message : "Le champ email doit contenir une adresse email correcte"});
        }
        if(!aLP.check())
        {
            ok = 0;
            //$.toaster({ priority : "warning", title : "Mot de passe incorrect", message : "Les champs 'mot de passe' ne doivent pas être vides et doivent contenir la même valeur"});
            err+="Les champs 'mot de passe' doivent comporter entre 12 et 50 caractères et doivent contenir la même valeur<br />";
        }
        if(!$("#cguCheck")[0].checked)
        {
            ok = 0;
            err = "Vous devez avoir lu les conditions générales d'utilisation<br />";
        }

        if(ok)
        {
            $('.alert-danger', $('.login-form')).hide();

            var p = "accountLoginEmail="+aLE.getQParam()+"&accountLoginPassword="+aLP.getQParam(),
                source = getAccountSource();

            if(source)
                p += "&source="+source;

            $(".homeFormSpinner").show();
            $("#buttonCreateAccount").hide();
            $(".connectAction").hide();

            $.ajax({
                type: 'POST',
                url: this.rootURL + '/account',
                data: p,
                dataType: "json",

                success: function (response)
                {
                    if(response.result=="ok")
                    {
                        //$("#csrf").val(response.csrf);
                        lBR.setCsrf(response.csrf);
                        lBR.initBoard(aLE.field.val());
                        lBR.resetLoginForm();

                        if (response.msg=="userCreated")
                        {
                            toastr['success']("Compte créé","");
                            if(source)
                                lBR.logEventToGA('event', 'User creation', 'Source', source);
                        }
                    }
                    else
                    {
                        $wST(230);
                    	if (response.msg=="userExists") {
                    		// compte déjà existant
                    		$("#createAccountMsg").html("Ce compte existe déjà ! Veuillez utiliser une autre adresse email ou bien vous connecter.");
                    		$('.alert-danger', $('.login-form')).show();
                    	}
                        else
                        {
                    		toastr['error']("Erreur lors de la création du compte","Une erreur s'est produite lors de la création du compte "+response.msg);
                            lBR.manageError(response,"createAccount");
                    	}
                    }
                },
                error: function (jqXHR, textStatus, errorThrown)
                {
                    // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                    console.log('/login/account error: ' + textStatus);
                    $wST(230);
                    Raven.captureException("accountLogin ajax error : ",textStatus,errorThrown);
                },
                complete: function()
                {
                    $(".homeFormSpinner").hide();
                    $("#buttonCreateAccount").show();
                    $(".connectAction").show();
                }
            });
        }
        else
        {
            $("#createAccountMsg").html(err);
            $('.alert-danger', $('.login-form')).show();
            $wST(230);
        }
    },

    showPasswordResetPage : function(h)
    {
        $('.alert-danger', $('.login-form')).hide();

        $('#btnHeaderConnect').show();
        $('#btnHeaderStart').show();

        this.goToPage("resetPasswordForm",h);

        $wST(0);
    },

    saveNewPassword : function()
    {
        var  t=this,
            rP = t.resetPassword,
            rRP = t.repeatResetPassword,
            err = '',
            ok = 1;

        if(!rP.check())
        {
            ok = 0;
            err+="Les champs 'mot de passe' doivent comporter entre 12 et 50 caractères et doivent contenir la même valeur<br />";
        }

        if(ok)
        {
            $('#resetPasswordForm .alert-danger').hide();

            var p = "newPassword="+rP.field.val()+"&resetToken="+memoVars.resetToken;

            $(".homeFormSpinner").show();
            $("#buttonResetPassword").hide();

            $.ajax({
                type: 'POST',
                url: this.rootURL + '/account/resetPassword',
                data: p,
                dataType: "json",

                success: function (response)
                {
                    if(response.result=="ok")
                    {
                        toastr['success']("Nouveau mot de passe enregistré","");
                        lBR.showConnectionPage();

                        $('#loginPasswordRenewed').show();
                        memoVars.resetToken = "";
                    }
                    else
                    {
                        $wST(230);
                        if (response.msg=="tokenExpired") {
                            $("#resetPasswordMsg").html("Votre token n'est plus valable. Veuillez retournez sur la page de mot de passe oublié pour en régénérer un nouveau.");
                        } else
                        {
                            $("#resetPasswordMsg").html("Une erreur s'est produite. Veuillez contacter l'assistance de MEMO.");
                            lBR.manageError(response,"saveNewPassword");
                        }
                        $('#resetPasswordForm .alert-danger').show();
                    }
                },
                error: function (jqXHR, textStatus, errorThrown)
                {
                    // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                    console.log('/login/account error: ' + textStatus);
                    $wST(230);
                    Raven.captureException("saveNewPassword ajax error : ",textStatus,errorThrown);
                },
                complete: function()
                {
                    $(".homeFormSpinner").hide();
                    $("#buttonResetPassword").show();
                }
            });
        }
        else
        {
            $("#resetPasswordMsg").html(err);
            $('#resetPasswordForm .alert-danger').show();
            $wST(230);
        }
    },

    initBoard : function(uLogin)
    {
        memoVars.uLI = 1;

        if(uLogin)
            memoVars.user.login = uLogin;

        $("body").addClass("loggedIn");
        this.loggedIn = true;

        this.goToPage("boardPage");
        this.board.loadBoard();
        this.logUserIdIntoGA();
        this.saveUserSource();
    },

    showForgottenPasswordForm : function(h)
    {
        $('.alert-danger', $('.login-form')).hide();
        $("#fpResult").hide();

        $("#buttonGetPassword").show();

        $('#btnHeaderConnect').show();
        $('#btnHeaderStart').show();

        this.goToPage("forgottenPasswordForm",h);
        $wST(0);
    },

    getPassword : function()
    {
        var t =this,
            fpL = t.fpLoginEmail,
            p;

        if(fpL.check())
        {
            $('.alert-danger', $('.login-form')).hide();

            p = "loginEmail=" + fpL.getQParam();

            $("#fpResult").hide();

            $("#buttonGetPassword").hide();
            $(".homeFormSpinner").show();

            $.ajax({
                type: 'POST',
                url: this.rootURL + '/account/password',
                data: p,
                dataType: "json",

                success: function (response) {
              
                    if(response.result=="ok")
                        $("#fpResult").html("Un  lien pour renouveler votre mot de passe vous a été envoyé par email à l'adresse "+fpL.getValue()+"<br /><i>note : vérifiez dans vos spams si vous ne trouvez pas cet email dans votre boîte au lettres</i>").show();
                    else
                    {
                        //$.toaster({ priority : "warning", title : "Mauvais mot de passe", message : "Mauvais mot de passe"});
                        $("#forgottenPasswordMsg").html("Cette adresse ne correspond à aucun compte utilisateur");
                        $('.alert-danger', $('.login-form')).show();
                        $("#buttonGetPassword").show();

                        lBR.manageError(response,"getPassword");
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('/login/account error: ' + textStatus);

                    $("#forgottenPasswordMsg").html("Une erreur interne s'est produite");
                    $('.alert-danger', $('.login-form')).show();
                    $("#buttonGetPassword").show();

                    Raven.captureException("getPassword ajax error : ",textStatus,errorThrown);
                },
                complete: function()
                {
                    $(".homeFormSpinner").hide();
                }
            });
        }
        else
        {
            //$.toaster({ priority : "warning", title : "Formulaire incomplet", message : "Veuillez renseigner votre adresse email et votre mot de passe"});
            $("#forgottenPasswordMsg").html("Veuillez renseigner une adresse email valide");
            $('.alert-danger', $('.login-form')).show();
        }
    },

    showHome : function(h)
    {
        $('#createAccountForm').hide();
        $('#forgottenPasswordForm').hide();
        $('#connectionPage').hide();
        $('#btnHeaderConnect').show();
        $('#btnHeaderStart').show();

        //this.goToPage("connectionPage",h);
        this.goToPage("homePage",h);
    },

    goToPage : function(page, h)
    {
        if(h!=1)
            $Hist({ id : page });

        var t = this;

        $("#"+ t.currentPage).hide();
        t.currentPage = page;

        $("#"+ t.currentPage).show();

        if(page=="boardPage")
        {
            $("#homeHeader").hide();
        }
        else if(page=="homePage")
        {
            $("#homeHeader").show();
        }
    },

    // masque les pages intérieures de l'espace loguées et affiche celle en paramètre
    displayInnerPage : function(pageToShow)
    {
        $("#parametresPage").hide();
        $("#conseilsPage").hide();
        $("#prioritesPage").hide();
        $('#activitesPage').hide();

        if(pageToShow)
            $(pageToShow).show();
    },

    hideAllModals : function()
    {
        var mds = lBR.modals;
        for(md in mds)
            $('#'+mds[md]).modal('hide');
    },

    resetLoginForm : function()
    {
        this.loginEmail.setValue("");
        this.loginEmail.setNoColor();
        this.loginPassword.setValue("");
        this.loginPassword.setNoColor();
        this.accountLoginEmail.setValue("");
        this.accountLoginEmail.setNoColor();
        this.accountLoginPassword.setValue("");
        this.accountLoginPassword.setNoColor();
        this.accountRepeatLoginPassword.setValue("");
        this.accountRepeatLoginPassword.setNoColor();
        this.fpLoginEmail.setValue("");
        this.fpLoginEmail.setNoColor();
    },


    logUserIdIntoGA : function()
    {
        $.ajax({
            type: 'GET',
            url: this.rootURL + '/account/userId',
            dataType: "json",

            success: function (response)
            {
                if(response.result=="ok")
                {
                    //ga('set', 'userId', response.userId);

                    lBR.logEventToGA('event','Utilisateur','connection',(memoVars.PEAMConnect?'PEAM':''));
                    //ga('send', { hitType : 'event', eventCategory : 'Utilisateur', eventAction : 'connection' });
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('/login/account error: ' + textStatus);
                Raven.captureException("logUserIdIntoGA ajax error : ",textStatus,errorThrown);
            }
        });
    },

    buildPageName : function()
    {
        var href = window.location.href.toLowerCase(), v="", l="";

        v  = "<div>Retrouvez vos candidatures en un clin d'oeil</div>";
        l = '<img src="./pic/logo_memo.png" alt="Logo MEMO"/>';
        document.title = "MEMO";

        $(".logoSmall").html(l);
        $("#pageTitle").html(v);
        $("#serviceName").html(v);
    },

    showShareLink : function()
    {
        if(lBR.board.form.hasChange)
        {
            lBR.board.form.afterChangeSave = "showShareLink";
            lBR.board.form.showUnsavedModal();
        }
        else
        {
            $("#shareLinkDiv").hide();
            $("#shareLinkSpinner").show();
            this.getShareLink();
            $("#mdShareLink").modal('show');
        }
    },

    showParametres : function(h)
    {
        if(lBR.board.form.hasChange)
        {
            lBR.board.form.afterChangeSave = "showParametres";
            lBR.board.form.showUnsavedModal();
        }
        else
        {
            var t = this;

            if (h != 1)
                $Hist({id: "parametres"});

            t.parametres.show();

            // On désactive le lien des notifications dans le menu
            this.refreshMenu($("#parametresButton"));
        }
    },

    showConseils : function(h)
    {
        if(lBR.board.form.hasChange)
        {
            lBR.board.form.afterChangeSave = "showConseils";
            lBR.board.form.showUnsavedModal();
        }
        else
        {
            var t = this;

            if (h != 1)
                $Hist({id: "conseils"});

            t.conseils.show();

            // On désactive le lien des conseils dans le menu
            this.refreshMenu($("#conseilButton"));
        }
    },

    showFaq : function(idx)
    {
        var t = this,
            question = "mdFAQ";

        if(idx)
            question = idx;

        $("#mdPrivacyPolicy").modal("hide");    // cache cette modale si l'affichage de la faq se fait depuis cette modale

        $("#mdFAQ").modal("show");

        if($(".faqSpinner").length>0)
        {
            $.get( "faq.html", function( data ) {
                $("#mdFAQ .modal-body" ).html( data );

                $("#mdFAQ li[rel], a[rel]").on("click",function(el){
                    var id = $(el.currentTarget).attr("rel");
                    $goToFaq(id);
                })

                $(".faqBackToIndex").on("click",function(){
                    $goToFaq("mdFAQ");
                })

                $("#faqOpenDoorbell1,#faqOpenDoorbell2,#faqOpenDoorbell3").on("click",function(){
                    $("#mdFAQ").modal("hide");
                    doorbell.show();
                });

                setTimeout(function(){$goToFaq(question)},100);
            });
        }
        else
            $goToFaq(question);

        ga('send', { hitType : 'event', eventCategory : 'FAQ', eventAction : 'openFAQ' });
    },

    showPEAMError : function()
    {
        memoVars.peamError = '';
        $("#mdPEAMError").modal("show");
    },

    initCopyShareLinkButton : function()
    {
        var cpbd = new Clipboard("#shareLinkCopyButton");
    },

    // récupération du lien visiteur
    getShareLink : function()
    {
    	lBR.logEventToGA('event', 'Utilisateur', 'shareLink', 'partage TDB');
    	
        $.ajax({
            type: 'GET',
            url: this.rootURL + '/account/visitorLink',
            dataType: "json",

            success: function (response) {
                if(response.result=="ok")
                    $("#shareLink").val(window.location.origin+window.location.pathname+"?link="+response.visitorLink);
                else
                {
                    $("#shareLink").val("Une erreur s'est produite !");
                    lBR.manageError(response,"getShareLink");
                }

            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('/account/visitorLink error: ' + textStatus);
                $("#shareLink").val("Une erreur s'est produite !");
                Raven.captureException("getShareLink ajax error : ",textStatus,errorThrown);
            },
            complete: function()
            {
                $("#shareLinkDiv").show();
                $("#shareLinkSpinner").hide();
            }
        });
    },

    buildVisitorDisplay : function()
    {
        if(memoVars.isVisitor)
        {
            $(".boutonCandidature").hide();
            $("#quickImportDiv").hide();
            $("#ficheButton").hide();
            $("#shareBoardButton").hide();
            $("#conseilButton").hide();
            $("#logoutButton").hide();
            $("#buttonSaveCandidature2").hide();
            $("#buttonImportCandidature").hide();
            $("#buttonSaveCandidatureEvent").hide();
            $("#eventForm").hide();
            //$("#prefButton").hide();
            $("#parametresButton").hide();
            $("#candidatureForm textarea").attr("readonly",1)
            $("#candidatureForm input").attr("readonly",1)
            $("#candidatureForm select").attr("disabled","disabled")
            $("title").text($("title").text()+" "+memoVars.user.login );
        }
    },

    buildDisplayAfterLoadingCandidatures : function()
    {
        if (!memoVars.isVisitor && importOnStartup)       // s'il y a une url à importer à la connexion elle sera traitée ici et le buildCandidatures lui sera déféré.
            this.board.launchImportOnStartup();
        else
        {
            if (memoVars.openPrioritiesOnStartup)
            {
                this.conseils.showPriorites();
                memoVars.openPrioritiesOnStartup = 0;   // do it only once
            }
            else
                this.board.buildCandidatures();
        }
    },

    showVideo : function()
    {
        if(lBR.board.form.hasChange)
        {
            lBR.board.form.afterChangeSave = "showVideo";
            lBR.board.form.showUnsavedModal();
        }
        else
            $("#mdNoCandidatureVideo").modal("show");
    },

    // à la lecture de la vidéo on ajoute l'iframe vers youtube dans le div avec beau bg d'incitation à la lecture.
    // marquage de la vidéo lue utilisé dans moveVideo
    playVideo : function(elId,frId)
    {
        document.getElementById(elId).innerHTML = '<iframe id="'+frId+'" class="youtube" src="//www.youtube.com/embed/'+this.getVideo(frId)+'?rel=0&version=3&enablejsapi=1&autoplay=1&hl=fr&cc_lang_pref=fr&cc=on&cc_load_policy=1" frameborder="0" allowfullscreen></iframe>';
        if(!this.videoPlayed)
            this.videoPlayed = {};
        this.videoPlayed[frId]=1;
    },

    getVideo : function(frId)
    {
        var vid = "Cr-hCaqO298";
        if(frId=="homeVideo")
            vid = "JO-0MHmXsMw";
        return vid;
    },

    stopVideo : function()
    {
        try
        {
            $("#noCandidatureVideo")[0].contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}','*');
        }
        catch(err){}
        try
        {
            $("#homeVideo")[0].contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}','*');
        }
        catch(err){}
        try
        {
            $("#demoVideo")[0].contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}','*');
        }
        catch(err){}
    },

    showCGU : function()
    {
        $("#mdCGU").modal("show");
    },

    showBreadcrumb : function(page)
    {
        $("body").addClass("showBreadcrumb");
        this.board.searchTools.hideSearchForm();
        this.board.searchTools.closeFilterPanel();

        var links=$("#breadcrumbLinks")

        if(page=="board")
        {
            links.html("");
            this.board.searchTools.showSearchForm();
        }
        else if(page=="archives")
        {
            links.html(" <i class='fa fa-caret-right'></i> Candidatures terminées");
            this.board.searchTools.showSearchForm();
        }
        else if(page=="parametres")
        {
            links.html(" <i class='fa fa-caret-right'></i> Paramètres");
        }
        else if(page=="conseils")
        {
            links.html(" <i class='fa fa-caret-right'></i> Conseils personnalisés");
        }
        else if(page=="activites")
        {
            links.html(" <i class='fa fa-caret-right'></i> Journal des activités");
        }
        else if(page=="candidatureForm")
        {
            var html = "";
            if(lBR.board.archiveMode)
                html=" <i class='fa fa-caret-right'></i> <a id='buttonArchiveInBar'>Candidatures terminées</a>";

            if(lBR.board.selectedCandidature)
                html+= " <i class='fa fa-caret-right'></i> Fiche candidature";
            else
                html+= " <i class='fa fa-caret-right'></i> Ajouter une candidature";

            links.html(html);

            if(lBR.board.archiveMode)
                $("#buttonArchiveInBar").on("click", $.proxy(this.showArchives,this));
        }
        else if(page=="priorites")
        {
            links.html(" <i class='fa fa-caret-right'></i> Conseils<i class='fa fa-caret-right'></i> Vos priorités");
        }
    },

    hideBreadcrumb : function()
    {
        $("body").removeClass("showBreadcrumb");
    },

    checkPasswordChange : function()
    {
        $.ajax({
            type: 'GET',
            url: this.rootURL + '/account/checkPasswordChange',
            dataType: "json",

            success: function (response) {
                if(response.result=="doChange")
                    $('#mdRenouvelerMotDePasse').modal('show');
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log('/account/checkPasswordChange error: ' + textStatus);
                Raven.captureException("checkPasswordChange ajax error : ",textStatus,errorThrown);
            }
        });
    },

    getUrlLastUpdateOffreByJobboard : function(jobboard, async)
    {
    	var url;
	    $.ajax({
	        type : "GET",
	        url : memoVars.rootURL+"/candidatures/lastUpdateByJobboard/"+jobboard,
	        async: async,
	        dataType: "json",
	        success : function(response) {
	        	if (response.result == "ok") {
	                var rc = response.candidature;
	                url = rc.urlSource;
	        	}
	        },
	        error : function(jqXHR, textStatus, errorThrown) {
	            console.error('getLastUpdateOffreByJobboard error : ' + textStatus);
	            Raven.captureException("getUrlLastUpdateOffreByJobboard ajax error : ",textStatus,errorThrown);
	        }
	    });
	    return url;
    },
    
    logEventToGA : function(hitType, evtCategory, evtAction, evtLabel) {
    	ga('send', {
            hitType: hitType,
            eventCategory: evtCategory,
            eventAction: evtAction,
            eventLabel: evtLabel
        });
    },

    showPEConnectPage : function(h)
    {
        localStorage.setItem("peamSource",getAccountSource());
        localStorage.setItem("peamUrl",memoVars.url);
        lBR.logEventToGA('event', 'Utilisateur', 'PE Connect', 'Open PEAM');

        window.location = this.rootURL + '/account/peConnect';
    },

    // construction d'une iframe cachée contenant la mire PEConnect pour connecter automatiquement un utilisateur sur MEMO s'il a une session PE ouverte
    attemptToPeConnectUser : function()
    {
        var ifr = document.createElement("iframe");
        ifr.setAttribute("src",this.rootURL + '/account/peConnect');
        ifr.setAttribute("style","display:none;");

        document.body.appendChild(ifr);
    },

    // enregistre la source utilisateur dans le cas de PE Connect si la source n'est pas déjà enregistrée
    saveUserSource : function()
    {
        if(!memoVars.user.source && memoVars.peamSource)
        {
            p = "source=" + memoVars.peamSource+"&csrf="+$("#csrf").val();

            lBR.logEventToGA('event', 'User creation', 'Method', 'PE Connect');

            $.ajax({
                type: 'POST',
                url: this.rootURL + '/account/accountSource',
                data: p,
                dataType: "json",
                success: function (response) {},
                error : function(jqXHR, textStatus, errorThrown) {
                    Raven.captureException("saveUserSource ajax error : ",textStatus,errorThrown);
                }
            });
        }
    },

    manageError : function(response,action)
    {
        if(response.msg=="userAuth")
        {
            // cas d'un cookie de session expiré, on retourne sur la home.
            var now = moment();
            if(!this.lastUserAuthEvent || now.diff(this.lastUserAuthEvent,"seconds")>15)    // ce mécanisme évite d'effectuer plusieur fois la déconnexion$
            {
                this.lastUserAuthEvent = now;
                this.resetDisplayFromLogout();
                this.showErrorModal("Session terminée","Votre session a expiré.<BR /><br />Merci de vous reconnecter à votre espace MEMO");
                this.showConnectionPage();
            }
        }
        else
            console.log("error : ",action,response);
    },

    showErrorModal : function(title,body)
    {
        $("#mdErrorMessageDesc").html(title);
        $("#mdErrorMessageBody").html(body);

        $("#mdErrorMessage").modal("show");
    },

    setCsrf : function(csrf)
    {
        $("#csrf").val(csrf);
    }
    
}
