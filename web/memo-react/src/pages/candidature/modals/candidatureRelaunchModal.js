import React, { Component } from 'react';
import Modal from '../../../components/modal.js';
import moment from 'moment';
import { Constantes as CS } from '../../../constantes.js';
import { getLastActivity, getRappel } from '../../../actions/nextEvents.js';
import CandidatureEditEventModal from './candidatureEditEventModal.js';
import { saveCandidatureEvent } from '../../../actions/candidatureActions.js';
import CandidatureEvent from '../../../classes/candidatureEvent.js'

class CandidatureRelaunchModal extends Component{

	constructor(props)
    {
        super(props);
        this.state = {  showEditEventModal:false,
        				modalFormLoading : false,
                        modalError:""
                     };
        this.selectedEvent = null;
        //this.updateEvent = this.updateEvent.bind(this);
    }
	
	getLinkMailTo(emailContact) 
    {
    	return "mailto:" + emailContact;
    }
    
    getLinkTel(telContact) 
    {
    	return "tel:" + telContact;
    }
    
	getSearchLinkForSociety() 
    {
		let res = "";
		
		if(this.props.candidature)
		{
			let societyName = this.props.candidature.nomSociete;
    	
			if(societyName) 
				res = <a className='linkAdvice' href={this.getSearchLink(societyName)} target='_blank' /*onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : relancer candidature : google') +"'*/>ici</a>;
		}
		
    	return res;
    }
	
	getSearchLink(societyName) 
    {
		return "http://www.google.fr/#q=" + societyName;
    }
    
	getAdviceReminder(c) 
	{
//    	let now = moment();
//    	let cEvt, res = "";
//
//    	cEvt = getRappel(c.events, CS.SUBTYPES.RAPPEL_POSTULE_RELANCE);
//    	if(cEvt) 
//    	{ 
//    		// @RG - CONSEIL : Dans le conseil 'Relancer Candidature', si un evt de rappel de type 'RELANCE CANDIDATURE' existe, alors 'modifier la date de votre rappel de relance' est affiché. Au clic sur le lien 'modifier', l'evt de rappel correspondant est affiché pour être modifié.
//        	res = <li><a className='linkAdvice' /*onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil relancer candidature : modifier rappel') +"'*/>modifier</a> la date de votre rappel de relance</li>;
//        	this.selectedEvent = cEvt;
//    	} else 
//    	{
//    		// @RG - CONSEIL : Dans le conseil 'Relancer Candidature', s'il n'existe pas d'evt de rappel de type 'RELANCE CANDIDATURE', alors le lien 'définir un rappel de relance' est affiché. Au clic sur le lien, la modale d'ajout d'un evt de rappel est affichée.
//    		res = <li><a className='linkAdvice' onClick={this.onEvent}/*onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil relancer candidature : ajouter rappel') +"'*/>définir un rappel de relance</a></li>;
//    		this.selectedEvent = new CandidatureEvent();
//    		this.selectedEvent.eventType = CS.TYPES.RAPPEL;
//    		this.selectedEvent.eventSubType = CS.SUBTYPES.RAPPEL_POSTULE_RELANCE;
//    		this.selectedEvent.candidatureId = c.id;
//    	}
//        
//       return res;
	}
	
