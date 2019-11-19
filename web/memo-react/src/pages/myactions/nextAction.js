import React, { Component } from 'react';
import '../../css/candidature.css';
import { Link } from "@reach/router";
import { userStore } from '../../index.js';
import Button from '../../components/button';

export class NextAction extends Component
{

	constructor(props) 
	{
		super(props);
		this.state = { showNewEventModal: false};
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

            res = <div onClick={this.logOpenCandidatureToGA} className='candidatureActivityJob'> {<Link to={"/dashboard/candidature/"+c.id}>{c.nomCandidature}</Link>}{c.nomSociete?" pour "+c.nomSociete:""}</div>
        }

        return res;
    }

    logOpenCandidatureToGA()
    {
        console.log("GA open candidature journal");
        window.gtag('event', 'openCandidature', { event_category: 'Candidature', event_label: 'journal' });     
    }
    
    render()
    {   
        let eventProps = this.props.event;
        
        return <div className='candidatureActivity'>
        		{eventProps ? (<div className='row'>
                    <div className='col-xs-2 col-sm-2 candidatureActivityIcon'>{this.getIcon(eventProps)}</div>
                    <div className='col-xs-10 col-sm-6 candidatureActivityLabel'>{eventProps.label} {this.getJob()}</div>
                    {(!this.props.isVisitor)?<div className='col-xs-12 col-sm-4'>
                        <Button title={this.props.titleAction} 
                                className='candidatureAddEventActionButton' 
                                tooltip={"Ajouter une action \"" + this.props.titleAction + "\""} 
                                placement="bottom-start"
                                srOnly="Ouvrir une modale pour ajouter une action à la candidature" 
                                onClick={this.addNewEvent} />
                                            </div>:''}
                </div>) : ''}
              </div>
    }
    
    addNewEvent = evt =>
    {
        if (evt)
        	evt.stopPropagation();
        
        this.props.onNewEvent(this.props.event);
    }
}
