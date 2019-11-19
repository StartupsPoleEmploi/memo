import React, { Component } from 'react';
import Modal from '../../../components/modal.js';


class CandidatureWonModal extends Component{

    getText()
    {
        return this.props.candidature?<div>Félicitations, vous avez été accepté(e) pour le poste {this.props.candidature.nomCandidature}{this.props.candidature.nomSociete?" au sein de la société "+this.props.candidature.nomSociete:""}.
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
             onClick:this.props.onWonClicked
            }
        ];

        return <Modal buttons={buttons} 
                title="J'ai eu le poste" 
                text={this.getText()}
                closeText="Annuler"
                showCommentForm="true"
                formLoading={this.props.formLoading}
                errorMsg={this.props.errorMsg}
                showModal={this.props.showModal} 
                disableOverlayClickClose={true}
                handleCloseModal={this.props.handleCloseModal} />
    }
}
export default CandidatureWonModal;