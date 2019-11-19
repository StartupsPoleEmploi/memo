import React, { Component } from 'react';
import { navigate  } from "@reach/router";
import Breadcrumb from '../../components/breadcrumb.js';
import FileDrop from '../../components/fileDrop';
import Button from '../../components/button.js';
import CandidatureInfoForm from './candidatureInfoForm.js';
import CandidatureQuickActions from './candidatureQuickActions.js';
import '../../css/candidature.css';
import CandidatureDescriptionForm from './candidatureDescriptionForm.js';
import CandidatureState from './candidatureState.js';
import CandidatureNotes from './candidatureNotes.js';
import CandidatureMessages from './candidatureMessages.js';
import CandidatureActivities from './candidatureActivities.js';
import CandidatureArchiveModal from './modals/candidatureArchiveModal';
import CandidatureRestoreModal from './modals/candidatureRestoreModal';
import CandidatureUploadFileModal from './modals/candidatureUploadFileModal';
import { saveCandidature, loadCandidature, loadCandidatureAttachment, saveCandidatureAndEvent, removeCandidature} from '../../actions/candidatureActions.js';
import { upload, isFileNotOk,isFileNotAllowed, isFileTooBig, saveAttachment } from '../../actions/attachmentActions';
import { userStore, MEMO } from '../../index.js';
import {$sc} from '../../components/utils.js';
import CandidatureEvent from '../../classes/candidatureEvent.js';
import { Constantes as CS } from '../../constantes';
import moment from 'moment';
import CandidatureAttachments from './candidatureAttachments.js';
import Attachment from '../../classes/attachment';
import jQuery from 'jquery';

class CandidaturePage extends Component{

    constructor(props)
    {
        super(props);
        
        if(this.props.user && this.props.user.candidatures)
            this.candidature = this.props.user.candidatures[this.props.candidatureId];

        this.state={
            candidatureInfoFormOpened : false,
            candidatureDescriptionFormOpened : false,
            candidatureDescriptionLoaded: this.candidature.descriptionLoaded,
            showArchiveModal : false,
            showRestoreModal : false,
            modalFormLoading : false,
            showUploadFileModal: false,
            uploadFile: null,
            uploadFileMessage: null,
            attachmentUploadInProgress : false,
            attachmentUploadError : null,
            allowAttachmentModalToBeClosed: false,
            modalError : ""
        };
    }

    componentDidMount()
    {
        if(!this.candidature.descriptionLoaded) // chargement de la descripion et de la note de la candidature si ce n'est pas déjà fait
        {
            loadCandidature(this.candidature)
                .then(response => response.json() )
                .then(response => {
                                if(response.result=="ok")
                                {
                                    let rc = response.candidature;
                                    if (rc.description)
                                        this.candidature.description = $sc(rc.description);
                                    if (rc.note)
                                        this.candidature.note = $sc(rc.note);
                                    this.candidature.descriptionLoaded=1;

                                    userStore.dispatch({type:'UPDATE_CANDIDATURE', candidature:this.candidature});

                                    return Promise.resolve(true);
                                }
                                else
                                    return Promise.reject(response.msg);
                            })
                .catch( msg => {
                                    console.log("TODO: gestion d'error componentDidMount candidaturePage ",msg);
                                    //MEMO.utils.manageError( msg );
                                }
                )

            loadCandidatureAttachment(this.candidature)
                .then(response => response.json() )
                .then(response => {
                                if(response.result=="ok")
                                {
                                    this.candidature.attachments = [];

                                    //console.log("response : ",response);

                                    for(let i=0; i<response.attachments.length; ++i)
                                        this.candidature.attachments.push(new Attachment(response.attachments[i]));
                                    
                                    userStore.dispatch({type:'UPDATE_CANDIDATURE', candidature:this.candidature});

                                    return Promise.resolve(true);
                                }
                                else
                                    return Promise.reject(response.msg);
                                })
                .catch( msg => {
                                    console.log("TODO: gestion d'error componentDidMount candidaturePage.attachment ",msg);
                                    //MEMO.utils.manageError( msg );
                                }
                )
        }
    }


