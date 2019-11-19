import React, { Component } from 'react';
import Modal from '../../../components/modal.js';
import { getEventProperties } from '../../../actions/candidatureActions.js';

class CandidatureEditEventModal extends Component{

    getJob()
    {
        return this.props.candidature.nomCandidature+this.props.candidature.nomSociete?" au sein de la société "+this.props.candidature.nomSociete:"";
    }

    getParameters()
    {
        let evt = this.props.event;
        
        let text='';
        let eventProperties = {label:''};
        if(evt) 
            eventProperties = getEventProperties(evt);
        else
            evt = {comment:'',eventTime:null};
        
        return {text:eventProperties.text,title:eventProperties.label,comment:evt.comment,eventTime:evt.eventTime};
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
                title={parameters.title}
                text={parameters.text}
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