function Activites(board)
{
    this.init(board);
}

// gère l'affichage des activités en ligne
Activites.prototype = {

    board: null,

    init : function (board) {
        var t=this;

        t.board = board;

        $("#activitesButton").on("click",$.proxy(this.showActivites,this));

    },

    showActivites : function(h)
    {
        if(lBR.board.form.hasChange)
        {
            lBR.board.form.afterChangeSave = "showActivites";
            lBR.board.form.showUnsavedModal();
        }
        else
        {
            ga('send', { hitType : 'event', eventCategory : 'Activites', eventAction : 'ouverture' });

            var t = this;

            if (h != 1)
                $Hist({id: "activites"});

            // Retrait du mode archive
            lBR.board.archiveMode = 0;
            $("body").removeClass("archives");

            // Elements/Pages masqués
            lBR.hideNewCandidatureButtons();
            lBR.board.displayQuickImportButton(0);
            $("#boardPanel").hide();
            $("#createCandidatureForm").hide();

            lBR.displayInnerPage("#activitesPage");

            // Fil d'ariane
            lBR.showBreadcrumb("activites");

            // MAJ du menu : on désactive le lien des priorites
            lBR.refreshMenu($("#activitesButton"));

            // affichage des activites
            setTimeout(function () {
                lBR.activites.buildActivites();
            },50);

            lBR.activites.showSpinner();
        }
    },

    showSpinner : function()
    {
        $("#activitesList").hide();
        $(".activiteSpinner").show();
    },

    hideSpinner : function()
    {
        $(".activiteSpinner").hide();
        $("#activitesList").show();
    },

    buildActivites : function()
    {
        var cs = this.board.candidatures, c, evts, evt, activite, creation, tabActivites = [];

        for(k in cs)
        {
            c = cs[k];

            if(c)
            {
                creation = {};
                creation.candidature = c;
                creation.event = { eventTime : c.creationDate };
                tabActivites.push(creation);

                evts = c.events;

                if(evts)
                {
                    for(k1 in evts)
                    {
                        evt = evts[k1];

                        if(evt)
                        {
                            activite = {};
                            activite.candidature = c;
                            activite.event = evt;
                            tabActivites.push(activite);
                        }

                    }
                }
            }
        }

        // faire le tri chronologique
        tabActivites.sort(function(a,b){return b.event.eventTime - a.event.eventTime; });

        // afficher le résultat
        var html = "";
        for(var i= 0, l=tabActivites.length; i<l; ++i)
        {
            c = tabActivites[i].candidature;
            evt = tabActivites[i].event;

            if(!evt.eventType || (evt.eventType!=1 && evt.eventType!=7 && evt.eventType!=9))
            {
                html += "<div class='row";
                if (c.archived)
                    html += " archived";

                html += "'>" +
                        "<div class='col-xs-6 col-md-3  activiteDate'>" + evt.eventTime.format("DD/MM/YYYY HH:mm") + "</div>" +
                        "<div class='col-xs-6 col-md-2  activiteAction";

                switch(evt.eventType)
                {
                    case CS.TYPES.ENTRETIEN : {
                        html+= " entretien";
                        break;
                    }

                    case CS.TYPES.AI_POSTULE : {
                        html+= " candidature";
                        break;
                    }

                    case CS.TYPES.AI_RELANCE : {
                        html+= " relance";
                        break;
                    }
                }

                html+="'>";
                if (evt.eventType)
                    html += CS.TYPES_LIBELLE_ACTIVITES[evt.eventType];
                else
                    html += "Création";

                html += "</div>";


                html += "<div class='col-xs-12 col-md-7 activiteCandidature'><a class='activite' rel='"+ c.id +"'>" + c.nomCandidature + "</a>";
                if (c.nomSociete)
                    html += " au sein de " + c.nomSociete;

                html += "</div></div>";
            }
        }

        $("#activitesList").html(html);

        this.hideSpinner();

        this.setLinksToCandidatures();
    },

    setLinksToCandidatures : function()
    {
        $(".activite").on("click",$.proxy(this.openCandidature,this));
    },

    openCandidature : function(evt)
    {
        evt.stopPropagation();

        var t=this,
            elId = evt.currentTarget.attributes['rel'].value,
            c = t.board.candidatures[""+elId];

        t.board.selectedCandidature = c;
        t.board.editMode = 1;

        ga('send', { hitType : 'event', eventCategory : 'Candidature', eventAction : 'openCandidature', eventLabel : 'journal' });

        t.board.editCandidature();

    }


}

