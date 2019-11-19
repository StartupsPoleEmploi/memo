import React, { Component } from 'react';
import Modal from '../modal.js';
import { navigate  } from "@reach/router";
import { loadUserFromCookie,loadUserFromConseillerLink,loadUserFromVisitorLink } from '../../actions/userActions';
import {loadBoard} from '../../actions/loadBoard';
import { MEMO, userStore } from '../../index.js';

// modale de connexion implicite via cookie ou lien visiteur
class AutoLoginModal extends Component{

    constructor(props)
    {
        super(props);

        this.state = {
            autoLoginLoading : true,
            autoLoginError : ""
        }
    }

    componentDidMount()
    {
        // premier render du composant, tentative de connexion via cookie
        if(this.props.showModal && this.state.autoLoginLoading)
            this.loadUser();
    }

    // chargement implicite de l'utilisateur selon le contexte : cookie d'auth, lien visiteur, lien visiteur conseiller
    loadUser()
    {
        let loadUserFct, link="";

        if(this.props.autoLoginMode==="cookie")
        {
            loadUserFct = loadUserFromCookie;
        }
        else if(this.props.autoLoginMode==="visitor")
        {
            //console.log("lien visiteur ",this.props.autoLoginLink);
            loadUserFct = loadUserFromVisitorLink;
            link=this.props.autoLoginLink;
        }
        else if(this.props.autoLoginMode==="conseiller")
        {
            //console.log("lien conseiller ",this.props.autoLoginLink);
            loadUserFct = loadUserFromConseillerLink;
            link=this.props.autoLoginLink;
        }
        
        loadUserFct(link)
        .then(function(response) {
            return response.json()
        })
        .then(async function(json) {

            if(json.result=='ok')
            {
                if(this.props.autoLoginMode==="cookie")
                    window.gtag('event', 'Connexion', { event_category: 'Utilisateur', event_label : MEMO.PEAMConnect?'PEAM':'Cookie' });
                else
                    window.gtag('event', 'Connexion', { event_category: 'Utilisateur', event_label : this.props.autoLoginMode });

                let jsonUser = json.user;
                jsonUser.csrf = json.csrf;

                // cas d'autoconnexion PE Connect si le cookie idutkes est répéré. on est dans une IFRAME
                if(window.parent !== window.self)
                {   // envoi de l'instruction d'ajustement de l'interface du cadre parent
                    window.parent.loadBoardFromPEAM(jsonUser);
                }
                else
                {   // ajustement de l'interface courante   
                    // on est directement dans la fenêtre de l'interface. Autoconnexion par Cookie auth
                    this.setUser(jsonUser,link);
                    this.props.handleCloseModal();

                    await loadBoard();

                    navigate("/dashboard");
                }                                
            }
        }.bind(this))
        .catch(msg =>
        {
            let errorMsg = "Une erreur technique s'est produite. Veuillez réessayer. Si l'erreur persiste merci de contacter le support.";
            if(msg=="accessNotAllowed")
                errorMsg = "Vous n'avez pas accès à ces informations.";
            else if(msg=="tokenExpired")
                errorMsg = "Le lien a expiré."
            
            this.setState({ autoLoginError : errorMsg })
        })
        .finally( () => { this.setState({autoLoginLoading : false}); })        
    }

    setUser(user,link)
    {
        MEMO.user = user;
        MEMO.visitorLink = link;
        userStore.dispatch({type:'SET_USER', user:user, isVisitor:(link?true:false)});
    }

    // construction du titre et du texte de la modale d'autoLogin
    getParameters()
    {        
        let text='';
        let title='';
        
        if(this.props.autoLoginMode==="cookie")
        {
            if(this.state.autoLoginError)
            {
                title='Votre session a expiré';
                text ='Veuillez vous reconnecter à votre espace';
            }
            else
            {
                title='Connexion à votre espace MEMO';
                text ='';
            }
        }
        else if(this.state.autoLoginMode==="visitor")
        {
            if(this.state.autoLoginError)
            {
                title='Erreur de connexion à l\'espace MEMO';
                text ='Veuillez vérifier la validité du lien '+this.state.autoLoginError;
            }
            else
            {
                title='Connexion à l\'espace MEMO partagé';
                text ='';
            }
        }
        else if(this.state.autoLoginMode==="conseiller")
        {
            if(this.state.autoLoginError)
            {
                title='Erreur de connexion à l\'espace MEMO';
                text ='Veuillez vérifier la validité du lien '+this.state.autoLoginError;
            }
            else
            {
                title='Connexion à l\'espace MEMO du Demandeur d\'emploi';
                text ='';
            }
        }

        return {text,title};
    }

    render()
    {        
        let parameters = this.getParameters();

        return <Modal 
                title={parameters.title}
                text={parameters.text}
                disableOverlayClickClose={true}
                closeText="Fermer"
                formLoading={this.state.autoLoginLoading}
                errorMsg={this.state.autoLoginError}
                showModal={this.props.showModal} 
                handleCloseModal={this.props.handleCloseModal} />
    }
}
export default AutoLoginModal;