    toggleInfoForm = e =>
    {
        if(e)
            e.stopPropagation();
        this.setState({candidatureInfoFormOpened:!this.state.candidatureInfoFormOpened});        
    }

    toggleDescriptionForm = e =>
    {
        if(e)
            e.stopPropagation();
        this.setState({candidatureDescriptionFormOpened:!this.state.candidatureDescriptionFormOpened});        
    }

    getArchiveButtons()
    {
        let res = "";
        
        if(!this.props.isVisitor)
        {
            if(this.candidature.archived)
                res = [
                    <Button key="1" title="Supprimer définitivement cette candidature" 
                            tooltip="Supprimer définitivement cette candidature. La carte ne pourra plus être récupérée" 
                            className="removeCandidatureBt" 
                            srOnly="Cliquer sur ce bouton pour supprimer définitivement cette candidature" 
                            onClick={this.handleRemoveCandidature} />,
                    <Button key="2" title="Restaurer la candidature" 
                        tooltip="Remettre cette candidature dans le tableau de bord actif" 
                        className="removeCandidatureBt" 
                        srOnly="Cliquer sur ce bouton pour restaurer la candidature dans le tableau de bord actif"
                        onClick={this.handleRestoreCandidature} />
                ];
            else    
                res = <Button title="Archiver cette candidature" 
                                tooltip="Placer cette carte dans vos archives MEMO" 
                                className="removeCandidatureBt" 
                                srOnly="Cliquer sur ce bouton pour archiver cette candidature"  
                                onClick={this.handleRemoveCandidature} />
        }
        
        return res;                            
    }

    getCandidaturePageContent()
    {
        return  <div>
               <div className='row candidaturePageRow candidatureFlexRow'>
                    <div className='col-xs-12 col-md-9 col-lg-10 candidaturePageSection'>
                        <div className='candidatureFlexCol'>
                        <CandidatureInfoForm 
                            {...this.props}
                            onEdit={this.toggleInfoForm} 
                            candidatureInfoFormOpened={this.state.candidatureInfoFormOpened} 
                            candidature={this.candidature} />
                        </div>
                    </div>
                    <div className='col-xs-12 col-md-3 col-lg-2 candidaturePageSection'>
                        <div className='candidatureFlexCol'>
                            {this.props.isVisitor?"":<CandidatureQuickActions candidature={this.candidature} />}
                        </div>
                    </div>                
                </div>
                <div className='row candidaturePageRow'>
                    <div className='col-xs-12 candidaturePageSection'>
                        <CandidatureState {...this.props} candidature={this.candidature} />
                    </div>
                </div>
                <div className='row candidatureFlexRow'>
                    <div className='col-xs-12 col-md-8 candidaturePageLeftSection'>
                        <div className='candidatureFlexCol'>
                            <div className='candidaturePageSection candidaturePageRow candidatureFlexGrow1'>
                                <CandidatureDescriptionForm 
                                    {...this.props}
                                    onEdit={this.toggleDescriptionForm}
                                    candidatureDescriptionFormOpened={this.state.candidatureDescriptionFormOpened}
                                    candidature={this.candidature} />
                            </div>
                            <div className='candidaturePageSection candidaturePageRow'>
                                <CandidatureNotes {...this.props} candidature={this.candidature} />
                            </div>
                        </div>
                    </div>

                    <div className='col-xs-12 col-md-4 candidaturePageRightSection candidatureFlexCol'>
                        <div className='candidaturePageSection candidaturePageRow'>
                            <CandidatureActivities {...this.props} candidature={this.candidature} />
                        </div>
                        <div className='candidaturePageSection candidaturePageRow'>
                            <CandidatureMessages {...this.props} candidature={this.candidature} />
                        </div>
                        <div className='candidaturePageSection candidaturePageRow'>
                            <CandidatureAttachments {...this.props} 
                                handleAddFile={this.handleAddFile} 
                                candidature={this.candidature} 
                                attachmentUploadInProgress={this.state.attachmentUploadInProgress} 
                                attachmentUploadError={this.state.attachmentUploadError} />
                        </div>
                    </div>
                </div>

                <div>
                    {this.getArchiveButtons()}
                    <CandidatureArchiveModal candidature={this.candidature}
                                            showModal={this.state.showArchiveModal} 
                                            onSaveClicked={this.handleSaveRemoveCandidature} 
                                            formLoading={this.state.modalFormLoading}
                                            handleCloseModal={this.handleCloseModal}
                                            errorMsg={this.state.modalError} />
                    <CandidatureRestoreModal candidature={this.candidature}
                                            showModal={this.state.showRestoreModal} 
                                            onSaveClicked={this.handleSaveRestoreCandidature} 
                                            formLoading={this.state.modalFormLoading}
                                            handleCloseModal={this.handleCloseModal}
                                            errorMsg={this.state.modalError} />
                    <CandidatureUploadFileModal 
                        showModal={this.state.showUploadFileModal}
                        allowClose={this.state.allowAttachmentModalToBeClosed}
                        uploadFile={this.state.uploadFile}
                        handleCloseModal={this.handleCloseModal}
                        formLoading={this.state.formLoading}
                        message={this.state.uploadFileMessage}
                        errorMsg={this.state.attachmentUploadError}
                     />
                </div>
            </div>
    }

