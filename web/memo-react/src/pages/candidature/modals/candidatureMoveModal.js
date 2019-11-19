import React, { Component } from 'react';
import Modal from '../../../components/modal.js';

class CandidatureMoveModal extends Component{

    getJob()
    {
        let res = "";
        if(this.props.candidature)
        {
            res = this.props.candidature.nomCandidature;
            res += (this.props.candidature.nomSociete)?" au sein de la société "+this.props.candidature.nomSociete:""; 
        }
        return res;
    }

    getAdditionalFields()
    {
        return ["candidatureState"];
    }

    render()
    {
        let buttons = [
            {
             text:"Valider",
             onClick:this.props.onValidateClicked
            }
        ];

        return <Modal buttons={buttons} 
                title="Déplacer la carte"
                text={"Sélectionnez la colonne dans laquelle vous souhaitez placer la candidature "+this.getJob()}
                closeText="Annuler"
                showDateForm="true"
                requiredDateForm="true"
                showCommentForm="true"
                additionalFields={this.getAdditionalFields()}
                formLoading={this.props.formLoading}
                disableClose={this.props.disableClose}
                disableOverlayClickClose={true}
                errorMsg={this.props.errorMsg}
                showModal={this.props.showModal} 
                handleCloseModal={this.props.handleCloseModal} />
    }
}
export default CandidatureMoveModal;