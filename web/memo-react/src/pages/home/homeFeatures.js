import React, { Component } from 'react';
import BlueLine from '../../components/blueLine.js';
import pictoCandidatures from '../../pic/pictos/candidatures.svg';
import pictoAlertes from '../../pic/pictos/alertes.svg';
import pictoRecruteurs from '../../pic/pictos/recruteurs.svg';


class HomeFeatures extends Component{

    render()
    {
        return <div className='row homeFeatures'>
            <h2>Le service qui accélère votre retour à l'emploi</h2>
            <BlueLine className='center' />
            
            <div className='row homeFeatureList'>
                <HomeFeature title="Accédez à toutes vos candidatures en un clien d'oeil" text="Une plateforme en ligne qui vous permet de suivre l'état de vos candidatures simplement." img={pictoCandidatures} className="" />
                <HomeFeature title="Recevez des alertes personnalisées" text="MEMO identifie pour vous, les actions prioritaires pour accélérer votre retour à l'emploi. Ces actions sont déterminées en fonction de l'état de vos démarches." img={pictoAlertes} className='' />
                <HomeFeature title="Démarquez-vous auprès des recruteurs" text="MEMO vous apporte des conseils personnalisés pour bien relancer, vous préparer aux entretiens etc." img={pictoRecruteurs} className='last' />
            </div>
        </div>
    }
}
export default HomeFeatures;


class HomeFeature extends React.Component{

    render()
    {
       return <div className={'col-md-4 homeFeature '+this.props.className}>
            <div>
                <img src={this.props.img} alt=''/>
                <p className='homeFeatureTitle'>{this.props.title}</p>
                <p className='homeFeatureText'>{this.props.text}</p>
            </div>
        </div>
    }
}