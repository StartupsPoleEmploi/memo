import React, { Component } from 'react';
import '../../css/candidature.css';
import CandidatureEditButton from './candidatureEditButton.js';
import { Form, Field } from 'react-final-form';
import createDecorator from 'final-form-focus';
import { saveCandidature } from '../../actions/candidatureActions.js';
import { userStore, MEMO } from '../../index.js';
import CompanyLogoSelector from "../../components/companyLogoSelector";
import { maxLength, required, isValidPhone, isValidEmail, composeValidators } from '../../components/formValidators.js';


class CandidatureInfoForm extends Component{

    constructor(props)
    {
        super(props);
        this.state = {candidatureError:""};

        this.onSubmitFunc = this.onSubmitFunc.bind(this);
        this.focusOnError = createDecorator();
        this.logoUrl = "";

        // initialise la valeur tampon de l'adresse du logo pour le formulaire de modification des infos de la candidature
        MEMO.formLogoUrl = this.props.candidature.logoUrl;
    }

    async onSubmitFunc(values)
    {
        //console.log("values : ",values);
        let c = this.props.candidature;

        c.nomCandidature = values.nomCandidature;
        c.nomSociete = values.nomSociete;
        c.ville = values.ville;
        c.emailContact = values.emailContact;
        c.nomContact = values.nomContact;
        c.telContact = values.telContact;
        
        //console.log("ONSUBMITFUNC MEMO.formLogoUrl : ",MEMO.formLogoUrl);

        // l'url du logo est stockée dans la variable globale MEMO.formLogoUrl car le champ
        // nomSociete ne peut retourner qu'une valeur
        c.logoUrl = MEMO.formLogoUrl/*?MEMO.formLogoUrl:this.logoUrl*/; // 
            
        this.setState({candidatureError:null});

        saveCandidature(c).then(function(response) {
            return response.json()
        })
        .then(async function(json) {

            if(json.result=='ok')
            {
                this.setCandidature(c);
                if(this.props.candidatureInfoFormOpened)
                    this.props.onEdit();
            }
            else
            {
                if(json.result=="error") {
                    this.setState({candidatureError:"Un problème technique empêche l'enregistrement des modifications. Veuillez réessayer ultérieurement. Si le problème persiste vous pouvez contacter l'équipe MEMO avec le bouton 'Avis ou commentaire'."});
                }
            }
        }.bind(this))
        .catch(function(error) {
            this.setState({candidatureError:"Un problème technique empêche l'enregistrement des modifications. Veuillez réessayer ultérieurement. Si le problème persiste vous pouvez contacter l'équipe MEMO avec le bouton 'Avis ou commentaire'."});
        }.bind(this))
    }

    setCandidature(c)
    {
        userStore.dispatch({type:'UPDATE_CANDIDATURE', candidature:c});
    }

    getLogo()
    {
        let res="";

        if(this.props.candidature.logoUrl)
        {
            this.logoUrl = this.props.candidature.logoUrl;  // initialisation de logoUrl
            res = <div className='col-xs-12 col-md-3'>
                <div className='candidatureInfoLogo'><img alt="" src={this.logoUrl} /></div>
                {this.getCreationDate()}
            </div>
        }
        return res;
    }

    getCreationDate()
    {
        return <div className="candidatureDate">Créé le {this.props.candidature.creationDate.format("ddd D MMMM YYYY à hh:mm")}</div>
    }

    getInfoBloc()
    {
        return this.props.candidatureInfoFormOpened?this.getInfoForm():this.getInfo();
    }

    getInfo()
    {
        let res = "";
        const c = this.props.candidature;

        res = <div className='candidatureInfo'>
                <div className='candidatureInfoTitle'>
                    <div>{c.nomCandidature}</div>
                    <div><CandidatureEditButton {...this.props} onClick={this.props.onEdit} /></div>
                </div>
                {!c.logoUrl?this.getCreationDate():""}
                {c.nomSociete?<div className='candidatureInfoText'><i className='fal fa-building' />{c.nomSociete}</div>:""}
                {c.ville?<div className='candidatureInfoText'><i className='fal fa-map-marker-alt' />{c.ville}</div>:""}
                {c.nomContact?<div className='candidatureInfoText'><i className='fal fa-address-book' />{c.nomContact}</div>:""}
                {c.emailContact?<div className='candidatureInfoText'><a href={"mailto:"+c.emailContact}><i className='fal fa-envelope' />{c.emailContact}</a></div>:""}
                {c.telContact?<div className='candidatureInfoText'><a href={"tel:"+c.telContact}><i className='fal fa-mobile-alt' />{c.telContact}</a></div>:""}
                {c.urlSource?<div className='candidatureInfoText'><a href={c.urlSource} target="_blank"><i className='fal fa-link' />{c.urlSource}</a></div>:""}                
        </div>

        return res;
    }

