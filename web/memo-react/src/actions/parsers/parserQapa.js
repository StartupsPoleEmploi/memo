import Candidature from '../../classes/candidature';
import { $ , getEmailInText } from '../../components/utils';

class ParserQAPA {

    logo = "qapa.png";
    name = "QAPA";

    /*
     "description" : "Nous recherchons pour notre client un(e) peintre. <br><br>LES MISSIONS : <br><br>- Montage des échafaudages.<br>- Protection du mobilier et des sols avec des bâches.<br>- Sécurisation du chantier avec des gardes de corps anti-chutes et des lignes de vie.<br>- Préparation des supports (décaper les vieilles peintures, décoller l’ancien papier peint, colmater les fissures, enduire, poncer, etc.)<br>- Obtenir une surface lisse ou rugueuse telle que désirée (boucher les trous éventuels).<br>- Préparation des produits à appliquer : peinture, coloration, résines, etc.<br><br>LE PROFIL RECHERCHE : <br><br>- Savoir peindre<br>- Savoir enduire<br>- Savoir poncer, reboucher les trous ... <br><br>NB : La mission a lieu dans le centre ville de Briançon",
     "locality" : "Briançon",
     "mission" :
     {
         "bonus" : "Panier repas",
         "description" : "Nous recherchons pour notre client un/une <b>Peintre enduiseur / enduiseuse</b>  à <b>Briançon (05100)</b> pour la période du <b>3 septembre au 26 octobre 2018</b><br><b>Horaires de la mission : </b>de 09:00 à 17:00 Avec coupure<br><b>Jours travaillés : </b>Lundi, Mardi, Mercredi, Jeudi, Vendredi, Samedi, Dimanche<br><b>Base horaire hebdomadaire : </b>35h<br><br><b class=\"fontSize18\">Profil recherché :</b><br><dl>Expérience : Tous niveaux d'expérience<dt>Avantages :</dt><dd>Panier repas </dd><br></dl>",
         "endDate" : "2018-10-26",
         "hourlyRawSalary" : 9.88,

         "jobInformation" : "",

         "missionCost" : {
             "id" : 204334,
             "nbHoursTotal" : 270.0,
             "rawApplicant" : 3227.8,
             "links" : [ ]
         },
         "startDate" : "2018-09-03"
     },
     "postalCode" : "05100",
     "tradeLabel" : "Peintre enduiseur / enduiseuse",
     }
     */

    //@RG - IMPORT : Les données importées des offres de QAPA sont obligatoirement nomCandidature et description et si possible nomSociete, ville issus de page HTML.
    parse = html => 
    {
        window.gtag('event', 'import', { event_category: 'Candidature', event_label: this.name });     

        var t = this,
            c = new Candidature(),
            cont = JSON.parse(html),
            el, v, tmp = "";

        window.debugCont = cont;

        c.jobBoard = this.name;
        c.nomCandidature = cont.tradeLabel;

        if(cont.description)
            c.description = cont.description+" <hr /> ";

        c.description += cont.mission.description;

        c.ville = cont.locality+" ("+cont.postalCode+")";

        return c;
    }
}

export default ParserQAPA;