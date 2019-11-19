import { MEMO, userStore } from '../index.js';
import { Constantes as CS } from '../constantes.js';
import { getLastActivity } from './nextEvents';

export const saveCandidatureAndEvent = function(c,evt) {

    let candidature = c;
    let event = evt;
    
    return saveCandidatureState(candidature)
        .then(response => response.json() )
        .then(response => {
                        if(response.result=="ok")
                        {
                            return Promise.resolve(true);
                        }
                        else
                            return Promise.reject(response.msg);
                    })
    .then(saveCandidatureEvent.bind(null,event))    // bind avec event en paramètre ajouté pour saveCandidatureEvent
        .then(response => response.json() )
        .then(response => {

                        if(response.result=="ok")
                        {
                            return Promise.resolve({
                                eventUpdated:true,
                                eventId:response.id
                            });
                        }
                        else
                        {
                            // on résoud la promesse en renvoyant le message d'erreur et le fait que la candidature a été modifiée
                            return Promise.resolve({
                                error:response.msg
                            });
                        }
        })    
}

export function removeCandidature(c)
{
    let u = MEMO.rootURL+'/rest/candidatures/remove/'+c.id;
    let p = "csrf="+MEMO.user.csrf;

    let params = {
            method: 'POST',
            headers: new Headers({
                        'Content-Type': 'application/x-www-form-urlencoded'
                }),
            body: p
        };

    return fetch(u,params);
}

export function removeCandidatureEvent(c,evt)
{
    let u = MEMO.rootURL+'/rest/candidatures/'+c.id+'/events/remove/'+evt.id;
    let p = "csrf="+MEMO.user.csrf;

    let params = {
            method: 'POST',
            headers: new Headers({
                        'Content-Type': 'application/x-www-form-urlencoded'
                }),
            body: p
        };

    return fetch(u,params);
}

export async function removeEvent()
{     
    let evt = this.selectedEvent;
    
    removeCandidatureEvent(this.props.candidature,evt)
    .then(response => response.json() )
    .then(response => {

        if(response.result=="ok")
        {
            const cs = userStore.getState().user.candidatures;
            let c = cs[evt.candidatureId];
            
            delete c.events[evt.id];
            
            c.lastActivity = getLastActivity(c);

            this.handleCloseModal();

            userStore.dispatch({type:'UPDATE_CANDIDATURE_AND_USER_ACTION_COUNTER', candidature:c});
        }
        else
        {
            console.log("TODO : gérer error d'update event ",response.error);    
            this.setState({modalError:response.error});
        }
    })
    .catch( msg => {
        console.log("TODO: traitement d'erreur ",msg);
        this.setState({modalError:msg});
        //MEMO.utils.manageError( msg );
    })
    .finally( () => {
        this.setState({modalFormLoading:false});
    })
}

export function saveCandidature(c)
{
    let u = MEMO.rootURL+'/rest/candidatures';
    let p = c.getQParam()+"&csrf="+MEMO.user.csrf;

    let params = {
            method: 'POST',
            headers: new Headers({
                        'Content-Type': 'application/x-www-form-urlencoded'
                }),
            body: p
        };

    return fetch(u,params);
}

export function saveCandidatureState(c)
{
    let u = MEMO.rootURL+'/rest/candidatures/state';
    let p = c.getQParam()+"&csrf="+MEMO.user.csrf;

    let params = {
            method: 'POST',
            headers: new Headers({
                        'Content-Type': 'application/x-www-form-urlencoded'
                }),
            body: p
        };

    return fetch(u,params);
}

export function saveCandidatureFavorite(c)
{
    let u = MEMO.rootURL+'/rest/candidatures/favorite/'+c.id+'/'+((c.rating)?1:0);
    let p = "csrf="+MEMO.user.csrf;

    let params = {
            method: 'POST',
            headers: new Headers({
                        'Content-Type': 'application/x-www-form-urlencoded'
                }),
            body: p
        };

    return fetch(u,params);
}

