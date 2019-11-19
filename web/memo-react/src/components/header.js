import React, { Component } from 'react';
import { DropdownMenu, MenuItem } from 'react-bootstrap-dropdown-menu';
/*import { slide as Menu } from 'react-burger-menu'*/
import Button from './button.js'
import logoMemo from '../pic/logo_memo.png';
import logoPE from '../pic/logos/pe.png';
import { MEMO } from '../index.js';
import ShareModal from './modals/shareModal';
import { navigate } from '@reach/router';
import '../css/header.css';

class Header extends Component{

    constructor(props)
    {
        super(props)
        this.state = {
            showShareModal : false
        }
    }

    getHeaderButtons()
    {
        let res = "";
        if(!this.props.user)    // header pas connecté
        {   
            res = <Button title="Se connecter" 
                                className='headerConnectButton' 
                                srOnly="Ouvrir la page pour se connecter à son compte utilisateur MEMO"
                                onClick={(evt)=>{MEMO.openConnectionPage(evt);}} />;
        }
        else    // header connecté
        {
            res = <div className='headerButtons'>
                    <div className='headerBoundary hidden-xs' />
                    
                    {this.getDashboardButton()}

                    {this.getArchiveButton()}

                    {this.getAdviceButton()}

                    {this.getActionButton()}
                    
                    <div className='headerMenuContainer'>

                        {this.getMenu()}
                        <div className='headerBoundary hidden-xs hidden-sm' />

                    </div>
                    
                </div>;
        }
        return res;
    }

    getMenu()
    {
        return <div className='headerMenuBt'>
                <DropdownMenu position="left" triggerType="icon" trigger="glyphicon glyphicon-menu-hamburger" >
                    <div className='headerMenuUser'>
                        <i className='fa fa-user' />
                        {this.props.user.lastName?(this.props.user.firstName+' '+this.props.user.lastName):this.props.user.login}
                    </div>

                    <hr />
                    
                    <div className="headerMenuLink visible-xs" >
                        <Button title="Nos conseils" 
                                icon="far fa-lightbulb" 
                                srOnly="Cliquer sur ce bouton pour accéder à la page des conseils de MEMO"  
                                onClick={ (evt)=>{this.closeMenu();MEMO.openAdvicePage(evt);}} />
                    </div>

                    {!this.props.isVisitor?<div className="headerMenuLink">
                        <Button title="Ajouter une candidature" 
                                icon="fas fa-plus-circle" 
                                srOnly="Cliquer sur ce bouton pour ouvrir le formulaire d'ajout d'une nouvelle candidature"
                                onClick={(evt)=>{this.closeMenu();MEMO.openNewCandidature(evt);}} />
                    </div>:""}

                    {!this.props.isVisitor?<div className="headerMenuLink">
                        <Button title="Partager son tableau de bord" 
                                icon="fas fa-share-alt"
                                srOnly="Cliquer sur ce bouton pour obtenir un lien de partage du tableau de bord"
                                onClick={(evt)=>{this.closeMenu();this.openSharePage(evt);}} />
                    </div>:""}
                    
                    <hr />
                    
                    <div className="headerMenuLink visible-xs visible-sm">
                        <Button title="Tableau de bord"
                            icon="fas fa-home" 
                            srOnly="Cliquer sur ce bouton pour accéder à la page de vos candidatures actives"  
                            onClick={ (evt)=>{this.closeMenu();MEMO.openDashboardPage(evt);}} />
                    </div>

                    <div className="headerMenuLink visible-xs visible-sm">
                        <Button title="Candidatures terminées" 
                                icon="far fa-folder-open"
                                srOnly="Cliquer sur ce bouton pour accéder à la page de vos candidatures archivées"  
                                onClick={ (evt)=>{this.closeMenu();MEMO.openArchivePage(evt);}} />
                    </div>

                    <div className="headerMenuLink visible-xs" >
                        <Button title="Mes actions" 
                                icon="far fa-check-circle" 
                                srOnly="Cliquer sur ce bouton pour accéder à la page de vos actions"  
                                onClick={ (evt)=>{this.closeMenu();MEMO.openActionPage(evt);}} />        
                    </div>

                    {!this.props.isVisitor?<div className="headerMenuLink" >
                        <Button title="Paramètres" 
                                icon="fa fa-cog" 
                                srOnly="Cliquer sur ce bouton pour accéder à la page des paramètres de votre compte MEMO"  
                                onClick={ (evt)=>{this.closeMenu();MEMO.openParameterPage(evt);}} />        
                    </div>:""}

                    <div className="headerMenuLink" >
                        <Button title="Foire aux questions" 
                                icon="far fa-question-circle" 
                                srOnly="Cliquer sur ce bouton pour ouvrir la foire aux questions"  
                                onClick={ (evt)=>{this.closeMenu();MEMO.openFAQ(evt);}} />        
                    </div>

                    <hr />

                    <div className="headerMenuLink">
                        <Button title="Se déconnecter" 
                                icon="fas fa-sign-out-alt" 
                                srOnly="Se déconnecter de son compte utilisateur MEMO"
                                onClick={(evt)=>{this.closeMenu();MEMO.disconnect(evt);}} />
                    </div>

                </DropdownMenu>
            </div>
    }

