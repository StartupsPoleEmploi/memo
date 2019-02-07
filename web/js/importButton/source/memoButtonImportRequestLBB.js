function MemoButtonImportRequest()
{
    this.init();
}

MemoButtonImportRequest.prototype = {

    frameId : null,
    link : null,
    auth : null,

    init : function()
    {
        this.memoUrl = "https://memo.pole-emploi.fr/";

        this.auth = this.getCookie("isAuth");

        if(window.location.hostname.indexOf('beta')>=0)
            this.memoUrl = "https://memo.beta.pole-emploi.fr/";
        else if(window.location.hostname.indexOf('boomerang')>=0)
            this.memoUrl = "http://boomerang:8080/";

        this.parser = new Parser();

        this.initFrameMessageListener();
    },


    initFrameMessageListener : function()
    {
        //console.log("initFrameMessageListener : ");
        window.addEventListener('message',function(e)
        {
            //console.log("receiveParameters OK ",e.data, e);
            //console.log("mBIR réception message ",e, e.data);

            var t = memoButtonImportRequest;

            if(e.data.type=="clickOrder")   // reçoit un ordre de click
            {
                //console.log("- keyboardClick reçu -",e.data);

                // p = { id :  btn.attr("frameId"), type : "clickOrder", buttonId : btn.attr("id"), url : btn.attr("data-url"), jobTitle : btn.atr("data-title")  };
                if(t.auth)
                    t.importOffre(e.data);
                else
                {
                    t.openMemo(e.data);
                    t.setButtonState("", e.data.buttonId);
                }
                /*else
                 console.log("PAS OK", t.id, e.data.id, t.importActive);*/
            }

        })
    },

    prepareUrl : function()
    {
        var u = this.url;
        u = decodeURIComponent(u);

        u.replace(/\s/gi,'+');

        u = u.trim();

        if(u.toLowerCase().indexOf("http")!=0)
            u = "http://"+ u;

        this.url = u;
    },

    openMemo : function(btData)
    {
        //console.log("openMemo : ",btData);

        var p = "url="+Url.encode(btData.url)+"&utm_campaign=boutonLBB&utm_source=labonneboite.pole-emploi.fr&utm_medium=referral";

        if(btData.jobTitle)
            p+="&jobTitle="+ Url.encode(btData.jobTitle);

        window.open(this.memoUrl+"?"+p,"memo", this.getWindowParameters());

        ga('send', { hitType : 'event', eventCategory : 'ImportButton', eventAction : 'openMemo', eventLabel : pHost });
    },

    getWindowParameters : function()    // retourne les paramètres d'ouverture de la fenêtre
    {
        var res = "", ww = screen.width, wh = screen.height, l;

        if(ww>800)
        {
            l = Math.round((ww-600)/2);
            res = "left="+l+",top=180,height=600,width=600,directories=no,toolbar=no,status=no,scrollbars=yes,personalbar=no";
        }

        return res;
    },

    saveCandidature : function(c, buttonId)
    {
        //console.log("saveCandidature : ",c);

        var nC = c.nomCandidature,
            nS = c.nomSociete,
            numS = c.numSiret,
            ville = c.ville,
            nomC = c.nomContact,
            emailC = c.emailContact,
            telC = c.telContact,
            p, v, ok = true;

        c.etat = 0;

        if(!c.type)
            c.type = 2;

        if(!nC)
        {
            ok = false;
        }
        else
        {
            if (nC)
            {
                nC = nC.substring(0, 128);
                c.nomCandidature = nC;
            }

            if (nS)
            {
                nS = nS.substring(0, 128);
                c.nomSociete = nS;
            }

            if (numS)
            {
                numS = numS.substring(0, 20);
                c.numSiret = numS;
            }

            if (ville)
            {
                ville = ville.substring(0, 255);
                c.ville = ville;
            }

            if (nomC)
            {
                nomC = nomC.substring(0, 255);
                c.nomContact = nomC;
            }

            if (emailC)
            {
                emailC = emailC.substring(0, 128);
                c.emailContact = emailC;
            }

            if (telC)
            {
                telC = telC.substring(0, 24);
                c.telContact = telC;
            }
        }

        if(ok)
        {
            p = c.getQParam()+"&isButton=1";

            $.ajax({
                type: 'POST',
                url: this.memoUrl+'rest/candidatures/importFrom',
                data: p,
                dataType: "json",

                success: function (response)
                {
                    if(response.result=="ok")
                    {
                        memoButtonImportRequest.setButtonState("success",buttonId);
                        localStorage.setItem("refreshBoardAfterImport",1);
                        ga('send', { hitType : 'event', eventCategory : 'ImportButton', eventAction : 'offreEnregistree', eventLabel : pHost });
                    }
                    else if(response.result=="doublon")
                    {
                        memoButtonImportRequest.setButtonState("doublon",buttonId);
                        ga('send', { hitType : 'event', eventCategory : 'ImportButton', eventAction : 'doublon', eventLabel : pHost });
                    }
                    else if(response.msg=="userAuth")
                    {
                        memoButtonImportRequest.setButtonState("",buttonId);
                        memoButtonImportRequest.openMemo();
                        ga('send', { hitType : 'event', eventCategory : 'ImportButton', eventAction : 'authExpired', eventLabel : pHost });
                    }
                    else
                    {
                        memoButtonImportRequest.setButtonState("error",buttonId);
                        ga('send', { hitType : 'event', eventCategory : 'ImportButton', eventAction : 'saveError', eventLabel : pHost });
                    }
                },
                error: function (jqXHR, textStatus, errorThrown)
                {
                    ga('send', { hitType : 'event', eventCategory : 'ImportButton', eventAction : 'saveError2', eventLabel : pHost });
                    memoButtonImportRequest.setButtonState("error",buttonId);
                }
            });

            memoButtonImportRequest.parser.logUrlToGA(c);

            // geler la possibilité de cliquer sur le bouton --> Supprimer l'event, changer la css pour avoir un rond barré

        }
        else
            ga('send', { hitType : 'event', eventCategory : 'ImportButton', eventAction : 'parseError', eventLabel : pHost });
    },

    importOffre : function(btData)
    {
        //console.log("importOffre : ",btData);

        var t=this,
            p = "url="+ Url.encode(btData.url);

        t.setButtonState("loading",btData.buttonId);

        $.ajax({
            type: 'POST',
            url: t.memoUrl+'rest/candidatures/offre',
            data : p,
            dataType: "html",

            success: function (response)
            {
                var json, html,
                    t = memoButtonImportRequest;

                if(response=="error")
                {
                    t.setButtonState("error",btData.buttonId);
                    ga('send', { hitType : 'event', eventCategory : 'ImportButton', eventAction : 'importError', eventLabel : pHost });
                }
                else
                {
                    t.setButtonState("success",btData.buttonId);
                    html = $sc(response);

                    try
                    {
                        json = JSON.parse(html);
                    }
                    catch (err) { }

                    var c = t.parser.parseOffre(html, btData.url);
                    if(!c.urlSource)
                        c.urlSource = btData.url;

                    // tentative de récupération du logo
                    var tO = 0;
                    if (!c.logoUrl && c.nomSociete)
                    {
                        tO = 100;
                        $.getJSON('https://autocomplete.clearbit.com/v1/companies/suggest', { query: c.nomSociete }, function(data)
                        {
                            if(data && data.length>0)
                            {
                                var u = data[0].logo;
                                c.logoUrl=u;
                            }
                        });
                    }

                    setTimeout(function () {
                        memoButtonImportRequest.saveCandidature(c,btData.buttonId);
                    }, tO);
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                memoButtonImportRequest.setButtonState("error",btData.buttonId);
                ga('send', { hitType : 'event', eventCategory : 'ImportButton', eventAction : 'importError2', eventLabel : pHost });
            }
        });

        ga('send', { hitType : 'event', eventCategory : 'ImportButton', eventAction : 'importOffre', eventLabel : pHost });
    },

    setButtonState : function(state,buttonId)
    {
        //console.log("setButtonState : ",state,buttonId);

        if(!state)
        {
            this.setParentState(buttonId,"btn-memo-on","Enregistrer dans MEMO","Enregistrer la fiche entreprise dans MEMO (Ouvre une fenêtre popup)");
        }
        else if(state=="loading")
        {
            this.setParentState(buttonId,"btn-memo-loading","Enregistrement en cours","Enregistrement en cours");
        }
        else if(state=="error")
        {
            this.setParentState(buttonId,"btn-memo-off","Service momentanément indisponible","Service momentanément indisponible");
        }
        else if(state=="success")
        {
            this.setParentState(buttonId,"btn-memo-off","Fiche enregistrée dans MEMO","Fiche enregistrée dans MEMO");
        }
        else if(state=="doublon")
        {
            this.setParentState(buttonId,"btn-memo-off","Vous avez déjà enregistré cette fiche dans MEMO","Vous avez déjà enregistré cette fiche dans MEMO");
        }

    },

    getCookie: function(cname)
    {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length,c.length);
            }
        }
        return "";
    },

    setParentState : function(buttonId,cls,btText,srText)
    {
        var p = {   type : "setState",
            buttonId : buttonId,
            btText : btText,
            srText : srText,
            className : cls         };
        window.parent.postMessage(p,"*");
    }
}

var memoButtonImportRequest = new MemoButtonImportRequest();


(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-77025427-3', 'auto');
var pHost = "Générique";
try { pHost = parent.location.hostname; } catch(err){}
ga('send', { hitType : 'event', eventCategory : 'ImportButton', eventAction : 'display', eventLabel : pHost });
