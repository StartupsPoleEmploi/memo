import { MEMO, userStore } from '../index.js';
import { Url } from '../components/utils.js';


export function initializeFilteredColumns(user)
{
    // récupération de la liste des candidatures matchant les mots clefs dans leur description
    // le scan se fait en bdd côté back car la description des candidatues n'est faite qu'à l'ouverture du détail d'une candidature
    if(MEMO.dashboardFilters.keyword)
    {
        if(!MEMO.descriptionSearchResult || MEMO.descriptionSearchResult.keyword!=MEMO.dashboardFilters.keyword)
        {
            MEMO.descriptionSearchResult = { candidatures : [], keyword : MEMO.dashboardFilters.keyword };        
            getInDescriptionSearchResult(MEMO.dashboardFilters.keyword);            
        }
    }
    else
        MEMO.descriptionSearchResult = null;

    for(let k in user.columnOrder)
    {
        if(k.indexOf('-filtered')<0)
        {
            let filteredColumn = filterColumn(user,k);
            user.columnOrder[filteredColumn.name] = filteredColumn.candidatures;
        }
    }
}

// appel de l'api de recherche des identifiants de candidatures qui matchent le mot clef de recherche
export const getInDescriptionSearchResult = async function(searchString)
{
    let cs = [];
        
    let u = MEMO.rootURL + '/rest/candidatures/search';        
    let p = "searchString=" + Url.encode(searchString) + "&csrf=" + MEMO.user.csrf;

    if(MEMO.visitorLink)
        p += "&link=" + MEMO.visitorLink;
    
    let params = {
            method: 'POST',
            headers: new Headers({
                        'Content-Type': 'application/x-www-form-urlencoded'
                }),
            body: p
        };

    let response = await fetch(u,params);
    let json = await response.json();

    if(json.result=="ok")
    {
        cs = json.candidatures;

        MEMO.descriptionSearchResult = { candidatures : cs, keyword : searchString };        

        if(cs && cs.length>0)
            userStore.dispatch({type:"UPDATE_SEARCH_RESULT_FROM_DESCRIPTION"});        
    }
}

// nettoyage des columnOrder filtés après annulation de filtrage
export function removeFilteredColumns(user)
{
    for(let k in user.columnOrder)
    {
        if(k.indexOf("-filtered")>=0)
            delete user.columnOrder[k];
    }
}

// filtrage d'une colonne selon les critères de recherche
export function filterColumn(user, columnName)
{
    let filteredColumn = { name : columnName+"-filtered", candidatures : []};

    for(let i=0; i<user.columnOrder[columnName].length; ++i)
    {
        if(isInFilterScope(user.candidatures[user.columnOrder[columnName][i]]))
            filteredColumn.candidatures.push(user.columnOrder[columnName][i]);
    }

    return filteredColumn;
}

// return true si la candidature doit être affichée avec les filtres en cours
export function isInFilterScope(c)
{
    let rgx = MEMO.dashboardFilters.keyword?new RegExp(MEMO.dashboardFilters.keyword,'i'):null;
    
    let inFilterScope = true;

    if( isFilterActive()) // recherche sur les filtres
        inFilterScope = filterCandidature(c);

    if(inFilterScope && rgx)    // recherche textuelle
    {
        inFilterScope = searchInCandidature(rgx, c);

        // recherche dans la liste des candidatures renvoyées par la fonction de recherche dans les notes et détails
        if(!inFilterScope)
            inFilterScope = searchInDescription(c);
    }

    //console.log("isFiltered : ",dontFilter,c.nomCandidature,MEMO.dashboardFilters,c);

    return inFilterScope;    
}

// retourne vrai si un critère de filtrage autre que le mot clef est actif
function isFilterActive()
{
    let f = MEMO.dashboardFilters,
        res = false;

    if( f.stateFilter!="" ||
        f.typeFilter!="" ||
        f.jobboardFilter!="" ||
        f.favoriteFilter )
    {
        res = true;
    }

    return res;
}


// retourne vrai si le ou les filtres activés sont respectés
export function filterCandidature(c)
{
    let res = true,
        f = MEMO.dashboardFilters;

    if(f.stateFilter!=undefined && c.etat!= f.stateFilter)
        res = false;

    if(res && f.typeFilter!=undefined && c.type!= f.typeFilter)
        res = false;
    
    if(res && f.favoriteFilter && !c.rating)
        res = false;

    if(res && f.jobboardFilter && (!c.jobBoard || f.jobboardFilter.toUpperCase()!=c.jobBoard.toUpperCase()) )
        res = false;

    return res;
}

// recherche la chaîne  dans les éléments de la candidature
export function searchInCandidature(rgx,c)
{
    let r = rgx.test(c.nomCandidature);

    if(!r)
        r = rgx.test(c.nomSociete);
    if(!r)
        r = rgx.test(c.ville);
    if(!r)
        r = rgx.test(c.nomContact);
    if(!r)
        r = rgx.test(c.emailContact);
    if(!r)
        r = rgx.test(c.telContact);
    if(!r)
        r = rgx.test(c.jobBoard);
    if(!r)
        r = searchInEvents(rgx, c.events);

    return r;
}

export function searchInEvents(rgx,evts)
{
    var r = false;
    if(evts) {
        for (let k in evts) {
            if(evts[k])
                r = rgx.test(evts[k].comment);
            if(r)
                break;
        }
    }

    return r;
}

// retourne vrai si la candidature est dans le résultat de recherche dans la description
function searchInDescription(c)
{
   let cs = MEMO.descriptionSearchResult.candidatures;

   if(cs && cs.length && cs.indexOf(c.id)>=0)
        return true;
    else
        return false;
}