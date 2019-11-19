import React, { Component } from 'react';
import Modal from '../../../components/modal.js';
import moment from 'moment';
import { Constantes as CS } from '../../../constantes.js';
import { getLastActivity } from '../../../actions/nextEvents.js';

class CandidatureRelaunchInterviewModal extends Component{

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
				res = <a className='linkAdvice' href={this.getSearchLink(societyName)} target='_blank' /*onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : relancer entretien : google') +"'*/>ici</a>;
		}
    	
    	return res;
    }
	
	getSearchLink(societyName) 
    {
		return "http://www.google.fr/#q=" + societyName;
    }
	
	getAdviceContact(c) 
	{
		let res = "";
		if(c)
		{
			if((c.emailContact && c.emailContact.length) || (c.telContact && c.telContact.length)) 
			{
				// @RG - CONSEIL : Dans le conseil 'Relancer Entretien', l'email et/ou le téléphone sont affichés s'ils sont renseignés
				if(c.emailContact && c.emailContact.length && c.telContact && c.telContact.length) 
				{
					res = <li className='textAdvice'>relancer tout de suite sur <a className='linkAdvice' href={this.getLinkMailTo(c.emailContact)} target='_blank' /*onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil relancer entretien : mailto') +"'*/>{c.emailContact}</a> ou au <a className='linkAdvice' href={this.getLinkTel(c.telContact)} target='_blank' /*onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil relancer candidature : tel') +"'*/>{c.telContact}</a></li>;
				} else if (c.emailContact && c.emailContact.length)
				{
					res = <li className='textAdvice'>Relancer tout de suite <a className='linkAdvice' href={this.getLinkMailTo(c.emailContact)} target='_blank' /*onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil relancer entretien : mailto') +"'*/>{c.emailContact}</a></li>;
				} else 
				{
					res = <li className='textAdvice'>Relancer tout de suite au <a className='linkAdvice' href={this.getLinkTel(c.telContact)} target='_blank' /*onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil relancer entretien : tel') +"'*/>{c.telContact}</a></li>;
				}
			} else 
			{
				if(c.type != CS.TYPES_CANDIDATURE.RESEAU) 
				{
					if (c.nomSociete) 
					{
						// @RG - CONSEIL : Dans le conseil 'Relancer Entretien', si aucune donnée de contact et si le nom de la societé est renseignée et si la candidature n'est pas de type 'RESEAU alors la recherche google des coordonnées de l'entreprise est propoposée
						res = <li className='textAdvice'>Relancer l'employeur en retrouvant les coordonnées de l'entreprise {this.getSearchLinkForSociety()} </li>;
					} 
				} else 
				{
					// @RG - CONSEIL : Dans le conseil 'Relancer Entretien', si aucune données de contact et si la candidature est du type 'RESEAU', alors 'relancer votre contact' est affiché
					res = <p className='textAdvice'>Relancer votre contact</p>; 
				}
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
			let now = moment(), lE = lastActivity.lastEntretien, daysCounter = '';
			
			if(lE) {
				// @RG - CONSEIL : Dans le conseil 'Relancer Entretien', la différence de jour entre ajourd'hui et la date du dernier entretien de la candidature est affiché
				daysCounter = now.diff(lE,'days');
			}
			
			title="Relancer";
			text =  <div>
						<p><b>Pas de réponse ? Reprenez la main !</b></p>
						<p className='textAdvice'>Vous avez passé un entretien il y a <b>{daysCounter}</b> jours.</p>
						<ul style={{listStyleType:'none'}}>
							{this.getAdviceContact(c)}
						</ul>
						<p className='titleTextAdvice'>Comment vous y prendre ?</p>
						<p className='titleAdvice'>Apprenez en ligne les incontournables : </p>
						<ul style={{listStyleType:'none'}}>
							<li><a className='linkAdvice' href="http://www.lexpress.fr/emploi/conseils-emploi/comment-relancer-un-recruteur-apres-un-entretien_1500653.html" target="astuce" /*onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : relancer entretien recruteur')"*/>Comment relancer un recruteur</a></li>
							<li><a className='linkAdvice' href="http://www.welcometothejungle.co/articles/6-astuces-pour-relancer-un-recruteur" target="astuce" /*onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : relancer entretien astuce')"*/>6 astuces pour relancer un recruteur</a></li>
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

        return <Modal buttons={buttons} 
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
    }
}
export default CandidatureRelaunchInterviewModal;