import React, { Component } from 'react';
import '../../../css/homeForm.css';
import '../../../pic/logos/memo_inverse.png';
import moment from 'moment';
import RGPDWarning from '../rgpdWarning.js';
import CreationAccount from './creationAccount.js';

class creationAccountPage extends Component{

    constructor(props)
    {
        super(props);
        this.state = { showSpinner:false};
    }
    
    toggleSpinner()
    {
        this.setState({showSpinner:!this.state.showSpinner});
    }

    render()
    {
        return <div className='row'>
            <div className='hidden-xs col-sm-3 connectionPageLeftPane'>
            </div>
            <div className='col-xs-12 col-sm-9 connectionPageCenterPane'>
                <div>
                    <h2>Créer votre compte</h2>
                    <div className="row boundary"></div>
                    {this.props.hasConsent?<CreationAccount showSpinner={this.state.showSpinner}/>:<RGPDWarning onConsent={this.props.onConsent} onOpenConsentModal={this.props.onOpenConsentModal} />}
                </div>
                <iframe id="loginTarget" name="loginTarget" className='displayNone'></iframe>
                <div id="peDisconnect" className="displayNone"></div>
            </div>

        </div>;
    }
}
export default creationAccountPage;