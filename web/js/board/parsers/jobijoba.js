function ParserJobiJoba()
{
  
}

ParserJobiJoba.prototype = {

    logo: "jobijoba.png",
    name: "JobiJoba",

    
    parse : function (html) {
    	
    	ga('send', { hitType : 'event', eventCategory : 'Candidature', eventAction : 'import', eventLabel : this.name });
    	
    	var t = this,
        	c = new Candidature(),
        	cont = document.createElement("div"),
        	el, v = "", tmp;
    	
    	cont.innerHTML = html;
        cont = $(cont);
        debugCont = cont;

        c.jobBoard = this.name;
        
        el = cont.find("h1");
        if (el && el.length)
            c.nomCandidature = $rSPAN(el[0].innerHTML.trim());
               
        el = cont.find('.new_feature:first>span');
        
		if (el && el.length)
			c.ville = el.text().trim();
        
		var first = cont.find('.new_feature');
		if (first && first.length>0)	
			el = first[1].children[1];
			if (el)
	            c.nomSociete = el.innerHTML.trim();
        
        el = cont.find(".description");
        if(el.length > 0) 
        	c.description = el.html();
        
        el = cont.find(".logo>img");
        if (el.length > 0)
            c.logoUrl = "https://www.jobijoba.com"+ el.attr("src");;

        
        return c ;
	
    	
    }

}