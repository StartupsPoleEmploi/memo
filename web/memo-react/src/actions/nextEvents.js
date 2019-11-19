import React, { Component } from 'react';
import moment from 'moment';
import { Constantes as CS } from '../constantes.js'
import CandidatureEvent from '../classes/candidatureEvent.js'

export function getNextActionAdvice(c)
{
    let lastActivity, nE, lE, lC, lR, lA, lP, lM, lRA,
        now = moment(),
        res={};

    
    if (c && !c.archived) {
        
        lastActivity = c.lastActivity;
        nE = lastActivity.nextEntretien;
        lE = lastActivity.lastEntretien;
        lC = lastActivity.lastCandidature;
        lR = lastActivity.lastRelance;
        lRA = lastActivity.lastRelanceAlert;
        lA = lastActivity.lastActivity;
        lP = lastActivity.lastPreparation;
        lM = lastActivity.lastMerci;

        /*if(c.etat==0) {
            console.log("lA : ", (lA)?lA.toString():"", "   ---   nE : ",nE?nE.toString():"","  ----   lE : ",lE?lE.toString():"");
            console.log("lC : ", (lC)?lC.toString():"", "   ---   lR : ",lR?lR.toString():"", "  ---- ",c );

            console.log("diff now last activ : ",now.diff(lA,'days'));
            }*/

        if(now.diff(lA,'days')>30)  {     
            // @RG - CONSEIL : Le conseil 'Supprimer' est affiché, si aucune activité sur la candidature depuis 30 jours 
            //res = "<span class='tooltipster' title='Conseil : archiver'><span class='nextActionTitle'>Conseil :</span> archiver</span>";
        	res.title = "archiver";
            res.type = CS.TYPES_ADVICE.ARCHIVER;
        } else {

            switch (eval(c.etat)) {
                case CS.ETATS.VA_POSTULER  :   
                {
                    // @RG - CONSEIL : Le conseil 'Postuler' est affiché, si candidature à l'état 'VA_POSTULER'
                	res.title = "postuler";
                    res.type = CS.TYPES_ADVICE.POSTULER;
                    break;
                }
                case CS.ETATS.A_POSTULE  :
                {
                    if( (lRA && now.isAfter(lRA)) ||     // si une alerte
                        (!lRA && lC && (
                            ( c.type == CS.TYPES_CANDIDATURE.OFFRE && now.diff(lC,'days')>=7 ) ||
                            ( c.type == CS.TYPES_CANDIDATURE.RESEAU && now.diff(lC,'days')>=14 ) ||
                            ( (c.type == CS.TYPES_CANDIDATURE.SPONT || c.type == CS.TYPES_CANDIDATURE.AUTRE) && now.diff(lC,'days')>=21 ) )
                        )
                        )
                    {
                        // @RG - CONSEIL : Le conseil 'Relancer Candidature' est affiché, si candidature à l'état 'A_POSTULE' et une relance programmée est échue. Ou si pas de relance et la date dépasse une durée dépendant du type de candidature
                    	res.title = "relancer";
                        res.type = CS.TYPES_ADVICE.RELANCER_CANDIDATURE;
                    }

                    break;
                }
                case CS.ETATS.ENTRETIEN :
                {
                    if( nE && now.isBefore(nE) )
                    {   
                        // @RG - CONSEIL : Le conseil 'Se préparer' est affiché, si la candidature est à l'état 'ENTRETIEN' et s'il y a un entretien dans le futur positionné et qu'il n'y pas déjà eu d'evt 'J'ai préparé'
                        if(!lP || !lE || !lP.isBefore(lE))
                        {
                        	res.title = "se préparer";
                            res.type = CS.TYPES_ADVICE.PREPARER_ENTRETIEN;
                        }
                    }
                    else
                    {
                        if(lE && now.diff(lE,'days')>4)   
                        {
                            // @RG - CONSEIL : Le conseil 'Relancer Entretien' est affiché, si la candidature est à l'état 'ENTRETIEN' et si entretien passé depuis 4 jours et qu'il n'y pas déjà eu d'evt 'J'ai relancé'
                            if(!lR || lR.isBefore(lE) ) 
                            {
                            	res.title = "relancer";
                                res.type = CS.TYPES_ADVICE.RELANCER_ENTRETIEN;
                            }
                            
                        }
                        else if(lE && now.diff(lE,'hours')>0)  
                        {
                            // @RG - CONSEIL : Le conseil 'Remercier' est affiché, si la candidature est à l'état 'ENTRETIEN' et si entretien passé depuis moins de 4 jours et qu'il n'y pas déjà eu d'evt 'J'ai remercié'
                            if(!lM || lM.isBefore(lE) )
                            {
                            	res.title = "remercier";
                            	res.type = CS.TYPES_ADVICE.REMERCIER;
                            }
                        }
                    }
                    break;
                }
                default : {break;}
            }
        }
    }
    return res;
}

