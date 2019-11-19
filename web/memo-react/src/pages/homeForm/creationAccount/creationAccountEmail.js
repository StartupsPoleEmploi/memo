import React, { Component } from 'react';
import { Link } from "@reach/router"
import CreationAccountEmailForm from './creationAccountEmailForm.js';

class CreationAccountEmail extends Component{

    constructor(props)
    {
        super(props);
    }

    render()
    {
    	const divStyle = { 'text-align':'left' };
    	
    	return <div className='col-xs-12'> 
                    <div className="accountTitle accountTitleBorder">Avec votre E-mail</div>
                    <div className="col-xs-12">
                        
                        <CreationAccountEmailForm />

                        <div className="row accountEmail">
	                        <div className="row col-xs-12 col-sm-12 txtBold">
	                                Déjà un compte sur MEMO ? 
	                        </div>
	                        <div className="row col-xs-12 col-sm-12 accountLinkBlock">                                		
	                                <Link to="/connection" className="link"> Se connecter</Link>
	                        </div>
	                    </div>
                    </div>

                </div>
    }
}
export default CreationAccountEmail;