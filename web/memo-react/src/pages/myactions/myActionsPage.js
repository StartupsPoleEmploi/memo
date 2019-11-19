import React, { Component } from 'react';
import Header from '../../components/header.js';
import Breadcrumb from '../../components/breadcrumb.js';
import NextActionsList from './nextActionsList.js';
import PastActionsList from './pastActionsList.js';
import '../../css/actionPage.css';

class MyActionsPage extends Component{
		
    render()
    {
        console.log("envoi event Priorites affichage liste");
        window.gtag('event', 'affichage', { event_category: 'Priorites', event_label : 'liste' }); 

        return <div className='actionPage'>
            <Header {...this.props} page="actions" />
            <Breadcrumb {...this.props} page="actions" />
            
            <div className='actionContent'>
                <div className='actionTitle'>Mes actions</div>
                <NextActionsList {...this.props} />
                <PastActionsList user={this.props.user} />
            </div>

        </div>
    }
}
export default MyActionsPage;