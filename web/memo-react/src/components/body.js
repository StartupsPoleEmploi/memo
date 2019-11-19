import React, { Component } from 'react';
import { Router, Link } from "@reach/router";
import Home from '../pages/home/home.js';
import FAQ from '../pages/faq/faq.js';
import CGU from '../pages/cgu/cgu.js';
import ParameterPage from '../pages/parameters/parameterPage';
import ResetPasswordPage from '../pages/homeForm/connectionAccount/resetPasswordPage';
import PolicyInfoPage from '../pages/policy/policyInfoPage.js';
import ConnectionAccountPage from '../pages/homeForm/connectionAccount/connectionAccountPage.js';
import ForgottenPasswordPage from '../pages/homeForm/connectionAccount/forgottenPasswordPage.js';
import CreationAccountPage from '../pages/homeForm/creationAccount/creationAccountPage.js';
import AdvicePage from "../pages/advice/advicePage";
import MyActionsPage from "../pages/myactions/myActionsPage";
import Dashboard from '../pages/dashboard/dashboard.js';
import NewCandidatureForm from '../pages/newCandidature/newCandidatureForm';
import { MEMO } from '../index';

class Body extends Component{

    buildUserBody()
    {
        //console.log("user body ",);
        return  <div className='body withUser'>
                    <Router>
                        <Dashboard user={this.props.memoState.user} active={true} path="dashboard/*" />
                        <Dashboard user={this.props.memoState.user} active={false} path="dashboard/archives/*" />
                        <NewCandidatureForm path="/nouvelleCandidature" user={this.props.memoState.user} {...this.props} />
                        <AdvicePage user={this.props.memoState.user} path="conseils" />
                        <MyActionsPage user={this.props.memoState.user} path="actions" />
                        <ParameterPage user={this.props.memoState.user} path="parametres" />
                        <FAQ user={this.props.memoState.user} path="faq" />
                        <CGU user={this.props.memoState.user} path="cgu" />
                    	<PolicyInfoPage hasConsent={this.props.hasConsent} onChangeConsent={this.props.onChangeConsent} path="privacy" user={this.props.memoState.user} />
                    </Router>
                </div>;
    }

    buildVisitorBody()
    {
        //console.log("VISITORBODY");
        let isVisitor=true;
        return  <div className='body withUser'>
                    <Router>
                        <Dashboard user={this.props.memoState.user} isVisitor={isVisitor} active={true} path="dashboard/*" />
                        <Dashboard user={this.props.memoState.user} isVisitor={isVisitor} active={false} path="dashboard/archives/*" />
                        <AdvicePage user={this.props.memoState.user} isVisitor={isVisitor} path="conseils" />
                        <MyActionsPage user={this.props.memoState.user} isVisitor={isVisitor} path="actions" />
                        <FAQ user={this.props.memoState.user} path="faq" />
                        <CGU user={this.props.memoState.user} path="cgu" />
                    	<PolicyInfoPage hasConsent={this.props.hasConsent} onChangeConsent={this.props.onChangeConsent} path="privacy" user={this.props.memoState.user} />
                    </Router>
                </div>;
    }

    buildNoUserBody()
    {
        //console.log("no user body");
        return <div className='body'>
                    <Router>
                        <Home default path="/" />
                        <ConnectionAccountPage path="/connection" hasConsent={this.props.hasConsent} onConsent={this.onFormConsent} onOpenConsentModal={this.props.onOpenConsentModal} />
                        <ForgottenPasswordPage path="/motdepasseOublie" />
                        <ResetPasswordPage path="/renouvellementMotDePasse" />
                        <CreationAccountPage path="/creationCompte" hasConsent={this.props.hasConsent} onConsent={this.onFormConsent} onOpenConsentModal={this.props.onOpenConsentModal} />
                        <FAQ path="faq" />
                        <CGU path="cgu" />
                    	<PolicyInfoPage hasConsent={this.props.hasConsent} onChangeConsent={this.props.onChangeConsent} path="privacy" />
                        <AdvicePage path="conseils" />
                    </Router>
                    {this.getPEAMLogoutIframe()}
                </div>;
    }

    onFormConsent = (e) =>
    {
        if(e)
            e.stopPropagation();

        window.gtag('event', 'acceptedPolicy', { event_category: 'Privacy', event_label : 'Form' }); 

        this.props.onConsent();
    }

    buildBody()
    {
        //console.log("memoState : ",this.props.memoState);
        if(this.props.memoState && this.props.memoState.user)
        {
            if(this.props.memoState.isVisitor)
                return this.buildVisitorBody();
            else
                return this.buildUserBody();
        }
        else
            return this.buildNoUserBody();
    }

    // construit l'iframe vers l'url de déconnexion PEAM en cas de déconnexion utilisateur
    getPEAMLogoutIframe()
    {
        let res = "";
        if(MEMO.shouldDisconnectUserFromPE)
        {
            res = <iframe style={{display:"none"}} src="https://authentification-candidat.pole-emploi.fr/compte/deconnexion" />;
            MEMO.shouldDisconnectUserFromPE = false;
        }

        return res;
    }

    render()
    {
        return this.buildBody();
    }
}
export default Body;