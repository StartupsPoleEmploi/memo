import React, { Component } from 'react';
import { ShowLessLink, ShowMoreLink, CandidatureActivity } from '../candidature/candidatureActivities';

class PastActionsList extends Component{


    constructor(props)
    {
        super(props);
        this.state = {  showAllActivities:false, 
                        showSpinner:true };
        this.activityCount=0;
    }

    onToggleClick = e => 
    {
        this.setState({
            showAllActivities:!this.state.showAllActivities
            });
    }
        
    getPastActivity(event)
    {
    	return <CandidatureActivity key={event.id} event={event} display="pastActions" />
    }

    getPastActivities()
    {
        let res = [];
        let events = [];

        for(let k in this.props.user.candidatures)
        {
            const c = this.props.user.candidatures[k];

            for(let k2 in c.events)
            {
                events.push(c.events[k2]);
            }
            //events = events.concat(rappels);

            events.sort(function(a,b){return b.eventTime - a.eventTime; });
        }

        this.activityCount=events.length;

        if (this.activityCount != 0)
        {
        	for(let i=0; i<events.length; ++i)
	        {
	            res.push(this.getPastActivity(events[i]));
	
	            if(i===19 && !this.state.showAllActivities)
	                break;
	        }
        } else 
        {
        	// @RG - ACTIONS : Si aucune action déjà réalisée n'est identifiée, le message 'Pour le moment, vous n'avez pas encore réalisé d actions.' est affiché
        	res = <div className='candidatureActivity'><p>Pour le moment, vous n'avez pas encore réalisé d'actions.</p></div>
        }
        return res;
    }
    
    getToggleButton()
    {
        let res="";

        if(this.activityCount>20)
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
        return <div className='candidatureDescription pastActivity'>
                <div className='candidatureDescriptionHeader'>
                    <div className='candidatureDescriptionTitle'>
                        Déjà réalisées
                    </div>
                </div>
                {this.getPastActivities()}
                {this.getToggleButton()}
                {/*<CandidatureEditEventModal showModal={this.state.showEditEventModal} 
                                event={this.selectedEvent}
                                formLoading={this.state.modalFormLoading}
                                onClick={this.onValidateClicked} 
                                handleCloseModal={this.handleCloseModal}
                                errorMsg={this.state.modalError} />*/}
            </div>        
    }
}
export default PastActionsList;

