import React, { Component } from 'react';
import '../../css/candidature.css';
import CandidatureEditButton from './candidatureEditButton.js';
import { saveCandidatureEvent, removeEvent } from '../../actions/candidatureActions.js';
import { userStore } from '../../index.js';
import { Constantes as CS } from '../../constantes';
import CandidatureEvent from '../../classes/candidatureEvent';
import CandidatureMessageModal from './modals/candidatureMessageModal.js';
import CandidatureRemoveEventModal from './modals/candidatureRemoveEventModal';
import moment from 'moment';
import Button from '../../components/button';
import { formatText } from '../../components/utils';
import { ShowMoreLink, ShowLessLink } from './candidatureActivities';

class CandidatureMessages extends Component{

    constructor(props)
    {
        super(props);
        this.state = {  showAllMessages:false,
                        showEditMessageModal:false,
                        showConfirmRemoveModal:false,
                        modalFormLoading:false,
                        modalError:""
                     };
        this.messageCount=0;
        this.selectedMessage = null;
        this.updateMessage = this.updateMessage.bind(this);
        this.removeEvent = removeEvent.bind(this);
    }

    onToggleClick = e => 
    {
        this.setState({showAllMessages:!this.state.showAllMessages});
    }

    handleCloseModal= e => {
        if(e)
            e.stopPropagation();

        this.setState( { showEditMessageModal : false,
                         showConfirmRemoveModal : false,
                         modalFormLoading : false,
                         modalError:"" });
    }

    onEdit = evt => {
        this.selectedEvent = evt;
        this.setState( { showEditMessageModal : true,
            modalError:"" });
    }

    onRemove = evt => 
    {
        this.selectedEvent = evt;
        this.setState( { showConfirmRemoveModal : true, modalError:"" });
    }

    onValidateClicked = (values) =>
    {
        this.setState({modalFormLoading:true});
        this.updateMessage(values);
    }

    async updateMessage(values)
    {     
        let evt = this.selectedEvent;
        
        if(!evt)    // en cas de création de message on initialise l'objet event
        {
            evt = new CandidatureEvent();
            evt.candidatureId = this.props.candidature.id;
        }

        if(values.messageType==0)
        {
            evt.eventType = CS.TYPES.ECHANGE_MAIL;
            evt.eventSubType = 0;
        }
        else
        {
            evt.eventType = CS.TYPES.ENTRETIEN;
            evt.eventSubType = values.messageType;
        }

        
        evt.eventTime = moment(values.selectedTime);
        evt.comment = values.comment?values.comment:"";

        saveCandidatureEvent(evt)
        .then(response => response.json() )
        .then(response => {

            if(response.result=="ok")
            {
                const cs = userStore.getState().user.candidatures;
                let c = cs[evt.candidatureId];
                
                if(!evt.id)
                    evt.id = response.id;

                if(!c.events)
                    c.events = [];
                c.events[evt.id] = evt;

                this.handleCloseModal();

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

    onRemoveClicked = (values) =>
    {
        this.setState({modalFormLoading:true});
        this.removeEvent();
    }

    getMessage(event)
    {
        return <CandidatureMessage {...this.props} key={event.id} event={event} onEdit={this.onEdit} onRemove={this.onRemove} />
    }

    getMessages()
    {
        let res = [];
        let events = [];
        const c = this.props.candidature;

        for(let k in c.events)
        {
            let eT = c.events[k].eventType;
            if(eT==CS.TYPES.ECHANGE_MAIL || eT==CS.TYPES.ENTRETIEN)
            {
                events.push(c.events[k]);
            }
        }
        //events = events.concat(rappels);

        events.sort(function(a,b){return b.eventTime - a.eventTime; });
        
        this.messageCount=events.length;

        for(let i=0; i<events.length; ++i)
        {
            res.push(this.getMessage(events[i]));

            if(i===1 && !this.state.showAllMessages)
                break;
        }

        return res;
    }

    getToggleButton()
    {
        let res="";

        if(this.messageCount>2)
        {
            if(this.state.showAllMessages)
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
    
    getAddMessageButton = () =>
    {
        return (!this.props.isVisitor)?<div style={{textAlign:"center"}}><Button title="Ajouter un échange" className='candidatureAddEventButton'  
        srOnly="Ouvrir un formulaire pour ajouter un échange à la candidature"
        onClick={(evt)=>{this.addMessage(evt);}} /></div>:"";
    }

    addMessage = evt =>
    {
        this.selectedEvent = null;
        this.setState( { showEditMessageModal : true,
            modalError:"" });
    }
    
    render()
    {
        return <div className='candidatureDescription'>
                <div className='candidatureDescriptionHeader'>
                    <div className='candidatureDescriptionTitle'>
                        <table><tbody><tr>
                            <td><i className="fal fa-comments"></i></td>
                            <td>Mes échanges</td>
                        </tr></tbody></table>
                    </div>
                </div>
                {this.getMessages()}
                {this.getToggleButton()}
                {this.getAddMessageButton()}
                <CandidatureMessageModal showModal={this.state.showEditMessageModal} 
                                event={this.selectedEvent}
                                formLoading={this.state.modalFormLoading}
                                onClick={this.onValidateClicked} 
                                handleCloseModal={this.handleCloseModal}
                                errorMsg={this.state.modalError} />
                <CandidatureRemoveEventModal showModal={this.state.showConfirmRemoveModal} 
                                type="message"
                                event={this.selectedEvent}
                                formLoading={this.state.modalFormLoading}
                                onClick={this.onRemoveClicked} 
                                handleCloseModal={this.handleCloseModal}
                                errorMsg={this.state.modalError} />
            </div>        
    }
}
export default CandidatureMessages;

class CandidatureMessage extends Component
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

    getMessageProperties()
    {
        const evt = this.props.event;
        let res = {};

        if(evt.eventType != CS.TYPES.ECHANGE_MAIL)
        {
            switch(eval(evt.eventSubType))
            {
                case CS.SUBTYPES.ENTRETIEN_PHYSIQUE : 
                {
                    res =  {icon:<i className="fal fa-handshake"></i>,
                            label:'Entretien physique'}
                    break;
                }
                case CS.SUBTYPES.ENTRETIEN_TEL : 
                {
                    res = {icon:<i className="fal fa-phone"></i>,
                            label:'Entretien téléphonique'}
                    break;
                }
                case CS.SUBTYPES.ENTRETIEN_VIDEO : 
                {
                    res = {icon:<i className="fal fa-video"></i>,
                            label:'Entretien vidéo'}
                    break;
                }
                default : break;
            }
        }
        else
        {
            res = { icon:<i className="fal fa-envelope"></i>,
                    label:'Echange de mail'
                    }
        }

        return res;
    }

    render()
    {   
        const event = this.props.event;
        const params = this.getMessageProperties();

        return <div className='candidatureActivity candidatureMessage'>
                <div className='row'>
                    <div className='col-xs-2 candidatureActivityIcon'>{params.icon}</div>
                    <div className='col-xs-6 candidatureActivityLabel'>{params.label}</div>
                    <div className='col-xs-4'>{this.getDate(event)}</div>
                </div>
                <div className='row'>
                    <div className='col-xs-12 candidatureActivityText' dangerouslySetInnerHTML={formatText(event.comment)}></div>
                    {!this.props.isVisitor?<div className='col-xs-12 candidatureActivityEdit'>
                        <CandidatureEditButton tooltip="Modifier" onClick={this.onEdit} />
                        <CandidatureEditButton tooltip="Supprimer le message" isRemove="1" onClick={this.onRemove} />
                    </div>:""}
                </div>        
        </div>
    }
}
