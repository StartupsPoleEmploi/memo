import React, { Component } from 'react';
import { userStore } from '../../index.js';
import Header from '../../components/header.js';
import Spinner from '../../components/spinner.js';
import Breadcrumb from '../../components/breadcrumb.js';
import CompanyLogoSelector from '../../components/companyLogoSelector';
import { Form, Field } from 'react-final-form';
import createDecorator from 'final-form-focus';
import { Constantes as CS } from '../../constantes';
import moment from 'moment';
import { saveCandidature, saveCandidatureEvent } from '../../actions/candidatureActions';
import { importCandidature, findDoubleCandidature, getLogoFromCompanyName } from '../../actions/importActions';
import { navigate } from '@reach/router';
import { getLastActivity } from '../../actions/nextEvents.js';
import Candidature from '../../classes/candidature';
import CandidatureEvent from '../../classes/candidatureEvent';
import { maxLength, required, isValidEmail, isValidPhone, isValidUrl, composeValidators } from '../../components/formValidators.js';
import CandidatureStateModal from '../candidature/modals/candidatureStateModal';
import DoubleCandidatureModal from '../candidature/modals/doubleCandidatureModal';
import { MEMO } from '../../index';
import $ from 'jquery';

// modifie l'entrée courante de l'historique en modifiant une clef de history.state
export const changeHistoryState = (key,value) =>
{
    let newState = window.history.state;
    newState[key] = value;
    //console.log("alorss  : ",key,value);
    window.history.replaceState(newState,"");
}

class NewCandidatureForm extends Component{
    

    constructor(props)
    {
        super(props);

        this.state = {
            step:1,
            isLoading: false,
            step1Option: "import",
            cardType: 1,
            showHelp: false,
            errorMsg:"",
            showEntretienModal: false,
            doubleCandidature : null,
            formType: ""
        }

        this.saveNewCandidature = this.saveNewCandidature.bind(this);
        this.focusOnError = createDecorator();
        this.formValues = null;

    }

    componentDidMount()
    {
        $(window).scrollTop(0);
    }

    isStep1FormValid = (values) => { 

        let errors = {};
        
        const url = values.importURL;
        const nom = values.nomCandidature;

        if(this.state.step1Option==='import')
        { 
            if(!values.importURL || isValidUrl(url))
                errors.importURL = "Veuillez renseigner une adresse Internet bien formée. Ex : https://candidat.pole-emploi.fr/offres/recherche/detail/A0CARLRJ";
        }

        if(this.state.step1Option==='manual')
        { 
            if(!values.nomCandidature)
                errors.nomCandidature = "Requis";
            else if(nom.length>128)
                errors.nomCandidature  = "Trop long (maximum 128 char.)"; 
        }

        return errors;
    }


    // récupère dans l'historique de navigation les états qui influent sur le state du composant react
    static getDerivedStateFromProps(props, state) {
    
        let step1Option = window.history.state.step1Option;
        let step = window.history.state.step;
        let cardType = window.history.state.cardType;
        let modifiedState = {};
        let update = false;
        
        //console.log("import error ",MEMO.quickImportErrorMessage);

        if(MEMO.quickImportErrorMessage)
        {
            //console.log("Erreur import : ",MEMO.quickImportErrorMessage);
            modifiedState.step=2;
            modifiedState.step1Option="manual";
            modifiedState.cardType=CS.TYPES_CANDIDATURE.OFFRE;
            modifiedState.errorMsg = "Cette offre n'est plus disponible, n'existe pas ou est bloquée. Merci de renseigner le formulaire manuellement.";
            modifiedState.formType = "QuickImport";
            update = true;
            MEMO.quickImportErrorMessage="";    // reset du message
        }
        else
        {
            if(step)
            {
                modifiedState.step=step;
                update = true;
            }

            if(step1Option && step1Option!=="import")
            {
                modifiedState.step1Option="manual";
                update = true;
            }

            if(cardType && state.cardType!==cardType)
            {
                modifiedState.cardType=cardType;
                update=true;   
            }
        }

        return update?modifiedState:null;
    }

