function SearchTools(board)
{
    this.init(board);
}

SearchTools.prototype = {

    init : function(board)
    {
        var t = this;

        t.board = board;

        t.searchInput = $("#searchInput input");
        t.memoSearchInput = $("#filterForm .searchInputDeco input");

        var fctEnter = function (evt) {
            if (evt.which == 13) {
                lBR.board.searchTools.closeFilterPanel();
                lBR.board.searchTools.search();
            }
            else
            {
                // synchronisation des valeurs
                $(".memoSearchInput").val(evt.currentTarget.value);
            }
        };

        $(".memoSearchInput").on("keyup", $.proxy( fctEnter, t) );

        $("#doSearch").on("click", $.proxy(t.search,t));
        $("#doSearchFilter").on("click", $.proxy(t.filterSearch,t));
        $(".doRemoveSearch").on("click", $.proxy(t.resetSearch,t));
        $(".openFilter,.hideFilterForm").on("click", $.proxy(t.toggleFilterPanel,t));
    },

    filterSearch : function()
    {
        this.search();
        this.toggleFilterPanel();
    },

    search : function()
    {
        this.resetCardFilter();
        this.removeEndSearchButton();
        var searchString = this.searchInput.val().trim(),
            cs = lBR.board.candidatures,
            c, dontFilter, hasFilter = 0;

        this.setFilters();

        hasFilter = this.isFilterActive();

        if(searchString || hasFilter)
        {
            $("#searchSpinner").show();

            rgx = new RegExp(searchString,'i');

            for(var k in cs)
            {
                c = cs[k];
                if(c)
                {
                    dontFilter = true;

                    if ((lBR.board.archiveMode && c.archived) || (!lBR.board.archiveMode && !c.archived)) {
                        if (searchString)    // recherche textuelle
                            dontFilter = this.searchInCandidature(rgx, c);

                        if (dontFilter && hasFilter) // recherche sur les filtres
                            dontFilter = this.filterCandidature(c);

                        if (!dontFilter)     // masquage des candidatures qui ne matchent pas
                            this.setCandidatureFiltered(k);
                    }
                }
            }

            this.updateBadgesFromSearch();
            this.searchInput.addClass("activeSearch");
            this.searchInDescription(searchString);
        }
        else
        {
            this.resetBadges();
            setTimeout(function () {
                lBR.board.updateCandidatureListHeight();
            }, 1050);
            //this.resetSearchForm();
        }
    },

    // retourne vrai si le ou les filtres activés sont respectés
    filterCandidature : function(c)
    {
        var t = this,
            res = true;

        if(t.filtreEtat!="" && c.etat!= t.filtreEtat)
            res = false;

        if(t.filtreType!="" && c.type!= t.filtreType)
            res = false;

        if(res && t.filtreFavoris && !c.rating)
            res = false;

        if(res && t.filtreSource && c.jobBoard != t.filtreSource)
            res = false;

        return res;
    },

    setFilters : function()
    {
        var t=this;
        t.filtreEtat = $("#selectFiltreEtat").val();
        t.filtreType = $("#selectFiltreType").val();
        t.filtreSource = $("#selectFiltreSource").val();
        t.filtreFavoris = $("#cbFiltreFavoris").is(':checked');
    },

    isFilterActive : function()
    {
        var t = this,
            res = 0;

        if( t.filtreEtat!="" ||
            t.filtreType!="" ||
            t.filtreSource!="" ||
            t.filtreFavoris )
        {
            res = 1;
        }

        return res;
    },

    resetFilterForm : function()
    {
        $("#selectFiltreEtat").val("");
        $("#selectFiltreType").val("");
        $("#selectFiltreSource").val("");
        $("#cbFiltreFavoris").prop('checked',false)
    },

    searchInDescription : function(searchString)
    {
        // on lance la recherche côté serveur seulement s'il s'agit d'une nouvelle string
        if(!searchString || searchString == this.searchString)
            this.finalizeSearchResultDisplay();
        else
        {
            this.searchString = searchString;

            var p = "searchString=" + Url.encode(searchString) + "&csrf=" + $("#csrf").val();

            $.ajax({
                type: 'POST',
                url: lBR.rootURL + '/candidatures/search',
                data: p,
                dataType: "json",

                success: function (response) {
                    var t = lBR.board.searchTools;
                    if (response.result == "ok")
                    {
                        var cs = response.candidatures;
                        t.searchResult = cs;
                    }
                    else {
                        toastr['error']("Erreur lors de la mise à jour de la candidature", "Une erreur s'est produite " + response.msg);
                        console.log("traitement erreur candidature");
                    }
                    t.finalizeSearchResultDisplay();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('/candidature/search error: ' + textStatus);
                    console.log("traitement erreur recherche");
                }
            });
        }
    },

    updateBadgesFromSearch : function()
    {
        $("#badgeTodos").html($("#listeTodos div.fiche").not(".filtered").length);
        $("#badgeCandidatures").html($("#listeCandidatures div.fiche").not(".filtered").length);
        $("#badgeRelances").html($("#listeRelances div.fiche").not(".filtered").length);
        $("#badgeEntretiens").html($("#listeEntretiens div.fiche").not(".filtered").length);
    },

    resetBadges : function()
    {
        var bv = this.board.badgeValues;

        $("#badgeTodos").html(bv[CS.ETATS.VA_POSTULER]);
        $("#badgeCandidatures").html(bv[CS.ETATS.A_POSTULE]);
        $("#badgeRelances").html(bv[CS.ETATS.A_RELANCE]);
        $("#badgeEntretiens").html(bv[CS.ETATS.ENTRETIEN]);
    },

    // recherche la chaîne  dans les éléments de la candidature
    searchInCandidature : function(rgx,c)
    {
        var r = rgx.test(c.nomCandidature);

        if(!r)
            r = rgx.test(c.nomSociete);
        if(!r)
            r = rgx.test(c.ville);
        if(!r)
            r = rgx.test(c.nomContact);
        if(!r)
            r = rgx.test(c.emailContact);
        if(!r)
            r = rgx.test(c.telContact);
        if(!r)
            r = rgx.test(c.jobBoard);
        if(!r)
            r = this.searchInEvents(rgx, c.events);

        return r;
    },

    // recherche les é
    searchInEvents : function(rgx,events)
    {
        var r = false;
        if(events) {
            for (var k in events) {
                if(events[k])
                    r = rgx.test(events[k].comment);
                if(r)
                    break;
            }
        }

        return r;
    },

    // masque la candidature
    setCandidatureFiltered : function(id)
    {
        $("#candidature_"+id).addClass("filtered").fadeOut("slow");
        $("#candidatureM_"+id).addClass("filtered").fadeOut("slow");
    },

    // réaffiche toutes les cartes
    resetCardFilter : function()
    {
        $(".filtered").removeClass("filtered");
        $(".fiche").fadeIn(0);
    },

    // réaffiche des cartes masquées par la recherche sur les infos déjà présentes côté client
    unHideCards : function()
    {
        var  cs = this.searchResult;
        if(cs)
        {
            for (var i = 0; i < cs.length; ++i)
            {
                if(this.filterCandidature(this.board.candidatures[cs[i]]))
                    this.unHideCard(cs[i]);
            }
        }
    },

    finalizeSearchResultDisplay : function()
    {
        this.unHideCards();
        this.updateBadgesFromSearch();
        this.addEndSearchButton();
        $("#searchSpinner").hide();
        $("#doSearch").hide();
        $(".openFilter").hide();
        $(".doRemoveSearch").show();

        setTimeout(function () {
            lBR.board.updateCandidatureListHeight();
        }, 1050);

    },


    // réaffiche une carte
    unHideCard : function(id)
    {
        if($("#candidature_"+id).hasClass("filtered")) {
            $("#candidature_" + id).removeClass("filtered").fadeIn("slow");
            $("#candidatureM_" + id).removeClass("filtered").fadeIn("slow");
        }
    },

    resetSearchForm : function()
    {
        this.searchInput.val("");
        this.memoSearchInput.val("");

        this.searchInput.removeClass("activeSearch");
        $("#doSearch").show();
        $(".openFilter").show();
        this.searchResult = null;
        this.searchString = null;
    },

    resetSearch : function()
    {
        this.resetSearchForm();
        this.resetFilterForm();
        this.search();
    },

    // enregistre les nombres de cartes par colonne
    saveBadgeValues : function()
    {
        var bv = {};
        bv[CS.ETATS.VA_POSTULER] = eval($("#badgeTodos").text());
        bv[CS.ETATS.A_POSTULE] = eval($("#badgeCandidatures").text());
        bv[CS.ETATS.A_RELANCE] = eval($("#badgeRelances").text());
        bv[CS.ETATS.ENTRETIEN] = eval($("#badgeEntretiens").text());

        this.board.badgeValues = bv;
    },

    hideSearchForm : function()
    {
        $("#searchInput").hide();
    },

    showSearchForm : function()
    {
        $("#searchInput").show();
    },

    addEndSearchButton : function()
    {
        $("<div class='resetSearchButton'>"+this.getEndSearchButton(0,"#listeTodos","")+"</div>").insertAfter($(".brouillon .mt-step-title"));
        $("<div class='resetSearchButton'>"+this.getEndSearchButton(1,"#listeCandidatures","")+"</div>").insertAfter($(".candidature .mt-step-title"));
        $("<div class='resetSearchButton'>"+this.getEndSearchButton(2,"#listeRelances","")+"</div>").insertAfter($(".relance .mt-step-title"));
        $("<div class='resetSearchButton'>"+this.getEndSearchButton(3,"#listeEntretiens","")+"</div>").insertAfter($(".entretien .mt-step-title"));

        setTimeout(function () {
            $(".resetSearchButton").on("click", $.proxy(lBR.board.searchTools.resetSearch, lBR.board.searchTools));
            $('.resetSearchButton').tooltipster({
                theme: 'tooltipster-borderless',
                debug : false,
                delay : 100
            });
        }, 50);

        $(".doRemoveSearch").show();
    },

    getEndSearchButton : function(status,list)
    {
        /*var t=this, r = t.board.badgeValues[status]-$(list+" div.fiche").not(".filtered").length;

        return r += " candidatures filtrées.<br />Cliquez ici pour les afficher.";*/

        return "Supprimer les filtres <i class='fa fa-remove'>";
    },

    removeEndSearchButton : function()
    {
        $(".doRemoveSearch").hide();
        $(".resetSearchButton").remove();
    },

    toggleFilterPanel : function()
    {
        $("#breadcrumb").toggleClass("filterPanel");
    },

    closeFilterPanel : function()
    {
        $("#breadcrumb").removeClass("filterPanel");
    },

    updateSourceList : function()
    {
        this.buildSourceList();
        $("#selectFiltreSource").val(this.filtreSource);
    },

    buildSourceList : function()
    {
        var cs = this.board.candidatures,
            uniqueSources = [],
            sourceList = [],
            jB;

        for(k in cs)
        {
            jB = (cs[k])?cs[k].jobBoard:null;

            if(jB)
            {
                if (uniqueSources.indexOf(jB.toUpperCase()) < 0) {
                    uniqueSources.push(jB.toUpperCase());
                    sourceList.push(jB);
                }
            }
        }

        sourceList.sort();

        var opts = "<option value=''>Toutes les sources d'offre</option>";
        for(var i=0, l=sourceList.length; i<l; ++i)
            opts+="<option>"+sourceList[i]+"</option>";

        $("#selectFiltreSource").empty();
        $("#selectFiltreSource").html(opts);
    }




}
