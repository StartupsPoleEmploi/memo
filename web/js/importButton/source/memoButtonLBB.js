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
        this.clickedButtons = [];
        this.initCss();
        this.initFrameMessageListener();
        this.buildIframe();
        this.buildButtons();
        this.initToolTip();
        this.initEvents();
        this.removeATags();
    },


    initCss : function()
    {
        var css,
            fcss = document.getElementsByTagName("link")[0];

        if(!document.getElementById("memoCss"))
        {
            css = document.createElement("link");
            css.id = "memoCss";
            css.async = true;
            css.type = "text/css";
            css.rel = "stylesheet";

            if(this.evt=="p")
                css.href = "https://memo.pole-emploi.fr/css/importButton/memoButtonLBB.css";
            else if(this.evt=="r")
                css.href = "https://memo.beta.pole-emploi.fr/css/importButton/memoButtonLBB.css";
            else
                css.href = "http://boomerang:8080/css/importButton/memoButtonLBB.css";

            fcss.parentNode.insertBefore(css,fcss);
        }
    },

    initFrameMessageListener : function()
    {
        window.addEventListener('message',function(e)
        {
            //console.log("message recu", e.data.type, e.data);

            if(e.origin.indexOf('memo')>-1 || e.origin.indexOf('boomerang')>-1)
            {
                if (e.data.type=="setState") // modifie l'état du bouton
                {
                    var btId = e.data.buttonId,
                        btn = $("#"+btId);

                    btn.attr("data-original-title", e.data.btText);
                    btn.attr("class","btn-memo "+e.data.className);
                    /*btn.html("<div></div><span>"+e.data.btText+"</span>" +
                     "<span class='sr-only'>"+e.data.srText+"</span>");*/
                    btn.html("<div></div><span class='sr-only'>"+e.data.srText+"</span>");
                    $(".tooltip.in").html("<div class='tooltip-arrow' style='left: 50%;'></div><div class='tooltip-inner'>"+e.data.btText+"</div>");
                    btn.attr("title", e.data.btText);
                    if(e.data.className == "btn-memo-off")
                        btn.attr("disabled","disabled");
                    else if(e.data.className == "btn-memo-on")
                    {
                        // retrait du bouton du tableau clickedButtons
                        if(memoButtonToolkit.clickedButtons.indexOf(btId)>-1)
                            memoButtonToolkit.clickedButtons.splice(memoButtonToolkit.clickedButtons.indexOf(btId),1);
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
            this.buildButton(memoButtons[i],i);
        }
    },

    buildIframe : function()
    {
        //console.log("buildIframe");

        var ifr = document.createElement("iframe");

        ifr.setAttribute("title","Dispositif technique (aucun contenu)");
        ifr.setAttribute("id", "memo-iframe");

        if(this.evt=="p")
            ifr.setAttribute("src", "https://memo.pole-emploi.fr/importButton/importButtonLBB.html");
        else if(this.evt=="r")
            ifr.setAttribute("src", "https://memo.beta.pole-emploi.fr/importButton/importButtonLBB.html");
        else
            ifr.setAttribute("src", "http://boomerang:8080/importButton/importButtonLBB.html");

        ifr.setAttribute("style", "display:none; overflow:hidden; width:0px; height:0px;");

        $("body").append(ifr);

    },

    buildButton : function(aNode,rank)
    {
        var btn  = document.createElement("button"),
            title = "Enregistrer la fiche entreprise dans MEMO (Ouvre une fenêtre popup)";

        btn.setAttribute("type","button");
        btn.setAttribute("id", "memo-button-"+rank);
        btn.setAttribute("class", "btn-memo btn-memo-on");

        btn.setAttribute("dataurl",aNode.getAttribute("data-url"));
        btn.setAttribute("title",title);
        btn.setAttribute("rel","nofollow");

        aNode.parentNode.insertBefore(btn, aNode.nextSibling);
        /*btn.innerHTML =  "<div></div><span>Enregistrer dans MEMO</span>"+
         "<span class='sr-only'>"+title+"</span>";*/
        btn.innerHTML =  "<div></div>"+
            "<span class='sr-only'>"+title+"</span>";

        /*if(aNode.getAttribute("data-intro-js"))
         {
         if(rank==0 && this.activateIntroJs())
         //this.loadIntroJs();
         this.loadJePostuleIntroJs();
         }*/
    },

    initToolTip : function()
    {
        try
        {
            $('button.btn-memo').tooltip();
            $('button.btn-memo').attr("title","Enregistrer l'offre d'emploi dans MEMO (Ouvre une fenêtre popup)");
        }
        catch(err){ // tentative tant que la lib tooltip n'est pas dispo
            setTimeout(function(){memoButtonToolkit.initToolTip();},100);
        }
    },

    initEvents : function()
    {
        var bts = $("button.btn-memo");

        for(var i=0; i<bts.length; ++i)
        {
            $(bts[i]).on("click",function(e){
                memoButtonToolkit.sendClickOrder(e.currentTarget);
                localStorage.setItem("lastMemoClick",new Date().getTime());
                memoButtonToolkit.clickedTooltipElement = e.currentTarget;
            });

            $(bts[i]).on("focus",function(e){
                $(e.currentTarget).tooltip("show");
            });

            $(bts[i]).on("blur",function(e){
                $(e.currentTarget).tooltip("hide");
            });

            $(bts[i]).on("mouseout",function(e){
                if(memoButtonToolkit.clickedTooltipElement) {
                    $(".tooltip").tooltip("hide");
                }
            });
        }

        document.onkeydown = function(e) {
            if(e.keyCode === 13) { // The Enter/Return key
                var aE = document.activeElement;

                if(aE && $(aE).length>0 && $(aE)[0].firstChild && $(aE)[0].firstChild.className == "btn-memo")
                {
                    // envoi de message click vers le bouton
                    memoButtonToolkit.sendClickOrder($(aE)[0].firstChild);
                }
            }
        };

    },

    sendClickOrder : function(bt)
    {
        var btn = $("#"+bt.id),
            p = { id : "memo-iframe", type : "clickOrder", buttonId : bt.id, url : btn.attr("dataurl") };

        if(memoButtonToolkit.clickedButtons.indexOf(bt.id)<0)
        {
            //console.log("sendClickOrder : ", p);
            memoButtonToolkit.postMessageToFrame(p);
            memoButtonToolkit.clickedButtons.push(bt.id);
        }
        /*else
         {
         console.log("bouton déjà cliqué : ",bt.id);
         }*/
    },

    postMessageToFrame : function(p)
    {
        try
        {
            window.frames[p.id].contentWindow.postMessage(p, "*"); // version browser à jour
        }
        catch(err) // fallback pour ffx 17 et IE11, différence de rang selon qu'on est en version recherche ou standalone sur la fiche de poste
        {

            var ifrs = $("#memo-iframe");

            for (var i = 0; i < ifrs.length; ++i)    // l'identité est envoyée à toutes les iframes btn-memo sur la page, l'attribut id permet à la destination de se reconnaître
            {
                if (!!window.MSInputMethodContext && !!document.documentMode)
                    window.frames[i].postMessage(p, "*");
                else    // cas IOS
                    window.frames[($("iframe").length > ifrs.length) ? (i + 1) : i].postMessage(p, "*");
            }
        }
    },

    removeATags : function()
    {
        // suppression des <a>
        var memoButtons = document.getElementsByClassName("memo-import-button");

        while(memoButtons.length>0)
        {
            this.removeATag(memoButtons[0]);
        }
    },

    removeATag : function(aNode)
    {
        var prt = aNode.parentNode;
        prt.removeChild(aNode);
    },

    /*startIntroJs : function()
     {
     this.introJs = new introJs();
     this.introJs.setOptions({"steps" : [{element:"#memo-button-0", intro: "<b>Astuce : Utilisez le bouton MEMO</b><br /><br />Enregistrez toutes vos candidatures pour les suivre facilement depuis votre tableau de bord MEMO"}], "doneLabel":"J'ai compris","showBullets":false,"showStepNumbers":false,tooltipPosition:"top"});
     this.introJs.start();

     localStorage.setItem("lastMemoIntroJs",new Date().getTime());
     localStorage.setItem("memoIntroJsCount",(localStorage.getItem("memoIntroJsCount")?2:1));
     },*/
    startIntroJs : function()
    {
        //this.startJePostuleIntroJs();
    }

    /*,

     startJePostuleIntroJs : function()
     {
     this.introJs = new introJs();
     this.introJs.setOptions({"steps" : [{element:".js-result-toggle-details", intro: "<b>You rock !</b><br /><br />Le super texte pour faire cartonner le bouton JE POSTULE !"}], "doneLabel":"C'est promis je vais cliquer","showBullets":false,"showStepNumbers":false,tooltipPosition:"top"});
     this.introJs.start();

     localStorage.setItem("lastJePostuleIntroJs",new Date().getTime());
     localStorage.setItem("jePostuleIntroJsCount",(localStorage.getItem("memoIntroJsCount")?2:1));
     },*/


    /*loadIntroJs : function()
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

     },*/

    /*loadJePostuleIntroJs : function()
     {
     try
     {
     if(introJs)
     this.startJePostuleIntroJs();
     else
     this.importIntroJs();

     }
     catch(err)
     {
     this.importIntroJs();
     }
     },*/

    /*importIntroJs : function()
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
     },*/

    /*activateIntroJs : function()
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
     }*/

    /*activateJePostuleIntroJs : function()
     {
     var lMI = localStorage.getItem("lastJePostuleIntroJs"),
     mIC = localStorage.getItem("jePostuleIntroJsCount") || 0,
     now = new Date().getTime(),
     res = false;

     mIC = eval(mIC);
     // @RG - ONBOARDING affichage de l'onboarding sur le bouton JE POSTULE LBB si pas d'affichage de l'onboarding depuis moins de 14 jours, pas d'affichage de l'onboarding depuis moins d'1 jour et un seul affichage
     if(
     (!lMI || (now-eval(lMI))>(14*24*60*60*1000)) &&  // pas d'affichage depuis moins de 14 jours
     (!lMI || ((now-eval(lMI))>(24*60*60*1000) && mIC < 2)) // pas d'affichage depuis moins d'1 jour et un seul affichage
     )
     {
     res = true;
     }

     return res;
     }*/
}

memoButtonToolkit = new MemoButtonToolkit();