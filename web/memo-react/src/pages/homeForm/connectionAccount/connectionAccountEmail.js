import React, { Component } from 'react';
import { Link } from "@reach/router"
import ConnectionAccountEmailForm from './connectionAccountEmailForm.js';

class ConnectionAccountEmail extends Component{

    constructor(props)
    {
        super(props);
    }

    render()
    {
        return <div className='col-xs-12'> 
                    <div className="accountTitle accountTitleBorder">Avec votre E-mail</div>
                    <div className="col-xs-12">
                        
                        <ConnectionAccountEmailForm />

                        <div className="row accountEmail">
                            <div className="col-xs-12 col-sm-12">
                                <Link id="buttonForgottenPassword" to="/motdepasseOublie" className="link"><span>Mot de passe oublié</span></Link>
                            </div>
                            <div className="row col-xs-12 col-sm-12 txtBold accountTxtBlock">
                                Pas encore inscrit ?
                            </div>
                            <div className="row col-xs-12 col-sm-12 accountLinkBlock">
                                <Link to="/creationCompte" id="loginNoAccount"  className="link">S'inscrire</Link>
                            </div>
                        </div>

                    </div>

                </div>
    }
}
export default ConnectionAccountEmail;