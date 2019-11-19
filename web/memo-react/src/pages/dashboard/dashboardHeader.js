import React, { Component } from 'react';
import '../../css/dashboardHeader.css';
import { Link } from "@reach/router";
import '../../css/breadcrumb.css';
import Tippy from '@tippy.js/react';
import DashboardImporter from './dashboardImporter';
import DashboardFilter from './dashboardFilter';
import Button from '../../components/button';
import { MEMO } from '../../index';

class DashboardHeader extends Component{

    constructor(props)
    {
        super(props);
        
        this.state = {
            advancedFilterOpen:false,
            isFilterActivated:MEMO.dashboardFilters?true:false
        }
    }   

    getToggleFilterButton(e)
    {
        if(e)
            e.stopPropagation();

        return <Button title="Masquer les filtres" className="breadcrumb hideFilterButton" onClick={this.toggleFilter} tooltip="Cliquer pour fermer le panneau de configuration avancée des filtres" />;
    }

    toggleFilter = (e) =>
    {
        if(e)
            e.stopPropagation();

        this.setState({advancedFilterOpen:!this.state.advancedFilterOpen});
    }

    activateFilter = () =>
    {
        this.setState({isFilterActivated:true});
        this.props.onChangeFilter();
    }
    cancelFilter = () =>
    {
        this.setState({isFilterActivated:false});
        this.props.onChangeFilter();
    }

    getPath()
    {
        if(this.props.active)
            return <span>
                <i className='fas fa-home' />
                Tableau de bord
                </span>;
        else
            return <div>
                <Link to='/dashboard'>
                    <Tippy content="Retour au tableau de bord" allowHTML="true" animation='shift-toward' maxWidth={200} placement="right" duration={[0,0]} trigger="mouseenter focus">
                        <span>
                            <i className='fas fa-home' />   
                            Tableau de bord             
                        </span>
                    </Tippy>
                </Link>     
                <span> / Candidatures terminées</span>           
            </div>;
    }

    render()
    {
        //console.log('Render dashboardHeader.js');
        return <div className={'dashboardHeaderContainer'+(this.state.advancedFilterOpen?' filterFixedPosition':'')}>
            <div className='dashboardHeader'>
                <div className='breadcrumb'>
                    {this.getPath()}
                </div>
                {!this.state.advancedFilterOpen?<DashboardImporter {...this.props} />:''}
                {this.state.advancedFilterOpen?this.getToggleFilterButton():<DashboardFilter 
                                                                                advancedFilterOpen={this.state.advancedFilterOpen} 
                                                                                isFilterActivated={this.state.isFilterActivated} 
                                                                                toggleFilter={this.toggleFilter} 
                                                                                activateFilter={this.activateFilter}
                                                                                cancelFilter={this.cancelFilter}
                                                                                {...this.props} />}
            </div>
            {this.state.advancedFilterOpen?<DashboardFilter 
                                                advancedFilterOpen={this.state.advancedFilterOpen} 
                                                isFilterActivated={this.state.isFilterActivated} 
                                                toggleFilter={this.toggleFilter} 
                                                activateFilter={this.activateFilter}
                                                cancelFilter={this.cancelFilter}
                                                {...this.props} />:''}
        </div>
    }
}
export default DashboardHeader;