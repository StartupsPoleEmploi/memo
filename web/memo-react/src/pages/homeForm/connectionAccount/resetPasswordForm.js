import React, { Component } from 'react';
import { Form, Field } from 'react-final-form';
import createDecorator from 'final-form-focus';
import { required, minLength, composeValidators } from '../../../components/formValidators.js';
import '../../../css/form.css';
import { navigate } from '@reach/router';
import { resetPassword } from '../../../actions/userActions';
import { isPasswordValid } from '../../../components/utils.js';
import PasswordAdvice from '../passwordAdvice.js';
import { MEMO } from '../../../index.js';

class ResetPasswordForm extends Component
{
    constructor(props)
    {
        super(props);
        this.state = { resetMsg : null};
        this.onSubmitFunc = this.onSubmitFunc.bind(this);
        this.focusOnError = createDecorator();
    }

    async onSubmitFunc(values)
    {
    	resetPassword(values)
        .then(function(response) {
            return response.json()
        })
        .then(async function(json) {
            
            if(json.result=='ok')
            {
                MEMO.resetToken="";
                navigate('/connect');
            }
            else
            {
                if(json.result=="error" && json.msg=="systemError") {
                    this.setState({resetMsg:"Une erreur s'est produite. Veuillez contacter l'assistance de MEMO."});
                }
                else {
                    MEMO.resetToken="";
                    this.setState({resetMsg:"Votre token n'est plus valable. Veuillez retournez sur la page de mot de passe oublié pour en régénérer un nouveau."});
                }
            }
        }.bind(this))
        .catch(function(error) {
            this.setState({resetMsg:'Un problème technique s\'est produit. Veuillez réessayer plus tard. Si le problème persiste contactez le support MEMO.'});
        }.bind(this))
    }


    render()
    {
        return  <Form onSubmit={this.onSubmitFunc} subscription={{submitting:true}} decorators={[this.focusOnError]} validate={ values => {return isPasswordValid(values)} }>
            
                    {({form, handleSubmit, submitting, values}) => (
                    <form noValidate onSubmit={handleSubmit}>
                    
                    {(this.state.resetMsg)?<div className="alert alert-danger">
                            <span id="resetMsg">{this.state.resetMsg}</span>
                    </div>:""}

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

                    <PasswordAdvice />
                    
                    <button type="submit" className="blueButton" disabled={submitting}>{submitting?<span><i className='fa fa-spinner fa-spin' /> En cours</span>:"Enregistrer"}</button> 

                    </form>)}                
                </Form>

    }
}
export default ResetPasswordForm;
