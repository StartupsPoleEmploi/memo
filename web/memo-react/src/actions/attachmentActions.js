import { MEMO } from '../index.js';
import jQuery from 'jquery';

export function removeCandidatureAttachment(att,c)
{
    let u = MEMO.rootURL+'/rest/attachments/file/'+c.id+'/'+att.id;
    let p = "csrf="+MEMO.user.csrf;

    let params = {
            method: 'POST', // à remplacer par DELETE
            headers: new Headers({
                        'Content-Type': 'application/x-www-form-urlencoded'
                }),
            body: p
        };

    return fetch(u,params);
}




export function upload(f, handleReaderStart,handleReaderLoad,handleReaderProgress)
{
    var reader = new FileReader();

    // When the image is loaded,
    // run handleReaderLoad function
    
    reader.onloadstart = handleReaderStart;
    reader.onload = handleReaderLoad;
    reader.onprogress = handleReaderProgress;
    reader.fileName = f.name;
    reader.fileType = f.type;
    
    
    // Read in the image file as a data URL.
    reader.readAsDataURL(f);
}


// return 0 si pas de problème, le message d'erreur sinon
/*export function isFileNotOk(f)
{
    // extension
    var res = 0,
        re = /(\.|\/)(doc|docx|xls|xlsx|rtf|txt|csv|pdf|ppt|pptx|jpeg|jpg|png|gif|mp3|mp4|mkv|mpeg|mpg|wav|odt|bmp|tif|tiff|amr|odp|ods)$/i;

    if(!f.name.match(re))
    {
        res="Ce type de fichier n'est pas autorisé sur MEMO";
    }

    if(!f.file || f.file.length>1398101)   // 4/3 de 1Mo pour en prendre l'encodage en base64
    {
        res = "Vous ne pouvez pas enregistrer des fichiers de plus de 1 Mo";
    }

    return res;
}*/
export function isFileTooBig(f)
{
    if(f && f.size>1048576)   // 1Mo sur le fichier source
        return true;
    
    return false;
}

export function isFileNotAllowed(f)
{
    var re = /(\.|\/)(doc|docx|xls|xlsx|rtf|txt|csv|pdf|ppt|pptx|jpeg|jpg|png|gif|mp3|mp4|mkv|mpeg|mpg|wav|odt|bmp|tif|tiff|amr|odp|ods)$/i;

    if(!f.name.match(re))
        return true;
    
    return false;
}

export function saveAttachment(f,c)
{
    let u = MEMO.rootURL+'/rest/attachments/file/'+c.id;
    let p = jQuery.param(f)+"&csrf="+MEMO.user.csrf;

    
    let params = {
        method: 'POST',
        headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded'
            }),
        body: p
    };

    return fetch(u,params);
}


