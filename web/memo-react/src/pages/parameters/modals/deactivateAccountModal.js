import React, { Component } from 'react';
import ReactModal from 'react-modal';
import Spinner from '../../../components/spinner';
import Tippy from '@tippy.js/react';
import { deactivateAccount } from '../../../actions/userActions';

// modale de chargement et d'affichage d'un lien de partage
class DeactivateAccountModal extends Component{

    constructor(props)
    {
        super(props);
        this.state={
                errorMsg:"",
                successMsg:"",
                loading:false
        };
    }

    
    getCloseButton(type)
    {
        let res="";
        
        if(type=="cross")
        {    res = <Tippy content="Fermer" animation='shift-toward' placement="left" duration={[0,0]} trigger="mouseenter focus">
                <button className='modalClose' onClick={this.handleCloseModal}><i className='fal fa-times'></i></button>
            </Tippy>
        }
        else
            res = <button type="button" onClick={this.handleCloseModal} className='modalClose'>Fermer</button>
        
        return res;
    }

    handleCloseModal = e =>
    {
        this.setState({
            errorMsg:"",
            successMsg:"",
            loading:false
        });
        this.props.handleCloseModal(e);
    }

    getRemoveButton()
    {
        let res="";
        
        res = <button type="button" onClick={this.confirmRemoveAccount} >Confirmer</button>
        
        return res;
    }

    confirmRemoveAccount = e =>
    {
        window.gtag('event', 'Désactivation de compte', { event_category: 'Utilisateur' });

        e.stopPropagation();
        this.setState({
            errorMsg:"",
            successMsg:"",
            loading:true
        });

        deactivateAccount()
        .then(response => response.json() )
        .then(response => {
            if(response.result=="ok")
            {
                this.setState({ successMsg : "Email  envoyé à "+response.login });
            }
            else
                throw new Error(response.msg);
        })
        .catch(err => {
            this.setState({errorMsg:err});
            console.log("manage error ",err);
        })
        .finally( () => {
            this.setState({loading:false});
        })
    }

    getModalBody()
    {
        let res = "";
        
        if(!this.state.loading)
        {
            if(this.state.successMsg)
                res = <div>{this.state.successMsg}</div>
            else
                res = <div>
                        Vous êtes sur le point de supprimer définitivement votre compte.
                        <br />Afin de sécuriser cette opération, vous allez recevoir un email pour effectuer cette suppression.
                        </div>;
        }
        else
            res = <div className='modalForm'><Spinner /></div>;

        return res;
    }
    
    getActionButtons()
    {
        return <div className="modalActions">
                {(!this.state.loading && !this.state.successMsg)?this.getRemoveButton():""}
                {this.getCloseButton()}
                </div>;
    }

    getErrorMessage()
    {
        let res="";
        if(this.state.errorMsg)
            res = <div className='errorMessage'>Une erreur s'est produite .<br />Veuillez réessayer ultérieurement. Si le problème persiste Veuillez contacter le support.</div>
        return res;
    }

    render()
    { 
        return <ReactModal isOpen={this.props.showModal}
                        contentLabel=""
                        onRequestClose={this.props.handleCloseModal}
                        appElement={document.getElementById('root')}
                        className="Modal"
                        shouldCloseOnOverlayClick={false}
                        overlayClassName="Overlay"
                >
                {this.getCloseButton("cross")}
                <div className='modalTitle'>Supprimer votre compte</div>
                {this.getErrorMessage()}
                {this.getModalBody()}
                {this.getActionButtons()}
            </ReactModal>
    }
}
export default DeactivateAccountModal;