	getAdviceContact(c) 
	{
		let res = "";
		if((c.emailContact && c.emailContact.length) || (c.telContact && c.telContact.length)) 
        {
        	// @RG - CONSEIL : Dans le conseil 'Relancer Candidature', l'email et/ou le téléphone sont affichés s'ils sont renseignés
        	if(c.emailContact && c.emailContact.length && c.telContact && c.telContact.length) 
        	{
        		res = <li className='textAdvice'>Relancer tout de suite sur <a className='linkAdvice' href={this.getLinkMailTo(c.emailContact)} target='_blank' /*onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil relancer candidature : mailto') +"'*/>{c.emailContact}</a> ou au <a className='linkAdvice' href={this.getLinkTel(c.telContact)} target='_blank' /*onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil relancer candidature : tel') +"'*/>{c.telContact}</a></li>;
        	} else if (c.emailContact && c.emailContact.length)
        	{
        		res = <li className='textAdvice'>Relancer tout de suite <a className='linkAdvice' href={this.getLinkMailTo(c.emailContact)} target='_blank' /*onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil relancer candidature : mailto') +"'*/>{c.emailContact}</a></li>;
        	} else 
        	{
        		res = <li className='textAdvice'>Relancer tout de suite au <a className='linkAdvice' href={this.getLinkTel(c.telContact)} target='_blank' /*onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil relancer candidature : tel') +"'*/>{c.telContact}</a></li>;
        	}
        } else 
        {
        	if(c.type != CS.TYPES_CANDIDATURE.RESEAU) 
        	{
	        	if (c.nomSociete) 
	        	{
	        		// @RG - CONSEIL : Dans le conseil 'Relancer Candidature', si aucune donnée de contact et si la candidature n'est pas de type 'RESEAU et si le nom de la societé est renseignée alors la recherche google des coordonnées de l'entreprise est propoposée
	        		res = <li className='textAdvice'>Relancer en retrouvant les coordonnées de l'entreprise {this.getSearchLinkForSociety()} </li>;
	        	} 
        	} else 
        	{
        		// @RG - CONSEIL : Dans le conseil 'Relancer Candidature', si aucune données de contact et si la candidature est du type 'RESEAU', alors 'relancer votre contact' est affiché
        		res = <p className='textAdvice'>Relancer votre contact</p>; 
        	}
        }
		return res;
	}
	
    getContent()
    {
        let text='', title='';
		let c = this.props.candidature;
		
		if(c)
    	{
			// récupération de la date du dernier entretien physique
			let lastActivity = getLastActivity(c);
			let now = moment(), lC = lastActivity.lastCandidature, daysCounter = '';
			
			if(lC) {
				// @RG - CONSEIL : Dans le conseil 'Relancer Candidature', la différence de jour entre ajourd'hui et le dernier envoie de la candidature est affiché
				daysCounter = now.diff(lC,'days');
			}
				
			title="Relancer";
			text =  <div>
						<p><b>Affirmez votre motivation et obtenez une réponse</b></p>
						<p className='textAdvice'>Vous avez postulé il y a <b>{daysCounter}</b> jours.</p>
						<ul style={{listStyleType:'none'}}>
							{this.getAdviceReminder(c)}
							{this.getAdviceContact(c)}
						</ul>
						<p className='titleTextAdvice'>Comment vous y prendre ?</p>
						<ul style={{listStyleType:'none'}}>
							<li><a className='linkAdvice' href="http://blog-experts.cadres.apec.fr/2014/10/06/lart-de-relancer-ses-candidatures/" target="astuces" /*onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : relancer candidature - l art')"*/>L'art de relancer ses candidatures</a></li>
							<li><a className='linkAdvice' href="https://www.cadremploi.fr/editorial/conseils/conseils-candidature/detail/article/candidature-relancer-sans-harceler.html" target="astuces" /*onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : relancer candidature - sans harceler')"*/>Comment relancer sans harceler</a></li>
						</ul>
					</div>;
		}

        return {text,title};
    }

    render()
    {
    	let content = this.getContent();
    	 
    	let buttons = [
            {
             text:"J'ai relancé",
             onClick:this.props.onValidateClicked
            }
        ];
    	
        return <div>
        			<Modal buttons={buttons} 
		                title={content.title} 
		                text={content.text}
		                closeText="Annuler"
		                disableOverlayClickClose={true}
		                showCommentForm="true"
		                formLoading={this.props.formLoading}
		                errorMsg={this.props.errorMsg}
		                showModal={this.props.showModal}
		        		disableClose={this.props.disableClose}
		                handleCloseModal={this.props.handleCloseModal} />
                
        			<CandidatureEditEventModal showModal={this.state.showEditEventModal} 
				        event={this.selectedEvent}
				        formLoading={this.state.modalFormLoading}
				        onClick={this.onValidateClicked} 
				        handleCloseModal={this.handleCloseModal}
				        errorMsg={this.state.modalError} />
        		</div>
    }
    
    handleCloseModal = e => {
        if(e)
            e.stopPropagation();

        this.setState( { showEditEventModal : false, modalError:"" });
    }

    onValidateClicked = (values) =>
    {
        this.setState({modalFormLoading:true});
        //this.updateEvent(values);
    }
    
    onEvent = () => {
        this.setState( { showEditEventModal : true,
            modalError:"" });
    }
}
export default CandidatureRelaunchModal;