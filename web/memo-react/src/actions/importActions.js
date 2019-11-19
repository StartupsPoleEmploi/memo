import { MEMO, userStore } from '../index.js';
import { Constantes as CS } from '../constantes.js';
import Candidature from '../classes/candidature.js';
import {isInDomain} from '../components/utils';
import ParserAdecco from './parsers/parserAdecco';
import ParserApec from './parsers/parserApec';
import ParserCadremploi from './parsers/parserCadremploi';
import ParserEnviroJob from './parsers/parserEnvirojob';
import GenericParser from './parsers/genericParser';
import ParserIndeed from './parsers/parserIndeed';
import ParserJobAlim from './parsers/parserJobalim';
import ParserJobiJoba from './parsers/parserJobijoba';
import ParserKeljob from './parsers/parserKeljob';
import ParserLaBonneBoite from './parsers/parserLabonneboite';
import ParserLeBonCoin from './parsers/parserLeboncoin';
import ParserLinkedIn from './parsers/parserLinkedin';
import ParserManpower from './parsers/parserManpower';
import ParserMeteoJob from './parsers/parserMeteojob';
import ParserMonster from './parsers/parserMonster';
import ParserPoleEmploi from './parsers/parserPoleemploi';
import ParserQAPA from './parsers/parserQapa';
import ParserRandstad from './parsers/parserRandstad';
import ParserRegionsJob from './parsers/parserRegionsjob';
import ParserStepStone from './parsers/parserStepstone';
import ParserVivastreet from './parsers/parserVivastreet';
import { Url, $sc } from '../components/utils.js';

export const importCandidature = async function(url) {

    let candidature; 
    let message="";
    try
    {

        //console.log("import ? ",url);
        const parser  = getParser(url);

        //console.log("parser : ",parser);

        let response = await importOffre(url,parser);

        //console.log("response ",response);

        let html = await response.text();

        //console.log("html ",html);

        if(parser.name!="Monster" && parser.name!="APEC")
            html = $sc(html);
            
        try
        {
            html = JSON.parse(response);    // interprétation du json pour les cas où ce n'est pas du html
        }
        catch (err)
        {
            // erreur sans incidence. pas de notification
        }

        //console.log("response / html ",response,html);

        if (response == "expired" ||  (html && html == "expired") )
            throw new Error("expired");

        if (response == "error" || (html && html == "error") )
            throw new Error("notFound");
            
        candidature = parseOffre(html,parser);
        
        candidature.urlSource = url;
        
        if(!candidature.logoUrl)
        	candidature.logoUrl = "/pic/jobboard/"+parser.logo;
        	
        if(!candidature)
            throw new Error("parseError");
        /*else
            console.log("candidature : ",candidature);*/
    }
    catch(err) {
        console.log("err : ",err.message);
        if(err.message==="parseError")
            message = "Nous n'avons pas pu procéder au découpage de l'offre. Veuillez remplir le formulaire manuellement.";
        else if(err.message==="notFound")
            message = "Offre non trouvée. Vérifiez que l'adresse renseignée est correcte";
        else if(err.message==="expired")
            message = "L'offre a expirée";
    }
    
    //console.log("message : ",message);

    return {candidature,message};
}

// découpe le contenu récupéré du serveur en objet Candidature
const parseOffre = function(h,parser)
{
    var c = new Candidature(),
        html,
        offreId,
        isGeneric;
    
    try
    {
        if(h.startsWith("offreId=")) {
            offreId = h.substring(8, h.indexOf('\n'));
            html = h.substring(h.indexOf('\n') + 1);
        }
        else
            html = h;

        isGeneric = (parser.isGeneric?1:0);

        c = parser.parse(html);
        if(!c.sourceId) // sourceId est déjà valorisé pr les imports issus d'un flux json tels que monster
            c.sourceId = offreId;
    }
    catch(err)
    {
        console.log(err);
        //Raven.captureException(err);

        try {
            if (!isGeneric) {
                let p = Parsers["generic"] || (Parsers["generic"] = new GenericParser())
                c = p.parse(html);
            } 
        } catch(ex) {

            console.log("erreur générique");
            c = null;
            //Raven.captureException(ex);
        }
        
    }

    return c;
}