export function saveCandidatureEvent(evt)
{
    let u = MEMO.rootURL+'/rest/candidatures/event';
    let p = evt.getQParam()+"&csrf="+MEMO.user.csrf;

    let params = {
            method: 'POST',
            headers: new Headers({
                        'Content-Type': 'application/x-www-form-urlencoded'
                }),
            body: p
        };

    return fetch(u,params);
}

export function loadCandidature(c)
{
    let u = MEMO.rootURL+'/rest/candidatures/' + c.id;
    
    if (MEMO.visitorLink)
        u += "?link=" + MEMO.visitorLink;

    return fetch(u);
}

export function loadCandidatureAttachment(c)
{
    let u = MEMO.rootURL+'/rest/attachments/' + c.id;
    
    if (MEMO.visitorLink)
        u += "?link=" + MEMO.visitorLink;

    return fetch(u);
}

export function getEventProperties(evt)
{
    // permet de récupérer les icônes et labels correspondants à l'événement en paramètre

    let res = {};
    const T = CS.TYPES;
/*
    1 : "Je dois relancer", 
    2 : "Echange de mail",
    3 : "Entretien", 
    4 : "J'ai postulé",
    5 : "J'ai relancé", 
    6 : "Archiver",
    7 : "Rappel", 
    8 : "Note", 
    9 : "Maintenir actif", 
    10 : "J'ai préparé", 
    11 : "J'ai remercié"
    
    */
    switch(evt.eventType)
    {
        case T.DOIS_RELANCER : {
            res.shape = "invertedIcon eventAzure";
            res.icon = "fa fa-share";
            res.label = "Relancer le recruteur";
            break;
        }

        case T.ECHANGE_MAIL : {
            res.shape = "invertedIcon eventBlue";
            res.icon = "fas fa-envelope";
            res.label = "Echange de mail";
            break;
        }

        case T.ENTRETIEN : {
            res.shape = "invertedIcon eventGreen";
            res.icon = "fas fa-comment";
            res.label = "Entretien";

            switch(evt.eventSubType)
            {
                case CS.SUBTYPES.ENTRETIEN_VIDEO : 
                {
                    res.icon = "fas fa-video";
                    res.label = "Entretien vidéo";
                    break;
                }
                case CS.SUBTYPES.ENTRETIEN_PHYSIQUE : 
                {
                    res.icon = "fas fa-handshake";
                    res.label = "Entretien physique";
                    break;
                }
                case CS.SUBTYPES.ENTRETIEN_TEL : 
                {
                    res.icon = "fas fa-phone";
                    res.label = "Entretien téléphonique";
                    break;
                }
                default: break;
            }

            break;
        }

        case T.AI_POSTULE : {
            res.shape = "invertedIcon eventRed";
            res.icon = "fa fa-check";
            res.label = "J'ai postulé";
            break;
        }

        case T.AI_RELANCE : {
            res.shape = "invertedIcon eventAzure";
            res.icon = "fa fa-share";
            res.label = "J'ai relancé";
            break;
        }

        case T.ARCHIVER : {
            res.shape = "invertedIcon eventOrange";
            res.icon = "fas fa-archive";
            res.label = "Fiche archivée";
            break;
        }

        case T.RAPPEL : {
            res.shape = "invertedIcon eventOrange";
            res.icon = "fas fa-bell";
            res.label = "Rappel";
            break;
        }

        case T.NOTE : {
            res.shape = "invertedIcon eventOrange";
            res.icon = "fas fa-sticky-note";
            res.label = "Note";
            break;
        }

        case T.MAINTENIR : {
            res.shape = "invertedIcon eventYellow";
            res.icon = "fas fa-star";
            res.label = "Maintenir actif";
            break;
        }

        case T.AI_PREPARE : {
            res.shape = "invertedIcon eventGreen";
            res.icon = "fas fa-clipboard-check";
            res.label = "J'ai préparé l'entretien";
            break;
        }

        case T.AI_REMERCIE : {
            res.shape = "invertedIcon eventGreen";
            res.icon = "fas fa-mobile-alt";
            res.label = "J'ai remercié après l'entretien";
            break;
        }

        default : {}
    }

    return res;
}