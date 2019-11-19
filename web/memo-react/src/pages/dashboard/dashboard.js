import React, { Component } from 'react';
import { Router } from "@reach/router";
import Header from '../../components/header.js';
import '../../css/dashboard.css';
import CandidaturePage from '../candidature/candidaturePage.js';
import { MEMO, userStore } from '../../index.js';
import { Constantes as CS } from '../../constantes.js';
import DashboardContainer from './dashboardContainer';
import CandidatureArchiveModal from '../candidature/modals/candidatureArchiveModal';
import CandidatureRestoreModal from '../candidature/modals/candidatureRestoreModal';
import CandidatureWonModal from '../candidature/modals/candidatureWonModal';
import CandidatureLostModal from '../candidature/modals/candidatureLostModal';
import CandidatureMoveModal from '../candidature/modals/candidatureMoveModal';
import CandidatureRelaunchModal from '../candidature/modals/candidatureRelaunchModal';
import CandidatureApplyForModal from '../candidature/modals/candidatureApplyForModal';
import CandidatureRelaunchInterviewModal from '../candidature/modals/candidatureRelaunchInterviewModal';
import CandidaturePrepareInterviewModal from '../candidature/modals/candidaturePrepareInterviewModal';
import CandidatureThankToModal from '../candidature/modals/candidatureThankToModal';
import moment from 'moment';
import CandidatureEvent from '../../classes/candidatureEvent.js';
import { saveCandidature, saveCandidatureAndEvent } from '../../actions/candidatureActions.js';


class Dashboard extends Component{
    

    constructor(props)
    {
        super(props);

        this.state = {
            candidature: null,
            showArchiveModal : false,
            showRestoreModal : false,
            showLostModal : false,
            showWinModal : false,
            showMoveModal : false,
            showRelaunchCandidatureModal : false,
            showApplyForModal : false,
            showPrepareInterviewModal : false,
            showRelaunchInterviewModal : false,
            showThankToModal : false,
            modalFormLoading : false,
            modalError : ""
        };  
    }

    getVisitorRibbon()
    {
        if(this.props.isVisitor)
            return <div className='visitorRibbon'>Consultation</div>
        else
            return "";
    }
    
    render()
    {
        return <div className='dashboard'>
            <Header {...this.props} />
            <Router>
                <DashboardContainer path="/" 
                                    default 
                                    {...this.props} 
                                    openMoveCandidature={this.openMoveCandidature}
                                    openWinModal={this.openWinModal}
                                    openLostModal={this.openLostModal}
                                    openArchiveCandidature={this.openArchiveCandidature}
                                    openRelaunchCandidature={this.openRelaunchCandidature}
                                    openApplyForCandidature={this.openApplyForCandidature}
                                    openPrepareInterview={this.openPrepareInterview} 
                                    openRelaunchInterview={this.openRelaunchInterview}
                                    openThankTo={this.openThankTo}
                                    openRestoreCandidature={this.openRestoreCandidature} />
                {(this.props.user&&this.props.user.candidatures)?<CandidaturePage path="/candidature/:candidatureId" user={this.props.user} isVisitor={this.props.isVisitor} />:""}
            </Router>
            {this.getVisitorRibbon()}

            <CandidatureArchiveModal candidature={this.state.candidature}
                                    showModal={this.state.showArchiveModal} 
                                    onSaveClicked={this.onRemoveClicked} 
                                    formLoading={this.state.modalFormLoading}
                                    handleCloseModal={this.handleCloseModal}
                                    errorMsg={this.state.modalError} 
            						isAdvice={true}/>
            <CandidatureRestoreModal candidature={this.state.candidature}
                                    showModal={this.state.showRestoreModal} 
                                    onSaveClicked={this.onRestoreClicked} 
                                    formLoading={this.state.modalFormLoading}
                                    handleCloseModal={this.handleCloseModal}
                                    errorMsg={this.state.modalError} />
            <CandidatureWonModal showModal={this.state.showWinModal} 
                                    candidature={this.state.candidature}
                                    onWonClicked={this.onWonClicked} 
                                    formLoading={this.state.modalFormLoading}
                                    handleCloseModal={this.handleCloseModal}
                                    errorMsg={this.state.modalError} />
            <CandidatureLostModal showModal={this.state.showLostModal} 
                                    candidature={this.state.candidature}
                                    onLostClicked={this.onLostClicked} 
                                    formLoading={this.state.modalFormLoading}
                                    handleCloseModal={this.handleCloseModal}
                                    errorMsg={this.state.modalError} />                    
            <CandidatureMoveModal showModal={this.state.showMoveModal} 
                                    candidature={this.state.candidature}
                                    onValidateClicked={this.onMoveClicked} 
                                    formLoading={this.state.modalFormLoading}
                                    handleCloseModal={this.handleCloseModal}
                                    errorMsg={this.state.modalError} />      
            <CandidatureApplyForModal showModal={this.state.showApplyForModal} 
									candidature={this.state.candidature}
									onValidateClicked={this.onApplyForClicked} 
									formLoading={this.state.modalFormLoading}
									handleCloseModal={this.handleCloseModal}
									errorMsg={this.state.modalError} />
            <CandidatureRelaunchModal showModal={this.state.showRelaunchCandidatureModal} 
									candidature={this.state.candidature}
									onValidateClicked={this.onRelaunchCandidatureClicked} 
									formLoading={this.state.modalFormLoading}
									handleCloseModal={this.handleCloseModal}
									errorMsg={this.state.modalError} />
            <CandidaturePrepareInterviewModal showModal={this.state.showPrepareInterviewModal} 
									candidature={this.state.candidature}
									onValidateClicked={this.onPrepareInterviewClicked} 
									formLoading={this.state.modalFormLoading}
									handleCloseModal={this.handleCloseModal}
									errorMsg={this.state.modalError} />
            <CandidatureRelaunchInterviewModal showModal={this.state.showRelaunchInterviewModal} 
									candidature={this.state.candidature}
									onValidateClicked={this.onRelaunchInterviewClicked} 
									formLoading={this.state.modalFormLoading}
									handleCloseModal={this.handleCloseModal}
									errorMsg={this.state.modalError} />
            <CandidatureThankToModal showModal={this.state.showThankToModal} 
									candidature={this.state.candidature}
									onValidateClicked={this.onThankToClicked} 
									formLoading={this.state.modalFormLoading}
									handleCloseModal={this.handleCloseModal}
									errorMsg={this.state.modalError} />
        </div>
    }


