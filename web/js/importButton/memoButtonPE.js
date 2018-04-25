function MemoButtonToolkit(zipFilter)
{
    this.evt = "p";

    if(window.location.hostname.indexOf('beta')>=0)
        this.evt = "r";
    else if(window.location.hostname.indexOf('boomerang')>=0)
        this.evt = "l";

    this.init(zipFilter);
}

MemoButtonToolkit.prototype = {

    init : function(zipFilter,evt)
    {
        this.initFrameMessageListener();

        this.zipFilter=zipFilter;

        this.buildButtons();
        this.initToolTip();
        this.initKeyboardEvents();
        this.removeATags();
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
                else if (e.data.type=="setTooltip") // modifie le tooltip du bouton
                {
                    var ifr = document.getElementById(e.data.id);
                    ifr.setAttribute("data-original-title", e.data.tooltip);
                    $(".tooltip.in").html("<div class='tooltip-arrow' style='left: 50%;'></div><div class='tooltip-inner'>"+e.data.tooltip+"</div>");
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

                        try
                        {
                            window.frames[p.id].contentWindow.postMessage(p, "*"); // version browser à jour
                        }
                        catch(err)
                        {   // fallback pour ffx 17 et IE11, différence de rang selon qu'on est en version recherche ou standalone sur la fiche de poste
                            if(!!window.MSInputMethodContext && !!document.documentMode)
                                window.frames[i].postMessage(p,"*");
                            else
                                window.frames[($("iframe").length>ifrs.length)?(i+1):i].postMessage(p,"*");
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
        var ifr,
            location = aNode.getAttribute("data-location"),
            size = aNode.getAttribute("data-size"),
            zipCode = aNode.getAttribute("data-zipcode");

        //$(aNode).attr("tabindex",0);    // permet la tabulation

        if(this.checkFilter(location,zipCode))
        {
            ifr = document.createElement("iframe");

            ifr.setAttribute("id", id);

            if(this.evt=="p")
                ifr.setAttribute("src", "https://memo.pole-emploi.fr/importButton/importButtonPE.html");
            else if(this.evt=="r")
                ifr.setAttribute("src", "https://memo.beta.pole-emploi.fr/importButton/importButtonPE.html");
            else
                ifr.setAttribute("src", "http://boomerang:8080/importButton/importButtonPE.html");

            if(size && size=="detail")
            {
                ifr.setAttribute("style", "overflow:hidden; width:21px; height:21px;");
                ifr.setAttribute("data-size",size);
            }
            else
                ifr.setAttribute("style", "overflow:hidden; width:34px; height:34px;");
            ifr.setAttribute("class", "btn-memo");

            ifr.setAttribute("data-original-title", "Enregistrer dans MEMO");

            ifr.setAttribute("data-url",aNode.getAttribute("data-url"));
            ifr.setAttribute("data-id",aNode.getAttribute("data-id-offre"));
            ifr.setAttribute("data-location",location);
            ifr.setAttribute("data-zipcode",zipCode);
            ifr.setAttribute("data-title",aNode.getAttribute("data-title"));

            aNode.parentNode.insertBefore(ifr, aNode.nextSibling);
            //aNode.appendChild(ifr);
        }
    },

    initToolTip : function()
    {
        try{
            $('.btn-memo').tooltip();
        }
        catch(err){ // tentative tant que la lib tooltip n'est pas dispo
            setTimeout(function(){memoButtonToolkit.initToolTip();},100);
        }
    },

    initKeyboardEvents : function()
    {
        var ifrs = $(".memo-import-button");

        for(var i=0; i<ifrs.length; ++i)
        {
            $(ifrs[i]).on("focus",function(e){
                $(e.currentTarget.childNodes[0]).tooltip("show");
            });
            $(ifrs[i]).on("blur",function(e){
                $(e.currentTarget.childNodes[0]).tooltip("hide");
            });

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
        }
    },

    sendClickOrder : function(ifr)
    {
        var p = { id :  $(ifr).attr("id"), type : "keyboardClick" };

        try
        {
            window.frames[p.id].contentWindow.postMessage(p, "*"); // version browser ï¿½ jour
        }
        catch(err) // fallback pour ffx 17 et IE11, diffï¿½rence de rang selon qu'on est en version recherche ou standalone sur la fiche de poste
        {
            var ifrs = $("iframe.btn-memo");

            for(var i = 0; i < ifrs.length; ++i)    // l'identitï¿½ est envoyï¿½e ï¿½ toutes les iframes btn-memo sur la page, l'attribut id permet à la destination de se reconnaître
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