export function getNextActionObject(c)
{
    let lastActivity, nE, lE, lC, lR, lA, lP, lM, lRA,
        now = moment(), 
        res = new CandidatureEvent();

    
    if (c && !c.archived) {
        
        lastActivity = c.lastActivity;
        nE = lastActivity.nextEntretien;
        lE = lastActivity.lastEntretien;
        lC = lastActivity.lastCandidature;
        lR = lastActivity.lastRelance;
        lRA = lastActivity.lastRelanceAlert;
        lA = lastActivity.lastActivity;
        lP = lastActivity.lastPreparation;
        lM = lastActivity.lastMerci;

        /*if(c.etat==0) {
            console.log("lA : ", (lA)?lA.toString():"", "   ---   nE : ",nE?nE.toString():"","  ----   lE : ",lE?lE.toString():"");
            console.log("lC : ", (lC)?lC.toString():"", "   ---   lR : ",lR?lR.toString():"", "  ---- ",c );

            console.log("diff now last activ : ",now.diff(lA,'days'));
            }*/
        res.candidatureId = c.id;
        if(now.diff(lA,'days')>30)  {     
            // @RG - CONSEIL : Le conseil 'Supprimer' est affiché, si aucune activité sur la candidature depuis 30 jours 
            //res = "<span class='tooltipster' title='Conseil : archiver'><span class='nextActionTitle'>Conseil :</span> archiver</span>";
        	res.shortLabel = "archiver";
        	res.label = "Archiver votre candidature";
        	res.labelModal = "archivé votre candidature";
        	res.shape = "invertedIcon eventRed";
		    res.icon = "fa fa-check";
            res.adviceType = CS.TYPES_ADVICE.ARCHIVER;
            res.eventType = CS.TYPES.ARCHIVER;
        } else {

            switch (eval(c.etat)) {
                case CS.ETATS.VA_POSTULER  :   
                {
                    // @RG - CONSEIL : Le conseil 'Postuler' est affiché, si candidature à l'état 'VA_POSTULER'
                	res.shortLabel = "postuler";
                	res.label = "Postulez à l'offre";
                	res.labelModal = "postulé à l'offre";
                	res.shape = "invertedIcon eventGold";
        		    res.icon = "fa fa-arrow-right";
                    res.adviceType = CS.TYPES_ADVICE.POSTULER;
                    res.eventType = CS.TYPES.AI_POSTULE;
                    break;
                }
                case CS.ETATS.A_POSTULE  :
                {
                    if( (lRA && now.isAfter(lRA)) ||     // si une alerte
                        (!lRA && lC && (
                            ( c.type == CS.TYPES_CANDIDATURE.OFFRE && now.diff(lC,'days')>=7 ) ||
                            ( c.type == CS.TYPES_CANDIDATURE.RESEAU && now.diff(lC,'days')>=14 ) ||
                            ( (c.type == CS.TYPES_CANDIDATURE.SPONT || c.type == CS.TYPES_CANDIDATURE.AUTRE) && now.diff(lC,'days')>=21 ) )
                        )
                        )
                    {
                        // @RG - CONSEIL : Le conseil 'Relancer Candidature' est affiché, si candidature à l'état 'A_POSTULE' et une relance programmée est échue. Ou si pas de relance et la date dépasse une durée dépendant du type de candidature
                    	res.shortLabel = "relancer";
                    	res.label = "Relancer le recruteur suite à votre candidature";
                    	res.labelModal = "relancé le recruteur suite à votre candidature";
                    	res.shape = "invertedIcon eventBlue";
            		    res.icon = "fa fa-share";
                    	res.adviceType = CS.TYPES_ADVICE.RELANCER_CANDIDATURE;
                    	res.eventType = CS.TYPES.AI_RELANCE;
                    }

                    break;
                }
                case CS.ETATS.ENTRETIEN :
                {
                    if( nE && now.isBefore(nE) )
                    {   
                        // @RG - CONSEIL : Le conseil 'Se préparer' est affiché, si la candidature est à l'état 'ENTRETIEN' et s'il y a un entretien dans le futur positionné et qu'il n'y pas déjà eu d'evt 'J'ai préparé'
                        if(!lP || !lE || !lP.isBefore(lE)) 
                        {
                        	res.shortLabel = "se préparer";
                        	res.label = "Préparez votre entretien";
                        	res.labelModal = "préparé votre entretien";
                        	res.shape = "invertedIcon eventGrey";
                		    res.icon = "fa fa-list";
                            res.adviceType = CS.TYPES_ADVICE.PREPARER_ENTRETIEN;
                            res.eventType = CS.TYPES.AI_PREPARE;
                        }
                    }
                    else
                    {
                        if(lE && now.diff(lE,'days')>4)   
                        {
                            // @RG - CONSEIL : Le conseil 'Relancer Entretien' est affiché, si la candidature est à l'état 'ENTRETIEN' et si entretien passé depuis 4 jours et qu'il n'y pas déjà eu d'evt 'J'ai relancé'
                            if(!lR || lR.isBefore(lE) )
                            {
                            	res.shortLabel = "relancer";
                            	res.label = "Relancez le recruteur suite à votre entretien";
                            	res.labelModal = "relancé le recruteur suite à votre entretien";
                            	res.shape = "invertedIcon eventGreen";
                    		    res.icon = "fa fa-share";
                                res.adviceType = CS.TYPES_ADVICE.RELANCER_ENTRETIEN;
                                res.eventType = CS.TYPES.AI_RELANCE;
                                res.eventSubType = CS.SUBTYPES.ENTRETIEN_PHYSIQUE;
                            }
                        }
                        else if(lE && now.diff(lE,'hours')>0)  
                        {
                            // @RG - CONSEIL : Le conseil 'Remercier' est affiché, si la candidature est à l'état 'ENTRETIEN' et si entretien passé depuis moins de 4 jours et qu'il n'y pas déjà eu d'evt 'J'ai remercié'
                            if(!lM || lM.isBefore(lE) ) 
                            {
                            	res.shortLabel = "remercier";
                            	res.label = "Remerciez le recruteur suite à votre entretien";
                            	res.labelModal = "remercié le recruteur suite à votre entretien";
                            	res.shape = "invertedIcon eventYellow";
                    		    res.icon = "fa fa-star";
                            	res.adviceType = CS.TYPES_ADVICE.REMERCIER;
                            	res.eventType = CS.TYPES.AI_REMERCIE;
                            }
                        }
                    }
                    break;
                }
                default : {break;}
            }
        }
    }

    return res;
}

