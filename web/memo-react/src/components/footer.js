import React, { Component } from 'react';
import { Link } from "@reach/router"

import logoPE from "../pic/logos/logo-pole-emploi-horizontal.png";
import "../pic/rgpd_off.png";
import "../pic/rgpd_on.png";
import Doorbell from './doorbell.js';
import { MEMO } from "../index.js";

class Footer extends Component{

    render()
    {
        return <footer className='Site-footer'>

            <div className='container-fluid marginFooterHeader'>
                <div className='row'>
                    <div className='col-md-4 col-md-push-4 col-xs-12'>
                        <div className='footerSideBorder footerLinks footerBlock'>
                            <div>
                                <Link to="/faq">Aide et support</Link>
                            </div>
                            <div>
                                <Link to="/cgu" >Conditions générales d'utilisation</Link>
                            </div>
                            {this.props.memoState?'':<div><Link to="/conseils" >Conseils</Link></div>}
                        </div>
                    </div>

                    <div className='col-md-4 col-md-push-4 col-xs-12'>
                        <div className='footerSideBorder footerLinks footerBlock'>
                            <div>
                                <Link to="/privacy" onClick={(evt)=>{MEMO.openPolicy(evt);}}>Politique de confidentialité</Link>
                            </div>
                            <div id="privacyBadge" className={this.props.hasConsent?'hasConsent':'noConsent'} onClick={this.props.onOpenConsentModal}></div>
                        </div>
                    </div>

                    <div className='col-md-4 col-md-pull-8 col-xs-12'>
                        <div className='footerLogo footerBlock'>
                            <div>
                                <a target='_blank' href='https://www.pole-emploi.fr'>
                                    <img src={logoPE} alt="Logo Pôle emploi" />
                                </a>
                            </div>
                            <div>
                                Ce site est propulsé par Pôle Emploi
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Doorbell />
        </footer>;
    }
}
export default Footer;