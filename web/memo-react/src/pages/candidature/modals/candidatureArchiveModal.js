import React, { Component } from 'react';
import Modal from '../../../components/modal.js';

class CandidatureArchiveModal extends Component{

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
        let text='', title='';

        if(this.props.candidature && this.props.candidature.archived)
        {
            title="Supprimer une candidature";
            text =  "Vous êtes sur le point de supprimer définitivement la candidature pour le poste "+this.getJob();  
        }
        else
        {
            title="Archiver la candidature";
            text =  <div>
            			{(this.props.isAdvice)?<p>Il n'y a pas eu d'activité sur cette candidature depuis 30 jours. </p>: ''}
            			<span>Vous êtes sur le point d'archiver la candidature pour le poste {this.getJob()}.<br /><br />
                        	Celle-ci sera placée dans "candidatures terminées". Vous pourrez la supprimer définitivement ou la restaurer depuis cet espace.</span>
            		</div>
        }

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
                showCommentForm={(this.props.candidature && this.props.candidature.archived)?false:true}
                additionalFields={this.getAdditionalFields()}
                disableOverlayClickClose={true}
                formLoading={this.props.formLoading}
                disableClose={this.props.disableClose}
                errorMsg={this.props.errorMsg}
                showModal={this.props.showModal} 
                handleCloseModal={this.props.handleCloseModal} />
    }
}
export default CandidatureArchiveModal;