    closeMenu()
    {   // hack pour fermer le menu dans tous les cas
        // sinon le menu ne se ferme pas quand le composant react sous-jacent reste le même
        // ex : Dashboard quand on navigue entre Tableau de bord et Candidatures terminées
        document.getElementById("root").click();
    }

    openSharePage(evt)
    {
        evt.stopPropagation();

        // ajout de l'ouverture de la modale de partage dans l'historique
        // eslint-disable-next-line no-restricted-globals 
        history.pushState({page:"share"},"");
        
        this.setState({showShareModal:true})
    }

    getDashboardButton()
    {
        let res = "";

        if(window.location.pathname.indexOf('candidature')<0 && !this.props.page && this.props.active)
            res = <div className='selectedHeaderBt headerBt hidden-xs'>Tableau de bord</div>
        else
            res = <Button title="Tableau de bord" 
                tooltip="Accéder à la page de vos candidatures actives" 
                className="headerBt hidden-xs hidden-sm" 
                srOnly="Cliquer sur ce bouton pour accéder à la page de vos candidatures actives"  
                onClick={ (evt)=>{MEMO.openDashboardPage(evt);}} />

        return res;
    }

    getArchiveButton()
    {
        let res = "";

        if(!this.props.page && !this.props.active)
            res = <div className='selectedHeaderBt headerBt hidden-xs'>Candidatures terminées</div>
        else
            res = <Button title="Candidatures terminées" 
                tooltip="Accéder à la page de vos candidatures archivées" 
                className="headerBt hidden-xs hidden-sm" 
                srOnly="Cliquer sur ce bouton pour accéder à la page de vos candidatures archivées"  
                onClick={ (evt)=>{MEMO.openArchivePage(evt);}} />
            

        return res;
    }

    getAdviceButton()
    {
        let res ="";

        if(this.props.page!=="advice")
            res = <Button title="Nos conseils" 
                            tooltip="Accéder à la page des conseils de MEMO" 
                            className="headerBt hidden-xs" 
                            srOnly="Cliquer sur ce bouton pour accéder à la page des conseils de MEMO"  
                            onClick={ (evt)=>{MEMO.openAdvicePage(evt);}} />
        else
            res = <div className='selectedHeaderBt headerBt hidden-xs'>Nos conseils</div>

        return res;

    }

    getActionButton()
    {
        let res="";

        if(this.props.page!=="actions")
        {
            res = <div className="headerMyActions">
            	  	<Button title="Mes actions" 
                            tooltip="Accéder à la page de la liste de vos actions faites et à faire" 
                            className="headerBt headerBtMyActions" 
                            srOnly="Cliquer sur ce bouton pour accéder à la page de vos actions"  
                            onClick={ (evt)=>{MEMO.openActionPage(evt);}} />
            	  	{this.props.user.actionsCounter>0?<span className='badge headerBadgeActionsCounter' >{this.props.user.actionsCounter}</span>:''}
            	  </div>
        }
        else
    	{
        	res = <div className='headerMyActions selectedHeaderBt'>
        			<span className='selectedHeaderBt headerBt'>Mes actions</span>
        			{this.props.user.actionsCounter>0?<span className='badge headerBadgeActionsCounter' >{this.props.user.actionsCounter}</span>:''}
        		  </div>
    	}
               

        return res;
    }

    // réaffichage de la modale de partage en fonction de l'historique de navigation
    static getDerivedStateFromProps(nextProps, prevState)
    {
        // eslint-disable-next-line no-restricted-globals
        const h = history.state;

        let state = prevState;

        if(h && h.page && h.page==="share")
            state.showShareModal = true;
        else
            state.showShareModal=false;

        // s'il n'y a pas d'utilisateur --> pas d'affichage de modale possible (navigation dans l'historique après déconnexion)
        if(!nextProps.user)
            state.showShareModal = false;

        return state;
    }

    render()
    {
        return <header>
                <div className='headerContent'>
                    <div id='logoSmall' className='logoSmall'>
                        <img src={logoMemo} alt='Logo MEMO' />
                    </div>
                    <div className='logoPE hidden-xs hidden-md'>
                        <a href='https://www.pole-emploi.fr' target='_blank'>
                            <img src={logoPE} alt='Logo Pôle emploi' />
                        </a>
                    </div>
                    {this.getHeaderButtons()}
                </div>
                
                <ShareModal showShareModal={this.state.showShareModal} 
                            handleCloseModal={this.handleCloseModal}
                            errorMsg={this.state.modalError} />
            </header>
    }

    handleCloseModal = e => 
    {
        e.stopPropagation();

        // ajout d'une entrée dans l'historique après la fermeture de la modale
        // eslint-disable-next-line no-restricted-globals
        history.pushState({page:"dashboard"},"");

        this.setState({showShareModal:false});
    }
}
export default Header;