    // copie les éléments d'une candidature importée dans l'history state
    changeHistoryStateFromCandidature(c)
    {
        const cHS = changeHistoryState;
        if(c.ville)
            cHS("ville",c.ville);
        if(c.nomCandidature)
            cHS("nomCandidature",c.nomCandidature);
        if(c.description)
            cHS("description",c.description);
        if(c.nomSociete)
            cHS("nomSociete",c.nomSociete);
        if(c.numSiret)
            cHS("numSiret",c.numSiret);
        if(c.nomContact)
            cHS("nomContact",c.nomContact);
        if(c.emailContact)
            cHS("emailContact",c.emailContact);
        if(c.telContact)
            cHS("telContact",c.telContact);
        
        cHS("sourceId",c.sourceId);
        cHS("jobBoard",c.jobBoard);

        if(c.logoUrl)
            cHS("logoUrl",c.logoUrl);
    }

    selectManualBloc = () =>
    {
        changeHistoryState("step1Option","manual");
        this.setState({step1Option:"manual"});
    }

    selectImportBloc = () =>
    {
        changeHistoryState("step1Option","import");
        this.setState({step1Option:"import"});
    }

    close = (e) => {
        e.stopPropagation();
        //window.history.go(-1);
        navigate("/dashboard");
    }

    getForm()
    {  
        let res = "";

        if(this.state.isLoading)
            res = <Spinner />;
        else if(this.state.step==1)
            res = this.getStep1Form();
        else if(this.state.step==2)
            res = this.getStep2Form();

        return res;
    }

    proceedToStep2 = values =>
    {
        $(window).scrollTop(0);

        changeHistoryState("step",1);
        window.history.pushState(window.history.state,"");

        changeHistoryState("step",2);

        if(this.state.step1Option=="manual")
        {    
            this.setState({step:2, showEntretienModal:(window.history.state.candidatureState==CS.ETATS.ENTRETIEN)?true:false});
        }
        else
        {
            this.setState({isLoading:true, cardType:"", errorMsg:""});

            // cas d'import
            this.importJob().then((importResult) => {

                    if(importResult.candidature)
                    {
                        let t0 = 0;

                        // si pas de logo ET  un nom de société tentative de récupérer le logo via l'api clearbit
                        if(!importResult.candidature.logoUrl && importResult.candidature.nomSociete)
                        {
                            getLogoFromCompanyName(importResult.candidature.nomSociete)
                                .then(logo => { importResult.candidature.logoUrl = logo; }); 
                            
                            t0=400;
                        }
                        
                        // enregistrement immédiat si pas de récup de logo, délai de 200 ms pour récupérer l'url du logo avant sauvegarde sinon
                        setTimeout((function () {
                            this.changeHistoryStateFromCandidature(importResult.candidature);
                            const doubleCandidature = findDoubleCandidature(this.props.user,importResult.candidature.sourceId); 
                            this.setState({step:2, cardType:2, errorMsg:importResult.message, doubleCandidature, showEntretienModal:(window.history.state.candidatureState==CS.ETATS.ENTRETIEN)?true:false});
                        }).bind(this), t0);

                    }
                    else
                    {
                        this.setState({errorMsg:importResult.message});
                    }
                }
            )
            .finally(() => 
            {
                this.setState({isLoading:false});
            })
        }
    }

    backToStep1 = () => {
        window.history.pushState(window.history.state,"");

        changeHistoryState("step",1);
        this.setState({step:1});
        $(window).scrollTop(0);
    }

    async importJob()
    {
        //console.log("importUrl: ",window.history.state.importURL);

        return importCandidature(window.history.state.importURL);
    }

