import React, { Component } from 'react';
import Header from '../../components/header'
import Breadcrumb from '../../components/breadcrumb'
import Spinner from '../../components/spinner'
import $ from 'jquery';
import { MEMO } from '../..';

class FAQ extends Component{

    constructor(props)
    {
        super(props);
        this.state={ content:null };
    }

    componentDidMount()
    {
        //console.log(window.location.protocol,window.location.hostname);
        fetch("/faq.html")
        .then(resp =>{
            //console.log(resp);
            return resp.text();      
        })
        .then(content => {
            //console.log(content);
            this.setState({
                content 
            });            
        })
        .catch(err => {
            console.log("Errror",err);
        });       

        $(window).scrollTop(0);

        // masquage du bouton doorbell, setTimeout pour que le masquage ait lieu aussi quand on va directement sur .../faq
        setTimeout(()=>{$(".doorbell-button.doorbell-visible").hide();},200);

        // reset de la page de redirection si accès en mode non connecté 
        console.log("FAQ redirect : vérifier que ca empêche pas l'apparition de la faq après autologin");
        if(MEMO.redirectDestination==="/faq")
            MEMO.redirectDestination="";

    }

    componentWillUnmount()
    {
        // réaffichage bouton doorbell
        $(".doorbell-button.doorbell-visible").show();
    }

    getMarkup(){
        return {__html:this.state.content};
    }

    openDoorbell(e)
    {
        e.stopPropagation();
        window.doorbell.show();

        document.getElementById("doorbell-title").innerHTML = "Avis ou commentaire";
        document.getElementById("doorbell-feedback").setAttribute("placeholder","Envoyer nous vos commentaires ou suggestions");
        document.getElementById("doorbell-email").setAttribute("placeholder","Votre adresse e-mail");
        document.getElementById("doorbell-submit-button").innerHTML = "Envoyer";
        document.getElementById("doorbell-close").setAttribute("title","Fermer");    
    }

    render()
    {
        let res = this.getMarkup();

        if(window.gtag)
            window.gtag('event', 'openFAQ', { event_category: 'FAQ' });
        
        return <div className="faq">
                    <Header user={this.props.user} page="faq"/>                   
                    <Breadcrumb page="faq" user={this.props.user} />
                    <div className="faqBackground">
                        <div className="faqContainer">

                            <h1>Aide et support</h1>

                            La plupart des personnes qui ont une question trouve directement leur réponse ci-dessous.<br /><br />
                            Si ce n'est pas votre cas ou que vous souhaitez simplement nous faire part de votre avis 
                            ou de  vos suggestions d'amélioration, <a onClick={this.openDoorbell}>cliquez ici</a>.
                   
                            <div dangerouslySetInnerHTML ={!res ? <Spinner/> : res }/>

                            <hr />
                            
                            <div style={{textAlign:'center',marginTop:'20px',marginBottom:'20px'}}>
                                <button className='modalButton' id="doorbellButton" onClick={this.openDoorbell}>
                                    Contactez le support
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
    }
}
export default FAQ;