import React, { Component } from 'react';
import '../../css/dashboard.css';
import '../../css/breadcrumb.css';
import { Form, Field } from 'react-final-form';
import createDecorator from 'final-form-focus';
import { required } from '../../components/formValidators.js';
import { MEMO } from '../../index';
import Button from '../../components/button';
import Tippy from '@tippy.js/react';
import { Constantes as CS } from '../../constantes';

class DashboardFilter extends Component{

    constructor(props)
    {
        super(props);
        
        this.focusOnError = createDecorator();
    }    

    activateFilter = (values) =>
    {
        if(this.props.advancedFilterOpen)
            MEMO.dashboardFilters = values;
        else
            MEMO.dashboardFilters = { keyword:values.keyword };
        
        MEMO.formDashboardFilters = Object.assign({},MEMO.dashboardFilters);

        this.props.activateFilter();
    }

    cancelFilter = () =>
    {
        //this.setState({isFilterActivated:false});
        MEMO.dashboardFilters = null;
        this.props.cancelFilter();
        
        // reset des colonnes
    }

    onFilterFunc = (values) =>
    {
        if(!this.props.advancedFilterOpen && this.props.isFilterActivated)
        {
            this.cancelFilter();
        }
        else
        {
            this.activateFilter(values);
        }

        if(this.props.advancedFilterOpen)
            this.props.toggleFilter();
    }

    // construit la liste des jobboards présents comme sources des fiches candidatures
    // optimisation à faire pour faire en sorte que la liste ne soit pas reconstruite à chaque
    // action sur le formulaire de filtrage
    buildSourceList = () =>
    {    
        if(this.props.user && this.props.user.candidatures)
        {
            const cs = this.props.user.candidatures;
            let uniqueSources = [],
                sourceList = [],
                jB;

            for(let k in cs)
            {
                jB = (cs[k])?cs[k].jobBoard:null;

                if(jB)
                {
                    if (uniqueSources.indexOf(jB.toUpperCase()) < 0) {
                        uniqueSources.push(jB.toUpperCase());
                        sourceList.push(jB);
                    }
                }
            }

            sourceList.sort();    

            return sourceList.map((function(jobBoard, i){return <option key={i}>{jobBoard}</option>}))
        }
        else
            return "";
    }

    render()
    {
        if(this.props.advancedFilterOpen)
            return <div className='advancedFilterContainer'>
                
                <div className="row">
                    <Form onSubmit={this.onFilterFunc} 
                            subscription={{submitting:true}} 
                            decorators={[this.focusOnError]} 
                            initialValues={MEMO.formDashboardFilters} >
                    {({handleSubmit, submitting, values}) => (
                    <form noValidate onSubmit={handleSubmit}>                
                        <Field 
                            key="stateFilter"
                            name="stateFilter"
                            component="select" >                    
                            {({input})=>(
                            <div className="visible-sm visible-xs col-xs-12 col-sm-6">
                                <label htmlFor="stateFilterSelect">Filtrer par Etat</label>
                                <br />
                                <select {...input} id="stateFilterSelect">
                                    <option key="-1" value="">Tous les états de candidature</option>
                                    <option key="0" value={CS.ETATS.VA_POSTULER}>Je vais postuler</option>
                                    <option key="1" value={CS.ETATS.A_POSTULE}>J'ai postulé</option>
                                    <option key="2" value={CS.ETATS.A_RELANCE}>J'ai relancé</option>
                                    <option key="3" value={CS.ETATS.ENTRETIEN}>Entretien</option>    
                                </select>   
                            </div>)}
                        </Field>

                        <Field 
                            key="typeFilter"
                            name="typeFilter"
                            component="select" >                    
                            {({input})=>(
                            <div className="col-md-3 col-xs-12 col-sm-6">
                                <label htmlFor="typeFilterSelect">Filtrer par Type</label>
                                <br />
                                <select {...input} id="typeFilterSelect">
                                    <option key="-1" default value="">Tous les types de candidature</option>
                                    <option key="0" value="2">Offres</option>
                                    <option key="1" value="1">Candidatures spontanées</option>
                                    <option key="2" value="3">Opportunités réseau</option>
                                    <option key="3" value="4">Autres</option>    
                                </select>   
                            </div>)}
                        </Field>

                        <Field 
                            key="jobboardFilter"
                            name="jobboardFilter"
                            component="select" >
                            {({input})=>(
                            <div className="col-md-3 col-xs-12 col-sm-6">
                                <label htmlFor="jobboardFilterSelect">Filtrer par Source</label>
                                <br />
                                <select {...input} id="jobboardFilterSelect">
                                    <option key="-1" value="">Toutes les sources d'offre</option>
                                    {this.buildSourceList()}
                                </select>   
                            </div>)}
                        </Field>

                        <Field
                          key="favoriteFilter"
                          name="favoriteFilter"
                          component="input" 
		                  type='checkbox'>
		                	
			              {({input,meta})=>(<div className="col-md-1 col-xs-12 col-sm-6">
                            <label htmlFor="favoriteFilter">Que les favoris</label>
                            <br />
                            <input id="favoriteFilter" type="checkbox" {...input} />
                            
			              </div>)}
		                </Field>

                        <div className="col-md-5 col-xs-12 col-sm-6">
                            <Field 
                                name="keyword" 
                                component="input" 
                                placeholder="Rechercher" >                            
                                {({input,meta,placeholder})=>(<div>
                                <input {...input} type='text' placeholder={placeholder} />
                                </div>)}
                            </Field>
                            <button type="submit" className="blueButton">Lancer la recherche</button>     
                        </div>

                    </form>)}                
                </Form>

                </div>                
            </div>;
        else
            {
                return <div className='breadcrumb'>
                
                <div className={'quickFilterField '+(this.props.isFilterActivated?'fixedFilterForm':'')}>
                    <Form 
                        onSubmit={this.onFilterFunc} 
                        subscription={{submitting:true}} 
                        decorators={[this.focusOnError]}
                        initialValues={MEMO.formDashboardFilters} 
                        validate={values => {}}>
                
                        {({handleSubmit, submitting, values}) => (
                        <form noValidate onSubmit={handleSubmit}>
                        
                        <Field 
                            name="keyword" 
                            component="input" 
                            placeholder="Rechercher" 
                            validate={!this.props.isFilterActivated?required:null} >
                        
                            {({input,meta,placeholder})=>(<div>
                            <input {...input} className='hidden-xs hidden-sm' type='text' placeholder={placeholder} />
                            </div>)}
                        </Field>

                        {
                            this.props.isFilterActivated?<Tippy content="Annuler la recherche et afficher toutes les candidatures" allowHTML="true" maxWidth={200} animation='shift-toward' placement="left" duration={[0,0]} trigger="mouseenter focus">
                                                            <button type="submit" className="searchButton"><i className='fal fa-times' /></button> 
                                                        </Tippy>:<Tippy content="Rechercher dans les candidatures" allowHTML="true" animation='shift-toward' placement="left" maxWidth={200} duration={[0,0]} trigger="mouseenter focus">
                                                            <button type="submit" className="searchButton hidden-xs hidden-sm"><i className='fa fa-search' /></button> 
                                                        </Tippy>
                        }

                        </form>)}                
                    </Form>
                    
                    <Button className='fa fa-filter' onClick={this.props.toggleFilter} tooltip="Afficher plus de critères de recherche" srOnly="Cliquer surce bouton pour avoir plus de critères de recherche" />
                </div>
            </div>;}
    }
}
export default DashboardFilter;