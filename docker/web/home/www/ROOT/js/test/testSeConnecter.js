describe('plain suite', function() {
  it('succeeding test in plain suite', function() {
    expect(1).toBe(1);
  });
});

describe("Connecter", function() {
	var url, c, testImportOffreOK = false, testSaveCandidatureOK = false;
	// Affichage des msg dans la console
	toastr['error'] = console.log;
	toastr['warning'] = console.log;
	toastr['success'] = console.log;
	
	it("test AccountLogin (utilisateur inconnu)", function() {
		// Mock du formulaire loginForm
		document.loginForm = $('loginForm');
		document.loginForm.on('submit', function() { return false; });
		
		lBR.loginEmail = new TextField({id: 'loginEmail'});
		lBR.loginEmail.setValue("bidule");
		lBR.loginPassword = new TextField({id: 'loginPassword'});
		lBR.loginPassword.setValue("bidule");
		
		lBR.accountLogin(false);
		
		expect($('#csrf').val()).toBe('', 'le CSRF ne doit pas être initialisé');
    });	
	
	it("test AccountLogin (utilisateur existant)", function() {
		// Mock du formulaire loginForm
		document.loginForm = $('loginForm');
		document.loginForm.on('submit', function() { return false; });
		
		// Mock de l'objet leBonRythme 
		spyOn(leBonRythme.prototype, "initBoard");
		spyOn(leBonRythme.prototype, "resetLoginForm");
		spyOn(leBonRythme.prototype, "checkPasswordChange");
		
		lBR.loginEmail = new TextField({id: 'loginEmail'});
		lBR.loginEmail.setValue("testauto@test.fr");
		lBR.loginPassword = new TextField({id: 'loginPassword'});
		lBR.loginPassword.setValue("jaimebienlejudo");
		
		lBR.accountLogin(false);

		expect($('#csrf').val()).not.toBe('', 'le CSRF non initialisé');
    });
	
	it("test AccountLogin (identifiants incorrects)", function() {
		// Mock du formulaire loginForm
		document.loginForm = $('loginForm');
		document.loginForm.on('submit', function() { return false; });
		
		// Mock de l'objet leBonRythme 
		spyOn(leBonRythme.prototype, "initBoard");
		spyOn(leBonRythme.prototype, "resetLoginForm");
		spyOn(leBonRythme.prototype, "checkPasswordChange");
		
		lBR.loginEmail = new TextField({id: 'loginEmail'});
		lBR.loginEmail.setValue("testauto@tes.fr");
		lBR.loginPassword = new TextField({id: 'loginPassword'});
		lBR.loginPassword.setValue("jaimebienlejudo");
		
		lBR.accountLogin(false);

		expect($('#loginMsg').text()).not.toBe('', 'message erreur incorrect');
    });
});