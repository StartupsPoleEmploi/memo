import React, { Component } from 'react';
import Modal from '../../../components/modal.js';
import moment from 'moment';
import { Constantes as CS } from '../../../constantes.js';
import { getLastActivity } from '../../../actions/nextEvents.js';

class CandidatureThankToModal extends Component{

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
		if((c.emailContact && c.emailContact.length) || (c.telContact && c.telContact.length)) 
        {
	    	// @RG - CONSEIL : Dans le conseil 'Remercier', l'email et/ou le téléphone sont affichés s'ils sont renseignés
        	if(c.emailContact && c.emailContact.length && c.telContact && c.telContact.length) 
        	{
        		res = <li className='textAdvice'>Remercier tout de suite sur <a className='linkAdvice' href={this.getLinkMailTo(c.emailContact)} target='_blank' /*onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil remercier : mailto') +"'*/>{c.emailContact}</a> ou au <a className='linkAdvice' href={this.getLinkTel(c.telContact)} target='_blank' /*onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil relancer candidature : tel') +"'*/>{c.telContact}</a></li>;
        	} else if (c.emailContact && c.emailContact.length)
        	{
        		res = <li className='textAdvice'>Remercier tout de suite <a className='linkAdvice' href={this.getLinkMailTo(c.emailContact)} target='_blank' /*onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil remercier : mailto') +"'*/>{c.emailContact}</a></li>;
        	} else 
        	{
        		res = <li className='textAdvice'>Remercier tout de suite au <a className='linkAdvice' href={this.getLinkTel(c.telContact)} target='_blank' /*onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil remercier : tel') +"'*/>{c.telContact}</a></li>;
        	}
        } else 
        {
        	if(c.type != CS.TYPES_CANDIDATURE.RESEAU) 
        	{
	        	if (c.nomSociete) 
	        	{
	        		// @RG - CONSEIL : Dans le conseil 'Remercier', si aucune donnée de contact et si le nom de la societé est renseignée et si la candidature n'est pas de type 'RESEAU alors la recherche google des coordonnées de l'entreprise est propoposée
	        		res = <li className='textAdvice'>Remercier l'employeur en retrouvant les coordonnées de l'entreprise {this.getSearchLinkForSociety()} </li>;
	        	} 
        	} else 
        	{
        		// @RG - CONSEIL : Dans le conseil 'Remercier', si aucune données de contact et si la candidature est du type 'RESEAU', alors 'relancer votre contact' est affiché
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
			title="Remercier";
			text =  <div>
						<p><b>Confirmez votre intérêt et distinguez-vous</b></p>
						<ul style={{listStyleType:'none'}}>
							{this.getAdviceContact(c)}
						</ul>
						<p className='titleTextAdvice'>Comment vous y prendre ?</p>
						<p className='titleAdvice'>Les principes de base :</p>
						<ul style={{listStyleType:'none'}}>
							<li><a className='linkAdvice' href="http://www.lexpress.fr/emploi/conseils-emploi/lettre-de-remerciement-apres-un-entretien-d-embauche_1609017.html" target="astuces" /*onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : remercier - lettre')"*/>Rédiger une lettre de remerciement après un entretien</a></li>
						</ul>
						<p className='titleAdvice'>Des conseils d'experts en vidéo :</p>
						<ul style={{listStyleType:'none'}}>
							<li className='textAdvice'><a className='linkAdvice' href="http://www.academyk.org/gerer-l-apres-entretien-de-recrutement-mc15.html" target="astuces" /*onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : remercier - gérer')"*/>Gérer l’après-entretien </a>(2min)</li>
							<li className='textAdvice'><a className='linkAdvice' href="http://www.academyk.org/entretien-avec-un-manager-apres-l-entretien-4-4-mc96.html" target="astuces" /*onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : remercier - 2nd entretien')"*/>Remercier après un second entretien </a>(2min)</li>
						</ul>
						<p className='titleAdvice'>Pour avoir un retour du recruteur :</p>
						<ul style={{listStyleType:'none'}}>
							<li><a className='linkAdvice' href="https://fidbak.fr/" target="astuces" /*onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : remercier - fidbak')"*/>FIDBAK</a></li>
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
             text:"J'ai remercié",
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
export default CandidatureThankToModal;