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
        $(".openPrivacyButton").on("click",$.proxy( this.openPrivacyPolicy, this));
        $("#mdPrivacyInfoConsent").on("click",$.proxy( this.saveConsentAndHideModal, this));
        $("#mdPrivacyInfoDeny").on("click",$.proxy( this.saveDenyAndHideModal, this));
        $(".rgpdDeny .btn").on("click",$.proxy( this.showModal, this));
        $("#privacyBadge").on("click",$.proxy( this.showModal, this));
    },

    initBannerEvents : function()
    {
        //console.log("initBannerEvents");
        // l'événement sur le window pour fermeture banner  et consentement explicite

        $(document).on("click", $.proxy(this.saveConsentAndHideBanner,this));
    },

    removeBannerEvents : function()
    {
        //console.log("removeBannerEvents");
        // la suppression des événements banner et window
        $(document).off("click",$.proxy(this.saveConsentAndHideBanner,this));
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

            $('<input type="button" class="light" value="En savoir plus ou s\'opposer"/>').appendTo(div).click(function (evt) {
                //console.log("en savoir plus clicked");
                evt.stopPropagation();
                lBR.privacy.showModal();
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
    showModal : function()
    {
        //console.log("showModal");
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

        startGoogleAnalytics();
    },

    saveConsentAndHideBanner : function()
    {
        //console.log("saveConsentAndHideBanner");
        if(this.hasConsent!=false)
            this.saveConsent();
        this.hideBanner();
    },

    saveConsentAndHideModal : function()
    {
        this.saveConsent();
        this.hideModal();
    },

    saveDenyAndHideModal : function()
    {
        this.hideModal();
        this.disconnectUser();
        this.setNoConsentDisplay();
        this.stopTrackingAndRemoveCookies();
        this.hasConsent = false;
        this.setFooterBadge();
        localStorage.setItem("hasConsent",false);
    },

    hideModal : function()
    {
        $("#mdPrivacyInfo").modal("hide");
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
        this.removeBannerEvents();
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

        //console.log("checkConsent : ",res,this.hasConsent,this.consentExpire);

        return res;
    },

    // ouvre la modale avec la politique de confidentialité
    openPrivacyPolicy : function()
    {
        $("#mdPrivacyPolicy").modal("show");
    },

    showPrivacyInfo : function()
    {
        //$.infoCookie("Les cookies assurent le bon fonctionnement de nos services. En utilisant ces derniers, vous acceptez l'utilisation des cookies. <a href='javascript:lBR.showCGU();'>En savoir plus</a>");

        //console.log("showPrivacyInfo");

        if(!this.checkConsent())
        {
            this.seekConsent();
            this.setNoConsentDisplay();
        }
        else
            startGoogleAnalytics();
    },

    stopTrackingAndRemoveCookies : function()
    {
         var cks = Cookies.get();

         for(k in cks)
         {
             Cookies.remove(k);
             Cookies.remove(k, { domain: '.pole-emploi.fr' });
             Cookies.remove(k, { domain: '.memo.beta.pole-emploi.fr' });
             Cookies.remove(k, { domain: '.memo.pole-emploi.fr' });
         }

        localStorage.clear();

        window.ga = function(){};
    }
}


