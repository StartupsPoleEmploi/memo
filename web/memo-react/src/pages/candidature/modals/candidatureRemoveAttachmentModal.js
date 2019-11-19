import React, { Component } from 'react';
import Modal from '../../../components/modal.js';

class CandidatureRemoveAttachmentModal extends Component{

    getText()
    {
        return <div>
            Vous êtes sur le point de supprimer le fichier {this.props.attachment?this.props.attachment.fileName:""}.
            <br /><br />
            Ce fichier sera supprimé définitivement.
            <br />
            Les éventuelles copies de ce fichier associées à d'autres candidatures ne seront pas effacées.
        </div>
    }
    
    render()
    {
        let buttons = [
            {
             text:"Confirmer",
             onClick:this.props.onClick
            }
        ];
        
        return <Modal buttons={buttons} 
                title="Supprimer un fichier"
                text={this.getText()}
                closeText="Annuler"
                disableOverlayClickClose={true}
                formLoading={this.props.formLoading}
                disableClose={this.props.disableClose}
                errorMsg={this.props.errorMsg}
                showModal={this.props.showModal} 
                handleCloseModal={this.props.handleCloseModal} />
    }
}
export default CandidatureRemoveAttachmentModal;