import React, { Component } from 'react';
import '../../css/candidature.css';
import CandidatureEditButton from './candidatureEditButton.js';
import { saveCandidatureEvent, removeEvent } from '../../actions/candidatureActions.js';
import { userStore } from '../../index.js';
import { Constantes as CS } from '../../constantes';
import CandidatureEvent from '../../classes/candidatureEvent';
import CandidatureNoteModal from './modals/candidatureNoteModal.js';
import CandidatureRemoveEventModal from './modals/candidatureRemoveEventModal';
import moment from 'moment';
import Button from '../../components/button';
import { formatText } from '../../components/utils';

class CandidatureNotes extends Component{

    constructor(props)
    {
        super(props);
        this.state = {  showEditNoteModal:false,
                        showConfirmRemoveModal:false,                        
                        modalFormLoading:false,
                        modalError:""
                     };
        this.selectedNote = null;
        this.updateNote = this.updateNote.bind(this);
        this.removeEvent = removeEvent.bind(this);
    }

    handleCloseModal= e => {
        if(e)
            e.stopPropagation();

        this.setState( { showEditNoteModal : false,
                         showConfirmRemoveModal : false,
                         modalFormLoading : false,
                         modalError:"" });
    }

    onEdit = evt => {
        this.selectedEvent = evt;
        this.setState( { showEditNoteModal : true,
            modalError:"" });
    }

    onRemove = evt => 
    {
        this.selectedEvent = evt;
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
        this.updateNote(values);
    }

    async updateNote(values)
    {     
        let evt = this.selectedEvent;
        
        if(!evt)    // en cas de création de note on initialise l'objet event
        {
            evt = new CandidatureEvent();
            evt.candidatureId = this.props.candidature.id;
            evt.eventType = CS.TYPES.NOTE;
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
                    c.events=[];
                    
                c.events[evt.id] = evt;

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

    getNote(event)
    {
        return <CandidatureNote {...this.props} key={event.id} event={event} onEdit={this.onEdit} onRemove={this.onRemove} />
    }

    getNotes()
    {
        let res = [];
        let events = [];
        const c = this.props.candidature;

        for(let k in c.events)
        {
            let eT = c.events[k].eventType;
            if(eT==CS.TYPES.NOTE)
            {
                events.push(c.events[k]);
            }
        }
        //events = events.concat(rappels);

        events.sort(function(a,b){return b.eventTime - a.eventTime; });
        
        for(let i=0; i<events.length; ++i)
            res.push(this.getNote(events[i]));
        
        return res;
    }
    
    getAddNoteButton = () =>
    {
        return this.props.isVisitor?'':<div style={{textAlign:"center"}}><Button title="Ajouter une note" 
                className='candidatureAddEventButton' 
                srOnly="Ouvrir un formulaire pour ajouter une note à la candidature"
                onClick={(evt)=>{this.addNote(evt);}} /></div>;
    }

    addNote = evt =>
    {
        this.selectedEvent = null;
        this.setState( { showEditNoteModal : true,
            modalError:"" });
    }
    
    render()
    {
        return <div className='candidatureDescription'>
                <div className='candidatureDescriptionHeader'>
                    <div className='candidatureDescriptionTitle'>
                        <table><tbody><tr>
                            <td><i className="fal fa-sticky-note"></i></td>
                            <td>Mes notes</td>
                        </tr></tbody></table>
                    </div>
                </div>
                {this.getNotes()}
                {this.getAddNoteButton()}
                <CandidatureNoteModal showModal={this.state.showEditNoteModal} 
                                event={this.selectedEvent}
                                formLoading={this.state.modalFormLoading}
                                onClick={this.onValidateClicked} 
                                handleCloseModal={this.handleCloseModal}
                                errorMsg={this.state.modalError} />
                <CandidatureRemoveEventModal showModal={this.state.showConfirmRemoveModal} 
                                type="note"
                                event={this.selectedEvent}
                                formLoading={this.state.modalFormLoading}
                                onClick={this.onRemoveClicked} 
                                handleCloseModal={this.handleCloseModal}
                                errorMsg={this.state.modalError} />
            </div>        
    }
}
export default CandidatureNotes;

class CandidatureNote extends Component
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
    

    render()
    {   
        let event = this.props.event;
    
        return <div className='candidatureActivity candidatureNote'>
                <div className='row'>
                    <div className='col-xs-2 candidatureActivityIcon'><i className="fal fa-sticky-note"></i></div>
                    <div className='col-xs-6 candidatureActivityLabel'>Note</div>
                    <div className='col-xs-4'>{this.getDate(event)}</div>
                </div>
                <div className='row'>
                    <div className='col-xs-12 candidatureActivityText' dangerouslySetInnerHTML={formatText(event.comment)}></div>
                    {
                        !this.props.isVisitor?<div className='col-xs-12 candidatureActivityEdit'>
                                                <CandidatureEditButton tooltip="Modifier la note" onClick={this.onEdit} />
                                                <CandidatureEditButton tooltip="Supprimer la note" isRemove="1" onClick={this.onRemove} />
                                            </div>:''
                    }
                </div>        
        </div>
    }
}
