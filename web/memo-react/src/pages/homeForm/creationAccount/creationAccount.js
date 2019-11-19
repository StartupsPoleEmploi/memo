import React, { Component } from 'react';
import PEConnect from '../peConnect.js';
import CreationAccountEmail from './creationAccountEmail.js';

class CreationAccount extends Component{

    render()
    {
    	let res;
        
        if(this.props.showSpinner)
            res = <div className="homeFormSpinner"><i className="fa fa-spinner fa-spin"></i> Chargement en cours</div>
        else    
        {   
            res = <div>
                <PEConnect />
                <CreationAccountEmail />
            </div>
        }
        
        
        return res;
    }
}
export default CreationAccount;