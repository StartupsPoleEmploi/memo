import React, { Component } from 'react';
import { navigate  } from "@reach/router";
import Tippy from '@tippy.js/react';
import { getNextActionAdvice } from '../../actions/nextEvents.js';
import { Constantes as CS } from '../../constantes.js';
import '../../css/dashboard.css';
import { saveCandidatureFavorite } from '../../actions/candidatureActions.js';
import { userStore, MEMO } from '../../index.js';

import Button from '../../components/button.js';

class DashboardCard extends Component{

    

    shouldComponentUpdate(nextProps, nextState) 
    {
        if(this.props.candidature.id==MEMO.forceCandidatureUpdate)
        {
            MEMO.forceCandidatureUpdate = null;
            return true; 
        }

        //console.log(this.props.candidature.id, ' -- NP :',nextProps.openedMenu,' -- TP ', this.props.openedMenu, ' -- NS ', nextState, ' -- TS ', this.state);
        /*if (!isEqual(this.state,nextState))               commenté suite à déplacement des modales
            return true;*/
        
        if(this.props.openedMenu)
        {
            //this.props.openedMenu existe et this.props.openedMenu concerne this.props.candidature et  ( nextProps.openedMenu n'existe pas || nextProps.openedMenu concerne autre candidature)
            if(this.props.openedMenu.id === this.props.candidature.id
                && (
                    !nextProps.openedMenu ||
                    nextProps.openedMenu.id !== this.props.candidature.id
                ))
            {
                return true;
            }
            //this.props.openedMenu existe et this.props.openedMenu concerne autre candidature et nextProps.openedMenu existe et nextProps.openedMenu concerne this.props.candidature
            else if (this.props.openedMenu.id !== this.props.candidature.id
                        && nextProps.openedMenu
                        && nextProps.openedMenu.id === this.props.candidature.id )
            {
                return true;
            }
        }
        else
        {
            //this.props.openened menu n'existe pas et nextProps.openedMenu existe et nextProps.openedMenu.candidature = this.props.candidature != nextProps.openedMenu )
            if(nextProps 
                && nextProps.openedMenu 
                && nextProps.openedMenu.id === this.props.candidature.id )
            {
                //console.log("Update 2");
                return true;
            }
        }
        
       return false;
    }

    toggleMenu = e =>
    {
        e.stopPropagation();
        this.props.onToggleMenu(this.props.candidature);
    }

    closeMenu()
    {
        this.props.onToggleMenu(null);
    }

    toggleFavorite = e =>
    {
        if(!this.props.isVisitor)
        {
            if(e)
                e.stopPropagation();

            let c = this.props.candidature;
            c.rating = c.rating?0:1;
            this.saveCandidatureFavorite(c);
        }
    }

    // construit le bloc de date de la carte
    getCardDate()
    {
        const c = this.props.candidature;
        let dt = "";

        switch(eval(c.etat))
        {
            case CS.ETATS.VA_POSTULER : {
                if(c.creationDate)
                    dt = <div className='dashboardCardDate'><i className='far fa-clock'></i>Créé le {c.creationDate.format("DD MMM YY")}</div>;
                break;
            }

            case CS.ETATS.A_POSTULE : {
                if(c.lastActivity && c.lastActivity.lastCandidature)
                    dt = <div className='dashboardCardDate'><i className='fa fa-check'></i>Postulé le {c.lastActivity.lastCandidature.format("DD MMM YY")}</div>;
                break;
            }

            case CS.ETATS.A_RELANCE : {            
                if(c.lastActivity && c.lastActivity.lastRelance)
                    dt = <div className='dashboardCardDate'><i className='fa fa-share'></i>Relancé le {c.lastActivity.lastRelance.format("DD MMM YY")}</div>;
                break;
            }

            case CS.ETATS.ENTRETIEN : {
                if(c.nextEntretien)
                    dt = <div className='dashboardCardDate'><i className='fa fa-comment-dots'></i>Prévu le {c.nextEntretien.format("DD MMM YY")} à {c.nextEntretien.format("HH:mm")}</div>;
                break;
            }

            default: break;
        }
        
        return dt;
    }

