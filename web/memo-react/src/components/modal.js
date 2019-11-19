import React, { Component } from 'react';
import { Form, Field } from 'react-final-form';
import createDecorator from 'final-form-focus';
import ReactModal from 'react-modal';
import Tippy from '@tippy.js/react';
import Spinner from './spinner.js';
import '../css/modal.css';
import DatePicker from "react-datepicker";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import fr from 'date-fns/locale/fr';
import { Constantes as CS } from '../constantes';
import moment from 'moment';

class Modal extends Component{

    constructor(props)
    {
        super(props);
        this.onSubmitFunc = this.onSubmitFunc.bind(this);
        this.focusOnError = createDecorator();
        
        if(props.showDateForm)
        {
            this.state = { selectedTime : props.selectedTime?props.selectedTime.toDate():moment().toDate() };
            if(props.requiredDateForm)
                this.state.requiredDateError=this.state.selectedTime?false:true;
        }        
    }

    // permet l'initialisation du datepicker
    componentWillReceiveProps(nextProps){
        if(nextProps.showDateForm && nextProps.selectedTime)
            this.setState({selectedTime : nextProps.selectedTime.toDate()});
    }

    handleCloseModal = e =>
    {
        if(e) 
            e.stopPropagation();
        this.props.handleCloseModa();
    }

    getErrorMessage()
    {
        let res="";
        if(this.props.errorMsg)
        {
            res = <div className='errorMessage'>{this.props.errorMsg}</div>;
        }
        return res;
    }

    getButtons(form, submitting)
    {   const bts = this.props.buttons;
        let res = [];

        if(bts)
        {
            for(let i=0;i<bts.length; ++i)
            {
                res.push(<button key={i} type="submit" onClick={(e) => { e.stopPropagation(); form.change("button", i); }} disabled={submitting}>{submitting?"En cours ":""}{bts[i].text}</button>);
            }
        }
        
        return res;
    }

    getCommentField()
    {
        let res="";
        if(this.props.showCommentForm)
        {
            res = <Field 
                        name="comment" 
                        component="textarea" 
                        initialValue={this.props.commentValue?this.props.commentValue:''}
                        placeholder="Commentaire"  >                    
                        {({input,meta,placeholder})=>(<div className="row modalComment">
                        <div className='col-xs-12 col-md-2'>Commentaire</div>
                        <div className='col-xs-12 col-md-10'><textarea {...input} placeholder={placeholder} /></div>
                        </div>)}
                    </Field>
        }

        return res;
    }
    
    getAdditionalFields()
    {
        let res="";
        if(this.props.additionalFields)
        {
            res = [];
            for(let i=0; i<this.props.additionalFields.length; ++i)
            {
                switch(this.props.additionalFields[i])
                {
                    case 'interviewSubType': {

                        res.push(this.getInterviewSubTypeField(this.props.additionalFields[i]));
                        break;
                    }
                    case 'archiveMotivation' : {
                        res.push(this.getArchiveSubTypeField(this.props.additionalFields[i]));
                        break;
                    }
                    case 'messageType' : {
                        res.push(this.getMessageTypeField(this.props.additionalFields[i]));
                        break;
                    }
                    case 'candidatureState' : {
                        res.push(this.getCandidatureStateField(this.props.additionalFields[i]));
                        break;
                    }
                    default : {
                        break;
                    }
                }
            }
        }

        return res;
    }

    getInterviewSubTypeField(field)
    {
        let res = "";

        res = <Field 
                key="interviewSubType"
                name="interviewSubType" 
                initialValue="1"
                component="select"  >                    
                {({input,meta,placeholder})=>(<div className="row modalSelect">
                <div className='col-xs-12 col-md-2'>Type d'entretien</div>
                <div className='col-xs-12 col-md-10'><select {...input} >
                    <option key="1" default value="1">Entretien physique</option>
                    <option key="2" value="2">Entretien téléphonique</option>
                    <option key="3" value="3">Entretien vidéo</option>
                    </select>   
                </div>
                </div>)}
            </Field>

        return res;
    }

    getMessageTypeField(field)
    {
        let res = "";

        res = <Field 
                key="messageType"
                name="messageType" 
                initialValue="1"
                component="select"  >                    
                {({input,meta,placeholder})=>(<div className="row modalSelect">
                <div className='col-xs-12 col-md-2'>Type d'échange</div>
                <div className='col-xs-12 col-md-10'><select {...input} >
                    <option key="0" default value="0">Echange de mail</option>
                    <option key="1" value="1">Entretien physique</option>
                    <option key="2" value="2">Entretien téléphonique</option>
                    <option key="3" value="3">Entretien vidéo</option>
                    </select>   
                </div>
                </div>)}
            </Field>

        return res;
    }

    getCandidatureStateField(field)
    {
        let res = "";

        res = <Field 
                key="candidatureState"
                name="candidatureState" 
                initialValue="1"
                component="select"  >                    
                {({input,meta,placeholder})=>(<div className="row modalSelect">
                <div className='col-xs-12 col-md-2'>Etat</div>
                <div className='col-xs-12 col-md-10'><select {...input} >
                    <option key="0" value="0">Je vais postuler</option>
                    <option key="1" default value="1">J'ai postulé</option>
                    <option key="2" value="2">J'ai relancé</option>
                    <option key="3" value="3">Entretien</option>
                    </select>   
                </div>
                </div>)}
            </Field>

        return res;
    }

