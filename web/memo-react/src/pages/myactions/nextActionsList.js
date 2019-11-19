import React, { Component } from 'react';
import { getNextActionObject } from '../../actions/nextEvents.js';
import { NextAction } from './nextAction.js';
import { Constantes as CS } from '../../constantes.js';
import CandidatureNewEventModal from '../../components/modals/candidatureNewEventModal.js';
import moment from 'moment';
import { saveCandidatureAndEvent } from '../../actions/candidatureActions.js';
import { userStore } from '../../index.js';

class NextActionsList extends Component{

    constructor(props)
    {
        super(props);
        this.state = { showNewEventModal:false,
        			   modalFormLoading:false
        };
        
        this.actionsToThank=[];
        this.actionsToApplyFor=[];
        this.actionsToPrepareInterview=[];
        this.actionsToRelaunchCandidature=[];
        this.actionsToRelaunchInterview=[];
        
        this.selectedEvent=null;
    }

	loadNextActions()
    {
        let nextAction;
        
        // reset des tableaux d'actions à mener
        this.actionsToThank=[];
        this.actionsToApplyFor=[];
        this.actionsToPrepareInterview=[];
        this.actionsToRelaunchCandidature=[];
        this.actionsToRelaunchInterview=[];

        // Construction des tableaux des actions à mener
        for(let k in this.props.user.candidatures)
        {
            const c = this.props.user.candidatures[k];
            nextAction = getNextActionObject(c);
            switch(nextAction.adviceType) 
            {
            	case CS.TYPES_ADVICE.POSTULER :
            	{
            		this.actionsToApplyFor.push(nextAction);
            		break;
            	}
            	case CS.TYPES_ADVICE.RELANCER_CANDIDATURE :
            	{
            		this.actionsToRelaunchCandidature.push(nextAction);
            		break;
            	}
            	case CS.TYPES_ADVICE.PREPARER_ENTRETIEN :
            	{
            		this.actionsToPrepareInterview.push(nextAction);
            		break;
            	}
            	case CS.TYPES_ADVICE.RELANCER_ENTRETIEN :
            	{
            		this.actionsToRelaunchInterview.push(nextAction);
            		break;
            	}
            	case CS.TYPES_ADVICE.REMERCIER :
            	{
            		this.actionsToThank.push(nextAction);
            		break;
            	}
            	default : { break; }
            }
        }
    }
	
	getNextActions()
    {
		let res = [], i = 0;
		
		// On charge les actions en les regroupant par type
		this.loadNextActions();

		// On retrie les actions pr les grouper par type avec l'ordonnancement suivant : Action Remercier - Relancer entretien - Préparer entretien - Relancer candidature - Postuler
		for(let k in this.actionsToThank)
		{
			res.push(this.getNextAction(this.actionsToThank[k], i, "J'ai remercié"));
			i++;
		}
		for(let k in this.actionsToRelaunchInterview)
		{
			res.push(this.getNextAction(this.actionsToRelaunchInterview[k], i, "J'ai relancé"));
			i++;
		}
		for(let k in this.actionsToPrepareInterview)
		{
			res.push(this.getNextAction(this.actionsToPrepareInterview[k], i, "J'ai préparé"));
			i++;
		}
		for(let k in this.actionsToRelaunchCandidature)
		{
			res.push(this.getNextAction(this.actionsToRelaunchCandidature[k], i, "J'ai relancé"));
			i++;
		}
		for(let k in this.actionsToApplyFor)
		{
			res.push(this.getNextAction(this.actionsToApplyFor[k], i, "J'ai postulé"));
			i++;
		}
		
		if ( i== 0)
		{
        	// @RG - ACTIONS : Si aucune action à mener n'est identifiée, le message 'Pour le moment, vous n'avez pas d actions à effectuer.' est affiché
			res = <div className='candidatureActivity'><p>Pour le moment, vous n'avez pas d'actions à effectuer.</p></div>
		}
		return res;
    }
    

	getNextAction(event, i, titleAction)
    {
        return <NextAction {...this.props} key={i} event={event} display="nextActions" titleAction={titleAction}  onNewEvent={this.onNewEvent} />;
    }

    render()
    {	
    	return <div className='candidatureDescription'>
                    <div className='candidatureDescriptionHeader'>
                        <div className='candidatureDescriptionTitle'>
                            A mener en priorités
                        </div>
                        {this.getNextActions()}
                        <CandidatureNewEventModal showModal={this.state.showNewEventModal} 
	                        event={this.selectedEvent}
	                        formLoading={this.state.modalFormLoading}
	                        onClick={this.onValidateClicked} 
	                        handleCloseModal={this.handleCloseModal}
	                        errorMsg={this.state.modalError} />
                    </div>
                </div>
    }
    
    onNewEvent = evt => {
        this.selectedEvent = evt;
        this.setState( { showNewEventModal : true });
        window.gtag('event', 'ouvertureEvt', { event_category: 'Priorites', event_label : CS.TYPES_LIBELLE[evt.eventType] }); 
    }

	
    handleCloseModal= e => {
        if(e)
            e.stopPropagation();

        this.setState( { showNewEventModal : false,
                         modalFormLoading : false });
    }
    
    onValidateClicked = (values) =>
    {
    	this.setState({modalFormLoading:true});
    	// On enregistre un nouvel evt suite au traitement de l'action    	
        this.saveCandidatureAndEvent(values);
    }
    
    async saveCandidatureAndEvent(values)
    {     
        let evt = this.selectedEvent;
        const cs = userStore.getState().user.candidatures;
        let c = cs[this.selectedEvent.candidatureId];
        
        // MAJ l'état de la candidature
        if (c.etat != CS.ETATS.ENTRETIEN) 
        {
	        switch(evt.eventType) 
	        {
	        	case CS.TYPES.AI_POSTULE :
	    		{
	        		c.etat = CS.ETATS.A_POSTULE;
	        		break;
	    		}
	        	case CS.TYPES.AI_RELANCE :
	    		{
	        		c.etat = CS.ETATS.A_RELANCE;
	        		break;
	    		}
	    		default : {break;}
	        }
        }
        // Ajoute un evennement en récupérant le commentaire et la date saisie
        evt.comment = values.comment?values.comment:"";
        evt.eventTime = moment(values.selectedTime);

        saveCandidatureAndEvent(c,evt)
        .then( result  => {

            if(result.eventUpdated)
            {
                evt.id = result.eventId;
                c.addEvent(evt);
                this.handleCloseModal();

                window.gtag('event', 'ajoutEvt', { event_category: 'Priorites', event_label : CS.TYPES_LIBELLE[evt.eventType] }); 
            }
            else
            {
                console.log("TODO : gérer error d'update event ",result.error);    
                this.setState({modalError:result.error});
            }
            
            userStore.dispatch({type:'UPDATE_CANDIDATURE_AND_USER_ACTION_COUNTER', candidature:c});
        } )
        .catch( msg => {
            console.log("TODO: traitement d'erreur ",msg);
            this.setState({modalError:msg});
            //MEMO.utils.manageError( msg );
        })
        .finally( () => { this.setState({modalFormLoading:false}); })
    }

}
export default NextActionsList;