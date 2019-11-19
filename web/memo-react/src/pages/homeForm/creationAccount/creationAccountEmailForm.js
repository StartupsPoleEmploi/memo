import React, { Component } from 'react';
import { Form, Field, FormSpy } from 'react-final-form';
import createDecorator from 'final-form-focus';
import { required, isRequiredValidEmail, minLength, composeValidators } from '../../../components/formValidators.js';
import '../../../css/form.css';
import PasswordAdvice from '../passwordAdvice';
import { MEMO, userStore } from '../../../index.js';
import { navigate, Link } from '@reach/router';
import { loadBoard } from '../../../actions/loadBoard.js';
import { createAccount } from '../../../actions/userActions';
import { getAccountSource, isPasswordValid } from '../../../components/utils.js';

//const sleep = ms => new Promise(resolve => setTimeout(resolve,ms));


class CreationAccountEmailForm extends Component
{
    constructor(props)
    {
        super(props);
        this.state = { createAccountMsg : null};
        this.onSubmitFunc = this.onSubmitFunc.bind(this);
        this.focusOnError = createDecorator();
    }

    async onSubmitFunc(values)
    {
    	createAccount(values)
        .then(function(response) {
            return response.json()
        })
        .then(async function(json) {
            
            if(json.result=='ok')
            {
                let jsonUser = json.user;
                jsonUser.csrf = json.csrf;
                this.setUser(jsonUser);
             
                if (json.msg=="userCreated")
                    window.gtag('event', 'User creation', { event_category: 'Utilisateur', event_label : getAccountSource() }); 
                
                await loadBoard();

                navigate('/dashboard');                
            }
            else
            {
                if(json.result=="error" && json.msg=="systemError") {
                    this.setState({createAccountMsg:"Un problème technique empêche la création du compte. Veuillez réessayer ultérieurement. Si le problème persiste vous pouvez contacter l'équipe MEMO avec le bouton 'Avis ou commentaire'."});
                }
                else {
                    this.setState({createAccountMsg:"Cette adresse e-mail est déjà utilisée, veuillez vous connecter"});
                }
            }
        }.bind(this))
        .catch(function(error) {
            this.setState({createAccountMsg:'Un problème technique s\'est produit. Veuillez réessayer plus tard. Si le problème persiste contactez le support MEMO.'});
        }.bind(this))
    }

    setUser(user)
    {
        MEMO.user = user;
        userStore.dispatch({type:'SET_USER', user:user});
    }

    render()
    {
        //{alert(form.getFieldValue('loginPassword'))}
    	
    	return  <Form onSubmit={this.onSubmitFunc} subscription={{submitting:true}} decorators={[this.focusOnError]} validate={ values => {return isPasswordValid(values)} }>
            
                    {({form, handleSubmit, submitting, values}) => (
                    <form noValidate onSubmit={handleSubmit}>
                    
                    {(this.state.createAccountMsg)?<div className="alert alert-danger">
                            <span id="createAccountMsg">{this.state.createAccountMsg}</span>
                    </div>:""}

                    <Field 
                        name="loginEmail" 
                        component="input" 
                        placeholder="Votre adresse e-mail" 
                        validate={isRequiredValidEmail} >
                    
                        {({input,meta,placeholder})=>(<div>
                        <input {...input} type='email' placeholder={placeholder} />
                        {meta.error && meta.touched && <div className='formError'>{meta.error}</div>}                        
                        </div>)}
                    </Field>
                        
                    <Field 
                        name="newPassword" 
                        component="input"                     
                        placeholder="Mot de passe (minimum 12 caractères)" 
                        validate={composeValidators(required, minLength(12))} >
                    	
                        {({input,meta,placeholder})=>(<div>
                        <input {...input} type='password' placeholder={placeholder} /> 
                        {meta.error && meta.touched && <div className='formError'>{meta.error}</div>}
                        </div>)}                                            
                    </Field>

                    <Field 
	                    name="confirmNewPassword" 
	                    component="input"                     
	                    placeholder="Répéter le mot de passe" 
	                    	validate={required} >
	                
	                    {({input,meta,placeholder})=>(<div>
	                    <input {...input} type='password' placeholder={placeholder} /> 
	                    {meta.error && meta.touched && <div className='formError'>{meta.error}</div>}
	                    </div>)}                                            
                    </Field>
                    
                    <div className='creationAccountBlocCguCheckbox'>
		                <Field
                          name="cguCheck"
                          component="input"
		                  type='checkbox'
		                  validate={required}>
		                	
			              {({input,meta})=>(<div>
			                  <input id="cguCheck" type="checkbox" {...input} />
			                  <label htmlFor="cguCheck"> J'ai pris connaissance des <Link to='/cgu' className='link'>conditions générales d'utilisation</Link></label>
			                  {meta.error && meta.touched && <div className='formError'>{"Vous devez avoir pris connaissance des conditions générales"}</div>}
			              </div>)}
		                </Field>
		            </div>

                    <PasswordAdvice />
                    
                    <button type="submit" className="blueButton" disabled={submitting}>{submitting?<span><i className='fa fa-spinner fa-spin' /> En cours</span>:"S'inscrire"}</button> 

                    </form>)}                
                </Form>

    }
}
export default CreationAccountEmailForm;