    openMoveCandidature = c => 
    {
        this.setState({candidature: c, showMoveModal : true});
    }

    openWinModal = c => 
    {
        this.setState({candidature: c, showWinModal : true});
    }

    openLostModal = c => 
    {
        this.setState({candidature: c, showLostModal : true});
    }

    openArchiveCandidature = c => 
    {
    	this.setState({candidature: c, showArchiveModal : true});
    }
    
    openRelaunchCandidature = c => 
    {
        this.setState({candidature: c, showRelaunchCandidatureModal : true});
    }

    openApplyForCandidature = c => 
    {
        this.setState({candidature: c, showApplyForModal : true});
    }
    
    openPrepareInterview = c => 
    {
        this.setState({candidature: c, showPrepareInterviewModal : true});
    }
    
    openRelaunchInterview = c => 
    {
        this.setState({candidature: c, showRelaunchInterviewModal : true});
    }
    
    openThankTo = c => 
    {
        this.setState({candidature: c, showThankToModal : true});
    }
    
    openRestoreCandidature = c => 
    {
        this.setState({candidature: c, showRestoreModal : true});
    }

    onMoveClicked = values =>
    {
        let cS = eval(values.candidatureState),
            c = this.state.candidature;

        if(c.etat == cS)
            this.setState({modalError:"La candidature est déjà dans cet état. Choisissez un autre état."});        
        else
        {
            let evt = new CandidatureEvent();
            evt.comment = values.comment ;
            evt.candidatureId = c.id;
            evt.eventTime = moment(values.selectedTime);

            switch(cS)
            {
                case CS.ETATS.VA_POSTULER : {
                    evt = null; 
                    break;
                }
                case CS.ETATS.A_POSTULE : {
                    evt.eventType = CS.TYPES.AI_POSTULE;
                    break;
                }
                case CS.ETATS.A_RELANCE : {
                    evt.eventType = CS.TYPES.AI_RELANCE;
                    break;
                }
                case CS.ETATS.ENTRETIEN : {
                    evt.eventType = CS.TYPES.ENTRETIEN;
                    evt.eventSubType = CS.SUBTYPES.ENTRETIEN_PHYSIQUE;
                    break;
                }
                default : break;
            }

            c.etat = cS;

            if(evt)
                this.saveCandidatureAndEvent(c, evt);
            else
                this.saveCandidature(c);
        }
    }

    onWonClicked = values => 
    {
        let evt = new CandidatureEvent();

        evt.eventSubType = CS.SUBTYPES.AI_POSTE;
        this.archiveCandidature(evt, values);

        window.gtag('event', 'acceptationCandidature', { event_category: 'Candidature', event_label : 'direct' });     
    }

    onLostClicked = values => 
    {
        let evt = new CandidatureEvent();

        evt.eventSubType = CS.SUBTYPES.REPONSE_NEG;
        this.archiveCandidature(evt,values);

        window.gtag('event', 'refusCandidature', { event_category: 'Candidature', event_label : 'direct' });     
    }

