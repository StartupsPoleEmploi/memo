import React, { Component } from 'react';
import Modal from '../../../components/modal.js';

class CandidaturePrepareInterviewModal extends Component{

    getSearchLinkForCity(city) 
    {
    	let res = "";
    	
    	if(city) 
    		res = "https://www.google.fr/maps/dir/" + city;
    	
    	return res;
    }
    
	getContent()
    {
        let text='', title='';
        let city = this.props.candidature?this.props.candidature.ville:"";

		title="Se Préparer";
    	// @RG - CONSEIL : Dans le conseil 'Se préparer', le lien 'préparez votre trajet ici' est affiché si le lieu de la société est renseigné
        text =  <div>
        			<p><b>Apprenez à vous vendre pour assurer pendant l'entretien</b></p>
        			{(city)?(<p className='textAdvice'>"Rien ne sert de courir, il faut partir à point" : la préparation de votre entretien commence dès votre porte : <a className='linkAdvice' href={this.getSearchLinkForCity(city)} target='itineraire'>Préparez votre trajet ici</a></p>):''}
        			<p><b>Comment vous y prendre ?</b></p>

        			<p className='titleAdvice'>Apprendre en ligne les incontournables : </p>

	                <ul style={{listStyleType:'none'}}>
						<li className='textAdvice'><a className='linkAdvice' href="http://www.emploi-store.fr/portail/services/bABaEntretien" target="baba" /*onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : preparer - B.A BA')"*/>B.A BA de l'entretien</a> (20min)</li>
	                </ul>
					<p className='titleAdvice'>Testez-vous :</p>
	                <ul style={{listStyleType:'none'}}>
						<li className='textAdvice'><a className='linkAdvice' href="http://www.emploi-store.fr/portail/services/monEntretienVirtuel" target="entretienVirtuel" /*onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : preparer - simulateur')"*/>Simulateur - Mon entretien virtuel</a> (45min)</li>
						<li className='textAdvice'><a className='linkAdvice' href="http://www.emploi-store.fr/portail/services/monEntretienDEmbauche" target="entretienEmbauche" /*onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : preparer - serious game')"*/>Serious game - Mon entretien d'embauche</a> (45min)</li>
						<li className='textAdvice'><a className='linkAdvice' href="http://www.emploi-store.fr/portail/services/meteojobMonEntretienDEmbauche" target="meteoJobEntretien" /*onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : preparer - quiz entretien')"*/>Quiz - Mon entretien d’embauche</a> (15min)</li>
						<li className='textAdvice'><a className='linkAdvice' href="http://www.emploi-store.fr/portail/services/commentSHabillerPourUnEntretien#" target="habits" /*onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : preparer - quiz s\'habiller')"*/>Quiz - S’habiller pour un entretien</a> (5min)</li>
	                </ul>
	                <p className='titleAdvice'>Des conseils d'experts en vidéo :</p>
	                <ul style={{listStyleType:'none'}}>
						<li className='textAdvice'><a className='linkAdvice' href="http://www.academyk.org/entretien-de-recrutement-adoptez-la-bonne-attitude-mc7.html" target="attitude" /*onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : preparer - bonne attitude')"*/>Adoptez la bonne attitude en entretien</a> (5min)</li>
	                </ul>
	                <p className='titleAdvice'>Inspirez-vous de la communauté :</p>
	                <ul style={{listStyleType:'none'}}>
						<li><a className='linkAdvice' href="http://www.emploi-store.fr/portail/services/glassdoor" target="question" /*onclick="lBR.logEventToGA('event', 'Candidature', 'nextAction', 'Site externe : preparer - questions en entretien')"*/>Questions posées lors des entretiens</a></li>
	                </ul>

        		</div>;


        return {text,title};
    }

    render()
    {
    	let content = this.getContent();
    	 
    	let buttons = [
            {
             text:"J'ai préparé",
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
export default CandidaturePrepareInterviewModal;