    async saveNewCandidature(values)
    {
        //console.log("sauvegarde nouvelle candidature ",values,this.state,window.history.state);
        $(window).scrollTop(0);

        let c = this.initNewCandidature(values);
        let event;

        // construction d'un événément de création de candidature
        if (c.etat > CS.ETATS.VA_POSTULER) 
        {
            event = new CandidatureEvent();
            if(c.etat==CS.ETATS.ENTRETIEN)
            {
                event.eventType = CS.TYPES.ENTRETIEN;
                event.comment = window.history.state.comment;
                event.eventTime = moment(window.history.state.eventTime);
                event.eventSubType = window.history.state.subType;                
            }
            else
            {
                
                event.eventTime = moment();
                if (c.etat == CS.ETATS.A_POSTULE) {
                    event.eventType = CS.TYPES.AI_POSTULE;
                } else if (c.etat == CS.ETATS.A_RELANCE) {
                    event.eventType = CS.TYPES.AI_RELANCE;
                }
            }
        }

        this.setState({isLoading:true, errorMsg:""})
        
        try
        {
            let response = await saveCandidature(c);
            let json = await response.json();

            if(json.result==="ok")
            {
                window.gtag('event', 'saveTunnel', { event_category: 'Candidature' });     

                c.id = json.id;

                if(event)   
                {
                    event.candidatureId = c.id;
                    response = await saveCandidatureEvent(event);
                    json = await response.json();

                    if(json.result==="ok")
                    {
                        event.id = json.id;
                        c.addEvent(event);
                    }
                    else
                    {
                        console.log("souci sauvegarde event ? et maintenant ? ",json.msg);
                    }
                }

                c.lastActivity = getLastActivity(c);
                this.addCandidature(c);
                navigate("/dashboard");
            }
            else
                throw new Error(json.msg);

        }
        catch(err) {
            this.setState({errorMsg:"Un problème technique empêche l'enregistrement des modifications. Veuillez réessayer ultérieurement. Si le problème persiste vous pouvez contacter l'équipe MEMO avec le bouton 'Avis ou commentaire'."});
        }
        finally{
            this.setState({isLoading:false})
        }
    }

    addCandidature(c)
    {
        userStore.dispatch({type:'ADD_CANDIDATURE', candidature:c});
    }

    initNewCandidature = values => 
    {
        const hS = window.history.state;
        let c = new Candidature({
            nomCandidature : values.nomCandidature,
            description : values.description,
            type : this.state.cardType,
            nomSociete : values.nomSociete,
            ville : values.ville,
            nomContact : values.nomContact,
            emailContact : values.emailContact,
            creationDate : moment(),
            telContact : values.telContact,
            sourceId : hS.sourceId?hS.sourceId:"",
            jobBoard : hS.jobBoard?hS.jobBoard:"",
            logoUrl : hS.logoUrl?hS.logoUrl:"",
            etat : hS.candidatureState?hS.candidatureState:0,
            urlSource : values.urlSource?values.urlSource:"" }); //window.history.candidatureState
        
        return c;     
    }

    getErrorMessage = () => {

        let res = "";

        if(this.state.errorMsg)
            res = <div className='errorMessage'>{this.state.errorMsg}</div>
        return res;
    }