    render()
    {
        return <div className='candidaturePage'>
                <Breadcrumb user={this.props.user} page='candidaturePage' />
                <div className='candidaturePageContainer'>
                    {this.props.isVisitor?this.getCandidaturePageContent():<FileDrop handleDrop={this.handleAddFile}>
                            {this.getCandidaturePageContent()}
                        </FileDrop>}
                </div></div>
    }

    handleAddFile= (files) => 
    {
        if (!files[0].name) 
            return;

        this.currentFile = {name: files[0].name, type: files[0].type};
        if(!isFileNotAllowed(this.currentFile) && !isFileTooBig(files[0]))
            upload(files[0], this.handleReaderStart, this.handleAttachmentUpload, this.handleAttachmentProgress);
        else
            this.setState({uploadFile:this.currentFile,showUploadFileModal:true,allowAttachmentModalToBeClosed:true,attachmentUploadError:"Ce type de fichier n'est pas autorisé sur MEMO"})

    }

    handleReaderStart = (evt) => 
    {
        this.setState({uploadFile:this.currentFile,formLoading:true,showUploadFileModal:true,allowAttachmentModalToBeClosed:false,uploadFileMessage:"0%"})
    }

    handleAttachmentProgress = (evt) =>
    {
        let percentage = 0;
        percentage = Math.floor((evt.loaded/evt.total)*100)+"%";
        //this.setState({uploadFileMessage:});
        
        this.setState({uploadFileMessage:"Lecture du fichier "+percentage});
    }

    handleAttachmentUpload = (evt) => 
    {
        this.setState({uploadFileMessage:"Fichier en cours d'enregistrement"});

        evt.stopPropagation();
        let file = {};

        let f = this.currentFile;
        file.file = evt.target.result.split(',')[1];
        file.name = f.name;
        file.type = f.type;

        
        saveAttachment(file,this.candidature)
        .then(response => response.json() )
        .then(response => {
            if(response.result=="ok")
            {
                var a = new Attachment();
                a.fileName = file.name;
                a.type = file.type;
                a.id = response.id;
                        
                let c =  this.candidature;
                c.attachments.push(a);

                userStore.dispatch({type:'UPDATE_CANDIDATURE', candidature:c});
                this.setState({allowAttachmentModalToBeClosed:true,formLoading:false,uploadFileMessage:"Fichier enregistré"});
            }
            else
            {
                this.setState({allowAttachmentModalToBeClosed:true,formLoading:false,attachmentUploadError:"Une erreur s'est produite lors de l'enregistrement ("+response.result.error+")"})
            }                                    
        } )
        .catch( msg => {
            this.setState({allowAttachmentModalToBeClosed:true,formLoading:false,attachmentUploadError:"Une erreur s'est produite lors de l'enregistrement ("+msg+")"})
        })

        
    }

