import React, { Component } from 'react';
import '../../css/candidature.css';
import CandidatureEditButton from './candidatureEditButton.js';
import { userStore, MEMO } from '../../index.js';
import { Constantes as CS } from '../../constantes';
import Button from '../../components/button';
import Attachment from '../../classes/attachment';
import CandidatureRemoveAttachmentModal from './modals/candidatureRemoveAttachmentModal';
import { removeCandidatureAttachment } from '../../actions/attachmentActions';
import Spinner from '../../components/spinner';
import jQuery from 'jquery';

class CandidatureAttachments extends Component{

    constructor(props)
    {
        super(props);
        this.state = {  showConfirmRemoveAttachmentModal:false,
                        selectedAttachment:null,
                        modalFormLoading:false,
                        modalError:""
                     };

    }

    attachmentInputRef = React.createRef();
    

    componentDidMount()
    {
        this.attachmentInputRef.current.addEventListener('change', this.handleAttachmentSelection);        
    }

    componentWillUnmount()
    {
        this.attachmentInputRef.current.removeEventListener('change', this.handleAttachmentSelection);        
    }

    handleCloseModal= e => {
        if(e)
            e.stopPropagation();

        this.setState( { showConfirmRemoveAttachmentModal:false,
                         modalFormLoading : false,
                         selectedAttachment : null,
                         modalError:"" });
    }

    onRemove = attachment => {
        this.setState( { showConfirmRemoveAttachmentModal : true,
            selectedAttachment : attachment,
            modalError:"" });
    }

    onRemoveClicked = () => 
    {
        this.setState({modalFormLoading:true});
        this.removeAttachment();
    }

    removeAttachment = () => 
    {
        removeCandidatureAttachment(this.state.selectedAttachment,this.props.candidature)
        .then(response => response.json() )
        .then(response => {
            if(response.result=="ok")
            {
                let c = this.props.candidature;
                let attachmentIndex = c.attachments.findIndex(k=> {return this.state.selectedAttachment.id == k.id });
                c.attachments.splice(attachmentIndex,1);

                this.handleCloseModal()

                userStore.dispatch({type:'UPDATE_CANDIDATURE', candidature:c});
            }
            else
            {
                console.log("TODO : gérer error d'update event ",response.error);    
                this.setState({modalError:response.error});
            }
        })
        .catch( msg => {
            console.log("TODO: traitement d'erreur ",msg);
            this.setState({modalError:msg});
            //MEMO.utils.manageError( msg );
        })
        .finally( () => {
            this.setState({modalFormLoading:false});
        })
    }

    getAttachment(attachment)
    {
        return <CandidatureAttachment {...this.props} key={attachment.id} attachment={attachment} onRemove={this.onRemove} />
    }

    getAttachments()
    {
        let res = [];
        const c = this.props.candidature;

        if(c.attachments)
            for(let i=0; i<c.attachments.length; ++i)
                res.push(this.getAttachment(c.attachments[i]));
        
        return res;
    }
    
    getAddAttachmentButton = () =>
    {
        return <div style={{textAlign:"center"}}>
                    {(!this.props.isVisitor)?<Button onClick={this.addAttachment} 
                            title="Ajouter une pièce jointe" 
                            className='candidatureAddEventButton' 
                            srOnly="Cliquez pour ajouter une pièce jointe à la candidature" />:""}
                    
                    <input className="hiddenFileInput" 
                            type="file"
                            name="importFileInput" 
                            ref={this.attachmentInputRef} 
                            id="importFileInput"/>
                </div>;
    }

    addAttachment = (evt) =>
    {
        this.attachmentInputRef.current.click();
    }

    handleAttachmentSelection = (evt) =>
    {
        let target = evt.originalTarget || evt.target;        
        this.props.handleAddFile(target.files);
        document.getElementById("importFileInput").value="";
    }
    
    render()
    {
        return <div className='candidatureDescription'>
                <div className='candidatureAttachments candidatureDescriptionHeader'>
                    <div className='candidatureDescriptionTitle'>
                        <table><tbody><tr>
                            <td><i className="fal fa-paperclip"></i></td>
                            <td>Pièces jointes</td>
                        </tr></tbody></table>
                    </div>
                </div>
                {this.getAttachments()}
                {this.getAddAttachmentButton()}
                <CandidatureRemoveAttachmentModal showModal={this.state.showConfirmRemoveAttachmentModal} 
                                formLoading={this.state.modalFormLoading}
                                attachment={this.state.selectedAttachment}
                                onClick={this.onRemoveClicked} 
                                handleCloseModal={this.handleCloseModal}
                                errorMsg={this.state.modalError} />
            </div>        
    }
}
export default CandidatureAttachments;

class CandidatureAttachment extends Component
{

    onRemove = e =>
    {
        e.stopPropagation();

        this.props.onRemove(this.props.attachment);
    }

    getLink()
    {
        let link =  MEMO.rootURL + "/rest/attachments/file/" + this.props.attachment.id;

        if(MEMO.visitorLink)
            link += "?link=" + MEMO.visitorLink;

        return link;
    }

    render()
    {   
        let attachment = this.props.attachment;

        return <div className='candidatureAttachment'>
                <div className='row'>
                    <div className='col-xs-2 candidatureActivityIcon'><i className={attachment.getIcon()}></i></div>
                    <div className='col-xs-6 candidatureActivityLabel'><a href={this.getLink()} target="_blank">{attachment.fileName}</a></div>
                    {!this.props.isVisitor?<div className='col-xs-4 candidatureActivityEdit'>
                                            <CandidatureEditButton tooltip="Supprimer le fichier" isRemove="1" onClick={this.onRemove} />
                                            </div>:""}
                </div>
        </div>
    }
}
