var lBR = new leBonRythme();
rootURL = (window.location.origin+window.location.pathname).match(/^.*\//)[0]+"rest";

if (rootURL.indexOf('boomerang')>0)
	rootURL = "http://boomerang:8080/rest";
else if (rootURL.indexOf('beta')>0)
	rootURL = "https://memo.beta.pole-emploi.fr/rest";
else
	rootURL = "https://memo.pole-emploi.fr/rest";

lBR.rootURL = rootURL;