    // formulaire de la première étape
    getStep1Form()
    {
        const hS = window.history.state;

        // sauvegarde de l'état initial de candidatureState
        changeHistoryState("candidatureState",(hS && hS.candidatureState)?hS.candidatureState:window.selectedCandidatureType);

        return <Form onSubmit={this.proceedToStep2} subscription={{submitting:true}} decorators={[this.focusOnError]} validate={values => {return this.isStep1FormValid(values)}}>
                {({handleSubmit, submitting, values}) => (
                <form noValidate onSubmit={handleSubmit}>
                    {this.getErrorMessage()}
                    <div>
                        <Field 
                            key="candidatureState"
                            name="candidatureState"
                            initialValue={(hS && hS.candidatureState)?hS.candidatureState:window.selectedCandidatureType}
                            component="select"  >                    
                            {({input})=>(<div className="row newCandidatureSelect">
                            <div className='newCandidatureFieldLabel'>Etat d'avancement</div>
                            <div>
                                <select {...input} onChange={(e) => {
                                                            input.onChange(e); //final-form's onChange
                                                            changeHistoryState("candidatureState",e.target.value);
                                                            }
                                                        } >
                                <option key="0" default value={CS.ETATS.VA_POSTULER}>Je vais postuler</option>
                                <option key="1" value={CS.ETATS.A_POSTULE}>J'ai postulé</option>
                                <option key="2" value={CS.ETATS.A_RELANCE}>J'ai relancé</option>
                                <option key="3" value={CS.ETATS.ENTRETIEN}>Entretien</option>    
                                </select>   
                            </div>
                            </div>)}
                        </Field>

                        <div className='newCandidatureFieldLabel'>
                            Nouvelle Candidature
                        </div>
                    
                        <div tabIndex="0" onClick={this.selectImportBloc} className={'newCandidatureSourceBloc' + ((this.state.step1Option==="import")?' active':'')}>
                        
                            <div className='newCandidatureSourceBlocTitle' >Remplissage automatique</div>
                            <div className='newCandidatureSourceBlocCheck' >{this.state.step1Option==="import"?<i className="fas fa-check-circle" />:<i className="far fa-circle" />}</div>
                            <div style={{clear:'both'}} />
                            Lorsque vous avez le lien Internet de l'offre d'emploi (ou de la petite annonce) qui a été diffusée sur un site Internet (site de l'entreprise, Pôle emploi, Indeed, Le Bon Coin ...).

                            <Field 
                                name="importURL" 
                                component="input" 
                                initialValue={(hS && hS.importURL)?hS.importURL:""} 
                                placeholder="Collez ici le lien Internet de l'offre" 
                                 >
                            
                                {({input,meta,placeholder})=>(<div className="candidatureField">
                                <div className='newCandidatureFieldLabel'>Lien Internet de l'offre</div>
                                <input {...input} type="url" className="candidatureTitle" type='text' placeholder={placeholder} onChange={(e) => {
                                                            input.onChange(e); //final-form's onChange
                                                            changeHistoryState("importURL",e.target.value);
                                                            }
                                                        } />
                            
                                {meta.error && meta.touched && <div className='formError'>{meta.error}</div>}                        
                                </div>)}
                            </Field>

                        </div>

                        <div tabIndex="0" onClick={this.selectManualBloc} className={'newCandidatureSourceBloc' + ((this.state.step1Option==="manual")?' active':'')}>
                        
                            <div className='newCandidatureSourceBlocTitle' >Remplissage manuel</div>
                            <div className='newCandidatureSourceBlocCheck' >{this.state.step1Option==="manual"?<i className="fas fa-check-circle" />:<i className="far fa-circle" />}</div>
                            <div style={{clear:'both'}} />
                            Lorsque vous n'avez pas de lien Internet ou que l'offre a été déposée sur un journal, sur une vitrine, sur les réseaux sociaux, sur un pdf ...

                            <Field 
                                name="nomCandidature" 
                                component="input" 
                                initialValue={(hS && hS.nomCandidature)?hS.nomCandidature:""} 
                                placeholder="Ex : Boucher en CDI" 
                                >
                            
                                {({input,meta,placeholder})=>(<div className="candidatureField">
                                <div className='newCandidatureFieldLabel'>Titre ou poste de l'offre</div>    
                                <input {...input}   className="candidatureTitle" 
                                                    type='text' 
                                                    placeholder={placeholder} 
                                                    onChange={(e) => {
                                                            input.onChange(e); //final-form's onChange
                                                            changeHistoryState("nomCandidature",e.target.value);
                                                            }
                                                        } />
                            
                                {meta.error && meta.touched && <div className='formError'>{meta.error}</div>}                        
                                </div>)}
                            </Field>

                        </div>

                    </div>
                    <div className='newCandidatureActions'>
                        <button type="button" onClick={this.close} className="back" disabled={submitting}>{submitting?"":"Retour"}</button> 
                        <button type="submit" disabled={submitting}>{submitting?<span><i className='fa fa-spinner fa-spin' />En cours</span>:"Suivant"}</button>     
                    </div>
                    </form>)}                
                </Form>;
    }

    toggleHelp = (e) => {
        e.stopPropagation();
        this.setState({showHelp:!this.state.showHelp});
    }

    selectType = e => {
        e.stopPropagation();
        const cardType = e.currentTarget.getAttribute("data-type"); 
        this.setState({cardType});
        changeHistoryState("cardType",cardType);
    }
    
    getStep2Form()
    {
        const hS = window.history.state;

        return <Form    onSubmit={this.saveNewCandidature} 
                        initialValues={ {
                                            nomCandidature:(hS && hS.nomCandidature)?hS.nomCandidature:"",
                                            description: (hS && hS.description)?hS.description:"",
                                            nomSociete: (hS && hS.nomSociete)?hS.nomSociete:"",
                                            ville: (hS && hS.ville)?hS.ville:"",
                                            nomContact: (hS && hS.nomContact)?hS.nomContact:"",      
                                            emailContact: (hS && hS.emailContact)?hS.emailContact:"",
                                            telContact: (hS && hS.telContact)?hS.telContact:""                                        
                                        } } 
                        subscription={{submitting:true}} 
                        decorators={[this.focusOnError]} 
                        validate={values => {}}>
                {({handleSubmit, submitting, values}) => (
                <form noValidate onSubmit={handleSubmit}>
                    {this.getErrorMessage()}

                    <div className='newCandidatureSectionTitle'>Candidature</div>

                    <div className='newCandidatureFieldLabel'>Type de candidature <i className="far fa-question-circle" onClick={this.toggleHelp}/></div>

                    <div className='newCandidatureRadio' tabIndex="0" data-type="1" onClick={this.selectType}><i className={this.state.cardType==1?'fas fa-check-circle':'far fa-circle'} /> <div>Une candidature spontanée</div></div>
                    {this.state.showHelp?<div className='newCandidatureHelp'><span>vous postulez auprès d'une entreprise qui n'a pas déposé d'offre</span></div>:''}
                    <div className='newCandidatureRadio' tabIndex="0" data-type="2" onClick={this.selectType}><i className={this.state.cardType==2?'fas fa-check-circle':'far fa-circle'} /> <div>Une offre d'emploi</div></div>
                    {this.state.showHelp?<div className='newCandidatureHelp'><span>vous réponsez à une offre d'emploi ou à une petite annonce.</span></div>:''}
                    <div className='newCandidatureRadio' tabIndex="0" data-type="3" onClick={this.selectType}><i className={this.state.cardType==3?'fas fa-check-circle':'far fa-circle'} /> <div>Une approche réseau</div></div>
                    {this.state.showHelp?<div className='newCandidatureHelp'><span>vous utilisez votre réseau relationnel : connaissances, anciens collègues, Viadeo, Linkedin, Facebook...</span></div>:''}
                    <div className='newCandidatureRadio' tabIndex="0" data-type="4" onClick={this.selectType}><i className={this.state.cardType==4?'fas fa-check-circle':'far fa-circle'} /> <div>Autre (Forum de l'emploi, etc...)</div></div>
                    {this.state.showHelp?<div className='newCandidatureHelp'><span>vous avez été contacté via votre CV en ligne, vous avez rencontré un recruteur lors d'un job dating ou un salon etc.</span></div>:''}

                    <Field 
                        name="nomCandidature" 
                        component="input" 
                        initialValue={(hS && hS.nomCandidature)?hS.nomCandidature:""} 
                        placeholder="Ex : Boucher en CDI" 
                        validate={composeValidators(required, maxLength(128))} >
                    
                        {({input,meta,placeholder})=>(<div className="candidatureField">
                        <div className='newCandidatureFieldLabel'>Titre ou poste de la candidature (obligatoire)</div> 
                        <input {...input}   className="candidatureTitle" 
                                            type='text' 
                                            placeholder={placeholder} 
                                            onChange={(e) => {
                                                input.onChange(e); //final-form's onChange
                                                changeHistoryState("nomCandidature",e.target.value);
                                                }
                                            } />
                    
                        {meta.error && meta.touched && <div className='formError'>{meta.error}</div>}                        
                        </div>)}
                    </Field>

                    <Field 
                        name="description" 
                        component="textarea" 
                        initialValue={(hS && hS.description)?hS.description:""} 
                        placeholder="" >
                    
                        {({input,meta,placeholder})=>(<div className="candidatureField">
                        <div className='newCandidatureFieldLabel'>Description de la candidature</div> 
                        <textarea {...input} className="candidatureTitle" type='text' placeholder={placeholder} onChange={(e) => {
                                                    input.onChange(e); //final-form's onChange
                                                    changeHistoryState("description",e.target.value);
                                                    }
                                                } />
                        </div>)}
                    </Field>
                    
                    <div className='newCandidatureSectionTitle'>Société</div>

                    {/*<Field 
                        name="nomSociete" 
                        component="input" 
                        initialValue={(hS && hS.nomSociete)?hS.nomSociete:""} 
                        validate={composeValidators(maxLength(128))} >
                    
                        {({input,meta,placeholder})=>(<div className="candidatureField">
                        <div className='newCandidatureFieldLabel'>Nom de la société</div> 
                        <input {...input}   className="candidatureTitle" 
                                            type='text' 
                                            onChange={(e) => {
                                                input.onChange(e); //final-form's onChange
                                                changeHistoryState("nomSociete",e.target.value);
                                                }
                                            } />
                        {meta.error && meta.touched && <div className='formError'>{meta.error}</div>}                        
                        </div>)}
                                        </Field>*/}

                    <Field 
                        name="nomSociete" 
                        component={CompanyLogoSelector} 
                        initialValue={(hS && hS.nomSociete)?hS.nomSociete:""}
                        logoUrl={(hS && hS.logoUrl)?hS.logoUrl:""}
                        placeholder="Société"
                        formType="newCandidature"
                        validate={composeValidators(maxLength(128))} />


                    <Field 
                        name="ville" 
                        component="input" 
                        initialValue={(hS && hS.ville)?hS.ville:""} 
                        validate={composeValidators(maxLength(255))} >
                    
                        {({input,meta,placeholder})=>(<div className="candidatureField">
                        <div className='newCandidatureFieldLabel'>Adresse</div> 
                        <input {...input}   className="candidatureTitle" 
                                            type='text' 
                                            onChange={(e) => {
                                                input.onChange(e); //final-form's onChange
                                                changeHistoryState("ville",e.target.value);
                                                }
                                            } />
                        {meta.error && meta.touched && <div className='formError'>{meta.error}</div>}                        
                        </div>)}
                    </Field>

                    <div className='newCandidatureSectionTitle'>Contact</div>

                    <Field 
                        name="nomContact" 
                        component="input" 
                        initialValue={(hS && hS.nomContact)?hS.nomContact:""} 
                        validate={composeValidators(maxLength(255))} >
                    
                        {({input,meta,placeholder})=>(<div className="candidatureField">
                        <div className='newCandidatureFieldLabel'>Nom de la personne à contacter</div> 
                        <input {...input}   className="candidatureTitle" 
                                            type='text' 
                                            onChange={(e) => {
                                                input.onChange(e); //final-form's onChange
                                                changeHistoryState("nomContact",e.target.value);
                                                }
                                            } />
                        {meta.error && meta.touched && <div className='formError'>{meta.error}</div>}                        
                        </div>)}
                    </Field>

                    <Field 
                        name="emailContact" 
                        component="input" 
                        initialValue={(hS && hS.emailContact)?hS.emailContact:""} 
                        validate={composeValidators(isValidEmail, maxLength(128))} >
                    
                        {({input,meta,placeholder})=>(<div className="candidatureField">
                        <div className='newCandidatureFieldLabel'>Adresse e-mail de la personne à contacter</div> 
                        <input {...input}   className="candidatureTitle" 
                                            type='email' 
                                            onChange={(e) => {
                                                input.onChange(e); //final-form's onChange
                                                changeHistoryState("emailContact",e.target.value);
                                                }
                                            } />
                        {meta.error && meta.touched && <div className='formError'>{meta.error}</div>}                        
                        </div>)}
                    </Field>

                    <Field 
                        name="telContact" 
                        component="input" 
                        initialValue={(hS && hS.telContact)?hS.telContact:""} 
                        validate={composeValidators(isValidPhone,maxLength(24))} >
                    
                        {({input,meta,placeholder})=>(<div className="candidatureField">
                        <div className='newCandidatureFieldLabel'>Numéro de téléphone de la personne à contacter</div> 
                        <input {...input}   className="candidatureTitle" 
                                            type='tel' 
                                            onChange={(e) => {
                                                input.onChange(e); //final-form's onChange
                                                changeHistoryState("telContact",e.target.value);
                                                }
                                            } />
                        {meta.error && meta.touched && <div className='formError'>{meta.error}</div>}                        
                        </div>)}
                    </Field>

                    <div className='newCandidatureActions'>
                        <button type="button" onClick={this.state.formType?this.close:this.backToStep1} className="back" disabled={submitting}>{submitting?"":"Retour"}</button> 
                        <button type="submit" disabled={submitting}>{submitting?<span><i className='fa fa-spinner fa-spin' />En cours</span>:"Valider"}</button>     
                    </div>
                    </form>)}                
                </Form>;
    }
    
    render()
    {
        //console.log("history state : ",window.history.state,this.state);

        return <div className='newCandidatureForm'>
            <Header {...this.props} />
            <Breadcrumb {...this.props} page="newCandidatureForm" />
            <div className='newCandidatureFormBackground'>
                <div className='newCandidatureFormContainer'>
                    <h2>Ajouter une nouvelle carte</h2>
                    <h3>Etape {this.state.step} sur 2</h3>
                    {this.getForm()}
                </div>

                <CandidatureStateModal showModal={this.state.showEntretienModal && !this.state.doubleCandidature} 
                                step="3"
                                formLoading={false}
                                disableClose={true}
                                onValidateClicked={this.onStoreEntretien} 
                                errorMsg="" />
                <DoubleCandidatureModal showModal={this.state.doubleCandidature?true:false}
                                doubleCandidature={this.state.doubleCandidature}
                                onAcceptClicked={this.acceptDoubleCandidature}
                                onRefuseClicked={this.refuseDoubleCandidature}
                                />
            </div>            
        </div>
    }

    // stockage de l'entretien
    onStoreEntretien = values =>
    {
        changeHistoryState("comment",values.comment);
        changeHistoryState("subType",values.interviewSubType);
        changeHistoryState("eventTime",values.selectedTime);

        this.setState({"showEntretienModal" : false});
    }

    // on ferme la modale et on passe à l'étape 2
    acceptDoubleCandidature = () => 
    {
        this.setState({doubleCandidature:null});
    }

    // on reste sur l'étape 1
    refuseDoubleCandidature = e =>
    {
        e.stopPropagation();
        this.setState({step:1, doubleCandidature:null});
    }
}
export default NewCandidatureForm;

