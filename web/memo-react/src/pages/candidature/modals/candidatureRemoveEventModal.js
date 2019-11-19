import React, { Component } from 'react';
import Modal from '../../../components/modal.js';

class CandidatureRemoveEventModal extends Component{

    getParameters()
    {
        let res = {};

        switch(this.props.type)
        {
            case 'message' : 
            {
                res.title="Supprimer un message";
                res.text = "Souhaitez vous supprimer définitivement ce message ?";
                break;
            }

            case 'activite' : 
            {
                res.title="Supprimer une action";
                res.text = "Souhaitez vous supprimer définitivement cette action ?";
                break;
            }

            case 'note' : 
            {
                res.title="Supprimer une note";
                res.text = "Souhaitez vous supprimer définitivement cette note ?";
                break;
            }

            default : 
            {
                res.title="";
                res.text="";
                break;
            }
        }

        return res;
    }
    
    render()
    {
        let buttons = [
            {
             text:"Confirmer",
             onClick:this.props.onClick
            }
        ];
        
        let parameters = this.getParameters();

        return <Modal buttons={buttons} 
                title={parameters.title}
                text={parameters.text}
                closeText="Annuler"
                disableOverlayClickClose={true}
                formLoading={this.props.formLoading}
                disableClose={this.props.disableClose}
                errorMsg={this.props.errorMsg}
                showModal={this.props.showModal} 
                handleCloseModal={this.props.handleCloseModal} />
    }
}
export default CandidatureRemoveEventModal;