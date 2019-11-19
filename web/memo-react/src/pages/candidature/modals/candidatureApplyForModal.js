import React, { Component } from 'react';
import Modal from '../../../components/modal.js';
import moment from 'moment';
import { getLastActivity } from '../../../actions/nextEvents.js';
import { Constantes as CS } from '../../../constantes.js';

class CandidatureApplyForModal extends Component{

    getLinkAppyFor() 
    {
		let res = "";
		if(this.props.candidature)
        {
			let emailContact = this.props.candidature.emailContact;
			let url = this.props.candidature.urlSource;

			if (emailContact) 
			{
				res = <a className='linkAdvice' href={this.getLinkMailTo(emailContact)} target='_blank' /*onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Conseil postuler : mailto') +"'*/>Postulez sur {emailContact}</a>
			} else if (url) 
			{
				res = <a className='linkAdvice' href={url} /*onclick='" + lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : postuler - postulez ici') +"'*/>Postulez ici</a>;
			}
		}
    	return res;
    }
    
    getLinkMailTo(emailContact) 
    {
    	return "mailto:" + emailContact;
    }

	getSearchLinkForSociety() 
    {
		let res = "";
		if(this.props.candidature)
		{
			let societyName = this.props.candidature.nomSociete;
    	
			if(societyName) 
				res = <a className='linkAdvice col-xs-6 col-sm-6' href={this.getSearchLink(societyName)} target='_blank'>Découvrez l'entreprise</a>;
    	}
    	return res;
    }
	
	getSearchLink(societyName) 
    {
		return "http://www.google.fr/#q=" + societyName;
    }
	
	getContent()
    {
        let text='', title='';
        
        // @RG - CONSEIL : Dans le conseil 'Postuler', le lien 'Découvrez entreprise' est affiché si le nom de la société est connu
    	// @RG - CONSEIL : Dans le conseil 'Postuler', le lien 'postulez sur emailContact' est affiché si l'email existe, sinon si l'url existe le lien 'postulez ici' est affiché  
		title="Postuler";
        text =  <div>
        			<p><b>N'attendez pas et profitez-en pour retenir l'attention</b></p>
        			{this.getSearchLinkForSociety()}
        			{this.getLinkAppyFor()}
        			<p className='titleTextAdvice'>Comment vous y prendre ?</p>
        			<p className='titleAdvice'>Apprenez en ligne les incontournables</p>
        			<ul style={{listStyleType:'none'}}>
        				<li><a className='linkAdvice' href="http://www.contratdapprentissage.fr/comment-faire-une-lettre-de-motivation.php" target="astuces" /*onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : postuler - LM')"*/>Comment faire une lettre de motivation</a></li>
        				<li className='textAdvice'><a className='linkAdvice' href="https://www.emploi-store.fr/portail/services/bABaCvLettreDeMotivation" target="astuces" /*onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : postuler - B.A BA')"*/>B.A BA CV et lettre de motivation </a>(1h)</li>
        				<li><a className='linkAdvice' href="http://www.eotim.com/Cabinet-de-recrutement-informatique-et-IT-%C3%A0-Paris-et-Caen/eotips-38-le-pitch-mail-ou-la-nouvelle-lettre-de-motivation-1493214324657.html" target="astuces" /*onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : postuler - pitch')"*/>Écrire un bon pitch mail</a></li>
	                </ul>
		            <p className='titleAdvice'>Des conseils d'expert en vidéo</p>
        			<ul style={{listStyleType:'none'}}>
	                	<li className='textAdvice'><a className='linkAdvice' href="http://www.academyk.org/ecrire-une-lettre-de-motivation-percutante-mc40.html" target="lmp" /*onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : postuler - LM percutante')"*/>Écrire une lettre de motivation percutante</a> (5min)</li>
	                	<li className='textAdvice'><a className='linkAdvice' href="http://www.academyk.org/bien-communiquer-par-email-avec-un-recruteur-mc5.html?_=46554036" target="email" /*onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : postuler - communiquer')"*/>Bien communiquer par e-mail avec un recruteur</a> (4min)</li>
	                </ul>
		            <p className='titleAdvice'>Partez sur un modèle efficace</p>
	        		<ul style={{listStyleType:'none'}}>
	                	<li><a className='linkAdvice' href="https://www.emploi-store.fr/portail/services/outilDeCreationDeCvDesignPdfGratuit" target="cvDesign" /*onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : postuler - CV design')"*/>CV DesignR</a> / <a className='linkAdvice' href="https://www.canva.com/fr_fr/creer/cv/" target="canva">Canva</a></li>
	                	<li><a className='linkAdvice' href="https://www.emploi-store.fr/portail/services/emailEtLettreDeMotivation" target="lm" /*onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : postuler - modèles')"*/>Modèles de lettres de motivation à personnaliser</a></li>
	                </ul>
					<p className='titleAdvice'>Pour aller plus loin</p>
					<ul style={{listStyleType:'none'}}>
						<li className='textAdvice'><a className='linkAdvice' href="https://www.emploi-store.fr/portail/services/glassdoor" target="cvpe" /*onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : postuler - glassdoor')"*/>Les avis des employés de l’entreprise </a>(Glassdoor)</li>
						<li className='textAdvice'><a className='linkAdvice' href="https://www.emploi-store.fr/portail/services/quiConsulteVotreCv" target="cvpe" /*onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : postuler - tilkee')"*/>Qui consulte votre CV ? </a>(Tilkee)</li>
					</ul>
					
        		</div>;


        return {text,title};
    }

    render()
    {
    	let content = this.getContent();
    	 
    	let buttons = [
            {
             text:"J'ai postulé",
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
export default CandidatureApplyForModal;