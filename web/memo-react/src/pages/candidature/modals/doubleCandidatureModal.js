import React, { Component } from 'react';
import Modal from '../../../components/modal.js';
import { Link } from "@reach/router";

class DoubleCandidatureModal extends Component{

    getJob()
    {
        let res = this.props.doubleCandidature.nomCandidature;
        res += (this.props.doubleCandidature.nomSociete)?" au sein de la société "+this.props.doubleCandidature.nomSociete:""; 
        
        return res;
    }

    getColumn()
    {
        let res = "";
        switch(this.props.doubleCandidature.etat)
        {
            case 0 : {res="Je vais postuler"; break;}
            case 1 : {res="J'ai postulé"; break;}
            case 2 : {res="J'ai relancé"; break;}
            case 3 : {res="J'ai un entretien"; break;}
            default: {}
        }

        return res;
    }

    getText()
    {
        let text=<div>Vous avez déjà importé la candidature {this.getJob()} sur votre tableau de bord.
        <br /><br />
        Elle se trouve dans la colonne {this.getColumn()} {this.props.doubleCandidature.archived?" dans les candidatures terminées":""}.
        <br /><br />
        <strong>Souhaitez-vous néanmoins en importer une nouvelle copie ?</strong>
        <br /><br />
        Si vous n'étiez pas en train de procéder à un import veuillez consulter la <Link to="/faq">FAQ</Link>
        </div>;

        return text;
    }

    render()
    {
        let buttons = [
            {
             text:"Importer la candidature",
             onClick:this.props.onAcceptClicked
            }
        ];

        return this.props.doubleCandidature?<Modal buttons={buttons} 
                title="Candidature déjà importée"
                text={this.getText()}
                closeText="Annuler"
                disableOverlayClickClose={true}
                showModal={this.props.showModal} 
                handleCloseModal={this.props.onRefuseClicked} />:"";
    }
}
export default DoubleCandidatureModal;