    onRemoveClicked = values =>
    {
        let evt = new CandidatureEvent();

        evt.eventSubType = values.archiveSubType;
        this.archiveCandidature(evt,values);

        window.gtag('event', 'archiveCandidature', { event_category: 'Candidature', event_label : 'direct' });     
    }

    
    archiveCandidature = (event,values) => {
        let c = this.state.candidature;
        c.archived = 1;
        
        let evt = event;
        evt.comment = values.comment ;
        evt.candidatureId = c.id;
        evt.eventType = CS.TYPES.ARCHIVER;
        evt.eventTime = moment();

        this.setState({modalFormLoading:true});

        this.saveCandidatureAndEvent(c,evt);    
    }

    saveCandidatureAndEvent = (c, evt) => 
    {
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
                    MEMO.forceCandidatureUpdate = c.id;
                    userStore.dispatch({type:'UPDATE_CANDIDATURE_AND_USER_ACTION_COUNTER', candidature:c});
                } )
                .catch( msg => {
                    console.log("TODO: traitement d'erreur ",msg);
                    this.setState({modalError:msg});
                    //MEMO.utils.manageError( msg );
                })
                .finally( () => { this.setState({modalFormLoading:false}); })
    }

    saveCandidature = c => {
        saveCandidature(c)
            .then(response => response.json() )
            .then(response => {
                if(response.result=="ok")
                {
                    this.handleCloseModal();
                    MEMO.forceCandidatureUpdate = c.id;
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

    onRestoreClicked = (values) =>
    {
        let c = this.state.candidature;
        c.archived=0;

        this.setState({modalFormLoading:true});

        this.saveCandidature(c);                

        console.log("GA restoreCandidature");
        window.gtag('event', 'restoreCandidature', { event_category: 'Candidature', event_label : 'direct' });     
    }

    handleCloseModal = () => 
    {
        this.setState(  {candidature:null,
                        showRestoreModal:false,
                        showArchiveModal:false,
                        showLostModal:false,
                        showWinModal:false,
                        showMoveModal:false,
                        showRelaunchCandidatureModal:false,
                        showApplyForModal:false,
                        showPrepareInterviewModal:false,
                        showRelaunchInterviewModal:false,
                        showThankToModal:false,
                        modalFormLoading:false,
                        modalError:""});  

    }

    onApplyForClicked = (values) => 
    {
    	let evt = new CandidatureEvent();
    	
        evt.eventType = CS.TYPES.AI_POSTULE;
        this.onAdviceClicked(evt, values.comment);

        console.log("GA archiveCandidature");
        window.gtag('event', 'archiveCandidature', { event_category: 'Candidature', event_label : 'direct' });     
    }

    onRelaunchCandidatureClicked = (values) => 
    {
    	let evt = new CandidatureEvent();
    	
        evt.eventType = CS.TYPES.AI_RELANCE;
        evt.eventSubType = 0;
        this.onAdviceClicked(evt, values.comment);
    }
    
    onPrepareInterviewClicked = (values) => 
    {
    	let evt = new CandidatureEvent();
    	
        evt.eventType = CS.TYPES.AI_PREPARE;
        evt.eventSubType = 0;
        this.onAdviceClicked(evt, values.comment);
    }
    
    onRelaunchInterviewClicked = (values) => 
    {
    	let evt = new CandidatureEvent();
    	
        evt.eventType = CS.TYPES.AI_RELANCE;
        evt.eventSubType = 0;
        this.onAdviceClicked(evt, values.comment);
    }
    
    onThankToClicked = (values) => 
    {
    	let evt = new CandidatureEvent();
    	
        evt.eventType = CS.TYPES.AI_REMERCIE;
        evt.eventSubType = 0;
        this.onAdviceClicked(evt, values.comment);
    }
    
    onAdviceClicked(evt, comment) 
    {
    	let c = this.state.candidature;
    	
    	evt.candidatureId = c.id;
    	evt.comment = comment;
        evt.eventTime = moment();

        // MAJ l'état de la candidature si elle n'est pas à l'état 'Entretien'
        if (c.etat != CS.ETATS.ENTRETIEN) 
        {
	        switch(evt.eventType) 
	        {
	        	case CS.TYPES.AI_POSTULE :
	    		{
	        		c.etat = CS.ETATS.A_POSTULE;
	        		break;
	    		}
	        	case CS.TYPES.AI_RELANCE :
	    		{
	        		c.etat = CS.ETATS.A_RELANCE;
	        		break;
	    		}
	    		default : {break;}
	        }
        }
        
    	this.setState({showApplyForModal : false});
    	this.saveCandidatureAndEvent(c,evt);
    }
}
export default Dashboard;

export function getColumnOrderName(type, active)
{
    let order = "column-";
    if(active)
        order += "active-";
    else   
        order += "archive-";
    order += type;

    return order;
}
