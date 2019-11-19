import React, { Component } from 'react';
import Modal from '../../../components/modal.js';

class CandidatureRestoreModal extends Component{

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
        let res = "";

        if(this.props.candidature && !this.props.candidature.archived)
        {
            res = ["archiveMotivation"];
        }

        return res;
    }

    getParameters()
    {
        let text =  <span>Vous êtes sur le point de restaurer la candidature pour le poste {this.getJob()}.<br /><br />
                        Celle-ci retournera dans le tableau de bord actif.</span>;
            
        let title='Restaurer la candidature';

        return {text,title};
    }

    render()
    {
        let buttons = [
            {
             text:"Confirmer",
             onClick:this.props.onSaveClicked
            }
        ];

        let parameters = this.getParameters()

        return <Modal buttons={buttons} 
                title={parameters.title}
                text={parameters.text}
                closeText="Annuler"
                showCommentForm={false}
                disableOverlayClickClose={true}
                formLoading={this.props.formLoading}
                disableClose={this.props.disableClose}
                errorMsg={this.props.errorMsg}
                showModal={this.props.showModal} 
                handleCloseModal={this.props.handleCloseModal} />
    }
}
export default CandidatureRestoreModal;