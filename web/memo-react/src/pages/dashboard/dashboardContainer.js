import React, { Component } from 'react';
//import { Router } from "@reach/router";
import { getColumnOrderName } from './dashboard';
import { userStore } from '../../index.js';
//import Header from '../../components/header.js';
import Spinner from '../../components/spinner.js';
import DashboardHeader from './dashboardHeader.js';
import DashboardColumn from './dashboardColumn.js';
import '../../css/dashboard.css';
//import CandidaturePage from '../candidature/candidaturePage.js';
import CandidatureEvent from '../../classes/candidatureEvent';
import { Constantes as CS } from '../../constantes';
import moment from 'moment';
import { DragDropContext } from 'react-beautiful-dnd';
import { saveCandidature, saveCandidatureAndEvent } from '../../actions/candidatureActions';
import { startTour, shouldShowConseilReseau, shouldShowWelcomeTour } from '../../actions/dashboardActions';
import CandidatureStateModal from '../candidature/modals/candidatureStateModal';
import { MEMO } from '../../index.js';
import $ from 'jquery';
import { redirectToStartPage, checkPasswordChange } from '../../actions/userActions.js';
import PasswordChangeModal from './modals/passwordChangeModal';
import ConseilReseauModal from './modals/conseilReseauModal';


class DashboardContainer extends Component{

    constructor(props)
    {
        super(props);
        this.state = {  openedMenu:null, 
                        candidatureError:null,
                        showEntretienModal : false,
                        showPasswordChangeModal : false,
                        showConseilReseauModal: false,
                        modalFormLoading:false,
                        importURLOnStartup:false,
                        modalError : "" };        
    }

    updateColumnHeights()
    {
        // le tableau de bord est en cours de construction, tant qu'il n'a pas sa hauteur max de colonne définitive
        // on relance updateColumnHeights toutes les 500ms
        setTimeout((function(){
        try
        {
            let maxHeight = 0;

            for(let i=0; i<$(".dashboardColumnContainer").length; ++i )
            {
                let cH = $($(".dashboardColumnContainer")[i]).innerHeight();
                if(cH>maxHeight)
                
                maxHeight = cH>maxHeight?cH:maxHeight;
            }

            maxHeight=Math.ceil(maxHeight);

            if(!this.maxColumnHeight || maxHeight!=this.maxColumnHeight)
            {
                this.maxColumnHeight=maxHeight;
                this.updateColumnHeights();
            }
            else
            {
                for(let i=0; i<$(".dashboardColumnContainer").length; ++i )
                {
                    $(".dashboardColumnContainer")[i].style.minHeight=maxHeight+"px";
                }
            }
        }
        catch(err) {}}).bind(this),500);
        
    }
    resetColumnHeight()
    {
        for(let i=0; i<$(".dashboardColumnContainer").length; ++i )
        {
            $(".dashboardColumnContainer")[i].style.minHeight="auto";
        }
    }

    // alignement des hauteur des colonnes
    setEvenColumnHeight(reset)
    {
        // lors d'un update du container on remets les hauteurs min en auto pour éviter de figer la hauteur à une valeur
        // qui n'a plus de sens par rapport au contenu du tableau
        if(reset)
            this.resetColumnHeight();

        this.maxColumnHeight=0;
        this.updateColumnHeights();
    }

    componentDidUpdate()
    {
        //$(window).scrollTop(0);
        this.setEvenColumnHeight("reset");

        this.displayOnStartupModal();

        if(this.startWelcomeTourFlag)
            this.startWelcomingTour();
    }

    componentDidMount()
    {
        $(window).scrollTop(0);

        if(redirectToStartPage())
            this.setState({importURLOnStartup:true});

        this.setEvenColumnHeight();

        this.displayOnStartupModal();
    }

    handleCloseModal= () => {
        this.setState( { showEntretienModal : false,
            showPasswordChangeModal : false,
            showConseilReseauModal : false,
            modalFormLoading:false,
            modalError:"" });
    }

    displayOnStartupModal = () => {

        if(MEMO.displayOnStartupModal && MEMO.user.candidatures)
        {
            MEMO.displayOnStartupModal = 0; // on n'affichera plus cette modale sur la session

            if(shouldShowConseilReseau())   // checkConseilRéseau
                this.showConseilReseau();
            else if(shouldShowWelcomeTour(this.props.isVisitor))  // checkIntroJS
            {
                this.showWelcomeTour();
            }
            else  
                this.checkPasswordChange();

        }    
    }

