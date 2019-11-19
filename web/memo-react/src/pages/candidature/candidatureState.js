import React, { Component } from 'react';
import '../../css/candidature.css';
import Tippy from '@tippy.js/react';
import { userStore, MEMO } from '../../index.js';
import CandidatureEvent from '../../classes/candidatureEvent.js';
import { saveCandidatureAndEvent, saveCandidatureState } from '../../actions/candidatureActions.js';
import CandidatureStateModal from './modals/candidatureStateModal.js';
import { Constantes as CS } from '../../constantes.js';
import moment from 'moment';

class CandidatureState extends Component{

    constructor(props)
    {
        super(props);
        this.onStepClick = this.onStepClick.bind(this);
        this.onStepClicked = this.onStepClicked.bind(this);
        
        this.state = { showStepModal : false,
                        step : "",
                        modalFormLoading:false,
                        modalError : "" };
    }

    handleCloseModal= e => {
        if(e)
            e.stopPropagation();

        this.setState( { showStepModal : false,
            step:"",
            modalFormLoading:false,
            modalError:"" });
    }

    onStepClick = e => {
        e.stopPropagation();
        this.setState( { showStepModal : true, step:e.currentTarget.getAttribute("step") });
    }
    
    // l'utilisateur a validé la modale Candidature gagnée
    // la candidature est mise à jour (état archivé) et un nouvel événement est ajouté (type archivage, sous type ai le poste)
    async onStepClicked(values)
    {
        this.updateCandidature(values);
    }

    getEventTypeFromState(state)
    {
        const s = eval(state);
        let res = CS.TYPES.AI_POSTULE;
        if(s===CS.ETATS.A_RELANCE)
            res = CS.TYPES.AI_RELANCE;
        else if(s===CS.ETATS.ENTRETIEN)
            res = CS.TYPES.ENTRETIEN;

        return res;
    }

    updateCandidature = (values) => {
        let c = this.props.candidature;
        c.etat = this.state.step;

        this.setState({modalFormLoading:true});
        if(this.state.step!=CS.ETATS.VA_POSTULER)
        {
            let evt = new CandidatureEvent();
            evt.comment = values.comment?values.comment:"";
            evt.candidatureId = c.id;
            evt.eventType = this.getEventTypeFromState(c.etat);

            evt.eventTime = moment(values.selectedTime);

            saveCandidatureAndEvent(c,evt)
            .then( result  => {

                if(result.eventUpdated)
                {
                    evt.id = result.eventId;

                    c.addEvent(evt);

                    this.handleCloseModal();
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
            .finally( () => {
                this.setState({modalFormLoading:false});
            })
        }
        else
        {
            saveCandidatureState(c)
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
        
    }

    getButton(button)
    {
        let step=button, active='active', placement, icon='', text='', position='';        

        switch(button)
        {
            case CS.ETATS.VA_POSTULER : {
                text="Je vais postuler";
                icon="fa fa-long-arrow-alt-right";
                active=this.states[CS.ETATS.VA_POSTULER];
                position="first";
                placement='right';
                break;
            }
            case CS.ETATS.A_POSTULE : {
                text="J'ai postulé";
                icon="fa fa-check";
                active=this.states[CS.ETATS.A_POSTULE];
                placement='bottom';
                break;
            }
            case CS.ETATS.A_RELANCE : {
                text="J'ai relancé";
                icon="fa fa-share";
                active=this.states[CS.ETATS.A_RELANCE];
                placement='bottom';
                break;
            }
            case CS.ETATS.ENTRETIEN : {
                text="J'ai un entretien";
                icon="fa fa-comment-dots";
                active=this.states[CS.ETATS.ENTRETIEN];
                position="last";
                placement='left';
                break;
            }
            default : {
                break;
            }
        }

        let res="";
        if(active==='active' || this.props.isVisitor)
            res = this.getStep(position, step, active, icon, text);
        else
            res = <Tippy content="Cliquer pour modifier l'état de la candidature" animation='shift-toward' maxWidth={200} placement={placement} duration={[0,0]} trigger="mouseenter focus">
                    {this.getStep(position, step, active, icon, text)}
                </Tippy>;

        return res;
    }

    getStep(position, step, active, icon, text)
    {
        return <div onClick={(active!=='active'&&!this.props.isVisitor)?this.onStepClick:undefined} step={step} className={"col-xs-3 mt-step-col "+position+" step "+active}>
            <div className="mt-step-number"><i className={icon} /></div>
            <div className="mt-step-title uppercase font-grey-cascade">{text}</div>
        </div>
    }

    getStates()
    {
        const c = this.props.candidature;
        const events = c.events;
        let states = { 0 : "past", 1 : "inactive", 2 : "inactive", 3 : "inactive" };
        states[c.etat] = "active";

        for(let k in events)
        {
            let event = events[k];
            switch(event.eventType)
            {
                case CS.TYPES.AI_POSTULE : {
                    if(c.etat != CS.ETATS.A_POSTULE)
                        states[CS.ETATS.A_POSTULE]= "past";
                    break
                }
                case CS.TYPES.AI_RELANCE : {
                    if(c.etat != CS.ETATS.A_RELANCE)
                        states[CS.ETATS.A_RELANCE]= "past";
                    break
                }
                case CS.TYPES.ENTRETIEN : {
                    if(c.etat != CS.ETATS.ENTRETIEN)
                        states[CS.ETATS.ENTRETIEN]= "past";
                    break
                }
                default : { break; }
            }
        }

        return states;
    }
    
    render()
    {
        this.states = this.getStates();

        return <div className='candidatureStateStepper'>
            <div className="mt-element-step">
                    <div className="row step-line">
                        {this.getButton(0)}
                        {this.getButton(1)}
                        {this.getButton(2)}
                        {this.getButton(3)}    
                    </div>
            </div>
            <CandidatureStateModal showModal={this.state.showStepModal} 
                                candidature={this.props.candidature}
                                step={this.state.step}
                                formLoading={this.state.modalFormLoading}
                                onValidateClicked={this.onStepClicked} 
                                handleCloseModal={this.handleCloseModal}
                                errorMsg={this.state.modalError} />
        </div>
    }
}
export default CandidatureState;

