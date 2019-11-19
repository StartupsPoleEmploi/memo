import React, { Component } from 'react';
import PEConnectButton from '../../components/peConnectButton.js';
import { MEMO } from '../../index.js';

class PEConnect extends Component{

    getPEAMError()
    {
        if(MEMO.PEAMError)
        {
            return <div className='alert alert-danger'>{MEMO.PEAMError==1?<span>Un problème s'est produit lors de votre tentative de connexion à MEMO via votre compte Pôle Emploi.<br />
                                                Veuillez réessayer.<br />
                                                Si le problème persiste, merci de contacter le service MEMO.
                                            </span>:<span>
                                                Votre adresse électronique définie dans votre espace personnel de Pôle Emploi doit être valide pour utiliser le service MEMO. <br />
                                                Validez votre adresse et veuillez réessayer.<br />
                                                Si le problème persiste, merci de contacter le service MEMO.
                                            </span>}</div>
        }
        else
            return "";
    }

    render()
    {
        return <div className='col-xs-12'>
                <div className="connectTitle">Avec Pôle Emploi</div>
                <table className="extConnect">
                <tbody>
                    <tr>
                        <td>
                            {this.getPEAMError()}
                            <PEConnectButton />
                        </td>
                    </tr>
                </tbody>
                </table>
            </div>
    }
}
export default PEConnect;