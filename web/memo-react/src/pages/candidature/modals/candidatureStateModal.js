import React, { Component } from 'react';
import Modal from '../../../components/modal.js';

class CandidatureStateModal extends Component{

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

        if(this.props.step==3)
        {
            res = ["interviewSubType"];
        }

        return res;
    }

    getParameters()
    {
        let text='', title='';


        switch(this.props.step)
        {
            case "1" : {
                title="J'ai postulé";
                text="Veuillez préciser à quelle date vous avez postulé pour le poste "+this.getJob();
                break;
            }
            case "2" : {
                title="J'ai relancé";
                text="Veuillez préciser à quelle date vous avez relancé pour le poste "+this.getJob();
                break;
            }
            case "3" : {
                title="J'ai un entretien";
                text="Félicitations. Veuillez préciser à quelle date a lieu l'entretien pour le poste "+this.getJob();
                break;
            }
            default : {
                title="Je vais postuler";
                break;
            }
        }
        
        return {text,title};
    }

    render()
    {
        let buttons = [
            {
             text:"Valider",
             onClick:this.props.onValidateClicked
            }
        ];

        let parameters = this.getParameters()

        return <Modal buttons={buttons} 
                title={parameters.title}
                text={parameters.text}
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
export default CandidatureStateModal;