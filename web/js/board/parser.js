function Parser(board)
{
    this.init(board);
}

Parser.prototype = {

    board : null,

    parsers : [],

    init : function(board)
    {
        this.board = board;

    },

    logUrlToGA : function(c)
    {
        if(c && c.urlSource) {
            var s = this.getUrlParser(c.urlSource),
                a = "newCandidature";

            if(c.id)
                a = "editCandidature";
            if(!this.board || this.board.importOnStartupNotConsumed)
                a = "importCandidature";

            if(s) {
                ga('send', {hitType: 'event', eventCategory : 'Candidature', eventAction: a, eventLabel: s});
            }
        }
    },

    getParser : function(url)
    {
        var p, ps = this.parsers, u = url.toLowerCase();

        if(isInDomain(u, "labonneboite"))
            p = ps["labonneboite"] || (ps["labonneboite"] = new ParserLaBonneBoite());
        else if(isInDomain(u, "pole-emploi"))
            p = ps["poleemploi"] || (ps["poleemploi"] = new ParserPoleEmploi());
        else if(isInDomain(u, "pe-qvr.fr"))
            p = ps["poleemploi"] || (ps["poleemploi"] = new ParserPoleEmploi());
        else if (isInDomain(u, "leboncoin.fr"))
            p = ps["leboncoin"] || (ps["leboncoin"] = new ParserLeBonCoin());
        else if (isInDomain(u, "indeed.fr"))
            p = ps["indeed"] || (ps["indeed"] = new ParserIndeed());
        else if (isInDomain(u, "jobalim"))
            p = ps["jobalim"] || (ps["jobalim"] = new ParserJobAlim("jobalim"));
        else if (isInDomain(u, "vitijob"))
            p = ps["vitijob"] || (ps["vitijob"] = new ParserJobAlim("vitijob"));
        else if (isInDomain(u, "vivastreet.com"))
            p = ps["vivastreet"] || (ps["vivastreet"] = new ParserVivastreet());
        else if (isInDomain(u, "monster.fr"))
            p = ps["monster"] || (ps["monster"] = new ParserMonster());
        else if (isInDomain(u, "keljob.com"))
            p = ps["keljob"] || (ps["keljob"] = new ParserKeljob());
        else if (isInDomain(u, "cadremploi.fr"))
            p = ps["cadremploi"] || (ps["cadremploi"] = new ParserCadremploi());
        else if (isInDomain(u, "linkedin.com"))
            p = ps["linkedin"] || (ps["linkedin"] = new ParserLinkedIn());
        else if (isInDomain(u, "envirojob.fr"))
            p = ps["envirojob"] || (ps["envirojob"] = new ParserEnviroJob());
        else if (isInDomain(u, "apec.fr"))
            p = ps["apec"] || (ps["apec"] = new ParserApec());
        else if (isInDomain(u, "meteojob.com"))
            p = ps["meteojob"] || (ps["meteojob"] = new ParserMeteoJob());
        else if (isInDomain(u, "stepstone."))
            p = ps["stepstone"] || (ps["stepstone"] = new ParserStepStone("stepstone"));
        else if (isInDomain(u, "qapa."))
            p = ps["qapa"] || (ps["qapa"] = new ParserQAPA());
        else if (isInDomain(u, "marketvente."))
            p = ps["marketvente"] || (ps["marketvente"] = new ParserStepStone("marketvente"));
        else if (isInDomain(u, "adecco."))
            p = ps["adecco"] || (ps["adecco"] = new ParserAdecco("adecco"));
        else if (isInDomain(u, "manpower."))
            p = ps["manpower"] || (ps["manpower"] = new ParserManpower("manpower"));
        else if (isInDomain(u, "randstad."))
            p = ps["randstad"] || (ps["randstad"] = new ParserRandstad("randstad"));
        else if (isInDomain(u, "job.com") &&
            (
                isInDomain(u, "ouestjob.com") ||
                isInDomain(u, "parisjob.com") ||
                isInDomain(u, "nordjob.com") ||
                isInDomain(u, "centrejob.com") ||
                isInDomain(u, "estjob.com") ||
                isInDomain(u, "rhonealpesjob.com") ||
                isInDomain(u, "sudouestjob.com") ||
                isInDomain(u, "pacajob.com")
            ) )
            p = ps["regionsjob"] || (ps["regionsjob"] = new ParserRegionsJob());
        else
            p = ps["generic"] || (ps["generic"] = new GenericParser());

        return p;
    },

    // retourne le nom du parser sauf pour le généric --> ne retourne rien
    getUrlParser : function(url)
    {
        var p, r, u = url.toLowerCase();

        p = this.getParser(url);

        r = p.name;

        return r;
    },

    logImportError : function(url)
    {
        console.log("enregistrer l'erreur d'import sur l'url : ",url);
    },

    setImportButtonState : function()
    {
        var t = this,
            bt = $("#buttonImportCandidature0"),
            u = t.board.form.urlSource0.getValue();

        if (u)
            bt.removeClass("disabled");
        else
            bt.addClass("disabled");

        bt = $("#buttonQuickImport");
        if(bt && bt.length)
        	u = t.board.quickImport.val().toLowerCase();

        if (u)
            bt.removeClass("disabled");
        else
            bt.addClass("disabled");
    },

    parseOffre : function(h,u, async)
    {
        var t=this,
            c = new Candidature(),
            html,
            offreId,
            jobBoard,
            isGeneric,
            p;
        
        // Si le paramètre async n'est pas renseigné, il est valorisé automatiquement à TRUE
        if (async == undefined)
        	async = true;

        try
        {
            if(h.startsWith("offreId=")) {
                offreId = h.substring(8, h.indexOf('\n'));
                html = h.substring(h.indexOf('\n') + 1);
            }
            else
                html = h;

            p = t.getParser(u);

            isGeneric = (p.isGeneric?1:0);

            c = p.parse(html);
            if(!c.sourceId) // sourceId est déjà valorisé pr les imports issus d'un flux json tels que monster
            	c.sourceId = offreId;
        }
        catch(err)
        {
            //console.log(err);
            Raven.captureException(err);

         	try {
        		if (!isGeneric) {
            		c = this.genericParse(html);
            	} 
        	} catch(ex) {

        	    Raven.captureException(ex);
        		if(this.board)
                    toastr['error']("","Erreur de traitement d'import");
        	}
        	// Pourrait être isolé pour ne pas être affiché à chaque fois.
            this.logImportError(u);
        }

        if(this.board)
            this.updateFormInputs(c, async)

        return c;
    },

    updateFormInputs : function(c, async)
    {
        var f = this.board.form;

        f.ville.setValue((c && c.ville)?c.ville:"");
        f.nomCandidature.setValue((c && c.nomCandidature)?c.nomCandidature:"");
        f.nomSociete.setValue((c && c.nomSociete)?c.nomSociete:"");
        f.numSiret.setValue((c && c.numSiret)?c.numSiret:"");

        f.description.val((c && c.description)?c.description:"");
        f.logoUrl.val((c && c.logoUrl)?c.logoUrl:"");

        f.nomContact.setValue((c && c.nomContact)?c.nomContact:"");
        f.emailContact.setValue((c && c.emailContact)?c.emailContact:"");
        f.telContact.setValue((c && c.telContact)?c.telContact:"");

        $("#sourceId").val((c && c.sourceId)?c.sourceId:"");
        $("#jobBoard").val((c && c.jobBoard)?c.jobBoard:"");

        if(c && !c.logoUrl && c.nomSociete)
        {
            $.ajax({
                url: 'https://autocomplete.clearbit.com/v1/companies/suggest',
                data: { query: c.nomSociete },
                async: async,
                dataType: "html",

                success: function (response) {
                    try {
                        data = JSON.parse(response);
                    } catch (err) {}

                    if(data && data.length>0)
                    {
                        var u = data[0].logo;
                        f.logoUrl.val(u);
                        c.logoUrl=u;
                        //$("#formLogoSociete,#formLogoSocieteTunnel").html("<img src="+u+" />");
                        lBR.board.form.buildFormLogoUrl(u,"#formLogoSociete,#formLogoSocieteTunnel");
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    Raven.captureException("clearBit logo  ajax error : ",textStatus,errorThrown);
                }
            });
        }
    },

    warnTeam : function(u)
    {
        p = "message="+Url.encode(u);
        $.ajax({
            type: 'POST',
            url: lBR.rootURL + '/log/import',
            data: p,
            dataType: "json",
            success: function (response){},
            error: function (jqXHR, textStatus, errorThrown){}
        });
    }
}

