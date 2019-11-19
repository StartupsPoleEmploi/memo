import React, { Component } from 'react';
import Header from '../../components/header.js';
import Breadcrumb from '../../components/breadcrumb.js';
import AdviceMoreInformationModal from './adviceMoreInformationModal.js'

class AdvicePage extends Component{

	constructor(props)
    {
        super(props);
        this.state = { showMoreInformation:false,
        			   adviceInformation:null,
        			   modalFormLoading:false
        };
    }
	
    render()
    {
		window.gtag('event', 'ouverture', { event_category: 'Conseils' }); 
		
		return <div className='advicePage'>
		            <Header {...this.props} page="advice" />
		            <Breadcrumb {...this.props} page="advice" />
		
		           	<AdviceMoreInformationModal showModal={this.state.showMoreInformation} advice={this.adviceInformation} formLoading={this.state.modalFormLoading} handleCloseModal={this.handleCloseModal} />
				
		            	
		        	<div className='adviceBackground'>
		    			<div className='adviceContainer'>
		    				<h1 align="center">Notre sélection de conseils pour votre recherche d'emploi</h1>
				            <div className="row">
								<div className="col-md-12 col-xs-12">
									<h2>Réussir vos candidatures spontanées</h2>
									<p>80% des recrutements se font hors offres d’emploi, la
										candidature spontanée est un excellent moyen d’accéder aux
										opportunités qui ne sont pas visibles sur le marché du travail.
										Découvrez comment optimiser vos candidatures spontanées.</p>
									<div align="center">
										<button type="button" className="blueButton" onClick={this.onMoreInformationAdvice1}>En savoir plus</button>
									</div>
									
									<hr width="100%" />
										
									<h2>Mobiliser votre réseau relationnel</h2>
									<p>Le réseau est le meilleur levier pour accélérer votre
										retour à l’emploi. Nous avons sélectionné pour vous les conseils
										pour créer, développer et entretenir votre réseau relationnel.</p>
									<div align="center">
										<button type="button" className="blueButton" onClick={this.onMoreInformationAdvice2}>En savoir plus</button>
									</div>
									
									<hr width="100%" />
				
									<h2>Répondre aux offres d’emploi</h2>
									<p>Retrouvez les conseils et outils pour répondre aux offres,
										créer vos CV et vos lettres de motivation.</p>
									<div align="center">
										<button type="button" className="blueButton" onClick={this.onMoreInformationAdvice3}>En savoir plus</button>
									</div>
									
									<hr width="100%" />
				
									<h2>Relancer les recruteurs</h2>
									<p>La relance de vos candidatures peut être déterminante dans
										un processus de recrutement. C’est le moyen pour vous de
										réaffirmer votre motivation auprès du recruteur.</p>
									<div align="center">
										<button type="button" className="blueButton" onClick={this.onMoreInformationAdvice4}>En savoir plus</button>
									</div>
									
									<hr width="100%" />
				
									<h2>Réussir vos entretiens d’embauche</h2>
									<p>La réussite d’un entretien d’embauche passe par une bonne
										préparation. Nous vous proposons de découvrir les conseils
										d’Yves Gautier (coach emploi).</p>
									<div align="center">
										<button type="button" className="blueButton" onClick={this.onMoreInformationAdvice5}>En savoir plus</button>
									</div>
									
								</div>
							</div>
						</div>
					</div>
				</div>
    }
    
    onMoreInformationAdvice1 = () => {
        this.adviceInformation = "advice1"; 
        this.setState( { showMoreInformation : true });
    }

    onMoreInformationAdvice2 = () => {
        this.adviceInformation = "advice2"; 
        this.setState( { showMoreInformation : true });
    }
    
    onMoreInformationAdvice3 = () => {
        this.adviceInformation = "advice3"; 
        this.setState( { showMoreInformation : true });
    }
    
    onMoreInformationAdvice4 = () => {
        this.adviceInformation = "advice4"; 
        this.setState( { showMoreInformation : true });
    }
    
    onMoreInformationAdvice5 = () => {
        this.adviceInformation = "advice5"; 
        this.setState( { showMoreInformation : true });
    }
    
    handleCloseModal= e => {
        if(e)
            e.stopPropagation();

        this.setState( { showMoreInformation : false});
    }

}
export default AdvicePage;