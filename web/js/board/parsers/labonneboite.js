function ParserLaBonneBoite()
{
    //console.log("instantiate La Bonne Boite Parser");
}

ParserLaBonneBoite.prototype = {

    logo: "labonneboite.png",
    name: "La Bonne Boîte",

    //@RG - IMPORT : Les données importées des offres de LBB sont obligatoirement nomCandidature et descrition et si possible nomSociete, ville, nomContact, logoUrl issues de leur API retournant un flux JSON.
    parse : function(html)
    {
        /*
         {  "address": {
         "city": "METZ",
         "city_code": "57463",
         "street_name": "RUE DE LA CHAPELLE",
         "street_number": "63",
         "zipcode": "57000"  },

         "headcount_text": "3 à 5 salariés",
         "lat": 49.0993,
         "phone" : ,
         "email" : ,
         "website" : ,
         "lon": 6.17315,
         "naf": "4722Z",
         "naf_text": "Commerce de détail de viandes et de produits à base de viande en magasin spécialisé",
         "name": "VOLAILLES GAUB",
         "siret": "34229567200014",
         "stars": 2.7,
         "url": "http://localhost:8090/34229567200014/details"
         }
         */

        ga('send', { hitType : 'event', eventCategory : 'Candidature', eventAction : 'import', eventLabel : this.name  });

        var t = this,
            cont = JSON.parse(html),
        // Init de la candidature après le parse au cas où celui-ci génère une exception
            c = new Candidature(),
            el, v, tmp = "";

        debugCont = cont;

        c.jobBoard = this.name;
        c.nomCandidature = cont.name;
        c.nomSociete = cont.name;
        c.numSiret = cont.siret;
        
        el = cont.address;
        c.ville = el.city+" ("+el.zipcode+")";

        v = cont.naf_text+"<br />"+cont.headcount_text+"<br /><br /><b>Adresse</b> : <br />";
        v += el.street_number+" "+el.street_name+"<br />"+el.zipcode+" "+el.city;

        if(cont.website)
            v += "<br /><br />Site Internet : <a href='"+cont.website+"' target='_blank'>"+cont.website+"</a>";

        if(cont.phone)
            c.telContact = cont.phone;
        if(cont.email && isEmail(cont.email))
            c.emailContact = cont.email;

        c.description = v;

        c.type= 1; //CS.TYPES_CANDIDATURE.SPONT; pas référencé sur le bouton d'import
        c.urlSource = cont.url;

        return c;
    }


}