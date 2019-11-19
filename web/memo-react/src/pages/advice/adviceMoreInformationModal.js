import React, { Component } from 'react';
import Modal from '../../components/modal.js';


class AdviceMoreInformationModal extends Component{
    
    constructor(props)
    {
        super(props);
    }

    getContent()
    {
    	let res = '';
    	
		switch(this.props.advice)
		{
			case 'advice1' : 
			{
				res = this.getAdvice1();
				break;
			}
			case 'advice2' : 
			{
				res = this.getAdvice2();
				break;
			}
			case 'advice3' : 
			{
				res = this.getAdvice3();
				break;
			}
			case 'advice4' : 
			{
				res = this.getAdvice4();
				break;
			}
			case 'advice5' : 
			{
				res = this.getAdvice5();
				break;
			}
			default : {}
		}
		
		return res;
    }
    
    getAdvice1() 
    {
    	let text='', title="Réussir vos candidatures spontanées";
		
			text = <div className='adviceModal'>
				<p>Le réseau est le meilleur levier pour accélérer votre
					retour à l’emploi. Nous avons sélectionné pour vous les
					meilleurs conseils pour créer, développer et entretenir votre
					réseau relationnel.</p>
			
				<h3 className='titleAdviceMoreInformation'>La bonne boîte</h3>
				
				<p>
					Avez la Bonne boîte, <strong>envoyez votre CV à la 
					bonne entreprise ! Découvrez en un clic les entreprises qui 
					recrutent dans votre métier, près de chez vous.</strong>
				</p>
				<p>
					Sur la base d’algorithmes statistiques évolués, La Bonne Boite 
					vous restitue <strong>une liste d’entreprises ayant une 
					forte probabilité d’embaucher dans les 6 mois à venir.</strong>
				</p>
				<p>
					Mieux qu’un annuaire, La Bonne Boîte cible pour vous
					uniquement les entreprises n’ayant que des perspectives élevées
					d’embauche. Utiliser ce nouveau service va vous permettre d’<strong>
					être plus efficace dans vos démarches spontanées</strong>, en limitant
					l’envoi aléatoire de candidature, en limitant les retours
					négatifs et en augmentant vos chances de décrocher un entretien
					d’embauche. 
				</p>
				<p>Découvrez la vidéo de présentation du service : <a href="https://www.youtube.com/watch?v=qi8waDE9dMY">ici</a></p>
				<div className='linkButton'>
					<a className="blueButton" href="https://labonneboite.pole-emploi.fr/"
						target="_blank">Lancer La Bonne Boîte</a>						
				</div>
			
				<hr width="80%" />
			
				<h3 className='titleAdviceMoreInformation'>La candidature spontanée, comment s'y prendre</h3>
				<p>Découvrez les conseils proposés par Hymane Ben Aoun, fondatrice du cabinet Aravati (conseils en recrutement).</p>
				<div className='linkButton'>
					<a className="blueButton"
						href="https://www.youtube.com/watch?v=7BoWaohD9zg/"
						target="_blank">Voir la vidéo</a>
				</div>
			</div>;
	
    	return {text,title};
    }
    