export const getLogoFromCompanyName = async function(companyName)
{
    let u = 'https://autocomplete.clearbit.com/v1/companies/suggest/'+Url.encode(companyName);
    
    let response = await fetch(u);
    let json = await response.json();

    //console.log(json);

    if(json && json.length>0)
            return json[0].logo;
        else
            return "";
}

export const getLogosFromCompanyName = async function(companyName)
{
    let u = 'https://autocomplete.clearbit.com/v1/companies/suggest/'+Url.encode(companyName);
    
    let response = await fetch(u);
    let json = await response.json();

    //console.log("aaaa ",json);
    //console.log("bbbb ",json.map(c => c.logo));

    if(json)
        return json;
    else
        return "";
}

//pour test window.gLF = function(name){getLogoFromCompanyName(name).then(res => {console.log(res)})};

const importOffre = function(url, parser)
{
    let u = MEMO.rootURL+'/rest/candidatures/offre';
    
    let p = "url=" + Url.encode(url);

    if(!parser)
        p += "&generic=1";

    let params = {
            method: 'POST',
            headers: new Headers({
                        'Content-Type': 'application/x-www-form-urlencoded'
                }),
            body: p
        };

    return fetch(u,params);
}

let Parsers = {};

export const getParser = function(url)
{
    var p, ps = Parsers, u = url.toLowerCase();

    if(isInDomain(u, "labonneboite"))
        p = ps["labonneboite"] || (ps["labonneboite"] = new ParserLaBonneBoite());
    else if(isInDomain(u, "pole-emploi"))
        p = ps["poleemploi"] || (ps["poleemploi"] = new ParserPoleEmploi());
    else if(isInDomain(u, "pe-qvr.fr"))
        p = ps["poleemploi"] || (ps["poleemploi"] = new ParserPoleEmploi());
    else if (isInDomain(u, "leboncoin.fr"))
        p = ps["leboncoin"] || (ps["leboncoin"] = new ParserLeBonCoin());
    else if (isInDomain(u, "indeed.fr"))
        p = ps["indeed"] || (ps["indeed"] = new ParserIndeed());
    else if (isInDomain(u, "jobalim"))
        p = ps["jobalim"] || (ps["jobalim"] = new ParserJobAlim("jobalim"));
    else if (isInDomain(u, "vitijob"))
        p = ps["vitijob"] || (ps["vitijob"] = new ParserJobAlim("vitijob"));
    else if (isInDomain(u, "vivastreet.com"))
        p = ps["vivastreet"] || (ps["vivastreet"] = new ParserVivastreet());
    else if (isInDomain(u, "monster.fr"))
        p = ps["monster"] || (ps["monster"] = new ParserMonster());
    else if (isInDomain(u, "keljob.com"))
        p = ps["keljob"] || (ps["keljob"] = new ParserKeljob());
    else if (isInDomain(u, "cadremploi.fr"))
        p = ps["cadremploi"] || (ps["cadremploi"] = new ParserCadremploi());
    else if (isInDomain(u, "linkedin.com"))
        p = ps["linkedin"] || (ps["linkedin"] = new ParserLinkedIn());
    else if (isInDomain(u, "envirojob.fr"))
        p = ps["envirojob"] || (ps["envirojob"] = new ParserEnviroJob());
    else if (isInDomain(u, "apec.fr"))
        p = ps["apec"] || (ps["apec"] = new ParserApec());
    else if (isInDomain(u, "meteojob.com"))
        p = ps["meteojob"] || (ps["meteojob"] = new ParserMeteoJob());
    else if (isInDomain(u, "stepstone."))
        p = ps["stepstone"] || (ps["stepstone"] = new ParserStepStone("stepstone"));
    else if (isInDomain(u, "qapa."))
        p = ps["qapa"] || (ps["qapa"] = new ParserQAPA());
    else if (isInDomain(u, "marketvente."))
        p = ps["marketvente"] || (ps["marketvente"] = new ParserStepStone("marketvente"));
    else if (isInDomain(u, "adecco."))
        p = ps["adecco"] || (ps["adecco"] = new ParserAdecco("adecco"));
    else if (isInDomain(u, "manpower."))
        p = ps["manpower"] || (ps["manpower"] = new ParserManpower("manpower"));
    else if (isInDomain(u, "randstad."))
        p = ps["randstad"] || (ps["randstad"] = new ParserRandstad("randstad"));
    else if (isInDomain(u, "jobijoba.com"))
        p = ps["jobijoba"] || (ps["jobijoba"] = new ParserJobiJoba("jobijoba"));
    else if (isInDomain(u, "job.com") &&
        (
            isInDomain(u, "ouestjob.com") ||
            isInDomain(u, "parisjob.com") ||
            isInDomain(u, "nordjob.com") ||
            isInDomain(u, "centrejob.com") ||
            isInDomain(u, "estjob.com") ||
            isInDomain(u, "rhonealpesjob.com") ||
            isInDomain(u, "sudouestjob.com") ||
            isInDomain(u, "pacajob.com")
        ) )
        p = ps["regionsjob"] || (ps["regionsjob"] = new ParserRegionsJob());
    /*else if(url.indexOf("getJobJSONForMemo")>=0)
        p = ps["memo"] || (ps["memo"] = new ParserMemo());*/
    else
        p = ps["generic"] || (ps["generic"] = new GenericParser());

    return p;
}

