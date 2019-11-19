import React, { Component } from 'react';
import Modal from '../../../components/modal.js';
import { getEventProperties } from '../../../actions/candidatureActions.js';

class CandidatureEditEventModal extends Component{

    getParameters()
    {
        let evt = this.props.event;
        
        if(!evt)
            evt = {comment:'',eventTime:null};
        
        return {comment:evt.comment,eventTime:evt.eventTime};
    }

    render()
    {
        let buttons = [
            {
             text:"Valider",
             onClick:this.props.onClick
            }
        ];

        let parameters = this.getParameters();

        return <Modal buttons={buttons} 
                title={(this.props.event && this.props.event.id)?"Modifier la note":"Ajouter une note"}
                text=""
                disableOverlayClickClose={true}
                closeText="Annuler"
                showDateForm="true"
                requiredDateForm="true"
                showCommentForm="true"
                formLoading={this.props.formLoading}
                commentValue={parameters.comment}
                selectedTime={parameters.eventTime}
                errorMsg={this.props.errorMsg}
                showModal={this.props.showModal} 
                handleCloseModal={this.props.handleCloseModal} />
    }
}
export default CandidatureEditEventModal;