    getAdvice2() 
    {
    	let text='', title='';
        
		title="Mobiliser votre réseau relationnel";
		
		text = <div className='adviceModal'>
				
				<p>Le réseau est le meilleur levier pour accélérer votre
					retour à l’emploi. Nous avons sélectionné pour vous les
					meilleurs conseils pour créer, développer et entretenir votre
					réseau relationnel.
				</p>
			
				<h3 className='titleAdviceMoreInformation'>Comment et pourquoi développer son réseau ?</h3>
				<p>Vous pensez que vous n’avez pas de réseau ? C’est une
					erreur ! Découvrez comment et pourquoi développer votre réseau
					relationnel.
				</p>
				<div className='linkButton'>
					<a className="blueButton" href="https://www.youtube.com/watch?v=dh1DfxYVsAw&feature=youtu.be/" target="_blank">Voir la vidéo</a>
				</div>
			
				<hr width="80%" />
			
				<h3 className='titleAdviceMoreInformation'>Faites appel à votre réseau</h3>
				<p>N’hésitez plus à faire appel à votre réseau, une simple
					transmission de votre candidature ou information sur le
					recruteur vous permettra de maximiser vos chances de décrocher
					un emploi.
				</p>
				<div className='linkButton'>
					<a className="blueButton" href="https://youtu.be/NGLRg94aIp4" target="_blank">Voir la vidéo</a>
				</div>
			
				<hr width="80%" />
			
				<h3 className='titleAdviceMoreInformation'>Web Atelier : Focus Réseau</h3>
				<p>Cet atelier en ligne proposé par l'APEC vous permettra de
					mieux saisir ce que signifie concrètement le réseau. Comprenez à
					quoi sert le réseau et comment le développer, Découvrez une
					méthode efficace pour développer des liens.
				</p>
				<div className='linkButton'>
					<a className="blueButton" href="https://cadres.apec.fr/Emploi/Mes-services-Apec/Les-outils-pour-evoluer/Reseaux-mode-d-emploi/Focus-Reseau-la-prise-de-contact" target="_blank">C'est parti !</a>
				</div>
			
				<hr width="80%" />
			
				<h3 className='titleAdviceMoreInformation'>Programme : Maîtriser Linkedin en 7 jours</h3>
				<p>LinkedIn est un outil extrêmement puissant mais difficile
					à maîtriser. Il y a des codes, des façons de faire, des
					fonctionnalités cachées. Ce programme vous propose de découvrir
					tout ça en 7 jours.
				</p>
				<div className='linkButton'>
					<a className="blueButton" href="http://www.maitriserlinkedin.com/" target="_blank">C'est parti !</a>
				</div>
			
				<hr width="80%" />
			
				<h3 className='titleAdviceMoreInformation'>Un outil pour maîtriser votre e-reputation</h3>
				<p>Le site web Nothing To hide vous permet de scanner vos
					réseaux sociaux et voir ce que les recruteurs peuvent découvrir
					sur vous !
				</p>
				<div className='linkButton'>
					<a className="blueButton" href="https://www.nothing-to-hide.fr/" target="_blank">C'est parti !</a>
				</div>
			</div>;
	
    	return {text,title};
    }
    
    getAdvice3() 
    {
    	let text='', title='';
    	
    	title="Répondre aux offres d’emploi";
		
		text = <div className='adviceModal'>
    	
				<p>Retrouvez les conseils et outils pour répondre aux offres, créer vos CV et vos lettres de motivation</p>
			
				<h3 className='titleAdviceMoreInformation'>Les conseils pour postuler à une offre</h3>
			
				<p>Vous avez repéré une offre qui vous intéresse ? Découvrez les conseils d’'Amandine Laforge, Consultante en évolution professionnelle.</p>
						
				<div className='linkButton'>
					<a className="blueButton" href="https://www.youtube.com/watch?v=mXmgFWd3XW0" target="_blank">Voir la vidéo</a>
				</div>
			
				<hr width="80%" />
			
				<h3 className='titleAdviceMoreInformation'>CVDesignR : service web pour créer facilement votre CV</h3>
			
				<p>CVDesignR est un outil en ligne gratuit de création de CV format PDF, avec des modèles classiques et design, pour faire rapidement votre CV vous-même.</p>
				<div className='linkButton'>
					<a className="blueButton" href="https://cvdesignr.com/fr" target="_blank">C'est parti !</a>
				</div>
			
				<hr width="80%" />
			
				<h3 className='titleAdviceMoreInformation'>Himp : service web pour créer votre lettre ou email de motivation en quelques clics</h3>
			
				<p>Himp.com vous propose un assistant pour la création de vos documents de candidature. </p>
				<p> Ce service vous propose des exemples de phrases d’accroche, points forts, valeurs ajoutées, demandes d’entretien et formules de politesse à personnaliser pour chacune de vos candidatures !</p>	
				<p>Une fonction
					"feedback" est également intégrée à votre tableau de bord pour
					obtenir facilement un avis sur votre document avant de l'envoyer
					au recruteur. Rédiger son email ou sa lettre de motivation n’a
					jamais été aussi simple !
				</p>
				<p>Voir la vidéo de présentation : <a href="https://www.youtube.com/watch?v=iggNDbJsB3E">ici</a></p>
				<div className='linkButton'>
					<a className="blueButton" href="https://www.himp.com/" target="_blank">C'est parti !</a>
				</div>
			
				<hr width="80%" />
			
				<h3 className='titleAdviceMoreInformation'>Les 10 règles d’or pour écrire un CV parfait</h3>
			
				<p>Découvrez les conseils clés d’Yves Gautier, coach emploi et entretiens d’embauche :</p>
				
				<div className='linkButton'>
					<a className="blueButton" href="https://www.youtube.com/watch?v=HIKOmU455vE&t=" target="_blank">Voir la vidéo</a>
				</div>
		</div>;
	
    	return {text,title};
    }
    
