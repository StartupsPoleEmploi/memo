import React, { Component } from 'react';
import PEConnect from '../peConnect.js';
import ConnectionAccountEmail from './connectionAccountEmail.js';

class ConnectionAccount extends Component{

    getDisplay()
    {
        let res;
        if(this.props.showSpinner)
            res = <div className="homeFormSpinner"><i className="fa fa-spinner fa-spin"></i> Chargement en cours</div>
        else    
        {   
            res = <div>
                <PEConnect />
                <ConnectionAccountEmail />
            </div>
        }            
        
        return res;
    }   

    render()
    {
        return this.getDisplay();
    }
}
export default ConnectionAccount;