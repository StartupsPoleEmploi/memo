import React, { Component } from 'react';
import Body from './components/body.js'
import Footer from './components/footer.js'
import {navigate} from '@reach/router';
import PolicyFormModal from './components/modals/policyFormModal.js';
import { getCookie, getValueFromPath, setLocalStorageConsentPolicy } from './components/utils.js';
import AutoLoginModal from './components/modals/autoLoginModal';
import { MEMO } from './index';

import './css/memo/eonasdandatepicker/eonasdandatepicker.css';
import './css/memo/tooltipster/tooltipster.bundle.min.css';
import './css/memo/tooltipster/tooltipster-sideTip-borderless.min.css';
import './css/memo/pixabay/jquery.auto-complete.css';
import './css/memo/introjs/introjs.min.css';
import './css/memo/optim.css';
import './css/memo/motivaction.css';
import './css/memo/home.css';
import './css/memo/header.css';
import './css/memo/homeForm.css';
import './css/memo/form.css';

import './css/memo/searchTools.css';
import './css/memo/fiche.css';
import './css/memo/timeline.css';
import './css/memo/parametres.css';
import './css/memo/priorites.css';
import './css/memo/activites.css';

import './css/memo/faq.css';
import './css/memo/toastr.css';
import './css/memo/importLanding.css';
import './css/memo/introJsMemo.css';
import './css/memo/calendar.css';
import './css/home.css';
import './css/footer.css';
import './css/cgu.css';
import './css/policy.css';
import './css/advice.css';
import './pic/image-pc.png';
import './pic/image-vaguebleue.svg';

class App extends Component {

  constructor(props)
  {
      super(props);

      const hasConsent = this.getConsent();
      this.isAuth = getCookie("isAuth");
      const visitorLink = getValueFromPath("link");
      const linkConseiller = getValueFromPath("linkConseiller");
      this.firstRender = true;

      //console.log("links ",visitorLink,linkConseiller);
      console.log("Version : ",React.version);

      let autoLoginMode = "";
      let autoLoginLink = "";

      // récupération url et jobTitle dans les paramètres
      this.getURLParams();
      this.getRedirectPathWhenLoggedIn();

      // si  lien conseiller
      if(linkConseiller)
      {
        window.gtag('event', 'Accès conseiller', { event_category: 'Utilisateur' });
        autoLoginMode = "conseiller";
        autoLoginLink = linkConseiller;
      }
      else if(visitorLink) // si lien visiteur
      {
        window.gtag('event', 'Accès visiteur', { event_category: 'Utilisateur' });

        autoLoginMode = "visitor";
        autoLoginLink = visitorLink;
      }
      else if(MEMO.resetToken)
      {
        navigate("/renouvellementMotDePasse");
      }
      else if(this.isAuth) // si utilisateur connecté via cookie
      {
        autoLoginMode = "cookie";
      }
      else if(MEMO.PEAMError)
      {
        navigate("/connection");
      }
      else // pas connecté
      {
        //console.log("-- App.js avant clean url");
        // masquage des paramètres de l'url sauf sur la page de faq
        this.cleanUrl();
      }
      //console.log("links ",visitorLink,linkConseiller, autoLoginLink,autoLoginMode);

      this.state={
          hasConsent,
          showAutoLoginModal : (this.isAuth||visitorLink||linkConseiller)?true:false,
          autoLoginMode,
          autoLoginLink,
          showConsentModal:false
      };
  }

  getURLParams()
  {
      MEMO.url = getValueFromPath("url");
      MEMO.jobTitle = getValueFromPath("jobTitle");
      MEMO.cId = getValueFromPath("c");
      MEMO.PEAMError = getValueFromPath("PEAMError");
      MEMO.resetToken = getValueFromPath("resetToken");
      MEMO.PEAMConnect = getValueFromPath("PEAMConnect");

      //console.log("getURLParams : ",MEMO);
  }

  // le chemin à remettre en place après une connexion pour rediriger vers une page spécifique (actions ou faq, le chemin vers une candidature spécifique est géré via les params d'URL)
  getRedirectPathWhenLoggedIn()
  {
    let redirectDestination = "",
        pn = window.location.pathname;
    if(pn.indexOf("priorities")>=0)
      redirectDestination = "/actions";
    else if(pn.indexOf("faq")>=0)
      redirectDestination = "/faq";
    else if(pn.indexOf("dashboard/candidature/")>=0)
    {
      try
      {
        MEMO.cId = eval(pn.substring(pn.lastIndexOf("/")+1));
      }
      catch(err){}
    }
    MEMO.redirectDestination = redirectDestination;

    //console.log("getRedirectPathWhenLoggedIn : ",pn, MEMO);
  }

