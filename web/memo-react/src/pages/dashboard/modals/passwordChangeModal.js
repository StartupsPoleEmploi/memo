import React, { Component } from 'react';
import ReactModal from 'react-modal';
import { navigate } from '@reach/router';
import Tippy from '@tippy.js/react';

// modale de chargement et d'affichage d'un lien de partage
class PasswordChangeModal extends Component{


    getModalBody()
    {
        let res = <div>
                    Votre mot de passe n'a pas été modifié depuis plus de 6 mois.
                    <br /><br />
                    Nous vous encourageons vivement à le renouveler.
                    <div className="modalActions">
                        {this.getCloseButton("text")}
                        {this.getRenewPasswordButton()}
                    </div>
                </div>
        
        return res;
    }

    getRenewPasswordButton()
    {
        return <button type="button" className="blue" onClick={this.goToParameterPage} >Modifier mon mot de passe</button>;
    }

    goToParameterPage = () =>
    {
        this.props.handleCloseModal();
        navigate("/parametres");
    }

    getCloseButton(type)
    {
        let res="";
        
        if(type=="cross")
        {    res = <Tippy content="Fermer" animation='shift-toward' placement="left" duration={[0,0]} trigger="mouseenter focus">
                <button className='modalClose' onClick={this.props.handleCloseModal}><i className='fal fa-times'></i></button>
            </Tippy>
        }
        else
            res = <button type="button" onClick={this.props.handleCloseModal} className='modalClose'>Fermer</button>
        
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
                <div className='modalTitle'>Renouveler votre mot de passe</div>
                {this.getModalBody()}
            </ReactModal>
    }
}
export default PasswordChangeModal;