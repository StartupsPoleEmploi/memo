function MemoButtonToolkit(zipFilter)
{
    this.evt = "p";

    var scriptFile = $("#ctj-script");

    if(scriptFile && scriptFile.length>0)
    {
        if(scriptFile.attr("src").indexOf('beta') >= 0)
            this.evt = "r";
    }
    else
    {
        if (window.location.hostname.indexOf('beta') >= 0)
            this.evt = "r";
        else if (window.location.hostname.indexOf('boomerang') >= 0)
            this.evt = "l";
    }

    this.init(zipFilter);
}

MemoButtonToolkit.prototype = {

    init : function(zipFilter,evt)
    {
        this.initCss();
        this.initFrameMessageListener();

        this.zipFilter=zipFilter;

        this.buildButtons();
        this.initToolTip();

        //this.removeATags();
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
                css.href = "https://memo.pole-emploi.fr/css/importButton/memoButtonPE.css";
            else if(this.evt=="r")
                css.href = "https://memo.beta.pole-emploi.fr/css/importButton/memoButtonPE.css";
            else
                css.href = "http://boomerang:8080/css/importButton/memoButtonPE.css";

            fcss.parentNode.insertBefore(css,fcss);
        }
    },

    initFrameMessageListener : function()
    {
        window.addEventListener('message',function(e)
        {
            //console.log("message recu MB", e.data);

            if(e.origin.indexOf('memo')>-1 || e.origin.indexOf('boomerang')>-1)
            {
                if (e.data.type=="setState") // modifie le tooltip du bouton
                {
                    var ifr = document.getElementById(e.data.id),
                        btn = document.getElementById(ifr.getAttribute("buttonId"));

                    btn.setAttribute("data-original-title", e.data.tooltip);
                    btn.setAttribute("class","btn-memo "+e.data.className);
                    btn.innerHTML="<span class='sr-only'>"+e.data.tooltip+"</span>";
                    $(".tooltip.in").html("<div class='tooltip-arrow' style='left: 50%;'></div><div class='tooltip-inner'>"+e.data.tooltip+"</div>");
                    btn.setAttribute("title", e.data.tooltip);
                    if(e.data.className == "btn-memo-off")
                        btn.setAttribute("disabled","disabled");
                }
                else if (e.data.type=="sendParameters") // envoie les paramètres du bouton
                {
                    var ifr = $("#"+ e.data.id),
                        p = {};
                    p.id=ifr.attr("id");
                    p.size = ifr.attr("data-size");
                    p.url = ifr.attr("data-url");
                    p.idOffre = ifr.attr("data-id");
                    p.location = ifr.attr("data-location");
                    p.zipCode = ifr.attr("data-zipcode");
                    p.jobTitle = ifr.attr("data-title");
                    p.type = "setAttributes";

                    e.source.postMessage(p,"*");
                }
                else if (e.data.type=="sendIdentity")   // envoie l'identité du bouton à l'iframe qui ne connait pas encore son nom
                {
                    var ifrs = $("iframe.btn-memo"),
                        p = {};

                    for(var i=0; i<ifrs.length; ++i)    // l'identité est envoyé à toutes les iframes btn-memo sur la page, l'attribut link permet au destinataire de se reconnaître
                    {
                        p.id= $(ifrs[i]).attr("id");

                        p.link = e.data.link;
                        p.type = "identity";

                        memoButtonToolkit.postMessageToFrame(p,i);
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

    buildButton : function(aNode,rank)
    {
        var ifr, button,
            location = aNode.getAttribute("data-location"),
            size = aNode.getAttribute("data-size"),
            zipCode = aNode.getAttribute("data-zipcode");

        //$(aNode).attr("tabindex",0);    // permet la tabulation

        if(this.checkFilter(location,zipCode))
        {
            ifr = document.createElement("iframe");
            button  = document.createElement("button");

            ifr.setAttribute("title","Dispositif technique (aucun contenu)");
            ifr.setAttribute("id", "memo-iframe-"+rank);
            ifr.setAttribute("buttonId", "memo-button-"+rank)

            button.setAttribute("type","button");
            button.setAttribute("id", "memo-button-"+rank);
            button.setAttribute("frameId", "memo-iframe-"+rank);
            button.setAttribute("data-original-title", "Enregistrer dans MEMO");
            button.setAttribute("class", "btn-memo btn-memo-on");
            button.setAttribute("rel","nofollow");

            if(this.evt=="p")
                ifr.setAttribute("src", "https://memo.pole-emploi.fr/importButton/importButtonPE.html");
            else if(this.evt=="r")
                ifr.setAttribute("src", "https://memo.beta.pole-emploi.fr/importButton/importButtonPE.html");
            else
                ifr.setAttribute("src", "http://boomerang:8080/importButton/importButtonPE.html");

            ifr.setAttribute("style", "display:none; overflow:hidden; width:0px; height:0px;");

            if(size && size=="detail")
            {
                button.setAttribute("style", "overflow:hidden; width:21px; height:21px;");
                ifr.setAttribute("data-size",size);
            }
            else
                button.setAttribute("style", "overflow:hidden; width:34px; height:34px;");

            ifr.setAttribute("class", "btn-memo");
            ifr.setAttribute("data-url",aNode.getAttribute("data-url"));
            ifr.setAttribute("data-id",aNode.getAttribute("data-id-offre"));
            ifr.setAttribute("data-location",location);
            ifr.setAttribute("data-zipcode",zipCode);
            ifr.setAttribute("data-title",aNode.getAttribute("data-title"));
            button.setAttribute("data-title",aNode.getAttribute("data-title"));

            aNode.parentNode.insertBefore(button, aNode.nextSibling);
            button.innerHTML = "<span class='sr-only'>Enregistrer l'offre d'emploi dans MEMO (Ouvre une fenêtre popup)</span>";

            if(!this.iFrameExists("memo-iframe-"+rank))
                $("body").append(ifr);
            else
            {
                var p = {
                    id : "memo-iframe-"+rank,
                    type : "getState"
                }
                this.postMessageToFrame(p);
            }
            //aNode.appendChild(ifr);

            this.initEvents(button);
            this.removeATags();
        }
    },

    iFrameExists : function(id)
    {
        var ifr = document.getElementById(id),
            res = false;
        if(ifr)
            res = true;
        return res;
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

    initEvents : function(button)
    {
        var bts = $(button);//$("button.btn-memo");

        for(var i=0; i<bts.length; ++i)
        {
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

            $(bts[i]).on("click",function(e){
                memoButtonToolkit.sendClickOrder(e.currentTarget);
                memoButtonToolkit.clickedTooltipElement = e.currentTarget;
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

    sendClickOrder : function(btn)
    {
        var p = { id :  $(btn).attr("frameId"), type : "keyboardClick" };
        this.postMessageToFrame(p);
    },

    postMessageToFrame : function(p,idx)
    {
        try
        {
            window.frames[p.id].contentWindow.postMessage(p, "*"); // version browser à jour
        }
        catch(err) // fallback pour ffx 17 et IE11, différence de rang selon qu'on est en version recherche ou standalone sur la fiche de poste
        {
            if(idx)
            {
                if(!!window.MSInputMethodContext && !!document.documentMode)
                    window.frames[idx].postMessage(p,"*");
                else
                    window.frames[($("iframe").length>ifrs.length)?(idx+1):idx].postMessage(p,"*");
            }
            else
            {
                var ifrs = $("iframe.btn-memo");

                for (var i = 0; i < ifrs.length; ++i)    // l'identité est envoyée à toutes les iframes btn-memo sur la page, l'attribut id permet à la destination de se reconnaître
                {
                    if (!!window.MSInputMethodContext && !!document.documentMode)
                        window.frames[i].postMessage(p, "*");
                    else    // cas IOS
                        window.frames[($("iframe").length > ifrs.length) ? (i + 1) : i].postMessage(p, "*");
                }
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

    checkFilter : function(location,zipCode)
    {
        var res = 0;

        if(this.zipFilter)
        {
            try {
                if (location || zipCode) {
                    var loc;
                    if (location) {
                        loc = location[0] + location[1];
                        if (isNaN(loc)) {
                            loc = "";
                        }
                    }

                    if (!loc && zipCode) {
                        loc = zipCode[0] + zipCode[1];
                        if (isNaN(loc))
                            loc = "";
                    }

                    if (loc && this.zipFilter.indexOf(eval(loc))>=0)
                        res = 1;
                }
            }
            catch(err){console.log("filter err : ",err,this.zipFilter,location,zipCode);}
        }
        else
            res = 1;

        return res;
    }
}

memoButtonToolkit = new MemoButtonToolkit();