  // reset de l'url d'arrivée sur la page pour nettoyer les chemins non accessibles en mode non connecté 
  cleanUrl()
  {
    const loc = window.location.pathname;

    if( MEMO.redirectDestination!=="/faq"
           && loc.indexOf("cgu")<0
           && loc.indexOf("connection")<0
           && loc.indexOf("creationCompte")<0  
           && loc.indexOf("motdepasseOublie")<0  
           && loc.indexOf("privacy")<0  
           && loc.indexOf("dashboard/candidature")<0
           )
          window.history.replaceState({},"Tableau de bord MEMO", "/");
  }

  getConsent()
  {
      let hasConsent = false;

      // fixer ici un state avec consent
      if(localStorage.getItem("hasConsent")=="true")
      {
        let consentExpire = localStorage.getItem('consentExpire');
        if(consentExpire)
        {
          consentExpire = eval(consentExpire);
          let now = new Date();
          now = now.getTime();
          if(consentExpire > now)
            hasConsent = true;  
        }
      }  
      
      return hasConsent;
  }

  getPrivacyBanner()
  {
    let res = "";

    if(!this.state.hasConsent)
      res = <div className='cookie-notice'>En poursuivant votre navigation sur ce site, vous acceptez nos conditions d'utilisation de vos données de navigations.
      <br />
      <button className="blueButton" onClick={this.onBannerConsent}>OK</button> 
      <a onClick={this.onOpenConsentModal}>En savoir plus ou s'opposer</a>
      </div>;

    return res;
  }

  onBannerConsent = (e) =>
  {
    if(e)
      e.stopPropagation();
    
    window.gtag('event', 'acceptedPolicy', { event_category: 'Privacy', event_label : 'Banner' }); 
    this.onConsent();
  }

  onConsent = () => 
  {
    this.onChangeConsent(true);
  }

  onChangeConsent = (accept) => 
  {
    setLocalStorageConsentPolicy(accept);
    this.setState({hasConsent:accept,showConsentModal:false});
  }

  onOpenConsentModal = () => 
  {    
    this.setState({showConsentModal:true});
  }

  onCloseConsentModal = (e) =>
  {
    e.stopPropagation();
    this.setState({showConsentModal:false});
  }

  handleCloseModal = e => 
  {
      if(e)
          e.stopPropagation();
      this.setState({showAutoLoginModal:false});
  }

  getPeAutoConnect()
  {
      //console.log("Conditions : ",this.firstRender, this.isAuth, "#"+getCookie("idutkes"));

      // construction d'une iframe cachée contenant la mire PEConnect pour connecter automatiquement un utilisateur sur MEMO s'il a une session PE ouverte
      if(this.firstRender && !this.isAuth && !this.visitorLink && !this.linkConseiller && getCookie("idutkes") && window.parent === window.self)
      {
        //console.log("ajout iframe cnx peConnect ",MEMO.rootURL+'/rest/account/peConnect/react');
        this.firstRender = false;
        return <iframe title='peConnectMemoFrame' src={MEMO.rootURL+'/rest/account/peConnect'} style={{display:'none'}}></iframe>
      }
      else
      {
        //console.log("pas d'auto connect iframe PE");
        return "";
      }
  }

  getBody()
  { 
	if(window.parent === window.self)   // pour empêcher de charger les éléments ci-dessous dans la frame de tentative de cnx  si l'utilisateur a une session PE ouverte
    {
        return <div>
                <Body hasConsent={this.state.hasConsent} onConsent={this.onConsent} onChangeConsent={this.onChangeConsent} onOpenConsentModal={this.onOpenConsentModal} memoState={this.props.memoState} />
                <Footer hasConsent={this.state.hasConsent} onOpenConsentModal={this.onOpenConsentModal} memoState={this.props.memoState} />
                <PolicyFormModal showConsentModal={this.state.showConsentModal} onChangeConsent={this.onChangeConsent} handleCloseModal={this.onCloseConsentModal} />
                <AutoLoginModal showModal={this.state.showAutoLoginModal} autoLoginLink={this.state.autoLoginLink} autoLoginMode={this.state.autoLoginMode} handleCloseModal={this.handleCloseModal} />
              </div>
    }
    else
      return <AutoLoginModal showModal={true} autoLoginLink="" autoLoginMode="cookie" handleCloseModal={this.handleCloseModal} />;
  }

  render() {
    return (
      <div>
        {this.getPrivacyBanner()}
        {this.getBody()}        
        {this.getPeAutoConnect()}
      </div>
    );
  }
}

export default App;