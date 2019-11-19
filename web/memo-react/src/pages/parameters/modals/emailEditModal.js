import React, { Component } from 'react';
import ReactModal from 'react-modal';
import Tippy from '@tippy.js/react';
import { Form, Field } from 'react-final-form';
import createDecorator from 'final-form-focus';
import { required, isRequiredValidEmail } from '../../../components/formValidators.js';
import { saveNewEmail } from '../../../actions/userActions';
import { MEMO, userStore } from '../../../index.js';


const isDifferentLogin = value => { 

    let res  = isRequiredValidEmail(value);
    
    if(!res && value.toLowerCase()===MEMO.user.login.toLowerCase())
        res = "L'adresse e-mail renseignée est identique à votre adresse actuelle.";
        
    return res;
}

//const sleep = ms => new Promise(resolve => setTimeout(resolve,ms));

// modale de chargement et d'affichage d'un lien de partage
class EmailEditModal extends Component{
    
    constructor(props)
    {
        super(props);
        this.state={
                errorMsg:""
        };

        this.focusOnError = createDecorator();
    }

    getCloseButton(type)
    {
        let res="";
        
        if(type=="cross")
        {    res = <Tippy content="Fermer" animation='shift-toward' placement="left" duration={[0,0]} trigger="mouseenter focus">
                <button className='modalClose' onClick={this.props.handleCloseModal}><i className='fal fa-times'></i></button>
            </Tippy>
        }
        else
            res = <button type="button" onClick={this.props.handleCloseModal} className='modalClose'>Annuler</button>
        
        return res;
    }

    onSaveEmail = async (values) => 
    {
        this.setState({errorMsg:''});
 
        //await sleep(1000);

        saveNewEmail(values)
        .then(response => response.json() )
        .then(async response => {
            if(response.result==="ok")
            {
                userStore.dispatch({type:'UPDATE_USER_EMAIL',login:values.newEmail})
                this.props.handleCloseModal()
            }
            else
                throw new Error(response.msg);
        })
        .catch(err => {
            let errorMsg = "Une erreur technique s'est produite. Veuillez contactez l'équipe MEMO";
            
            console.log("gerer erreur userAuth");

            if(err.message==="wrongPassword")
                errorMsg = "Le mot de passe renseigné ne correspond pas";
            else if(err.message==="userExists")
                errorMsg = "Cette adresse e-mail est déjà utilisée";
            
            this.setState({errorMsg});
        })
                
    }

    
    getModalBody()
    {
        let res="";

        res = <Form onSubmit={this.onSaveEmail} subscription={{submitting:true}} decorators={[this.focusOnError]} validate={values => {}}>
        
                {({handleSubmit, submitting, values}) => (
                <form noValidate onSubmit={handleSubmit}>
                
                {(this.state.errorMsg)?<div className="errorMessage">
                        {this.state.errorMsg}
                </div>:""}

                {MEMO.user.isPEAM?<div className='borderedModalField'>
                <div>Cette opération nécessite que vous redonniez votre mot de passe : </div>
                <Field 
                    name="password" 
                    component="input" 
                    placeholder="Mot de passe" 
                    validate={ required } >
                
                    {({input,meta,placeholder})=>(<div><div className='modalLongField'>
                    <input {...input} type='password' placeholder={placeholder} /></div>
                    {meta.error && meta.touched && <div className='formError'>{meta.error}</div>}                        
                    </div>)}
                </Field></div>:""}
                
                <div> Renseignez votre nouvelle adresse e-mail : </div>

                <Field 
                    name="newEmail" 
                    component="input" 
                    placeholder="Adresse e-mail de connexion" 
                    validate={ isDifferentLogin} >
                
                    {({input,meta,placeholder})=>(<div><div className='modalLongField'>
                    <input {...input} type='email' placeholder={placeholder} /></div>
                    {meta.error && meta.touched && <div className='formError'>{meta.error}</div>}                        
                    </div>)}
                </Field>

                    
                <div className='modalActions'>                            
                        {submitting?"":this.getCloseButton("text")}                                            
                        <button type="submit" disabled={submitting}>{submitting?<span><i className='fa fa-spinner fa-spin' /> En cours</span>:"Enregistrer"}</button> 
                </div>
                

                </form>)}                
            </Form>
        
        return res;
    }
    
    render()
    {        
        return <ReactModal isOpen={this.props.showModal}
                        contentLabel=""
                        onRequestClose={this.props.handleCloseModal}
                        appElement={document.getElementById('root')}
                        className="Modal"
                        shouldCloseOnOverlayClick={false}
                        overlayClassName="Overlay"
                >
                {this.getCloseButton("cross")}
                <div className='modalTitle'>Modifier votre adresse e-mail</div>
                {this.getModalBody()}
            </ReactModal>
    }
}
export default EmailEditModal;