import React, { Component } from 'react';
import peConnectLogo from '../pic/logos/logo-pe-connect.svg';
import { MEMO } from "../index.js";


class PEConnectButton extends Component{

    constructor(props)
    {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.url = MEMO.rootURL + '/rest/account/peConnect';
    }

    handleClick()
    {
        console.log("voir si on réinjecte les éléments commentés ci-dessous");
        /*localStorage.setItem("peamSource",getAccountSource());
        localStorage.setItem("peamUrl",memoVars.url);
        lBR.logEventToGA('event', 'Utilisateur', 'PE Connect', 'Open PEAM');*/
    
        //window.location = MEMO.rootURL + '/account/peConnect/react';
    }

    render()
    {
        return <a className="peConnectButton" href={this.url}>
                <img src={peConnectLogo} alt="Bouton pour se connecter avec son compte Pôle emploi" />
            </a>
    }
}
export default PEConnectButton;