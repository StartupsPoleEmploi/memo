import React, { Component } from 'react';
import Header from '../../components/header.js';
import Breadcrumb from '../../components/breadcrumb.js';
import DeactivateAccountModal from './modals/deactivateAccountModal';
import EmailEditModal from './modals/emailEditModal';
import PasswordEditModal from './modals/passwordEditModal';
import SwitchButton from '../../components/switchButton';
import { saveReceiveNotification, saveConsentAccess } from '../../actions/userActions';
import '../../css/parameters.css';
import { userStore, MEMO } from '../../index.js';

class ParameterPage extends Component{

    constructor(props)
    {
        super(props);

        this.state = {
            showPasswordModal:false,
            showEmailModal:false,
            showDeactivateModal:false,
            consentAccess:props.user.consentAccess,
            receiveNotification:props.user.receiveNotification
        }
    }

    handleCloseModal = e => 
    {
        if(e)
            e.stopPropagation();
        this.setState({
            showPasswordModal:false,
            showEmailModal:false,
            showDeactivateModal:false
        })
    }

    openPasswordModal = e => {
        e.stopPropagation();
        this.setState({showPasswordModal:true});
    }

    openEmailModal = e => {
        e.stopPropagation();
        this.setState({showEmailModal:true});
    }

    openDeactivateModal = e => {
        e.stopPropagation();
        this.setState({showDeactivateModal:true});
    }

    exportAccount = e => {
        e.stopPropagation();
       
        let fileUrl = MEMO.rootURL + "/rest/account/exportFile",
            element = document.createElement('a');
        element.setAttribute('href', fileUrl);
        element.setAttribute('download', "extractTDB.csv");
        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();
        document.body.removeChild(element);

        window.gtag('event', 'extractTDB', { event_category: 'Utilisateur' });
    }

    toggleReceiveNotifications = (newValue) => {
        this.oldReceiveNotification = this.props.user.receiveNotification;
        this.setState({receiveNotification:newValue});

        saveReceiveNotification(newValue)
        .then(response => response.json() )
        .then(response => {
            if(response.result=="ok")
            {
                userStore.dispatch({type:"UPDATE_RECEIVE_NOTIFICATION",receiveNotification:newValue});
            }
            else
                throw new Error(response.msg);
        })
        .catch(err => {
            this.setState({receiveNotification:this.oldReceiveNotification});
            console.log("manage error ",err);
        })
        .finally( () => {
            this.oldReceiveNotification = null;
        })
    }

    toggleConsentAccess = (newValue) => {
        this.oldConsentAccess = this.props.user.consentAccess;
        this.setState({consentAccess:newValue});
        
        window.gtag('event', newValue?'Autorisation accès conseiller':'Refus accès conseiller', { event_category: 'Accès conseiller' });

        saveConsentAccess(newValue)
        .then(response => response.json() )
        .then(response => {

            if(response.result=="ok")
            {
                userStore.dispatch({type:"UPDATE_CONSENT_ACCESS",consentAccess:newValue});
            }
            else
                throw new Error(response.msg);
        })
        .catch(err => {
            this.setState({consentAccess:this.oldConsentAccess});
            console.log("manage error ",err);
        })
        .finally( () => {
            this.oldConsentAccess = null;
        })
    }

    render()
    {
        return <div className='parameterPage'>
            <Header user={this.props.user} page="parameters" />
            <Breadcrumb user={this.props.user} page="parameters" />
            
            <EmailEditModal showModal={this.state.showEmailModal} 
                            handleCloseModal={this.handleCloseModal} />

            <PasswordEditModal showModal={this.state.showPasswordModal} 
                            handleCloseModal={this.handleCloseModal} />
                            
            <DeactivateAccountModal showModal={this.state.showDeactivateModal} 
                            handleCloseModal={this.handleCloseModal} />

            <div className='parameterBackground'>
                <div className='parameterContainer'>

                    <h2>Paramètres du compte</h2>

                    <div className='parameterBloc'>

                        <h3>Mon compte</h3>
                        
                        <div className='parameterSeparator' />

                        {!MEMO.user.isPEAM?<div className='row'>
                            <div className='col-xs-6 parameterLeft'><label>Mot de passe</label></div>
                            <div className='col-xs-6 parameterRight'> 
                                <button type="button" className="blueButton" onClick={this.openPasswordModal}>Modifier</button> 
                            </div>
                        </div>:""}

                        <div className='row'>

                            <div className='col-xs-6 parameterLeft'>
                                <label>Adresse e-mail</label><br />
                                {this.props.user.login?"Votre adresse e-mail est "+this.props.user.login:""}
                            </div>
                            <div className='col-xs-6 parameterRight'>
                                <button type="button" className="blueButton" onClick={this.openEmailModal}>Modifier</button> 
                            </div>

                        </div>

                        <div className='row'>

                            <div className='col-xs-6 parameterLeft'>
                                <label>Désactiver votre compte</label><br />
                                Vous pouvez supprimer définitivement votre compte
                            </div>
                            <div className='col-xs-6 parameterRight'> 
                                <button type="button" className="blueButton" onClick={this.openDeactivateModal}>Désactiver le compte</button> 
                            </div>

                        </div>

                        <h3>Notifications</h3>
                        
                        <div className='parameterSeparator' />

                        <div className='row'>

                            <div className='col-xs-6 parameterLeft'>
                                    <label>Notifications par e-mail</label><br />
                                    M'envoyer des conseils / rappels par e-mail
                            </div>
                            
                            <div className='col-xs-6 parameterRight'>
                                <SwitchButton switchPosition={/*this.props.user.receiveNotification*/this.state.receiveNotification} onClick={this.toggleReceiveNotifications} />
                            </div>

                        </div>

                        <h3>Espace MEMO</h3>
                        
                        <div className='parameterSeparator' />

                        <div className='row'>

                            <div className='col-xs-6 parameterLeft'>
                                <label>Accès des conseillers Pôle emploi à votre espace MEMO</label><br />
                                Autoriser les conseillers Pôle emploi à consulter votre espace MEMO
                            </div>
                            
                            <div className='col-xs-6 parameterRight'> 
                                <SwitchButton switchPosition={/*this.props.user.receiveNotification*/this.state.consentAccess} onClick={this.toggleConsentAccess} /></div>

                        </div>

                        <div className='row'>

                            <div className='col-xs-6 parameterLeft'>
                                <label>Exporter votre tableau de bord</label><br />
                                Vous pouvez exporter les données de votre tableau de bord dans un format compatible avec les tabeurs dont Excel et Open Office Calc
                            </div>
                            
                            <div className='col-xs-6 parameterRight'> 
                                <button type="button" className="blueButton" onClick={this.exportAccount}>Exporter</button> 
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    }
}
export default ParameterPage;