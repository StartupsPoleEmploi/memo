import React, { Component } from 'react';
import { Form, Field, FormSpy } from 'react-final-form';
import createDecorator from 'final-form-focus';
import { required, isRequiredValidEmail } from '../../../components/formValidators.js';
import '../../../css/form.css';
import { MEMO } from '../../../index.js';
import { userStore } from '../../../index.js';
import { navigate } from '@reach/router';
import { loadBoard } from '../../../actions/loadBoard.js';
import { loadUserFromCredentials } from '../../../actions/userActions';

const sleep = ms => new Promise(resolve => setTimeout(resolve,ms));


class ConnectionAccountEmailForm extends Component
{
    constructor(props)
    {
        super(props);
        this.state = { loginMsg : null};
        this.onSubmitFunc = this.onSubmitFunc.bind(this);
        this.focusOnError = createDecorator();
    }

    async onSubmitFunc(values)
    {
        loadUserFromCredentials(values)
        .then(function(response) {
            return response.json()
        })
        .then(async function(json) {
            if(json.result=='ok')
            {
                window.gtag('event', 'Connexion', { event_category: 'Utilisateur', event_label : 'login' }); 

                let jsonUser = json.user;
                jsonUser.csrf = json.csrf;
                this.setUser(jsonUser);
                
                await loadBoard();

                navigate("/dashboard");
            }
            else
            {
                if(json.result=="error" && json.msg=="systemError") {
                    this.setState({loginMsg:"Un problème technique empêche la connexion. Veuillez réessayer ultérieurement. Si le problème persiste vous pouvez contacter l'équipe MEMO avec le bouton 'Avis ou commentaire'."});
                }
                else {
                    this.setState({loginMsg:"Mauvais mot de passe ou erreur dans l'adresse e-mail"});
                }
            }
        }.bind(this))
        .catch(function(error) {
            this.setState({loginMsg:'Un problème technique s\'est produit. Veuillez réessayer plus tard. Si le problème persiste contactez le support MEMO.'});
        }.bind(this))
    }

    setUser(user)
    {
        MEMO.user = user;
        userStore.dispatch({type:'SET_USER', user:user});
    }

    render()
    {
        return  <Form onSubmit={this.onSubmitFunc} subscription={{submitting:true}} decorators={[this.focusOnError]} validate={values => {}}>
            
                    {({handleSubmit, submitting, values}) => (
                    <form noValidate onSubmit={handleSubmit}>
                    
                    {(this.state.loginMsg)?<div className="alert alert-danger">
                            <span id="loginMsg">{this.state.loginMsg}</span>
                    </div>:""}

                    <Field 
                        name="loginEmail" 
                        component="input" 
                        placeholder="Adresse e-mail de connexion" 
                        validate={isRequiredValidEmail} >
                    
                        {({input,meta,placeholder})=>(<div>
                        <input {...input} type='email' placeholder={placeholder} />
                        {meta.error && meta.touched && <div className='formError'>{meta.error}</div>}                        
                        </div>)}
                    </Field>

                        
                    <Field 
                        name="loginPassword" 
                        component="input"                     
                        placeholder="Mot de passe" 
                        validate={required} >
                    
                        {({input,meta,placeholder})=>(<div>
                        <input {...input} type='password' placeholder={placeholder} />
                        {meta.error && meta.touched && <div className='formError'>{meta.error}</div>}
                        </div>)}                                            
                    </Field>

                    <button type="submit" className="blueButton" disabled={submitting}>{submitting?<span><i className='fa fa-spinner fa-spin' /> En cours</span>:"Se connecter"}</button> 

                    </form>)}                
                </Form>

    }
}
export default ConnectionAccountEmailForm;
