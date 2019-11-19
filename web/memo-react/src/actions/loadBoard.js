import { userStore } from '../index.js';
import { MEMO } from '../index.js';
import { Constantes as CS } from '../constantes.js';
import { getLastActivity, getNextActionObject } from './nextEvents.js';
import Candidature from '../classes/candidature.js';
import CandidatureEvent from '../classes/candidatureEvent.js';
import moment from 'moment';
import { redirectToStartPage } from './userActions.js';

let candidatures;
let columnOrder;
let actionsCounter;

export const loadBoard = function() {

    //console.log("loadBoard.js");

    loadCandidatures()
        .then(response => response.json() )
        .then(response => {

                        //console.log("loadCandidatures ",response);
                        if(response.result=="ok")
                        {
                            initCandidatures(response.candidatures);
                            return Promise.resolve(true);
                        }
                        else
                            return Promise.reject(response.msg);
                    })
    .then( loadCandidatureEvents )
        .then(response => response.json() )
        .then(response => {

                        //console.log("loadCandidatureEvents ",response);
                        if(response.result=="ok")
                        {
                            addEventsToCandidatures(response.events);
                            initCandidatureLastActivity();
                            setColumnOrder();
                            // TODO JR
                            setActionsCounter();

                            return Promise.resolve(true);
                        }
                        else
                            return Promise.reject(response.msg);

        })
    .then( updateCandidatureStore )    
    .then( MEMO.startAgents )
    .catch( msg => {
                        console.log("TODO: gestion d'error ",msg);
                        //MEMO.utils.manageError( msg );
                    }
    )
    .finally( () => {
        //console.log("avant redirection");
        redirectToStartPage(); 
    }
    )
    //console.log("apres finaly");
}

function initCandidatures(candidaturesJson)
{    
    candidatures = {};

    candidaturesJson.map(c => {
        candidatures[c.id] = new Candidature(c);
    });
}

function setColumnOrder()
{
    columnOrder = {
        "column-active-0" : [],
        "column-active-1" : [],
        "column-active-2" : [],
        "column-active-3" : [],
        "column-archive-0" : [],
        "column-archive-1" : [],
        "column-archive-2" : [],
        "column-archive-3" : []
    }
    for(let k in candidatures)
    {
        let column = "column-";
        if(candidatures[k].archived)
            column += "archive-";
        else
            column += "active-";
        
        column+=candidatures[k].etat;
        columnOrder[column].push(candidatures[k].id);
    }
    //console.log("columnOrder : ",columnOrder);
}

function setActionsCounter() {
	actionsCounter = 0;
	
	for(let k in candidatures)
    {
		let action = getNextActionObject(candidatures[k]);  
		
		switch(action.adviceType) 
		{
			case CS.TYPES_ADVICE.POSTULER :
		  	{
				actionsCounter++;
		  		break;
		  	}
		  	case CS.TYPES_ADVICE.RELANCER_CANDIDATURE :
		  	{
		  		actionsCounter++;
		  		break;
		  	}
		  	case CS.TYPES_ADVICE.PREPARER_ENTRETIEN :
		  	{
		  		actionsCounter++;
		  		break;
		  	}
		  	case CS.TYPES_ADVICE.RELANCER_ENTRETIEN :
		  	{
		  		actionsCounter++;
		  		break;
		  	}
		  	case CS.TYPES_ADVICE.REMERCIER :
		  	{
		  		actionsCounter++;
		  		break;
		  	}
		  	default : { break; }
		}
    }
}

function addEventsToCandidatures(events)
{    
    // association d'événements chargés à leurs candidatures
    events.map(event => {
            let evt = new CandidatureEvent(event);
            let c = candidatures[evt.candidatureId];
            if(c)
            {
                if(!c.events)
                    c.events = {};    

                c.events[event.id] = evt;
            }

            // prochain entretien
            setNextEntretien(c,evt);        
        })
}

function initCandidatureLastActivity()
{
    if(candidatures)
    {
        for(let k in candidatures){
             candidatures[k].lastActivity = getLastActivity(candidatures[k]);
        }
    }
}

function updateCandidatureStore()
{
	// TODO JR
    let userCandidatures = { candidatures, columnOrder, actionsCounter };
    userStore.dispatch({type:'SET_USER_CANDIDATURES', userCandidatures});
    //window.candidatures = candidatures;
}

function loadCandidatures()
{
    let u = MEMO.rootURL+'/rest/candidatures';

    if (MEMO.visitorLink)
        u += "?link=" + MEMO.visitorLink;

    return fetch(u);
}

function loadCandidatureEvents()
{
    let u = MEMO.rootURL+'/rest/candidatures/events';

    if (MEMO.visitorLink)
        u += "?link=" + MEMO.visitorLink;

    return fetch(u);
}

export function setNextEntretien(c, evt)
{
    // prochain entretien
    if(evt.eventType==CS.TYPES.ENTRETIEN)
    {
        var cNE = c.nextEntretien, now = moment(), eT = evt.eventTime;
        if(!cNE)
            c.nextEntretien = eT;
        else
        {
            if( (cNE.isBefore(now) && eT.isAfter(cNE)) ||
                (cNE.isAfter(now) && eT.isAfter(now) && eT.isBefore(cNE))
            )
                c.nextEntretien = eT;
        }
    }
}