import React, { Component } from 'react';
import Modal from '../../../components/modal.js';


class CandidatureLostModal extends Component{

    getText()
    {
        return this.props.candidature?<div>Vous n'avez pas été retenu(e) pour le poste {this.props.candidature.nomCandidature}{this.props.candidature.nomSociete?" au sein de la société "+this.props.candidature.nomSociete:""}.
            <br /><br />
            Cette action placera la candidature dans <strong>"candidatures terminées"</strong>.<br />
            Vous pourrez la supprimer définitivement ou la restaurer depuis cet espace.
            </div>:"";
    }

    render()
    {
        let buttons = [
            {
             text:"Valider",
             onClick:this.props.onLostClicked
            }
        ];

        return <Modal buttons={buttons} 
                title="Je n'ai pas eu le poste" 
                text={this.getText()}
                closeText="Annuler"
                disableOverlayClickClose={true}
                showCommentForm="true"
                formLoading={this.props.formLoading}
                errorMsg={this.props.errorMsg}
                showModal={this.props.showModal} 
                handleCloseModal={this.props.handleCloseModal} />
    }
}
export default CandidatureLostModal;