import React, { Component } from 'react';
import '../../css/candidature.css';
import { Link } from "@reach/router";
import CandidatureEditButton from './candidatureEditButton.js';
import { saveCandidatureEvent, getEventProperties, removeEvent } from '../../actions/candidatureActions.js';
import { userStore } from '../../index.js';
import CandidatureEditEventModal from './modals/candidatureEditEventModal.js';
import CandidatureRemoveEventModal from './modals/candidatureRemoveEventModal';
import moment from 'moment';
import { formatText } from '../../components/utils';
import { getLastActivity } from '../../actions/nextEvents';

class CandidatureActivities extends Component{

    constructor(props)
    {
        super(props);
        this.state = {  showAllActivities:false,
                        showEditEventModal:false,
                        showConfirmRemoveModal:false,
                        modalFormLoading:false,
                        modalError:""
                     };
        this.activityCount=0;
        this.selectedEvent = null;
        this.updateEvent = this.updateEvent.bind(this);
        this.removeEvent = removeEvent.bind(this);
    }

    onToggleClick = e => 
    {
        this.setState({
            showAllActivities:!this.state.showAllActivities
            });
    }

    handleCloseModal= e => {
        if(e)
            e.stopPropagation();

        this.setState( { showEditEventModal : false,
                         showConfirmRemoveModal : false,
                         modalFormLoading : false,
                         modalError:"" });
    }

    onEdit = evt => {
        this.selectedEvent = evt;
        this.setState( { showEditEventModal : true,
            modalError:"" });
    }

    onRemove = candidatureEvent => 
    {
        this.selectedEvent = candidatureEvent;
        this.setState( { showConfirmRemoveModal : true, modalError:"" });
    }

    onRemoveClicked = (values) =>
    {
        this.setState({modalFormLoading:true});
        this.removeEvent();
    }

    onValidateClicked = (values) =>
    {
        this.setState({modalFormLoading:true});
        this.updateEvent(values);
    }

    async updateEvent(values)
    {     
        let evt = this.selectedEvent;
        
        evt.comment = values.comment?values.comment:"";
        evt.eventTime = moment(values.selectedTime);

        saveCandidatureEvent(evt)
        .then(response => response.json() )
        .then(response => {
            if(response.result=="ok")
            {
                const cs = userStore.getState().user.candidatures;
                let c = cs[this.selectedEvent.candidatureId];
                c.events[evt.id] = evt;

                c.lastActivity = getLastActivity(c);
                
                this.handleCloseModal()

                userStore.dispatch({type:'UPDATE_CANDIDATURE_AND_USER_ACTION_COUNTER', candidature:c});
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

    getActivity(event)
    {
        return <CandidatureActivity {...this.props} key={event.id} event={event} onEdit={this.onEdit} onRemove={this.onRemove} />
    }

    getActivities()
    {
        let res = [];
        let events = [];
        const c = this.props.candidature;

        for(let k in c.events)
        {
            let eT = c.events[k].eventType;
            if(eT!==2 && eT!==8 && eT!==9)
            {
                events.push(c.events[k]);
            }
        }
        //events = events.concat(rappels);

        events.sort(function(a,b){return b.eventTime - a.eventTime; });
        this.activityCount=events.length;

        for(let i=0; i<events.length; ++i)
        {
            res.push(this.getActivity(events[i]));

            if(i===1 && !this.state.showAllActivities)
                break;
        }
        return res;
    }
    
    getToggleButton()
    {
        let res="";

        if(this.activityCount>2)
        {
            if(this.state.showAllActivities)
            {  
                res = <ShowLessLink onClick={this.onToggleClick} />
            }
            else
            {
                res = <ShowMoreLink onClick={this.onToggleClick} />
            }
        }
        
        return res;
    }

    
    render()
    {
        return <div className='candidatureDescription'>
                <div className='candidatureDescriptionHeader'>
                    <div className='candidatureDescriptionTitle'>
                        <table><tbody><tr>
                            <td><i className="fal fa-calendar-alt"></i></td>
                            <td>Fil d'activité</td>
                        </tr></tbody></table>
                    </div>
                </div>
                {this.getActivities()}
                {this.getToggleButton()}
                <CandidatureEditEventModal showModal={this.state.showEditEventModal} 
                                event={this.selectedEvent}
                                formLoading={this.state.modalFormLoading}
                                onClick={this.onValidateClicked} 
                                handleCloseModal={this.handleCloseModal}
                                errorMsg={this.state.modalError} />
                <CandidatureRemoveEventModal showModal={this.state.showConfirmRemoveModal} 
                                type="activite"
                                event={this.selectedEvent}
                                formLoading={this.state.modalFormLoading}
                                onClick={this.onRemoveClicked} 
                                handleCloseModal={this.handleCloseModal}
                                errorMsg={this.state.modalError} />
            </div>        
    }
}
export default CandidatureActivities;

export class CandidatureActivity extends Component
{

    onEdit = e =>
    {
        e.stopPropagation();

        this.props.onEdit(this.props.event);
    }

    onRemove = e =>
    {
        e.stopPropagation();
        this.props.onRemove(this.props.event);
    }

    getDate(evt)
    {
        return <div className="candidatureActivityDate">{evt.eventTime.format("D MMM YYYY")}</div>
    }

    getIcon(eventProps)
    {
        let res= "";
        if(eventProps.shape)
        {
            res = <div className={eventProps.shape}>
                <i className={eventProps.icon} />
            </div>
        }
        else 
            res=<i className={eventProps.icon} /> 

        return res;
    }

    getJob()
    {
        let res = "";

        if(this.props.display)
        {
            const event = this.props.event;
            const c = userStore.getState().user.candidatures[event.candidatureId];

            res = <div className='candidatureActivityJob'> {<Link to={"/dashboard/candidature/"+c.id}>{c.nomCandidature}</Link>}{c.nomSociete?" pour "+c.nomSociete:""}</div>
        }

        return res;
    }
    

    render()
    {   
        //console.log("aaaa");
        let event = this.props.event;
        let eventProps = getEventProperties(event);


        //console.log("bbbb ",eventProps, event);

        return <div className='candidatureActivity'>
                <div className='row'>
                    <div className='col-xs-2 candidatureActivityIcon'>{this.getIcon(eventProps)}</div>
                    <div className='col-xs-6 candidatureActivityLabel'>{eventProps.label} {this.getJob()}
                    </div>
                    <div className='col-xs-4'>{this.getDate(event)}</div>
                </div>
                {!this.props.display?<div className='row'>
                    <div className='col-xs-12 candidatureActivityText' dangerouslySetInnerHTML={formatText(event.comment)}></div>
                    {
                        !this.props.isVisitor?<div className='col-xs-12 candidatureActivityEdit'>
                            <CandidatureEditButton tooltip="Modifier l'activité" onClick={this.onEdit} />
                            <CandidatureEditButton tooltip="Supprimer l'activité" isRemove="1" onClick={this.onRemove} />
                        </div>:""
                    }
                </div>:""}
        </div>
    }
}

export class ShowLessLink extends Component
{
    render()
    {
        return <div className='candidatureShowMore'>
                    <button onClick={this.props.onClick}>
                        Afficher moins&nbsp;&nbsp;&nbsp;<i className="fas fa-chevron-up" />
                    </button>
                </div>;
    }
}

export class ShowMoreLink extends Component
{
    render()
    {
        return <div className='candidatureShowMore'>
                    <button onClick={this.props.onClick}>
                        Afficher plus&nbsp;&nbsp;&nbsp;<i className="fas fa-chevron-down" />
                    </button>
                </div>;
    }
}