    getArchiveSubTypeField(field)
    {
        let res = "";

        res = <Field 
                key="archiveSubType"
                name="archiveSubType" 
                initialValue={CS.SUBTYPES.REPONSE_NEG}
                component="select"  >                    
                {({input,meta,placeholder})=>(<div className="row modalSelect">
                <div className='col-xs-12 col-md-2'>Motif</div>
                <div className='col-xs-12 col-md-10'><select {...input} >
                    <option key="1" default value={CS.SUBTYPES.REPONSE_NEG}>Réponse négative</option>
                    <option key="2" value={CS.SUBTYPES.PAS_REPONSE}>Pas de réponse</option>
                    <option key="3" value={CS.SUBTYPES.OFFRE_POURVUE}>Offre pourvue</option>
                    <option key="4" value={CS.SUBTYPES.OFFRE_HORS_LIGNE}>Offre hors ligne</option>
                    <option key="5" value={CS.SUBTYPES.INTERESSE_PLUS}>Ca ne m'intéresse plus</option>
                    <option key="6" value={CS.SUBTYPES.AI_POSTE}>J'ai le poste</option>
                    <option key="7" value={CS.SUBTYPES.TROUVE_AUTRE_POSTE}>J'ai trouvé un autre poste</option>
                    <option key="8" value={CS.SUBTYPES.AUTRE}>Autre</option>
                    </select>   
                </div>
                </div>)}
            </Field>

        return res;
    }

    handleDateChange = dt =>
    {
        if(this.props.requiredDateForm)
        {
            if(!dt)
                this.setState({selectedTime:dt, requiredDateError:true});
            else
                this.setState({selectedTime:dt, requiredDateError:false});
        }
        else
            this.setState({selectedTime:dt});
    }

    getDateField()
    {
        let res="";
        
        if(this.props.showDateForm)
        {
            res = <div className="row modalDatePicker">
                <div className='col-xs-12 col-md-2'>Date</div>
                <div className='col-xs-12 col-md-10'>
                    <DatePicker
                    selected={this.state.selectedTime}
                    onChange={this.handleDateChange}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={1}
                    locale={fr}
                    showYearDropdown
                    showMonthDropdown
                    placeholderText="Date"
                    dateFormat="d MMMM yyyy HH:mm"
                    timeCaption="Heure"
                    />
                    {this.state.requiredDateError && <div className='formError'>Requis</div>}                        
                </div>
            </div>
        }

        return res;
    }

    onSubmitFunc(values)
    {
        let proceed=true;
        let res = values;
        if(this.props.showDateForm)
        {
            res.selectedTime = this.state.selectedTime;

            if(this.props.requiredDateForm && !res.selectedTime)
                proceed=false;
        }

        if(proceed)
            this.props.buttons[values.button].onClick(res);
    }

    getForm()
    {
        let res="";
        
        if(!this.props.formLoading)
            res = <div className='modalForm'>
                    <Form onSubmit={this.onSubmitFunc} subscription={{submitting:true}} decorators={[this.focusOnError]} validate={values => {}}>
                    {({handleSubmit, submitting, form}) => (
                    <form noValidate onSubmit={handleSubmit}>
                        {this.getAdditionalFields()}
                        {this.getDateField()}
                        {this.getCommentField()}
                        <div className='modalActions'>
                            {this.getButtons(form, submitting)}
                            {this.getCloseButton("text",submitting)}
                        </div>

                        </form>)}                
                    </Form>
            </div>
        else
            res = <div className='modalForm'>
                <Spinner />
            </div>

        return res;
    }

    getCloseButton(type,submitting)
    {
        let res="";
        
        if(!this.props.disableClose)
        {
            if(type=="cross")
            {    res = <Tippy content={this.props.closeText} animation='shift-toward' placement="left" duration={[0,0]} trigger="mouseenter focus">
                    <button className='modalClose' onClick={this.props.handleCloseModal}><i className='fal fa-times'></i></button>
                </Tippy>
            }
            else
                res = <button type="button" onClick={this.props.handleCloseModal} disabled={submitting} className='modalClose'>{submitting?"":this.props.closeText}</button>
        }
        
        return res;
    }

    getCloseOnOverlayClick()
    {
        let res = true;

        if(this.props.disableClose)
            res = false;
        if(this.props.disableOverlayClickClose)
            res = false;

        return res;
    }

    render()
    {
        return <ReactModal isOpen={this.props.showModal}
                        contentLabel=""
                        onRequestClose={this.props.handleCloseModal}
                        appElement={document.getElementById('root')}
                        className="Modal"
                        shouldCloseOnOverlayClick={this.getCloseOnOverlayClick()}
                        overlayClassName="Overlay"
                >
                {this.getCloseButton("cross")}
                <div className='modalTitle'>{this.props.title}</div>
                {this.getErrorMessage()}
                <div className='modalText' style={this.props.textBold ? ({fontWeight:'bold'}):(null)}>{this.props.text}</div>
                {this.getForm()}
            </ReactModal>
    }
}
export default Modal;    