export function getLastActivity(c)
{
    let res =  { lastActivity : null, lastCandidature : null, lastRelance: null,
            lastEntretien : null, nextEntretien : null, lastPreparation : null, lastMerci : null, lastRelanceAlert : null },
        evt, now = moment();

    if(c && c.events)
    {
        for(let k in c.events)
        {
            evt = c.events[k];
            if(evt)
            {
                /*{ 1 : "Je dois relancer", 2 : "Echange de mail", 3 : "Entretien", 4 : "J'ai postulé",
                    5 : "J'ai relancé", 6 : "Archiver", 7 : "Rappel", 8 : "Note" }*/

                if (evt.eventType == CS.TYPES.ENTRETIEN && (!res.lastEntretien || evt.eventTime.isAfter(res.lastEntretien)))
                    res.lastEntretien = evt.eventTime;
                else if (evt.eventType == CS.TYPES.AI_PREPARE && (!res.lastPreparation || evt.eventTime.isAfter(res.lastPreparation)))
                    res.lastPreparation = evt.eventTime;
                else if (evt.eventType == CS.TYPES.AI_REMERCIE && (!res.lastMerci || evt.eventTime.isAfter(res.lastMerci)))
                    res.lastMerci = evt.eventTime;
                else if (evt.eventType == CS.TYPES.AI_POSTULE && (!res.lastCandidature || evt.eventTime.isAfter(res.lastCandidature)))
                    res.lastCandidature = evt.eventTime;
                else if (evt.eventType == CS.TYPES.AI_RELANCE && (!res.lastRelance || evt.eventTime.isAfter(res.lastRelance)))
                    res.lastRelance = evt.eventTime;
                else if (evt.eventType == CS.TYPES.RAPPEL && evt.eventSubType == CS.SUBTYPES.RAPPEL_POSTULE_RELANCE && (!res.lastRelanceAlert || evt.eventTime.isBefore(res.lastRelanceAlert)))
                    res.lastRelanceAlert = evt.eventTime;

                if (evt.eventType == CS.TYPES.ENTRETIEN) // détermination du nextEntretien
                {
                    if (now.diff(evt.eventTime, 'days') <= 0) {   // l'entretien est dans le futur
                        if (!res.nextEntretien || (evt.eventTime.isBefore(res.nextEntretien)))       // cet entretien est plus proche dans le temps qu'un autre entretien
                            res.nextEntretien = evt.eventTime;
                    }
                }

                if(!res.lastActivity || evt.eventTime.isAfter(res.lastActivity))
                    res.lastActivity = evt.eventTime;
            }
        }
    }

    if(c.etat==CS.ETATS.A_POSTULE && !res.lastCandidature)
        res.lastCandidature = c.creationDate;

    // détermination de last activity sur la candidature par rapport aux events enregistrés
    let mmts = [];
    if(res.lastRelance)
        mmts.push(res.lastRelance);
    if(res.lastCandidature)
        mmts.push(res.lastCandidature);
    if(res.lastEntretien)
        mmts.push(res.lastEntretien);
    if(res.nextEntretien)
        mmts.push(res.nextEntretien);
    if(res.lastPreparation)
        mmts.push(res.lastPreparation);
    if(res.lastMerci)
        mmts.push(res.lastMerci);
    if(res.lastActivity)
        mmts.push(res.lastActivity);
    if(mmts.length>0)
        res.lastActivity = moment.max(mmts);
    if(!res.lastActivity)
        res.lastActivity = c.lastUpdate;

    return res;
}