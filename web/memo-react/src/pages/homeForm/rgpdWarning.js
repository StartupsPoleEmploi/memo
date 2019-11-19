import React, { Component } from 'react';
import Button from '../../components/button.js';
import { Link } from "@reach/router"

class RGPDWarning extends Component{

    render()
    {
        return <div className="row rgpdDeny" >
            Vous n'avez pas accepté la politique de confidentialité.
            <br /><br />
            La connexion à MEMO n'est possible que si vous acceptez cette politique de confidentialité.
            <br /><br />
        
            <Button title="J'accepte la politique de confidentialité" className='blueButton' tooltip="Accepter la politique de confidentialité de MEMO" 
                srOnly="Accepter la politique de confidentialité de MEMO"
                onClick={(evt)=>{this.props.onConsent();}}
                />
            <br />
            <a onClick={this.props.onOpenConsentModal} >En savoir plus</a>
            <br /><br />
        </div>;
    }
}
export default RGPDWarning;