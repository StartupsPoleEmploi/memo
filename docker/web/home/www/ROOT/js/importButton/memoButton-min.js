function MemoButtonToolkit()
{
    this.evt = "p";

    if(window.location.hostname.indexOf('beta')>=0)
        this.evt = "r";
    else if(window.location.hostname.indexOf('boomerang')>=0)
        this.evt = "l";

    this.init();
}

MemoButtonToolkit.prototype = {

    init : function(evt)
    {
        this.initFrameMessageListener();
        this.buildButtons();
        this.initEvents();
    },

    initFrameMessageListener : function()
    {
        window.addEventListener('message',function(e)
        {
            //console.log("message recu MB", e.data);

            if(e.origin.indexOf('memo')>-1 || e.origin.indexOf('boomerang')>-1)
            {
                if(e.data.type=="setStyle") // fixe une classe css
                {
                    var ifr = document.getElementById(e.data.id);
                    var cls = e.data.styleClass;
                    if(cls)
                        ifr.setAttribute("class", cls);
                }
                else if (e.data.type=="buttonClicked")
                {
                    localStorage.setItem("lastMemoClick",new Date().getTime());
                    if(memoButtonToolkit.introJs)
                        memoButtonToolkit.introJs.exit();
                }
                else if (e.data.type=="sendParameters") // envoie les paramètres du bouton
                {
                    var ifr = document.getElementById(e.data.id),
                        p = {};
                    p.id=ifr.getAttribute("id");
                    p.style = ifr.getAttribute("data-style");
                    p.url = ifr.getAttribute("data-url");
                    p.jobTitle = ifr.getAttribute("data-title");
                    p.type = "setAttributes";

                    e.source.postMessage(p,"*");
                }
                else if (e.data.type=="sendIdentity")   // envoie l'identité du bouton à l'iframe qui ne connait pas encore son nom
                {
                    var ifrs = document.getElementsByClassName("btn-memo"),
                        p = {};

                    for(var i=0; i<ifrs.length; ++i)    // l'identité est envoyé à toutes les iframes btn-memo sur la page, l'attribut link permet au destinataire de se reconnaître
                    {
                        p.id= ifrs[i].getAttribute("id");

                        p.link = e.data.link;
                        p.type = "identity";

                        try
                        {
                            window.frames[p.id].contentWindow.postMessage(p, "*"); // version browser à jour
                        }
                        catch(err)
                        {   // fallback pour ffx 17 et IE11, différence de rang selon qu'on est en version recherche ou standalone sur la fiche de poste
                            if(!!window.MSInputMethodContext && !!document.documentMode)
                                window.frames[i].postMessage(p,"*");
                            else    // cas IOS
                                window.frames[($("iframe").length > ifrs.length) ? (i + 1) : i].postMessage(p, "*");
                        }
                    }
                }
            }
        })
    },

    buildButtons : function()
    {
        var memoButtons = document.getElementsByClassName("memo-import-button");

        for(var i= 0, l  = memoButtons.length; i<l; ++i)
        {
            this.buildButton(memoButtons[i],"memo-iframe-"+i);
        }
    },

    buildButton : function(aNode,id)
    {
        var ifr;
        aNode.setAttribute("tabindex",0);    // permet la tabulation

        ifr = document.createElement("iframe");

        ifr.setAttribute("id", id);

        if(this.evt=="p")
            ifr.setAttribute("src", "https://memo.pole-emploi.fr/importButton/importButton.html");
        else if(this.evt=="r")
            ifr.setAttribute("src", "https://memo.beta.pole-emploi.fr/importButton/importButton.html");
        else
            ifr.setAttribute("src", "http://boomerang:8080/importButton/importButton.html");

        ifr.setAttribute("class", "btn-memo");

        ifr.setAttribute("data-original-title", "Enregistrer dans MEMO");
        ifr.setAttribute("data-url",aNode.getAttribute("data-url"));
        ifr.setAttribute("data-title",aNode.getAttribute("data-title"));
        ifr.setAttribute("data-style",aNode.getAttribute("data-style"));
        ifr.setAttribute("data-style",aNode.getAttribute("data-style"));

        if(aNode.getAttribute("data-intro-js"))
        {
            if(id.indexOf("-0")>=0 && this.activateIntroJs())
                this.loadIntroJs();
        }

        aNode.appendChild(ifr);
    },

    initEvents : function()
    {
        document.onkeydown = function(e) {
            if(e.keyCode === 13) { // The Enter/Return key
                var aE = document.activeElement;

                if(aE && aE.firstChild && aE.firstChild.className == "btn-memo")
                {
                    // envoi de message click vers le bouton
                    memoButtonToolkit.sendClickOrder(aE.firstChild);
                }
            }
        };
    },

    sendClickOrder : function(ifr)
    {
        var p = { id :  ifr.getAttribute("id"), type : "keyboardClick" };

        try
        {
            window.frames[p.id].contentWindow.postMessage(p, "*"); // version browser à jour
        }
        catch(err) // fallback pour ffx 17 et IE11, diffïérence de rang selon qu'on est en version recherche ou standalone sur la fiche de poste
        {
            var ifrs = document.getElementsByClassName("btn-memo");

            for(var i = 0; i < ifrs.length; ++i)    // l'identité est envoyé à toutes les iframes btn-memo sur la page, l'attribut id permet à la destination de se reconnaître
            {
                if (!!window.MSInputMethodContext && !!document.documentMode)
                    window.frames[i].postMessage(p, "*");
                else    // cas IOS
                    window.frames[($("iframe").length > ifrs.length) ? (i + 1) : i].postMessage(p, "*");
            }
        }
    },

    startIntroJs : function()
    {
        this.introJs = new introJs();
        this.introJs.setOptions({"steps" : [{element:"#memo-iframe-0", intro: "<b>Astuce : Utilisez le bouton MEMO</b><br /><br />Enregistrez toutes vos candidatures pour les suivre facilement depuis votre tableau de bord MEMO"}], "doneLabel":"J'ai compris","showBullets":false,"showStepNumbers":false,tooltipPosition:"top"});
        this.introJs.start();

        localStorage.setItem("lastMemoIntroJs",new Date().getTime());
        localStorage.setItem("memoIntroJsCount",(localStorage.getItem("memoIntroJsCount")?2:1));
    },

    loadIntroJs : function()
    {
        try
        {
            if(introJs)
                this.startIntroJs();
            else
                this.importIntroJs();

        }
        catch(err)
        {
            this.importIntroJs();
        }

    },

    importIntroJs : function()
    {
        var js, css, path = "https://memo.pole-emploi.fr/",
            jsPath = "js/introjs/intro_memo-min.js",
            cssPath = "css/introjs/introjs_memo-min.css",
            fjs = document.getElementsByTagName("script")[0],
            fcss = document.getElementsByTagName("link")[0];

        js = document.createElement("script");
        js.async = true;

        css = document.createElement("link");
        css.async = true;

        if (window.location.hostname.indexOf('beta') >= 0)
            path = "https://memo.beta.pole-emploi.fr/";

        js.src = path + jsPath;
        css.href = path + cssPath;
        css.rel = "stylesheet";
        css.type = "text/css";

        fjs.parentNode.insertBefore(js, fjs);
        fcss.parentNode.insertBefore(css, fcss);
    },

    activateIntroJs : function()
    {
        var lMI = localStorage.getItem("lastMemoIntroJs"),
            mIC = localStorage.getItem("memoIntroJsCount") || 0,
            lMC = localStorage.getItem("lastMemoClick"),
            now = new Date().getTime(),
            res = false;

        mIC = eval(mIC);
        // @RG - ONBOARDING affichage de l'onboarding sur le bouton MEMO LBB si pas de click sur MEMO depuis moins de 30 jours, pas d'affichage de l'onboarding depuis moins de 14 jours, pas d'affichage de l'onboarding depuis moins d'1 jour et un seul affichage
        // affichage si
        if( (!lMC || (now-eval(lMC))>(30*24*60*60*1000)) &&  // pas de click sur MEMO depuis moins de 30 jours
            (!lMI || (now-eval(lMI))>(14*24*60*60*1000)) &&  // pas d'affichage depuis moins de 14 jours
            (!lMI || ((now-eval(lMI))>(24*60*60*1000) && mIC < 2)) // pas d'affichage depuis moins d'1 jour et un seul affichage
        )
        {
            res = true;
        }

        return res;
    }
}

memoButtonToolkit = new MemoButtonToolkit();