    // construit le bouton de mise en favori
    getFavoriteButton()
    {
        return <div className='dashboardCardFavorite' onClick={this.toggleFavorite}><i className={this.props.candidature.rating?'fa fa-star':'far fa-star'}></i></div>
    }

    // construit le menu d'action en mode ouvert
    getOpenedMenu()
    {
        return <div className='dashboardCardActionMenu'>
                <div className='dashboardCardActionMenuHeader'>
                    <div>Actions</div>
                    <div>
                        <Tippy content="Fermer le menu" animation='shift-toward' placement="right" duration={[0,0]} trigger="mouseenter focus">
                            <i className='fal fa-times' onClick={this.toggleMenu}></i>
                        </Tippy>        
                    </div>
                </div>
                {this.props.isVisitor?<div>
                                        <div className='dashboardCardActionMenuAction' onClick={this.openCandidature}><i className='fal fa-eye'></i> Voir la candidature</div>
                                    </div>:<div>
                                        <div className='dashboardCardActionMenuAction' onClick={this.openCandidature}><i className='fal fa-eye'></i> Voir ou modifier la candidature</div>
                                        <div className='dashboardCardActionMenuAction' onClick={this.openMoveCandidature}><i className='far fa-arrows-alt'></i> Déplacer la carte</div>
                                        <div className='dashboardCardActionMenuAction' onClick={this.openWinModal}><i className='fal fa-check-circle'></i> Candidature acceptée</div>
                                        <div className='dashboardCardActionMenuAction' onClick={this.openLostModal}><i className='fal fa-times-circle'></i> Candidature refusée</div>
                                        {this.props.candidature.archived?<div className='dashboardCardActionMenuAction' onClick={this.openRestoreCandidature}><i className="fal fa-trash-restore"></i> Restaurer la carte</div>:<div className='dashboardCardActionMenuAction' onClick={this.openArchiveCandidature}><i className='far fa-folder-open'></i> Archiver la carte</div>}
                                    </div>}
        </div>;
    }

    getCardInfo()
    {
        const c = this.props.candidature;

        let logo = "";
        if(c.logoUrl)
            logo = <img src={c.logoUrl} />;

        let nomSociete = "";
        if(c.nomSociete)
            nomSociete =  <div className='dashboardCardInfo'>
                            <i className='fal fa-building'></i> 
                            {c.nomSociete}
                        </div>;
        
        let ville = "";
        if(c.ville)
            ville =  <div className='dashboardCardInfo'>
                        <i className='fal fa-map-marker-alt'></i> 
                        {c.ville}
                    </div>;         
                    
        let telContact = "";
        if(c.telContact)
            telContact =  <div className='dashboardCardInfo'>
                        <i className='fas fa-mobile-alt'></i> 
                        {c.telContact}
                    </div>;                     

        return <div className='row'>        
                    <div className={logo?'col-xs-6 dashboardCardInfoLeft':'col-xs-12'}>
                        {nomSociete}
                        {ville}
                        {telContact}
                    </div>
                    {logo?<div className='col-xs-6 dashboardCardInfoRight'>
                        {logo}
                    </div>:''}        
                </div>;
    }

    buildCardContent()
    {
        let oM = this.props.openedMenu,
            c = this.props.candidature;
        if(oM && oM.id === c.id)
            return this.getOpenedMenu();
        else
            return this.getCardInfo();
    }
    
    getAction()
    {
        let c = this.props.candidature;
        let nextAction = (c)?getNextActionAdvice(c):"";
        
        return <div className='col-xs-8'>
        			{(nextAction && nextAction.type) ? 
        					(<div className='dashboardCardAdvisedAction'>
        						<Button title={nextAction.title} className={'buttonCardAdvice'+(this.props.isVisitor?' isVisitor':'')} 
        								srOnly={nextAction.title}
        								onClick={this.openAction} />
        					</div>) 
        			: ''}
               </div>;
    }
    
