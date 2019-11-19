import React, { Component } from 'react';
import '../../css/candidature.css';
import CandidatureEditButton from './candidatureEditButton.js';
import { Form, Field } from 'react-final-form';
import { saveCandidature } from '../../actions/candidatureActions.js';
import Spinner from '../../components/spinner.js';
import { userStore } from '../../index.js';
import { formatText } from '../../components/utils';

class CandidatureDescriptionForm extends Component{

    constructor(props)
    {
        super(props);
        this.state = {candidatureError:""};
        this.onSubmitFunc = this.onSubmitFunc.bind(this);
    }

    async onSubmitFunc(values)
    {
        let c = this.props.candidature;

        c.description = values.description;
        
        this.setState({candidatureError:null});

        saveCandidature(c).then(function(response) {
            return response.json()
        })
        .then(async function(json) {

            if(json.result=='ok')
            {
                this.setCandidature(c);
                if(this.props.candidatureDescriptionFormOpened)
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

    getDescriptionBloc()
    {
        return this.props.candidatureDescriptionFormOpened?this.getDescriptionForm():this.getDescription();
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

    getDescription()
    {
        let res = "";
        const c = this.props.candidature;

        res = <div className='candidatureDescription'>
                <div>
                    <div className='candidatureDescriptionTitle'>
                        <table><tbody><tr>
                            <td><i className='fal fa-clipboard-list' /></td>
                            <td>Description de la candidature</td>
                        </tr></tbody></table>
                    </div>
                    <div><CandidatureEditButton onClick={this.props.onEdit} {...this.props}  /></div>
                </div>
                {this.getContent(c)}
        </div>

        return res;
    }

    getContent(c)
    {
        if(c.descriptionLoaded)
            return  <div className='candidatureDescriptionText' dangerouslySetInnerHTML={this.getDescriptionHTML(c)} />;
        else
            return <Spinner />;
    }

    getDescriptionHTML(c) {
        return formatText(c.description);
        /*
        let description = c.description;
        if(!description)
            description="";
        description = description.replace(/[\r\n]/g, '<br />');

        return {__html: linkifyHtml(description)};*/
    }

    getDescriptionForm()
    {
        let res = "";
        const c = this.props.candidature;

        res = <div className='candidatureDescription'>
                
                <Form onSubmit={this.onSubmitFunc} subscription={{submitting:true}} validate={values => {}}>
                {({handleSubmit, submitting, values}) => (
                <form noValidate onSubmit={handleSubmit}>

                    <div>
                        <div className='candidatureDescriptionTitle'>
                            <table><tbody><tr>
                                <td><i className='fal fa-clipboard-list' /></td>
                                <td>Description de la candidature</td>
                            </tr></tbody></table>
                        </div>
                        <div>
                            <button type="submit" className="blueButton" disabled={submitting}>{submitting?"En cours ":""}Enregistrer</button> 
                            <button type="button" className="textButton" onClick={this.props.onEdit} disabled={submitting}>{submitting?"":"Annuler"}</button> 
                        </div>
                    </div>
   
                    {this.getErrorMessage()}

                    <div>
                        <Field 
                            name="description" 
                            component="input" 
                            initialValue={c.description?c.description:""} 
                            placeholder="Description" >
                        
                            {({input,meta,placeholder})=>(<div className="candidatureField">
                            <textarea {...input} placeholder={placeholder} />
                        
                            {meta.error && meta.touched && <div className='formError'>{meta.error}</div>}                        
                            </div>)}
                        </Field>
                    </div>
                        
                    </form>)}                
                </Form>
        </div>

        return res;
    }

    render()
    {
        return this.getDescriptionBloc();
    }
}
export default CandidatureDescriptionForm;