    checkPasswordChange = () => {
        if(!MEMO.PEAMConnect && !MEMO.user.isPEAM)   // on active pas le contrôle du mot de passe pour les utilisateurs PEConnect en partant du principe qu'ils n'ont pas de mot de passe MEMO
        {
            checkPasswordChange()
                .then(function(response) {
                    return response.json()
                })
                .then(async function(json) {
                    if(json.result=="doChange")
                        this.setState({showPasswordChangeModal:true});
            }.bind(this));
        }
    }

    showConseilReseau = () => {
        this.setState({showConseilReseauModal:true});
    }

    showWelcomeTour = () => {
        //console.log("SHOW WELCOME TOUR ?");
        localStorage.setItem("memoWelcomeTourShown",1);
        this.startWelcomeTourFlag = 1;
    }

    startWelcomingTour = () => {
        //console.log("Start Welcoming tour");
        this.startWelcomeTourFlag = 0;

        startTour();
    }
    
    onChangeFilter = () =>
    {
        //console.log("changeFilter ",MEMO.dashboardFilters);
        if(MEMO.dashboardFilters)
            userStore.dispatch({type:'SHOW_FILTERED_DASHBOARD'});
        else
            userStore.dispatch({type:'SHOW_UNFILTERED_DASHBOARD'});
    }

    getDashboard()
    {
        let res="";

        if(this.props.user.candidatures)
            res = this.buildDashboard();
        else
            res = <Spinner />;
        
        return res;
    }

    onToggleMenu = c =>
    {
        let oM = this.state.openedMenu;
        
        if(!oM || !c || oM.id!==c.id)
            oM = c;
        else
            oM = null;

        this.setState({openedMenu:oM});
    }

    reorderColumn(list, startIndex, endIndex)
    {
        //console.log("reorderColumn : ",startIndex, endIndex, list[startIndex], list[endIndex]);
        const result = Array.from(list);
        const [removed] = result.splice(startIndex,1);

        result.splice(endIndex,0,removed);

        return result;
    }

    moveCardToAnotherColumn(source,destination)
    {
        let res = {};

        this.restoreColumns = {};

        let sourceOrderName = getColumnOrderName(source.droppableId,this.props.active);
        let destinationOrderName =  getColumnOrderName(destination.droppableId,this.props.active);
        
        let restoreSourceList = Array.from(this.props.user.columnOrder[sourceOrderName]);
        let modifiedSourceList = Array.from(restoreSourceList);

        let restoreDestinationList = Array.from(this.props.user.columnOrder[destinationOrderName]);
        let modifiedDestinationList = Array.from(restoreDestinationList);

        // enregistrement de l'état avant modification            
        this.restoreColumns[sourceOrderName] = restoreSourceList;
        this.restoreColumns[destinationOrderName] = restoreDestinationList;

        if(MEMO.dashboardFilters)
        {    
            let filteredSourceOrderName = sourceOrderName+'-filtered';   
            let filteredDestinationOrderName = destinationOrderName+'-filtered';

            let restoreFilteredSourceList = Array.from(this.props.user.columnOrder[filteredSourceOrderName]);
            let filteredModifiedSourceList = Array.from(restoreFilteredSourceList);

            let restoreFilteredDestinationList = Array.from(this.props.user.columnOrder[filteredDestinationOrderName]);
            let filteredModifiedDestinationList = Array.from(restoreFilteredDestinationList);
        
            // enregistrement de l'état avant modification, complément pour les listes filtered            
            this.restoreColumns[filteredSourceOrderName] = restoreFilteredSourceList;
            this.restoreColumns[filteredDestinationOrderName] = restoreFilteredDestinationList;

            // application du déplacement
            const [filteredRemoved] = filteredModifiedSourceList.splice(source.index,1);
            filteredModifiedDestinationList.splice(destination.index,0,filteredRemoved);

            const [removed] = modifiedSourceList.splice(modifiedSourceList.indexOf(filteredRemoved),1);
            modifiedDestinationList.splice(destination.index,0,removed);

            // fixation des listes modifiées (complément filtered)
            res[filteredSourceOrderName] = filteredModifiedSourceList;
            res[filteredDestinationOrderName] = filteredModifiedDestinationList;                    
        }
        else
        {
            // application du déplacement
            const [removed] = modifiedSourceList.splice(source.index,1);
            modifiedDestinationList.splice(destination.index,0,removed);
        }

        // fixation des listes modifiées
        res[sourceOrderName] = modifiedSourceList;
        res[destinationOrderName] = modifiedDestinationList;

        return res;
    }

