describe("Offre Pole Emploi", function() {
	var url, c, testImportOffreOK = false, testSaveCandidatureOK = false;
	// Affichage des msg dans la console
	toastr['error'] = console.log;
	toastr['warning'] = console.log;
	toastr['success'] = console.log;
	
	it("test getUrlLastUpdatedOffre", function() {
		url = testGetUrlLastUpdateOffreByJobboard("POLE_EMPLOI");
    });	
	
	it("test ImportOffre [nomSociete, ville, nomContact, emailContact, telContact, logoUrl]", function() {				
		var msgWarn = "";
		if (url) {
			c = testImportCandidature(url);
			if(c) {
				testImportOffreOK = true;
				
				msgWarn = pendingImportCandidature(c);
				if(msgWarn && msgWarn.length>0) 
			    	pending(msgWarn);
			}
		} else {
			fail("url KO")
		}
    });
	
	it("test SaveCandidature", function() {
		testSaveCandidatureOK = testSaveCandidature(testImportOffreOK, c, url);
    });
	
	it("test RemoveCandidature", function() {
		testRemoveCandidature(testSaveCandidatureOK, c);
    });
	
});