function testGetUrlLastUpdateOffreByJobboard(jobboard) {
	var url;
	
	url = lBR.getUrlLastUpdateOffreByJobboard(jobboard, false);
	expect(url).not.toBeNull('url null');
	expect(url).toBeDefined('url undefined');
	console.log("url = "+url);
	
	return url;
}

function pendingImportCandidature(candidature) {
	var msgWarn = "";
	
	// Champs facultatifs
    if (!c.nomSociete) {
    	msgWarn += "nomSociete null, ";
    }
    if (!c.ville) {
    	msgWarn += "ville null, ";
    }
    if (!c.nomContact) {
    	msgWarn += "nomContact null, ";
    }
    if (!c.emailContact) {
    	msgWarn += "emailContact null, ";
    }
    if (!c.telContact) {
    	msgWarn += "telContact null, ";
    }
    if (!c.logoUrl) {
    	msgWarn += "logoUrl null";
    }
    return msgWarn;
}

function testImportCandidature(url) {
	if (url) {
		// Mock de l'objet Board
		spyOn(Board.prototype, "init");
		spyOn(Board.prototype, "setQuickImportDisabledState");
		// Mock de l'objet Parser
		spyOn(Parser.prototype, "logUrlToGA");
		// On ne veut pas passer par le parserGeneric donc on mocke la méthode
		//spyOn(Parser.prototype, "genericParse"); retiré suite à refactor
		// Mock de l'objet CandidatureForm
		spyOn(CandidatureForm.prototype, "init");
		spyOn(CandidatureForm.prototype, "initCandidatureForm");
		spyOn(CandidatureForm.prototype, "setOffreFieldDisabledState");
		spyOn(CandidatureForm.prototype, "autoSaveCandidature");
		spyOn(CandidatureForm.prototype, "buildFormLogoUrl");
		spyOn(CandidatureForm.prototype, "hideTunnelSpinner");
		spyOn(CandidatureForm.prototype, "showFormParseError");
		
		var b = new Board();
		var p = new Parser();
		var f = new CandidatureForm(b);
		   	    	
		b.parser = p;	    	
		p.board = b;
		f.board = b;
		
		// Chargement des données dans le mock
		f.initTest(null, url);
		
		// Chargement des données dans le DOM
		lBR.board = b;
		lBR.board.form = f;
		lBR.board.parser = p;
		
		// Import de l'offre en synchrone
		c = f.importOffre(null, CS.ETATS.VA_POSTULER, false);
		
		// Vérifications des champs
		// Champs obligatoires
		expect(c).not.toBeNull('candidature null');
		expect(c).toBeDefined('candidature null');
	    expect(c.nomCandidature).toBeDefined('nomCandidature null');
	    expect(c.description).toBeDefined('description null');
	    expect(c.nomCandidature).not.toEqual('Candidature Pole Emploi', 'nomCandidature KO');
	}
	return c;
}

function testSaveCandidature(testImportOffreOK, c, url) {
	var candId, res = false;
	
	if (testImportOffreOK && c && url) {
		// Mock de l'objet Board
		spyOn(Board.prototype, "init");
		spyOn(Board.prototype, "buildCandidatures");
		spyOn(Board.prototype, "buildCandidature");
		spyOn(Board.prototype, "setCandidature");			
		spyOn(Board.prototype, "setCandidatureId");
		spyOn(Board.prototype, "displayStartButton");
		// Mock de l'objet Parser
    	spyOn(Parser.prototype, "logUrlToGA");
    	// Mock de l'objet CandidatureForm
    	spyOn(CandidatureForm.prototype, "init");
    	spyOn(CandidatureForm.prototype, "resetErrorMessage");
    	
    	var b = new Board();
		var p = new Parser();
		var f = new CandidatureForm(b);
		
    	b.parser = p;	    	
		f.board = b;
		b.selectedCandidature = c;
		
		// Chargement des données dans le mock
		f.initTest(c, url);
		
		// Chargement des données dans le DOM
		lBR.board = b;
		lBR.board.form = f;
		
		// Sauvegarde de la candidature en synchrone
		candId = f.saveCandidature(-1, false);
		expect(candId).toBeDefined('idCandidature null');
        expect(candId).toBeDefined('idCandidature null');
    	
        if (candId) {
        	c.id = candId
        	res = true;
        }
	} else {
		fail("aucune candidature à sauvegarder car non importée");
	}
	return res;
}

function testRemoveCandidature(testSaveCandidatureOK, c) {
		if (testSaveCandidatureOK) {
			// Mock de l'objet Board
			spyOn(Board.prototype, "init");
			spyOn(Board.prototype, "removeCandidatureFromBoard");
			spyOn(Board.prototype, "hideModalRemoveOrArchive");
			
			var b = new Board();
			   	    	   	
			b.selectedCandidature = c;
			b.candidatures = [c];
			
			// Chargement des données dans le DOM
			lBR.board = b;
			
			// Suppression de la candidature en synchrone
			b.confirmRemoveCandidature(false);
			expect(true).toBe(true);
		} else {
			fail("aucune candidature à supprimer car non sauvegardée");
		}
}