    onDragStart = context => {
        //console.log("context : ",context);

        MEMO.dragContext = { sourceId : context.source.droppableId };
    }

    onDragEnd = result => {
  
        //console.log("onDragEnd dashboardContainer modifier reorderColumn pour le cas de search");

        const { destination, source, draggableId } = result;

        const colOrd = this.props.user.columnOrder;

        if(!destination) // pas de destination valide, aucune action
        {
            MEMO.dragContext = null;
            return;
        }

        const hasFilter = MEMO.dashboardFilters;

        if(source.droppableId === destination.droppableId)
        {   // déplacement dans la même colone : réagencement simple
            const columnOrderName = getColumnOrderName(source.droppableId,this.props.active);
            let reorderedColumns = { };

            if(hasFilter)
            {   // filtre en cours, le drag & drop s'est fait sur la liste filtrée qui doit être modifiée
                // on modifie également la liste non filtrée sous-jacente en retrouvant les index correspondants à partir
                // des identifiant des fiches candidatures concernées
                const filteredColumnOrderName = columnOrderName+"-filtered";
                
                let unfilteredSourceIndex =  colOrd[columnOrderName].indexOf(colOrd[filteredColumnOrderName][source.index]);
                let unfilteredDestinationIndex =  colOrd[columnOrderName].indexOf(colOrd[filteredColumnOrderName][destination.index]);

                const filteredList = this.reorderColumn(colOrd[filteredColumnOrderName],source.index,destination.index);
                const list = this.reorderColumn(colOrd[columnOrderName],unfilteredSourceIndex,unfilteredDestinationIndex);

                reorderedColumns[columnOrderName] = list;
                reorderedColumns[filteredColumnOrderName] = filteredList;
            }
            else
            {   // pas de filtre, on persiste l'ordre pour la seule liste principale
                const list = this.reorderColumn(colOrd[columnOrderName],source.index,destination.index);
                reorderedColumns[columnOrderName] = list;
            }

            MEMO.dragContext.dragEnded = true;            
            userStore.dispatch({type:'UPDATE_COLUMNS', reorderedColumns});
        }
        else
        {   // déplacement dans une autre colonne : modification de la candidature
            const reorderedColumns = this.moveCardToAnotherColumn(source,destination);
            userStore.dispatch({type:'UPDATE_COLUMNS', reorderedColumns});

            MEMO.dragContext.destinationId = destination.droppableId;
            MEMO.dragContext.dragEnded = true;
            
            this.moveCandidature(this.props.user.candidatures[draggableId],destination.droppableId);
        }
            
    }

    updateCandidature = (candidature) => {
        saveCandidature(candidature).then(function(response) {
            return response.json()
        })
        .then(async function(json) {
    
            if(json.result=='ok')
            {
                this.setCandidature(candidature);
            }
            else
            {
                throw new Error("");
            }
        }.bind(this))
        .catch(function(error) {
            this.setTechError();
            this.restoreColumnState();
        }.bind(this))
        .finally(function()
        {
            this.restoreColumns=null;
        }.bind(this))
    }

    setTechError()
    {
        this.setState({candidatureError:"Un problème technique empêche l'enregistrement des modifications. Veuillez réessayer ultérieurement. Si le problème persiste vous pouvez contacter l'équipe MEMO avec le bouton 'Avis ou commentaire'."});
    }

    restoreColumnState()
    {
        //console.log("restoring column state");
        userStore.dispatch({type:'UPDATE_COLUMNS', reorderedColumns:this.restoreColumns});
    }

    updateCandidatureAndEvent = (candidature,event) => {

        let evt = event;

        if(!evt)    // cas j'ai relancé ou j'ai postulé
        {
            evt = new CandidatureEvent();
            evt.eventTime = moment();
            evt.eventType = candidature.etat==1?CS.TYPES.AI_POSTULE:CS.TYPES.AI_RELANCE;
        }
        //else cas j'ai un entretien

        evt.candidatureId = candidature.id;
        
        saveCandidatureAndEvent(candidature,evt)
            .then( result  => {

                if(result.eventUpdated)
                {
                    evt.id = result.eventId;

                    candidature.addEvent(evt);

                    this.setCandidature(candidature);
                }
                else
                {
                    throw new Error("");
                }
            } )
            .catch( msg => {
                this.setTechError();
                this.restoreColumnState();
            })
            .finally( () => { this.restoreColumns=null; })
    }

