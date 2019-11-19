import React, { Component } from 'react';
import '../../css/dashboard.css';
import NewCandidatureButton from './newCandidatureButton.js';
import DashboardColumnCount from './dashboardColumnCount.js';
import DashboardCard from './dashboardCard.js';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { getColumnOrderName } from './dashboard';
import { MEMO } from '../../index.js';

class DashboardColumn extends Component{
   
    setCount = count => 
    {
        this.count=count;
    }

    getClassName()
    {
        let res = "dashboardColumn ";
        switch(eval(this.props.type))
        {
            case 0 : {
                res += "brouillon";
                break;
            }
            case 1 : {
                res += "candidature";
                break;
            }
            case 2 : {
                res += "relance";
                break;
            }
            case 3 : {
                res += "entretien";
                break;
            }
            default : {}

        }

        return res;
    }

    getTitle()
    {
        switch(eval(this.props.type))
        {
            case 0 : return <span><i className='fa fa-long-arrow-alt-right' /> Je vais postuler <DashboardColumnCount candidatureCount={this.state.candidatureCount} /></span>
            case 1 : return <span><i className='fa fa-check' /> J'ai postulé <DashboardColumnCount candidatureCount={this.state.candidatureCount} /></span>
            case 2 : return <span><i className='fa fa-share' /> J'ai relancé <DashboardColumnCount candidatureCount={this.state.candidatureCount} /></span>
            case 3 :  return <span><i className='fa fa-comment-dots' /> J'ai un entretien <DashboardColumnCount candidatureCount={this.state.candidatureCount} /></span>
            default : return;
        }
    }

    getNewCandidatureButton()
    {
        let res = "";

        if(this.props.active&&!this.props.isVisitor)
            res = <NewCandidatureButton type={this.props.type} />

        return res;
    }

    getColumn()
    {
        if(this.props.isVisitor)
            return this.getVisitorColumn();
        else
            return this.getEditableColumn();
    }

    getEditableColumn()
    {
        return <Droppable droppableId={this.props.type}>
                    {(provided, snapshot) => (
                        <div className='dashboardColumnContainer' ref = {provided.innerRef}>
                            <InnerDashboardColumn isVisitor={this.props.isVisitor} setCount={this.setCount} columnOrderName={this.columnOrderName} {...this.props} />
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
    }

    getVisitorColumn()
    {
        return <div className='dashboardColumnContainer'>
                    <InnerDashboardColumn isVisitor={this.props.isVisitor} setCount={this.setCount} columnOrderName={this.columnOrderName} {...this.props} />
                </div>
    }

    render()
    {
        //console.log("AAAA column");

        this.columnOrderName = getColumnOrderName(this.props.type,this.props.active);
        
        if(MEMO.dashboardFilters)
            this.columnOrderName+="-filtered";

        //console.log("columns : ",this.props.user.columnOrder, this.columnOrderName);    

        // affectation état initial du candidature Count. Il faut éviter les setState dans cette classe afin d'avoir une boucle infinie de render
        this.state = {candidatureCount : this.props.user.columnOrder[this.columnOrderName].length };

        return <div className='col-md-3'><div className={this.getClassName()}>
            <div className='dashboardColumnTitle'>{this.getTitle()}</div>
            {this.getNewCandidatureButton()}
            {this.getColumn()}
            </div>
        </div>
    }
}
export default DashboardColumn;

class InnerDashboardColumn extends Component
{
    shouldComponentUpdate(nextProps)
    {
        let mDC = MEMO.dragContext;
        let res = true;

        //console.log("dragContext : ",mDC);

        if(mDC && !mDC.dragEnded)
        {
            //console.log("drag not ended yet - noUpdate");
            res = false;        
        }

        if(mDC && mDC.dragEnded)
        {
            res = false;

            if(mDC.sourceId==nextProps.type)
            {
                MEMO.dragContext.sourceId=null;
                if(mDC.destinationId==undefined || mDC.sourceId==null)
                    MEMO.dragContext = null;

                //console.log("dragended source - update");
                res = true;
            }

            if(mDC && mDC.destinationId==nextProps.type)
            {
                MEMO.dragContext.destinationId=null;
                if(mDC.sourceId==undefined || mDC.sourceId==null)
                    MEMO.dragContext = null;
                
                //console.log("dragended dest - update");
                res = true;
            }

            //console.log("dragended nor source nor dest- noupdate");            
        }    
        //console.log(nextProps.user.columnOrder[nextProps.columnOrderName].length,this.props.user.columnOrder[this.props.columnOrderName].length);
        //console.log("shouldUpdate : ",res);

        return res;
    }

    buildDashboardCard(c, index)
    {
        if(!this.props.isVisitor)
        {
            return <Draggable key={c.id} draggableId={c.id} index={index}>
                          {(provided, snapshot) => (
                            <div 
                                ref={provided.innerRef}
                                {...provided.draggableProps}  
                                {...provided.dragHandleProps} >
                            <DashboardCard key={c.id} 
                                        candidature={c}  
                                        {...this.props}
                                        isDragging={snapshot.isDragging}  />
                            </div>
                          )}
                        </Draggable>
        }
        else
        {
            return <DashboardCard key={c.id} 
                    candidature={c}  
                    isVisitor={true}
                    {...this.props} />
        }
    }

    render()
    {
        let res = [];
        
        this.count = 0;
        
        const candidatures = this.props.user.candidatures;
        const  columnOrder = this.props.user.columnOrder[this.props.columnOrderName];

        Object.entries(columnOrder).map( (cO, index) => {
            const c = candidatures[cO[1]];
            
            res.push(this.buildDashboardCard(c,index));
            
            this.count++;            
        });    

        this.props.setCount(this.count);
        
        return res;
    }
}