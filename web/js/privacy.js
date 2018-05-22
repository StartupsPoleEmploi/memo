function Privacy()
{
    this.init();
}


Privacy.prototype = {

    init : function()
    {
        if(localStorage.getItem("hasConsent")=="true")
            this.hasConsent = true;
        else if(localStorage.getItem("hasConsent")=="false")
            this.hasConsent = false;

        this.consentExpire = localStorage.getItem('consentExpire');
        if(this.consentExpire)
            this.consentExpire = eval(localStorage.getItem('consentExpire'));

        this.badge = $("#privacyBadge");

        this.initEvents();

        this.setFooterBadge();
    },

    seekConsent : function()
    {
        //console.log("seekConsent");
        this.showBanner();
        this.setNoConsentDisplay();
        // showBanner et setNoConsentDisplay
    },

    initEvents : function()
    {
        // les événements sur les boutons
        $(".openPrivacyButton").on("click",$.proxy( this.showPrivacyPolicy, this));
        $(".mdPrivacyInfoConsent").on("click",$.proxy( this.saveConsentAndHideModal, this));
        $(".mdPrivacyInfoDeny").on("click",$.proxy( this.saveDenyAndHideModal, this));
        $(".rgpdDeny .btn").on("click",$.proxy( this.saveConsentAndHideBanner, this));
        $(".rgpdDeny a").on("click",$.proxy( this.showPrivacyInfo, this));
        $("#privacyBadge").on("click",$.proxy( this.showPrivacyInfo, this));
        $("#mdPrivacyInfo a").on("click", $.proxy(this.showPrivacyPolicy,this))
    },

    // affiche le bandeau
    showBanner : function()
    {
        //console.log("showBanner");

        var div = $("#privacyBanner");

        if(div.length==0)
        {
            //console.log("construction banner");

            div = $(document.createElement("div"));
            div.attr("id", "privacyBanner");
            div.css({
                "top": "0",
                "display": "none",
                "width": "100%",
                "position": "fixed",
                "zIndex": "2000",
                "left": "0"
            }).addClass("cookie-notice");

            div.html("En poursuivant votre navigation sur ce site, vous acceptez nos conditions d'utilisation de vos données de navigations.<div>");

            $('<input type="button" value="OK"/>').appendTo(div).click(function (evt) {
                //console.log("ok clicked");
                evt.stopPropagation();

                lBR.privacy.saveConsent();
                lBR.privacy.hideBanner();
            });

            $('<a>En savoir plus ou s\'opposer</a>').appendTo(div).click(function (evt) {
                //console.log("en savoir plus clicked");
                evt.stopPropagation();
                lBR.privacy.showPrivacyInfo();
            });

            $('</div>').appendTo(div);

            //lBR.privacy.initBannerEvents();

            div.appendTo("body");
        }
        else
        {
            //lBR.privacy.initBannerEvents();
            //console.log("banner existante");
        }

        setTimeout(function(){div.show("slideDown");},1000);
    },

    // montre la modale avec le détail
    showPrivacyInfo : function(h)
    {
        if (h != 1)
        {
            $Hist({id: "privacyInfo"});
            ga('send', { hitType : 'event', eventCategory : 'Privacy', eventAction : 'showInfo' });
        }

        //console.log("showPrivacyInfo");
        this.hideBanner();

        $("#mdPrivacyInfo").modal({
            backdrop: 'static',
            keyboard: false
        });
    },

    setNoConsentDisplay : function()
    {
        //console.log("setNoConsentDisplay");
        $(".rgpdConsent").hide();
        $(".rgpdDeny").show();
        // formulaire création / connexion remplacés par des textes + bouton
    },

    setConsentDisplay : function()
    {
        //console.log("setConsentDisplay");
        $(".rgpdDeny").hide();
        $(".rgpdConsent").show();
    },

    setFooterBadge : function()
    {
        //console.log("setFooterBadge");
        if(this.hasConsent)
            this.badge.addClass("hasConsent");
        else
            this.badge.removeClass("hasConsent");
    },

    saveConsent : function()
    {
        //console.log("saveConsent");

        var now = moment();
        now.add(13,"months");
        localStorage.setItem("consentExpire",now.toDate().getTime());
        localStorage.setItem("hasConsent",true);

        this.hasConsent = true;
        this.setFooterBadge();
        this.setConsentDisplay();

        ga('send', { hitType : 'event', eventCategory : 'Privacy', eventAction : 'acceptedPolicy' });
    },

    saveConsentAndHideBanner : function()
    {
        this.saveConsent();
        this.hideBanner();
    },

    saveConsentAndHideModal : function()
    {
        this.saveConsent();
        this.hideModals();
    },

    saveDenyAndHideModal : function()
    {
        this.hideModals();
        this.disconnectUser();
        this.setNoConsentDisplay();
        //this.stopTrackingAndRemoveCookies();
        this.hasConsent = false;
        this.setFooterBadge();
        localStorage.setItem("hasConsent",false);

        ga('send', { hitType : 'event', eventCategory : 'Privacy', eventAction : 'deniedPolicy' });
    },

    hideModals : function()
    {
        $("#mdPrivacyInfo").modal("hide");
        $("#mdPrivacyPolicy").modal("hide");
    },

    disconnectUser : function()
    {
        //console.log("déconnexion de l'utilisateur");
        if(lBR.loggedIn)
            lBR.logoutUser();
    },

    hideBanner : function()
    {
        //console.log("hideBanner");
        //this.removeBannerEvents();
        $("#privacyBanner").hide("slideUp");
    },

    checkConsent : function()
    {
        var res = false;
        if(this.hasConsent)
        {
            if(this.consentExpire)
            {
                var now = new Date();
                now = now.getTime();

                if (this.consentExpire > now)
                    res = true;
            }
        }

        return res;
    },

    // ouvre la modale avec la politique de confidentialité
    showPrivacyPolicy : function(h)
    {
        if (h != 1)
        {
            $Hist({id: "privacyPolicy"});
            ga('send', { hitType : 'event', eventCategory : 'Privacy', eventAction : 'showPrivacyPolicy' });
        }

        // prompt d'acceptation des la politique de confidentialité si l'utilisateur n'a pas encore répondu
        if(this.hasConsent)
        {
            $(".mdPrivacyPolicyPrompt").hide();
            $("#mdPrivacyPolicy .mdPrivacyInfoConsent").hide();
            $("#mdPrivacyPolicy .mdPrivacyInfoDeny").hide();
            $(".mdPrivacyPolicyClose").show();
        }
        else
        {
            $(".mdPrivacyPolicyPrompt").show();
            $("#mdPrivacyPolicy .mdPrivacyInfoConsent").show();
            $("#mdPrivacyPolicy .mdPrivacyInfoDeny").show();
            $(".mdPrivacyPolicyClose").hide();
        }

        this.hideBanner();
        $("#mdPrivacyInfo").modal("hide");
        $("#mdPrivacyPolicy").modal("show");
    },

    initPrivacyInfo : function()
    {
        if(!this.checkConsent())
        {
            this.seekConsent();
            this.setNoConsentDisplay();
        }
        /*else
            startGoogleAnalytics();*/
    }
}


