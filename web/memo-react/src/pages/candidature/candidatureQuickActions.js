import React, { Component } from 'react';
import ReactModal from 'react-modal';
import '../../css/candidature.css';
import Tippy from '@tippy.js/react';
import { userStore } from '../../index.js';
import { MEMO } from '../../index.js';
import CandidatureEvent from '../../classes/candidatureEvent.js';
import { saveCandidatureAndEvent } from '../../actions/candidatureActions.js';
import CandidatureWonModal from './modals/candidatureWonModal.js';
import CandidatureLostModal from './modals/candidatureLostModal.js';
import CandidatureNoAnswerModal from './modals/candidatureNoAnswerModal.js';
import { Constantes as CS } from '../../constantes.js';
import moment from 'moment';

class CandidatureQuickActions extends Component{

    constructor(props)
    {
        super(props);
        this.onWinClick = this.onWinClick.bind(this);
        this.onWonClicked = this.onWonClicked.bind(this);
        this.onNoAnswerClicked = this.onNoAnswerClicked.bind(this);
        this.onLostClicked = this.onLostClicked.bind(this);
        this.onNoAnswerClick = this.onNoAnswerClick.bind(this);
        this.onLostClick = this.onLostClick.bind(this);
        
        this.state = { showWinModal : false,
                        showLostModal : false,
                        showNoAnswerModal : false,
                        modalFormLoading:false,
                        modalError : "" };
    }

    handleCloseModal= e => {
        if(e)
            e.stopPropagation();

        this.setState( { showWinModal : false,
            showLostModal : false,
            showNoAnswerModal : false,
            modalFormLoading:false,
            modalError:"" });
    }

    onLostClick = e => {
        e.stopPropagation();
        this.setState( { showLostModal : true });
    }

    onNoAnswerClick = e => {
        e.stopPropagation();
        this.setState( { showNoAnswerModal : true });
    }

    onWinClick = e => {
        e.stopPropagation();
        this.setState( { showWinModal : true });
    }

    // l'utilisateur a validé la modale Candidature gagnée
    // la candidature est mise à jour (état archivé) et un nouvel événement est ajouté (type archivage, sous type ai le poste)
    async onWonClicked(values)
    {
        let evt = new CandidatureEvent();

        evt.eventSubType = CS.SUBTYPES.AI_POSTE;
        this.archiveCandidature(evt, values);

        window.gtag('event', 'acceptationCandidature', { event_category: 'Candidature', event_label : 'detail' });     
    }

    async onLostClicked(values)
    {
        let evt = new CandidatureEvent();

        evt.eventSubType = CS.SUBTYPES.REPONSE_NEG;
        this.archiveCandidature(evt,values);

        window.gtag('event', 'refusCandidature', { event_category: 'Candidature', event_label : 'detail' });     
    }

    async onNoAnswerClicked(values)
    {
        let evt = new CandidatureEvent();
        evt.eventSubType = CS.SUBTYPES.PAS_REPONSE;
        this.archiveCandidature(evt,values);

        window.gtag('event', 'noAnswer', { event_category: 'Candidature', event_label : 'detail' });     
    }

    archiveCandidature = (event,values) => {
        let c = this.props.candidature;
        c.archived = 1;
        
        let evt = event;
        evt.comment = values.comment ;
        evt.candidatureId = c.id;
        evt.eventType = CS.TYPES.ARCHIVER;
        evt.eventTime = moment();

        this.setState({modalFormLoading:true});

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

    getButton(button)
    {
        let res = "";

        if(button=="win")
        {
            res = <div className='candidatureQuickAction'>
                        <Tippy content="Signaler que vous avez obtenu ce poste" animation='shift-toward' placement="top-end" maxWidth={200} duration={[0,0]} trigger="mouseenter focus">
                            <button onClick={this.onWinClick}>
                                <table><tbody><tr><td><i className="fal fa-check-circle"></i></td><td><span>C'est gagné !</span></td></tr></tbody></table>
                            </button>
                        </Tippy></div>;
        }
        else if(button=="noAnswer")
        {
            res = <div className='candidatureQuickAction'>
                        <Tippy content="Signaler que vous n'avez pas eu de réponse à votre candidature" animation='shift-toward' placement="top-end" maxWidth={200} duration={[0,0]} trigger="mouseenter focus">
                            <button onClick={this.onNoAnswerClick}>
                                <table><tbody><tr><td><i className="fal fa-question-circle"></i></td><td><span>Pas de réponse</span></td></tr></tbody></table>
                            </button>
                        </Tippy></div>;
        }
        else if(button=="lost")
        {
            res = <div className='candidatureQuickAction'>
                        <Tippy content="Signaler que vous avez reçu une réponse négative" animation='shift-toward' placement="top-end" maxWidth={200} duration={[0,0]} trigger="mouseenter focus">
                            <button onClick={this.onLostClick}>
                                <table><tbody><tr><td><i className="fal fa-times-circle"></i></td><td><span>Refus</span></td></tr></tbody></table>
                            </button>
                        </Tippy></div>;
        }

        return res;
    }
    
    render()
    {
        return <div className='candidatureQuickActions'>
                {this.getButton("win")}
                {this.getButton("noAnswer")}
                {this.getButton("lost")}
                <CandidatureWonModal showModal={this.state.showWinModal} 
                                    candidature={this.props.candidature}
                                    onWonClicked={this.onWonClicked} 
                                    formLoading={this.state.modalFormLoading}
                                    handleCloseModal={this.handleCloseModal}
                                    errorMsg={this.state.modalError} />
                <CandidatureLostModal showModal={this.state.showLostModal} 
                                    candidature={this.props.candidature}
                                    onLostClicked={this.onLostClicked} 
                                    formLoading={this.state.modalFormLoading}
                                    handleCloseModal={this.handleCloseModal}
                                    errorMsg={this.state.modalError} />                    
                <CandidatureNoAnswerModal showModal={this.state.showNoAnswerModal} 
                                    candidature={this.props.candidature}
                                    onNoAnswerClicked={this.onNoAnswerClicked} 
                                    formLoading={this.state.modalFormLoading}
                                    handleCloseModal={this.handleCloseModal}
                                    errorMsg={this.state.modalError} />                                        
        </div>
    }
}
export default CandidatureQuickActions;