    getErrorMessage()
    {
        let res="";
        if(this.state.candidatureError)
        {
            res = <div className='col-xs-12 errorMessage'>{this.state.candidatureError}</div>;
        }
        return res;
    }

    getInfoForm()
    {
        let res = "";
        const c = this.props.candidature;

        const { value, suggestions } = this.state;

        res = <div className='candidatureInfoForm row'>
                {this.getErrorMessage()}
                <Form onSubmit={this.onSubmitFunc} subscription={{submitting:true}} decorators={[this.focusOnError]} validate={values => {}}>
                {({handleSubmit, submitting, values}) => (
                <form noValidate onSubmit={handleSubmit}>

                    <div className='col-xs-12 col-md-9'>
                        <Field 
                            name="nomCandidature" 
                            component="input" 
                            initialValue={c.nomCandidature?c.nomCandidature:""} 
                            placeholder="Titre de la candidature" 
                            validate={composeValidators(required, maxLength(128))} >
                        
                            {({input,meta,placeholder})=>(<div className="candidatureField">
                            <input {...input} className="candidatureTitle" type='text' placeholder={placeholder} />
                        
                            {meta.error && meta.touched && <div className='formError'>{meta.error}</div>}                        
                            </div>)}
                        </Field>

                        <Field 
                            name="nomSociete" 
                            component={CompanyLogoSelector} 
                            initialValue={c.nomSociete?c.nomSociete:""}
                            logoUrl={c.logoUrl?c.logoUrl:""}
                            placeholder="Société"
                            validate={composeValidators(maxLength(128))} />

                        <Field 
                            name="ville" 
                            component="input" 
                            initialValue={c.ville?c.ville:""}
                            placeholder="Lieu" 
                            validate={composeValidators(maxLength(255))} >
                        
                            {({input,meta,placeholder})=>(<div className="candidatureField">
                            <i className='fas fa-map-marker-alt' />
                            <input {...input} type='text' placeholder={placeholder} />
                            {meta.error && meta.touched && <div className='formError'>{meta.error}</div>}                        
                            </div>)}
                        </Field>
                        
                        <Field 
                            name="nomContact" 
                            component="input"
                            initialValue={c.nomContact?c.nomContact:""}
                            placeholder="Nom de la personne à contacter" 
                            validate={composeValidators(maxLength(255))} >
                        
                            {({input,meta,placeholder})=>(<div className="candidatureField">
                            <i className='far fa-address-book' />
                            <input {...input} type='text' placeholder={placeholder} />
                            {meta.error && meta.touched && <div className='formError'>{meta.error}</div>}                        
                            </div>)}
                        </Field>

                        <Field 
                            name="emailContact" 
                            component="input"
                            initialValue={c.emailContact?c.emailContact:""}
                            placeholder="Adresse e-mail de contact" 
                            validate={composeValidators(isValidEmail, maxLength(255))} >
                        
                            {({input,meta,placeholder})=>(<div className="candidatureField">
                            <i className='far fa-envelope' />
                            <input {...input} type='email' placeholder={placeholder} />
                            {meta.error && meta.touched && <div className='formError'>{meta.error}</div>}                        
                            </div>)}
                        </Field>

                        <Field 
                            name="telContact" 
                            component="input"
                            initialValue={c.telContact?c.telContact:""}
                            placeholder="Téléphone de contact" 
                            validate={composeValidators(isValidPhone,maxLength(24))} >
                        
                            {({input,meta,placeholder})=>(<div className="candidatureField">
                            <i className='fas fa-mobile-alt' />
                            <input {...input} type='tel' placeholder={placeholder} />
                            {meta.error && meta.touched && <div className='formError'>{meta.error}</div>}                        
                            </div>)}
                        </Field>

                        {c.urlSource?<div className='candidatureInfoText'><a href={c.urlSource} target="_blank"><i className='fas fa-link' />{c.urlSource}</a></div>:""}                

                    </div>
                    <div className='col-xs-12 col-md-3'>
                        <button type="submit" className="blueButton" disabled={submitting}>{submitting?<span><i className='fa fa-spinner fa-spin' />En cours</span>:"Enregistrer"}</button> 
                        <button type="button" className="textButton" onClick={this.props.onEdit} disabled={submitting}>{submitting?"":"Annuler"}</button> 
                    </div>
                    </form>)}                
                </Form>
        </div>

        return res;
    }

    render()
    {
        return <div className='row'>
            {this.getLogo()}
            <div className={this.props.candidature.logoUrl?"col-xs-12 col-md-9":"col-xs-12"}>            
                {this.getInfoBloc()}
            </div>
        </div>
    }
}
export default CandidatureInfoForm;