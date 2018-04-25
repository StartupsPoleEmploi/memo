
var parser = new Parser();


function saveCandidature(c)
{
    var nC = c.nomCandidature,
        nS = c.nomSociete,
        ville = c.ville,
        nomC = c.nomContact,
        emailC = c.emailContact,
        telC = c.telContact,
        p, v, ok = true;

    if(job)
        nC = job;

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
        p = c.getQParam();

        $.ajax({
            type: 'POST',
            url: 'https://memo.pole-emploi.fr/rest/candidatures/importFrom',
            data: p,
            dataType: "json",

            success: function (response)
            {
                if(response.result=="ok")
                {
                    setButtonState("success");
                    localStorage.setItem("refreshBoardAfterImport",1);
                }
                else
                {
                    setButtonState("error");
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                setButtonState("error");
            }
        });

        parser.logUrlToGA(c);

        // geler la possibilité de cliquer sur le bouton --> Supprimer l'event, changer la css pour avoir un rond barré

    }
}

function importOffre()
{
    var t=this,
        p = "url="+ Url.encode(url);

    importActive = 0;

    setButtonState("loading");

    $.ajax({
        type: 'POST',
        url: 'https://memo.pole-emploi.fr/rest/candidatures/offre',
        data : p,
        dataType: "html",

        success: function (response)
        {
            var json, html;

            if(response=="error")
            {
                setButtonState("error");
            }
            else
            {
                html = $sc(response);

                try
                {
                    json = JSON.parse(html);
                }
                catch (err) { }

                var c = parser.parseOffre(html, url);
                if(!c.urlSource)
                    c.urlSource = url;

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
                    saveCandidature(c);
                }, tO);
            }
        },
        error: function (jqXHR, textStatus, errorThrown)
        {
            // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
            setButtonState("error");
        }
        });
}

function setButtonState(state)
{
    document.getElementsByTagName("body")[0].className= state;

    if(state=="loading")
    {
        $("#btn").html("<i class='fa fa-spinner fa-spin fa-lg'></i> Import en cours");
    }
    else if(state=="error")
    {
        $("#btn").html("Une erreur s'est produite");
    }
    else if(state="success")
    {
        $("#btn").html("Importé dans MEMO");
    }
}

function getCookie(cname)
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
}

function activate(id,height,width,border)
{
    //console.log("activate !");

    var p = {id:id,width:width, height:height};

    if(border!=undefined)
        p.border=border;

    window.parent.postMessage(p,"*");
}

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-77025427-1', 'auto');
