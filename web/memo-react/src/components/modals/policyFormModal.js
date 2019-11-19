import React, { Component } from 'react';
import ReactModal from 'react-modal';
import Spinner from '../spinner.js';
import Tippy from '@tippy.js/react';
import { Link } from "@reach/router"
import Moment from 'moment';
import { MEMO } from '../../index.js';


class PolicyFormModal extends Component{

    
    getModalBody()
    {
        return this.getForm();
    }

    getForm()
    {
        let res="";

        res =   <div>
                    <div className='modalText'>Pour utiliser le service MEMO, vous devez accepter <Link to="/privacy" onClick={this.props.handleCloseModal}>la Politique de confidentialité</Link> de MEMO.<br />
                    	Sans ce consentement, vous ne serez pas en mesure d'accéder à l'espace connecté du site MEMO.<br /><br />
                    	Voici les informations recueillies par le site MEMO :<br />
                    	<ul>
                        	<li>Contenu de votre tableau de bord</li>
                        	<li>Données relatives à votre compte MEMO (coordonnées, dates de connexion)</li>
                        	<li>Données relatives à votre compte Pôle emploi connect (coordonnées, rome d'inscription...)</li>
                        			<li>Données relatives à votre navigateur</li>
                        </ul>
                        Par ailleurs MEMO dépose des cookies nécessaires au bon fonctionnement du site :<br />
                        <ul>
                        	<li>Un cookie d'authentification pour vous permettre de vous reconnecter plus facilement</li>
                        	<li>des cookies techniques pour permettre l'enregistrement de vos préférences ou de l'état de votre interface</li>
                        	<li>des cookies de mesure d'audience via le site Google analytics</li>
                        </ul>
                        <br />
                        Toutes ces informations ont pour but d'assurer le bon fonctionnement du site et nous permettent également d'améliorer l'intérêt et l'ergonomie de nos services
                        <br /><br />
                        Pôle emploi et MEMO s'engagent à ne pas communiquer vos données à des organismes tiers.
                        <br /><br />
                    </div>    
                     
                   {this.getButtons()}              
                </div>

        return res;
    }

    getButtons()
    {
        let res="";
        
        res = <div className='modalActions'>
        		<button type="button" onClick={this.onAccept}>J'accepte</button>
        		<button type="button" onClick={this.onDeny} className="btn dark btn-outline">Je refuse (MEMO ne sera pas accessible)</button>
        	  </div>
        
        return res;
    }
    
    onAccept = e => 
    {
        this.props.onChangeConsent(true);
        //ga('send', { hitType : 'event', eventCategory : 'Privacy', eventAction : 'acceptedPolicy' });
        window.gtag('event', 'acceptedPolicy', { event_category: 'Privacy', event_label : 'Footer badge' });
    }

    onDeny = e => 
    {
        this.props.onChangeConsent(false);
        //ga('send', { hitType : 'event', eventCategory : 'Privacy', eventAction : 'deniedPolicy' });
        window.gtag('event', 'deniedPolicy', { event_category: 'Privacy', event_label : 'Footer badge' });
    }
    
    render()
    {        
        return <ReactModal isOpen={this.props.showConsentModal}
                        contentLabel=""
                        appElement={document.getElementById('root')}
                        className="Modal policy"
                        shouldCloseOnOverlayClick={false}
                        overlayClassName="Overlay"
                >
                {/*this.getCloseButton("cross")*/}
                <div className='modalTitle'>Accepter la politique de confidentialité</div>
                {this.getModalBody()}
            </ReactModal>
    }
}
export default PolicyFormModal;