// cherche les doublons de candidature dans les candidatures déjà enregistrées de l'utilisateur
// retourne le premier doublon de candidature trouvé
// null si aucun trouvé
export function findDoubleCandidature(user,sourceId)
{
    let res = null;

    //console.log("findDoubleCand", sourceId, user.candidatures);

    if(sourceId)
    {
        for(let k in user.candidatures)
        {
            //console.log(" ------ ",user.candidatures[k].sourceId," ---- ",sourceId);
            if(user.candidatures[k].sourceId==sourceId)
            {
                res = user.candidatures[k];
                break;   
            }
        }
    }

    return res;
}

export const manageOffreExpiry = async function(cId,idx)
{
    //console.log("Manage offre expiry : ",cId);

    let c = MEMO.user.candidatures[cId];
    if(c && c.type==CS.TYPES_CANDIDATURE.OFFRE && c.urlSource && !c.expired && !c.archived && getParser(c.urlSource))
    {
        try
        {
        
            let parser = getParser(c.urlSource);

            if( !(parser instanceof ParserLaBonneBoite) &&
                !(parser instanceof ParserLinkedIn)
                                                            )   // les contrôles ne sont pas pertinents pour tous les importeurs
            {

                let u = MEMO.rootURL+'/rest/candidatures/checkOffre/'+c.id;    
                let params = {
                        method: 'POST',
                        headers: new Headers({
                                    'Content-Type': 'application/x-www-form-urlencoded'
                            }),
                        body: "csrf=" + MEMO.user.csrf
                    };

                let response = await fetch(u,params);
                let json = await response.json();

                if(json.result==="expired")
                {
                    c.expired = 1;
                    userStore.dispatch({type:'UPDATE_CANDIDATURE', candidature:c});
                }
            }
        }
        catch(err){}
        finally
        {    
            setTimeout(function () {
                MEMO.checkOffre(idx + 1);
            }, 15000);    
        }
    }
    else
    {
        //console.log("check pas offre ", c.id, c.urlSource);
        MEMO.checkOffre(idx+1);
    }
}