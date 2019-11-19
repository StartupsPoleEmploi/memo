import React, { Component } from 'react';
import Modal from '../modal.js';

class CandidatureNewEventModal extends Component
{
    getAdditionalFields()
    {
        return [""];
    }

    render()
    {
        let buttons = [
            {
             text:"Valider",
             onClick:this.props.onClick
            }
        ];
        
        return <Modal buttons={buttons} 
                title={"Action : " + (this.props.event ? this.props.event.shortLabel : '')}
                text={"Quand avez-vous  " + (this.props.event ? this.props.event.labelModal : '') + " ?"}
        		textBold="true"
                closeText="Annuler"
                showDateForm="true"
                requiredDateForm="true"
                showCommentForm="true"
                formLoading={this.props.formLoading}
                disableClose={this.props.disableClose}
                disableOverlayClickClose={true}
                errorMsg={this.props.errorMsg}
                showModal={this.props.showModal} 
                handleCloseModal={this.props.handleCloseModal} />
    }
}
export default CandidatureNewEventModal;