    onSaveEntretien = values =>
    {
        let c = this.movedCandidature;
        c.etat = CS.ETATS.ENTRETIEN;

        this.setState({modalFormLoading:true});
        let evt = new CandidatureEvent();
        evt.comment = values.comment?values.comment:"";
        evt.candidatureId = c.id;
        evt.eventType = CS.TYPES.ENTRETIEN;
        evt.eventSubType = values.interviewSubType;
        evt.eventTime = moment(values.selectedTime);

        saveCandidatureAndEvent(c,evt)
        .then( result  => {

            if(result.eventUpdated)
            {
                evt.id = result.eventId;

                c.addEvent(evt);
                
                this.setCandidature(c);                
            }
            else
            {
                throw new Error("");
            }
        } )
        .catch( msg => {
            this.setTechError();
            this.restoreColumnState();
        })
        .finally( () => {
            this.handleCloseModal();
            this.setState({modalFormLoading:false});
            this.restoreColumns=null;
            this.movedCandidature=null;
        })        
    }

    setCandidature(c)
    {
        MEMO.forceCandidatureUpdate = c.id;
        userStore.dispatch({type:'UPDATE_CANDIDATURE_AND_USER_ACTION_COUNTER', candidature:c});
    }

    moveCandidature = (candidature,destinationColumnId) => {
        
        let c = candidature;

        c.etat = destinationColumnId;

        if(destinationColumnId==0)  // candidature déplacée dans je vais postuler
        {
            this.updateCandidature(c);
        }
        else
        {
            if(destinationColumnId!=3) // candidature déplacée dans j'ai postulé ou j'ai relancé
            {
                this.updateCandidatureAndEvent(c);
            }
            else                        // candidature déplacée dans j'ai un entretien
            {
                this.movedCandidature = c;
                this.setState( { showEntretienModal : true,
                                modalFormLoading:false,
                                modalError : "" } );
            }
        }

        window.gtag('event', 'ddCandidature', { event_category: 'Candidature', event_label: destinationColumnId });     
    }

    getDashboardHeader()
    {
        let res="";
        if(this.props.user.candidatures)
            res = <DashboardHeader {...this.props} importURLOnStartup={this.state.importURLOnStartup} onChangeFilter={this.onChangeFilter} />;
        
        return res;
    }

    buildDashboard()
    {
        if(this.props.isVisitor)
            return this.buildDashboardContent();
        else
            return this.buildEditableDashboard();
        
    }

    buildEditableDashboard()
    {
        return <DragDropContext onDragEnd={this.onDragEnd} onDragStart={this.onDragStart}>
               {this.buildDashboardContent()}     
        </DragDropContext>;
    }

    buildDashboardContent()
    {
        return <div className='dashboardBody row'>
        <DashboardColumn type="0" {...this.props} 
                // {filter={this.state.filter} }
                openedMenu={this.state.openedMenu} 
                onToggleMenu={this.onToggleMenu} />
        <DashboardColumn type="1" {...this.props} 
                // {filter={this.state.filter} }
                openedMenu={this.state.openedMenu} 
                onToggleMenu={this.onToggleMenu} />
        <DashboardColumn type="2" {...this.props} 
                // filter={this.state.filter} 
                openedMenu={this.state.openedMenu} 
                onToggleMenu={this.onToggleMenu} />
        <DashboardColumn type="3" {...this.props} 
                // filter={this.state.filter}
                openedMenu={this.state.openedMenu} 
                onToggleMenu={this.onToggleMenu} />
                </div>;
    }

    render()
    {
        //console.log("render DashboardContainer");
        return <div className='dashboardContainer'>
                    {this.getDashboardHeader()}
                    {this.getDashboard()}
                    <CandidatureStateModal showModal={this.state.showEntretienModal} 
                                candidature={this.movedCandidature}
                                step="3"
                                formLoading={this.state.modalFormLoading}
                                disableClose={true}
                                onValidateClicked={this.onSaveEntretien} 
                                errorMsg={this.state.modalError} />
                    <PasswordChangeModal showModal={this.state.showPasswordChangeModal}
                                handleCloseModal={this.handleCloseModal} />
                    <ConseilReseauModal showModal={this.state.showConseilReseauModal}
                                handleCloseModal={this.handleCloseModal} />
                </div>
    }
}

export default DashboardContainer;