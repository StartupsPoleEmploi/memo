import React, { Component } from 'react';
import { Form, Field, FormSpy} from 'react-final-form';
import { sendForgottenPasswordMail } from '../../../actions/userActions';
import { required, isRequiredValidEmail } from '../../../components/formValidators.js';


class ForgottenPasswordForm extends Component
{
    constructor(props)
    {
        super(props);
        this.state = { message : null,
                    showButton : true,
                    isLoading : false };
        
        this.submitForgottenPassword = this.submitForgottenPassword.bind(this);        
    }

    async submitForgottenPassword(values)
    {
        if(this.state.showButton)
        {
            this.setState({showButton:false,
                            message:"",
                        isLoading:true});

            sendForgottenPasswordMail(values)
            .then(function(response) {
                return response.json()
            })
            .then(function(json) {


                if(json.result=='ok')
                {
                    console.log(this.state.email);
                    this.setState({message:"Un  lien pour renouveler votre mot de passe vous a été envoyé par email à l'adresse "+values.loginEmail+" note : vérifiez dans vos spams si vous ne trouvez pas cet email dans votre boîte aux lettres"});
                }
                else
                {
                    if(json.result=="error" && json.msg=="systemError") {
                        console.log("error system");
                        this.setState({message:"Une erreur interne s'est produite"});
                    }
                    else {
                        this.setState({message:"Cette adresse ne correspond à aucun compte utilisateur"});
                    }
                }
            }.bind(this))
            .catch(function(error) {
                        this.setState({message:"Une erreur interne s'est produite" });
            }.bind(this))
            .finally( () =>
            {
                this.setState({showButton:true, isLoading:false});
            })
        }

    }


    render()
    {
        return  <Form onSubmit={this.submitForgottenPassword} subscription={{submitting:true}} >           
                    
                    {({handleSubmit, submitting, values}) => (
                    
                    <form noValidate onSubmit={handleSubmit}>
                    
                            {(this.state.message)?<div className="alert alert-danger">
                                    <span id="message">{this.state.message}</span>
                            </div>:""}           
                            
                            <Field  name="loginEmail" component="input" type="text" value={this.state.email} placeholder="Email" validate={isRequiredValidEmail} >
                            
                                {({input,meta,placeholder})=>(<div>
                                <input {...input} type='email' placeholder={placeholder} />
                                {meta.error && meta.touched && <div className='formError'>{meta.error}</div>}                        
                                </div>)}
                            </Field>

                            {this.state.showButton?<button type="submit" className="blueButton" disabled={submitting}>{submitting?<span><i className='fa fa-spinner fa-spin' /> Envoi en cours </span>:"Envoyer"}</button>:""}
                            {this.state.isLoading?<span className='forgottenSpinner'><i className='fa fa-spin fa-spinner' /> Demande en cours. Merci de patienter</span>:""}
                    
                    </form>)} 
                    
                </Form>

    }

}
export default ForgottenPasswordForm;