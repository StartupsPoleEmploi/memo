import React, { Component } from 'react';
import Modal from '../../../components/modal.js';


class CandidatureNoAnswerModal extends Component{

    getText()
    {
        return <div>Vous n'avez pas reçu de réponse à votre candidature pour le poste {this.props.candidature.nomCandidature}{this.props.candidature.nomSociete?" au sein de la société "+this.props.candidature.nomSociete:""}.
            <br /><br />
            Cette action placera la candidature dans <strong>"candidatures terminées"</strong>.<br />
            Vous pourrez la supprimer définitivement ou la restaurer depuis cet espace.
            </div>;
    }

    render()
    {
        let buttons = [
            {
             text:"Valider",
             onClick:this.props.onNoAnswerClicked
            }
        ];

        return <Modal buttons={buttons} 
                title="Pas de réponse" 
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
export default CandidatureNoAnswerModal;