export const Constantes =
{
    // Les états d'une candidature
    ETATS : {
        VA_POSTULER : 0,
        A_POSTULE : 1,
        A_RELANCE : 2,
        ENTRETIEN : 3
    },

    TYPES_CANDIDATURE : {
        SPONT : 1,
        OFFRE : 2,
        RESEAU : 3,
        AUTRE : 4
    },

    // les index des types d'événements de candidatures
    TYPES : {
        DOIS_RELANCER : 1,
        ECHANGE_MAIL : 2,
        ENTRETIEN : 3,
        AI_POSTULE : 4,
        AI_RELANCE : 5,
        ARCHIVER : 6,
        RAPPEL : 7,
        NOTE : 8,
        MAINTENIR : 9,
        AI_PREPARE : 10,
        AI_REMERCIE : 11
    },

    TYPES_LIBELLE : { 
    	1 : "Je dois relancer", 
    	2 : "Echange de mail", 
    	3 : "Entretien", 
    	4 : "J'ai postulé",
        5 : "J'ai relancé", 
        6 : "Archiver",
        7 : "Rappel", 
        8 : "Note",   
        9 : "Maintenir actif", 
        10 : "J'ai préparé", 
        11 : "J'ai remercié"
    },
    
    TYPES_LIBELLE_ACTIVITES : {
        2 : "Echange de mail",
        3 : "Entretien",
        4 : "J'ai postulé",
        5 : "J'ai relancé",
        6 : "Archivage",
        8 : "Note",
        10 : "J'ai préparé",
        11 : "J'ai remercié"
    },
    
    // les index des sous types d'événements de candidatures
    SUBTYPES : {
        ENTRETIEN_PHYSIQUE : 1,
        ENTRETIEN_TEL : 2,
        ENTRETIEN_VIDEO : 3,
        REPONSE_NEG : 4,
        PAS_REPONSE : 5,
        OFFRE_POURVUE : 6,
        OFFRE_HORS_LIGNE : 7,
        INTERESSE_PLUS : 8,
        AI_POSTE : 9,
        TROUVE_AUTRE_POSTE : 10,
        AUTRE : 11,
        RAPPEL_POSTULE_RELANCE : 12,
        RAPPEL_ENTRETIEN_RELANCE : 13,
        RAPPEL_ENTRETIEN_REMERCIER : 14
    },
    
    TYPES_ADVICE : {
        POSTULER : 1,
    	RELANCER_CANDIDATURE : 2,        
        PREPARER_ENTRETIEN : 3,
        RELANCER_ENTRETIEN : 4,
        REMERCIER : 5,
        ARCHIVER : 6
    },
    
    JOBBOARD : [ "pole emploi", "monster", "leboncoin", "indeed", "vivastreet", "keljob", "cadremploi", "linkedin", "envirojob", 
    				"apec", "meteojob", "job", "adecco", "manpower", "randstad", "michael page", "page personnel", "randstad", "synergie", 
    					"hays", "expectra", "proman", "start people", "supplay", "crit interim", "adequat interim", "kelly services", "spring",
    						"adequat", "fed finance", "ergalis", "temporis", "samsic emploi", "apave", "lynx rh", "de graet consulting", "groupe actual",
    							"fed supply", "triangle interim", "kpmg", "actual", "alten", "uptoo", "interaction", "elis", "phone regie",
    								"taylor made recrutement", "domino interim", "in extenso", "jobintree"],

    MEMO_PARTNERS : ['labonneboite','envirojob','pole-emploi','pe-qvr','jobalim','vitijob']
}