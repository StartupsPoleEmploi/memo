import React, { Component } from 'react';
import Spinner from '../../components/spinner.js';
import Header from '../../components/header.js';
import Breadcrumb from '../../components/breadcrumb.js';
import $ from 'jquery';

class PolicyInfoPage extends Component{

    constructor(props)
    {
        super(props);
        this.state={ content: null };

    }
    
    componentDidMount()
    {
    	let page = "/policyInfoPage.html";
        
        fetch(page)
        .then(resp =>{
            return resp.text();      
        })
        .then(content => {
            this.setState({
                content
            });
            
        })
        .catch(err => {
            console.log("Errror",err);
        }); 

        $(window).scrollTop(0);
    }

    onAccept = (e) => 
    {
        e.stopPropagation();
        this.props.onChangeConsent(true);
        window.gtag('event', 'acceptedPolicy', { event_category: 'Privacy', event_label : 'Info page' });
    }

    onDeny = (e) => 
    {
        e.stopPropagation();
        this.props.onChangeConsent(false);
        window.gtag('event', 'deniedPolicy', { event_category: 'Privacy', event_label : 'Info page' });
    }

    render()
    {
    	let content = {__html:this.state.content};
    	return <div className="privacy">
               		<Header user={this.props.user} page="policyInfoPage"/>
               		<Breadcrumb user={this.props.user} page="privacy"/>
                    <div className='privacyBackground'>
                        {!content.__html ? <Spinner/> : <div dangerouslySetInnerHTML = {content} />}
                        <div className='modalActions'>
                            {this.props.hasConsent?"":<button type="button" onClick={this.onAccept}>J'accepte la politique de confidentialité</button>}
                            {this.props.hasConsent?<button type="button" onClick={this.onDeny} className="btn dark btn-outline">Je refuse la politique de confidentialité (MEMO ne sera pas accessible)</button>:""}
                        </div>
                    </div>   
               </div>  
    }
}
export default PolicyInfoPage;