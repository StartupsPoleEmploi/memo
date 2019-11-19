import React, { Component } from 'react';
import '../../css/dashboardHeader.css';
import { Link, navigate } from "@reach/router";
import '../../css/breadcrumb.css';
import Tippy from '@tippy.js/react';
import { Form, Field } from 'react-final-form';
import createDecorator from 'final-form-focus';
import { required, isValidUrl, composeValidators } from '../../components/formValidators.js';
import { importCandidature, findDoubleCandidature, getLogoFromCompanyName } from '../../actions/importActions';
import { saveCandidature } from '../../actions/candidatureActions';
import { getLastActivity } from '../../actions/nextEvents.js';
import Candidature from '../../classes/candidature';
import { MEMO, userStore } from '../../index';
import moment from 'moment';
import { Constantes as CS } from '../../constantes';
import DoubleCandidatureModal from '../candidature/modals/doubleCandidatureModal';

class DashboardImporter extends Component{

    constructor(props)
    {
        super(props);
        //console.log("props header : ",props);

        this.saveNewCandidature = this.saveNewCandidature.bind(this);

        this.focusOnError = createDecorator();
        
        this.state = {
            importLoading:false,
            doubleCandidature : null,
            candidatureToSave : null
        }
    }
    
    componentDidMount()
    {
        // déclenchement de l'importOnStartup
        if(MEMO.url && this.props.importURLOnStartup)
        {
            this.importJob({importURL:MEMO.url});
            MEMO.url = "";
        }
    }
    
    importJob = values =>
    {
        this.setState({importLoading:true});

        importCandidature(values.importURL).then((importResult) => {

                MEMO.quickImportErrorMessage = "";
                if(importResult.candidature && importResult.candidature.nomCandidature)
                {
                    let t0 = 0;

                    // si pas de logo ET  un nom de société tentative de récupérer le logo via l'api clearbit
                    if(!importResult.candidature.logoUrl && importResult.candidature.nomSociete)
                    {
                        getLogoFromCompanyName(importResult.candidature.nomSociete)
                            .then(logo => { importResult.candidature.logoUrl = logo; }); 
                        
                        t0=400;
                    }

                    // enregistrement immédiat si pas de récup de logo, délai de 400 ms pour récupérer l'url du logo avant sauvegarde sinon
                    setTimeout((function () {

                        //console.log("sourceId : ",importResult.candidature.sourceId);
                        const doubleCandidature = findDoubleCandidature(this.props.user,importResult.candidature.sourceId); 
                        //console.log("doubleCandidature : ",doubleCandidature);

                        if(doubleCandidature)   // affichage de la modale de confirmation de doublon, sauvegarde des infos de la candidature en cas de sortie positive de la modale
                            this.setState({doubleCandidature, candidatureToSave:importResult.candidature});
                        else
                            this.saveNewCandidature(importResult.candidature);
                        
                    }).bind(this), t0);
                }
                else
                {
                    // enregistrement en variable globale du message d'erreur d'import --> permet de modifier l'affichage du formulaire
                    MEMO.quickImportErrorMessage = importResult.message;

                    // redirection formulaire
                    navigate('/nouvelleCandidature');
                    //this.setState({errorMsg:importResult.message});
                }
            }
        )
        .catch(err => {
            console.log("cas err :",err);
            MEMO.quickImportErrorMessage = err;
            navigate('/nouvelleCandidature');
        })
        .finally(() => 
        {
            //this.setState({isLoading:false});
            this.setState({importLoading:false});
            console.log("vider le formulaire d'import de candidature");
        })
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
            logoUrl : values.logoUrl?values.logoUrl:"",
            emailContact : values.emailContact,
            creationDate : moment(),
            telContact : values.telContact,
            sourceId : hS.sourceId?hS.sourceId:(values.sourceId?values.sourceId:""),
            jobBoard : values.jobBoard?values.jobBoard:hS.jobBoard,
            etat : hS.candidatureState?hS.candidatureState:0,
            urlSource : values.urlSource}); //window.history.candidatureState
        
        return c;     
    }

    async saveNewCandidature(candidature) 
    {
        //console.log("engt candidatuer : ",candidature);

        try
        {
            let c = this.initNewCandidature(candidature);
            c.etat = CS.ETATS.VA_POSTULER;  
            c.type = CS.TYPES_CANDIDATURE.OFFRE;

            //console.log("c : ",c,candidature);

            let response = await saveCandidature(c);
            let json = await response.json();

            //console.log("json : ",json);

            if(json.result==="ok")
            {
                c.id = json.id;

                c.lastActivity = getLastActivity(c);
                this.addCandidature(c);
            }
            else
                throw new Error(json.msg);

        }
        catch(err) {
            MEMO.quickImportErrorMessage = "Un problème technique empêche l'enregistrement des modifications. Veuillez réessayer ultérieurement. Si le problème persiste vous pouvez contacter l'équipe MEMO avec le bouton 'Avis ou commentaire'.";
            navigate('/nouvelleCandidature');
        }
        finally{
            this.setState({importLoading:false})
        }

    }

    addCandidature(c)
    {
        userStore.dispatch({type:'ADD_CANDIDATURE', candidature:c});
    }

    getImportForm()
    {
        return (this.props.active&&!this.props.isVisitor)?<Form onSubmit={this.importJob} subscription={{submitting:true}} decorators={[this.focusOnError]} validate={() => {}}>
                                        {({handleSubmit,form}) => (
                                        <form noValidate onSubmit={ async values => {
                                                                                        await handleSubmit(values)
                                                                                        form.reset() 
                                                                                    }} >
                                                    <Field 
                                                        name="importURL" 
                                                        component="input" 
                                                        initialValue=""
                                                        placeholder="Collez ici le lien Internet de l'offre" 
                                                        validate={composeValidators(required, isValidUrl)} >
                                                        {({input,meta,placeholder})=>(
                                                        <div className="quickImportField">
                                                            <input {...input} type="url" placeholder={placeholder} />
                                                            {(meta.error&&meta.error!=="Requis")?<div className='quickImportError'>Veuillez renseigner une addresse bien formée</div>:""}
                                                            <button type="submit" className="blueButton" disabled={this.state.importLoading}>{this.state.importLoading?<span><i className='fa fa-spinner fa-spin' /> Import en cours</span>:"Importer"}</button>     
                                                        </div>
                                                    )}
                                                    </Field>

                                            </form>)}                
                                        </Form>:"";
    }

    // on ferme la modale et on passe à l'étape 2
    acceptDoubleCandidature = () => 
    {
        this.saveNewCandidature(this.state.candidatureToSave);
        this.setState({doubleCandidature:null, candidatureToSave:null});
    }

    // on reste sur l'étape 1
    refuseDoubleCandidature = e =>
    {
        e.stopPropagation();
        this.setState({doubleCandidature:null, candidatureToSave:null});
    }

    render()
    {
        //console.log('Render dashboardHeader.js');
   
        return <div className='breadcrumb hidden-xs hidden-sm'>
                    {this.getImportForm()}
                    <DoubleCandidatureModal showModal={this.state.doubleCandidature?true:false}
                                doubleCandidature={this.state.doubleCandidature}
                                onAcceptClicked={this.acceptDoubleCandidature}
                                onRefuseClicked={this.refuseDoubleCandidature}
                                />
                </div>
    }
}
export default DashboardImporter;