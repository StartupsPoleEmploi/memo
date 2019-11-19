import { reorderColumnsFromCandidatureChange, reorderColumnsFromCandidatureRemoval } from './actions/dashboardActions';
import { initializeFilteredColumns, removeFilteredColumns } from './actions/filterActions';
import { Constantes as CS } from './constantes.js';
import { getNextActionObject } from './actions/nextEvents.js';
import { MEMO } from './index';

export const userReducer = (state,action) => {

    let res = state;
    switch(action.type)
    {
        case 'SET_USER' :
        {
            res = { user : action.user, isVisitor : action.isVisitor };
            MEMO.displayOnStartupModal=1;   // permettre l'affichage des modals de démarrage à la connexion d'un utilisateur
            break;
        }

        case 'SET_USER_CANDIDATURES' :
        {
            res = { user : state.user, isVisitor : state.isVisitor };
            res.user.candidatures = action.userCandidatures.candidatures;
            res.user.columnOrder = action.userCandidatures.columnOrder;
            res.user.actionsCounter = setActionsCounter(res.user.candidatures);
            break;
        }

        case 'UPDATE_CANDIDATURE' : 
        {
            res = { user : state.user, isVisitor : state.isVisitor};
            res.user.candidatures[action.candidature.id] = action.candidature;
            if(!state.isVisitor)
                reorderColumnsFromCandidatureChange(res.user,action.candidature);
            break;
        }

        case 'UPDATE_CANDIDATURE_AND_USER_ACTION_COUNTER' : 
        {
            res = { user : state.user, isVisitor : state.isVisitor};
            res.user.candidatures[action.candidature.id] = action.candidature;
            if(!state.isVisitor)
                reorderColumnsFromCandidatureChange(res.user,action.candidature);

            res.user.actionsCounter = setActionsCounter(res.user.candidatures);

            break;
        }

        case 'ADD_CANDIDATURE' : 
        {
            // voir pertinence de doublon par rapport à update_candidature
            res = { user : state.user};
            res.user.candidatures[action.candidature.id] = action.candidature;
            reorderColumnsFromCandidatureChange(res.user,action.candidature);

            break;
        }

        case 'UPDATE_COLUMNS' :
        {
            res = { user : state.user };
            for(let k in action.reorderedColumns)
                res.user.columnOrder[k] = action.reorderedColumns[k];   
            break;
        }

        case 'REMOVE_CANDIDATURE' : 
        {
            res = { user : state.user};
            delete res.user.candidatures[action.candidature.id];
            reorderColumnsFromCandidatureRemoval(res.user,action.candidature);
            break;
        }

        case 'DISCONNECT' :
        {
            res = { user : null, isVisitor : false };
            break;
        }

        case 'UPDATE_RECEIVE_NOTIFICATION' : 
        {
            res = { user : state.user };
            res.user.receiveNotification = action.receiveNotification;
            break;
        }

        case 'UPDATE_CONSENT_ACCESS' : 
        {
            res = { user : state.user };
            res.user.consentAccess = action.consentAccess;
            break;
        }

        case 'UPDATE_USER_EMAIL' : 
        {
            res = { user : state.user };
            res.user.login = action.login;
            break;
        }

        case 'UPDATE_USER_ACTIONS_COUNTER' :
        {
            res = { user : state.user };
            res.user.actionsCounter = setActionsCounter(res.user.candidatures);
            break;
        }

        case 'SHOW_FILTERED_DASHBOARD' : 
        {
            res = { user : state.user };
            initializeFilteredColumns(res.user);
            break;
        }

        case 'SHOW_UNFILTERED_DASHBOARD' : 
        {
            res = { user : state.user };
            removeFilteredColumns(res.user);
            break;
        }

        case 'UPDATE_SEARCH_RESULT_FROM_DESCRIPTION' : 
        {
            // appelé suite à une recherche sur mot clef après le retour de l'api de recherche dans la description
            res = { user : state.user };
            initializeFilteredColumns(res.user);
            break;
        }

        default : break;
    }

    return res;
}

function setActionsCounter(candidatures) {
	let res = 0;
	
	for(let k in candidatures)
    {
		let action = getNextActionObject(candidatures[k]);  
		
		switch(action.adviceType) 
		{
			case CS.TYPES_ADVICE.POSTULER :
		  	{
				res++;
		  		break;
		  	}
		  	case CS.TYPES_ADVICE.RELANCER_CANDIDATURE :
		  	{
		  		res++;
		  		break;
		  	}
		  	case CS.TYPES_ADVICE.PREPARER_ENTRETIEN :
		  	{
		  		res++;
		  		break;
		  	}
		  	case CS.TYPES_ADVICE.RELANCER_ENTRETIEN :
		  	{
		  		res++;
		  		break;
		  	}
		  	case CS.TYPES_ADVICE.REMERCIER :
		  	{
		  		res++;
		  		break;
		  	}
		  	default : { break; }
		}
    }
	return res;
}