    openAction = e =>
    {
        if(e)
            e.stopPropagation();

        if(!this.props.isVisitor)
    	{
            let nextAction = getNextActionAdvice(this.props.candidature);

            switch (nextAction && nextAction.type)
            {
                case CS.TYPES_ADVICE.ARCHIVER :
                {
                    this.openArchiveCandidature();
                    break;
                }
                case CS.TYPES_ADVICE.RELANCER_CANDIDATURE :
                {
                    this.openRelaunchCandidature();
                    break;
                }
                case CS.TYPES_ADVICE.POSTULER :
                {
                    this.openApplyForCandidature();
                    break;
                }
                case CS.TYPES_ADVICE.PREPARER_ENTRETIEN :
                {
                    this.openPrepareInterview();
                    break;
                }
                case CS.TYPES_ADVICE.RELANCER_ENTRETIEN :
                {
                    this.openRelaunchInterview();
                    break;
                }
                case CS.TYPES_ADVICE.REMERCIER :
                {
                    this.openThankTo();
                    break;
                }
                default : {break}; 
            }
        }
    }

    getMenuButton()
    {
        return <div className='col-xs-4'>
                    <Tippy content="Plus d'actions" animation='shift-toward' placement="right" duration={[0,0]} trigger="mouseenter focus">
                        <div onClick={this.toggleMenu} className='dashboardCardMenu'>...</div>
                    </Tippy>                    
                </div>;
    }

    openCandidature = e => 
    {
        if(e)
            e.stopPropagation();
        this.closeMenu();
        navigate('/dashboard/candidature/'+this.props.candidature.id);        
    }
    
    

    saveCandidatureFavorite = c => {
        saveCandidatureFavorite(c)
            .then(response => response.json() )
            .then(response => {
                if(response.result=="ok")
                {
                    MEMO.forceCandidatureUpdate = c.id;
                    userStore.dispatch({type:'UPDATE_CANDIDATURE', candidature:c});
                }
                else
                {
                    console.log("TODO : gérer error d'update event ",response.result.error);    
                }                                    
                } )
            .catch( msg => {
                console.log("TODO: traitement d'erreur ",msg);
                //MEMO.utils.manageError( msg );
            })
    }

    render()
    {
        //console.log("CARD ",this.props.candidature.nomCandidature);
        const c = this.props.candidature;
        return <div className={'dashboardCard'+(this.props.isDragging?' dashboardCardBeingDragged':'')}>
            <div className='dashboardCardContent' onClick={this.openCandidature}>
                {this.getCardDate()}
                {this.getFavoriteButton()}
                <div className="dashboardCardName">{c.nomCandidature}</div>
                {this.buildCardContent()}             
            </div>   
            <div className='row dashboardCardActions'>
                {this.getMenuButton()}
                {this.getAction()}
            </div>
            
      </div>
    }

    openMoveCandidature = e => 
    {
        if(e)
            e.stopPropagation();
        this.closeMenu();
        this.props.openMoveCandidature(this.props.candidature);
    }
    
    openWinModal = e => 
    {
        if(e)
            e.stopPropagation();
        this.closeMenu();
        this.props.openWinModal(this.props.candidature);
    }

    openLostModal = e => 
    {
        if(e)
            e.stopPropagation();
        this.closeMenu();
        this.props.openLostModal(this.props.candidature);
    }
    
    openArchiveCandidature = e => 
    {
    	if(e)
            e.stopPropagation();
        this.closeMenu();
        this.props.openArchiveCandidature(this.props.candidature);
    }

    openRelaunchCandidature = () => 
    {
        this.closeMenu();
        this.props.openRelaunchCandidature(this.props.candidature);
    }

    openApplyForCandidature = () => 
    {
        this.closeMenu();
        this.props.openApplyForCandidature(this.props.candidature);
    }

    openPrepareInterview = () => 
    {
        this.closeMenu();
        this.props.openPrepareInterview(this.props.candidature);
    }

    openRelaunchInterview = () => 
    {
        this.closeMenu();
        this.props.openRelaunchInterview(this.props.candidature);
    }

    openThankTo = () => 
    {
        this.closeMenu();
        this.props.openThankTo(this.props.candidature);
    }

    openRestoreCandidature = e => 
    {
        if(e)
            e.stopPropagation();
        this.closeMenu();
        this.props.openRestoreCandidature(this.props.candidature);
    }
    
    
}
export default DashboardCard