    getAdvice4() 
    {
    	let text='', title='';
    	
    	title="Relancer les recruteurs";
		
		text = <div className='adviceModal'>
				<p>La relance de vos candidatures peut être déterminante dans un processus de recrutement. C’est le moyen pour vous de réaffirmer votre motivation auprès du recruteur.</p>
			
				<h3 className='titleAdviceMoreInformation'>L’art de relancer ses candidatures</h3>
				<p>Quand et comment relancer ses candidatures ? Découvrez les conseils de Thomas BALIGAND, consultant APEC.</p>
				<div className='linkButton'>
					<a className="blueButton" href="https://blog-experts.cadres.apec.fr/2014/10/06/lart-de-relancer-ses-candidatures/" target="_blank">C'est parti !</a>
				</div>
			
				<hr width="80%" />
			
				<h3 className='titleAdviceMoreInformation'>Comment relancer sans harceler ?</h3>
				<p>Cet article vous permettra de comprendre comment faire de la relance un réel atout pour votre candidature.</p>
				<div className='linkButton'>
					<a className="blueButton"
						href="https://www.cadremploi.fr/editorial/conseils/conseils-candidature/detail/article/candidature-relancer-sans-harceler.html"
						target="_blank">C'est parti !</a>
				</div>
			
				<hr width="80%" />
			
				<h3 className='titleAdviceMoreInformation'>HIMP : Service web pour rédiger facilement vos mails de relance</h3>
				<p>Himp.com vous propose un assistant pour la création de vos lettres et mails de motivation ainsi que vos mails de relance.</p>
				<p>Voir la vidéo de présentation : <a href="https://www.youtube.com/watch?v=iggNDbJsB3E">ici</a></p>
				<div className='linkButton'>
					<a className="blueButton" href="https://www.himp.com/" target="_blank">C'est parti !</a>
				</div>
			</div>;
			
		return {text,title};
    }
    
    getAdvice5() 
    {
    	let text='', title='';
    	
    	title="Réussir vos entretiens d’embauche";
		
			text = <div className='adviceModal'>
					<p>La réussite d’un entretien d’embauche passe par une bonne préparation. Nous vous proposons de découvrir les conseils d’Yves Gautier (coach emploi)</p>
				
					<h3 className='titleAdviceMoreInformation'>Les meilleurs conseils pour réussir un entretien d’embauche</h3>
					<p>Les 30 conseils d’Yves Gautier pour préparer au mieux votre entretien d’embauche.</p>
					<div className="linkButton">
						<a className="blueButton" href="https://www.youtube.com/watch?v=uXHp0EyXvlg" target="_blank">Voir la vidéo</a>
					</div>
				
					<hr width="80%" />
				
					<h3 className='titleAdviceMoreInformation'>Conseils pour préparer votre entretien téléphonique</h3>
					<p>L’entretien de recrutement téléphonique a ses spécificités, découvrez comment préparer au mieux cet échange.</p>
					<div className="linkButton">
						<a className="blueButton" href="https://www.youtube.com/watch?v=7wIqPzr4v_w" target="_blank">Voir la vidéo</a>
					</div>
				
					<hr width="80%" />
				
					<h3 className='titleAdviceMoreInformation'>Conseils pour préparer votre entretien Skype</h3>
					<p>Les recruteurs ont de plus en plus recours à l’entretien Skype. Yves Gautier vous donne les points clés pour mettre toutes les chances de votre côté.</p>
					<div className="linkButton">
						<a className="blueButton" href="https://www.youtube.com/watch?v=-sGEgy6l6l8" target="_blank">Voir la vidéo</a>
					</div>
				</div>;
		
			return {text,title};
    }
    
    render()
    {        
    	let content = this.getContent();
    	
    	return <Modal  
			        title={content.title} 
			        text={content.text}
			        closeText="Fermer"
			        disableOverlayClickClose={true}
			        formLoading={this.props.formLoading}
			        errorMsg={this.props.errorMsg}
			        showModal={this.props.showModal}
							disableClose={this.props.disableClose}
			        handleCloseModal={this.props.handleCloseModal} />;
    }
}
export default AdviceMoreInformationModal;