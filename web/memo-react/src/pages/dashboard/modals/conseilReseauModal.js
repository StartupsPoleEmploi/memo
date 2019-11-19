import React, { Component } from 'react';
import ReactModal from 'react-modal';
import { navigate } from '@reach/router';
import '../../../css/modal.css';
import Tippy from '@tippy.js/react';

// modale de chargement et d'affichage d'un lien de partage
class ConseilReseauModal extends Component{

    constructor(props)
    {
        super(props);
        
        this.state = {checked:false};
    }

    getModalBody()
    {
        let res = <div style={{textAlign:"center"}}>
                    <h4>Le réseau professionnel est le principal levier de retour à l'emploi !</h4>
                    
                    <div className='modalActions'>{this.getGoToConseilButton()}</div>
                    <br /><br />
                    Retrouvez ces conseils dans la rubrique "Nos conseils" accessible depuis le Menu ou l'en-tête de votre espace. 
                    <div className="modalActions">
                        {this.getCloseButton("text")}
                        {this.getCheckbox()}

                    </div>
                </div>
        
        return res;
    }

    getGoToConseilButton()
    {
        return <button type="button" className="blue" onClick={this.goToConseilPage} >Cliquez ici pour découvrir<br />comment mobiliser le vôtre !</button>;
    }

    goToConseilPage = () =>
    {
        window.gtag('event', 'openFromIncitation', { event_category: 'Conseils' }); 
        
        this.handleCloseModal();
        navigate("/conseils");
    }

    handleCloseModal = () => 
    {
        if(this.state.checked)
            localStorage.setItem("doNotShowNudgeReseau",1);
        else
            localStorage.removeItem("doNotShowNudgeReseau");
        this.props.handleCloseModal();
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
            res = <button type="button" onClick={this.handleCloseModal} className='modalClose'>J'ai compris</button>
        
        return res;
    }

    getCheckbox = () =>
    {
        return <span>
                <input id="doNoShowConseilReseauCheckbox" className='modalActionCheckbox' type="checkbox" onChange={this.toggle} checked={this.state.checked} />
                <label htmlFor="doNoShowConseilReseauCheckbox">ne plus afficher ce message</label>
                </span>;
    }


    toggle = () =>
    {
        this.setState({checked:!this.state.checked});
    }
    
    render()
    {   
        if(this.props.showModal)
        {
            console.log("inciteReseau ");
            window.gtag('event', 'affichageIncitationReseau', { event_category: 'Conseils' }); 
        }
        
        return <ReactModal isOpen={this.props.showModal}
                        contentLabel=""
                        onRequestClose={this.handleCloseModal}
                        appElement={document.getElementById('root')}
                        className="Modal"
                        shouldCloseOnOverlayClick={false}
                        overlayClassName="Overlay"
                >
                {this.getCloseButton("cross")}
                <div className='modalTitle'>Profitez de votre réseau professionnel</div>
                {this.getModalBody()}
            </ReactModal>
    }
}
export default ConseilReseauModal;