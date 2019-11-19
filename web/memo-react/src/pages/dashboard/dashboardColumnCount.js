import React, { Component } from 'react';
import '../../css/dashboard.css';

class DashboardColumnCount extends Component{

    render()
    {
        return <span className='dashboardCandidatureCount'>
                ({this.props.candidatureCount})
                </span>
    }
}
export default DashboardColumnCount;