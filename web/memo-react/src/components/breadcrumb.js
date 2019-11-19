import React, { Component } from 'react';
import { Link } from "@reach/router";
import '../css/breadcrumb.css';
import Tippy from '@tippy.js/react';

class Breadcrumb extends Component{

    getPath()
    {
        let res="";

        switch(this.props.page)
        {
            case 'candidaturePage' :
            {
                res = <span>/ Détail d'une candidature</span>;
                break;
            }

            case 'advice' : 
            {
                res = <span>/ Nos conseils</span>;
                break;
            }

            case 'actions' : 
            {
                res = <span>/ Mes actions</span>;
                break;
            }

            case 'parameters' : 
            {
                res = <span>/ Paramètres du compte</span>;
                break;
            }

            case 'newCandidatureForm' :
            {
                res = <span>/ Ajouter une nouvelle carte</span>;
                break;
            }

            case 'cgu' :
            {
                res = <span>/ Conditions générales d'utilisation</span>;
                break;
            }

            case 'faq' :
            {
                res = <span>/ Aide et support</span>;
                break;
            }

            case 'privacy' :
            {
                res = <span>/ Politique de confidentialité</span>;
            }

            default : break;
        }

        return res;
    }

    getHomeTarget()
    {
        if(this.props.user)
            return '/dashboard';
        else 
            return '/';
    }

    render()
    {
        return <div className='breadcrumb'>
            <Link  to={this.getHomeTarget()}>
                <Tippy content="Retour au tableau de bord" allowHTML="true" animation='shift-toward' placement="right" duration={[0,0]} trigger="mouseenter focus">
                    <i className='fas fa-home' />
                </Tippy>
            </Link>
            {this.getPath()}
        </div>
    }

}
export default Breadcrumb;    