    handleRemoveCandidature = e => 
    {
        e.stopPropagation();
        this.setState({showArchiveModal:true});
    }

    handleRestoreCandidature = e =>
    {
        e.stopPropagation();
        this.setState({showRestoreModal:true});
    }

    handleSaveRemoveCandidature = (values) =>
    {
        let c = this.candidature;

        this.setState({modalFormLoading:true});

        if(c.archived) // suppression définitive d'une candidature archivée
        {
            removeCandidature(c)
                .then(response => response.json() )
                .then(response => {
                    if(response.result=="ok")
                    {
                        this.handleCloseModal();
                        navigate('/dashboard');
                        userStore.dispatch({type:'REMOVE_CANDIDATURE', candidature:c});
                        //console.log("TODO : animation d'effacement : sauvegarder un état dans MEMO, afficher le dashboard archives, déclencher une anim d'effacement et le dispatch dans componentDidMount");
                    }
                    else
                    {
                        console.log("TODO : gérer error d'update event ",response.result.error);    
                        this.setState({modalError:response.result.error});
                    }                                    
                } )
                .catch( msg => {
                    console.log("TODO: traitement d'erreur ",msg);
                    this.setState({modalError:msg});
                    //MEMO.utils.manageError( msg );
                })
                .finally( () => { this.setState({modalFormLoading:false}); })
        }
        else            // mise en archive d'une candidature avec enregistrement du motif
        {
            c.archived = 1;
        
            let evt = new CandidatureEvent();
            evt.comment = values.comment ;
            evt.candidatureId = c.id;
            evt.eventType = CS.TYPES.ARCHIVER;
            evt.eventSubType = values.archiveSubType;
            evt.eventTime = moment();

            saveCandidatureAndEvent(c,evt)
                .then( result  => {

                    if(result.eventUpdated)
                    {
                        evt.id = result.eventId;

                        c.addEvent(evt);
                        
                        this.handleCloseModal()
                    }
                    else
                    {
                        console.log("TODO : gérer error d'update event ",result.error);    
                        this.setState({modalError:result.error});
                    }
                    
                    userStore.dispatch({type:'UPDATE_CANDIDATURE_AND_USER_ACTION_COUNTER', candidature:c});
                } )
                .catch( msg => {
                    console.log("TODO: traitement d'erreur ",msg);
                    this.setState({modalError:msg});
                    //MEMO.utils.manageError( msg );
                })
                .finally( () => { this.setState({modalFormLoading:false}); })
        }        
    }

    handleSaveRestoreCandidature = (values) =>
    {
        let c = this.candidature;
        c.archived=0;

        this.setState({modalFormLoading:true});

        saveCandidature(c)
            .then(response => response.json() )
            .then(response => {
                if(response.result=="ok")
                {
                    this.handleCloseModal();
                    userStore.dispatch({type:'UPDATE_CANDIDATURE_AND_USER_ACTION_COUNTER', candidature:c});
                }
                else
                {
                    console.log("TODO : gérer error d'update event ",response.result.error);    
                    this.setState({modalError:response.result.error});
                }                                    
                } )
            .catch( msg => {
                console.log("TODO: traitement d'erreur ",msg);
                this.setState({modalError:msg});
                //MEMO.utils.manageError( msg );
            })
            .finally( () => { this.setState({modalFormLoading:false}); })
                
    }

    handleCloseModal = e => 
    {
        if(e)
            e.stopPropagation();
        this.setState({showRestoreModal:false,
            showArchiveModal:false,
            showUploadFileModal:false,
            uploadFileMessage: null,
            uploadFile:null,
            attachmentUploadInProgress : false,
            attachmentUploadError : null,
            allowAttachmentModalToBeClosed: false,
            modalFormLoading:false,
            modalError:""});
    }

}
export default CandidaturePage;    