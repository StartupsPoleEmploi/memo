import React, { Component } from 'react';
import Modal from '../../../components/modal.js';


class CandidatureUploadFileModal extends Component{

    getParameters()
    {
        let att = this.props.attachment;
        
        if(!att)
            att = {};
        
        return {};
    }

    getMessage()
    {
        let msg = "";
        if(this.props.uploadFile)
        {
            if(this.props.errorMsg)
            {
                msg = <div>
                        L'enregistrement du fichier {this.props.uploadFile.name} a échoué.
                        <br /><br />
                        <span>
                        Seuls les fichiers de moins de 1Mo et des types suivants sont autorisés :<br />
                        doc, docx, xls, xlsx, rtf, txt, csv, pdf, ppt, pptx, jpeg, jpg, 
                        png, gif, mp3, mp4, mkv, mpeg, mpg, wav, odt, bmp, tif, tiff, amr, odp, ods
                        </span>
                    </div>
            }
            else
            {
                if(this.props.message=="Fichier enregistré")
                {
                    msg = <div>
                            Fichier {this.props.uploadFile.name} enregistré.
                        </div>
                }
                else
                    msg = <div>
                            Enregistrement du fichier {this.props.uploadFile.name} en cours.
                            <br /><br />Merci de patienter :)
                            <br /><br />
                            {this.props.message}
                        </div>
            }
        }
        
        return msg;
    }

    render()
    {
        let buttons = [];

        return <Modal buttons={buttons} 
                title="Enregistrement de pièce jointe"
                text={this.getMessage()}
                disableOverlayClickClose={true}
                closeText="Fermer"
                formLoading={this.props.formLoading}
                errorMsg={this.props.errorMsg}
                disableClose={!this.props.allowClose}
                showModal={this.props.showModal} 
                handleCloseModal={this.props.handleCloseModal} />
    }
}
export default CandidatureUploadFileModal;