//A CONSERVER POUR LES BESOINS DE L'HISTORIQUE

//console.log("ICI : ",ctjButtons);

var ctjButtons = document.getElementsByClassName("ctj-import-button");

//console.log("- boutons : ",ctjButtons);

window.addEventListener('message',function(e) {
    //console.log("message recu : ",e, e.origin, e.data.height,e.data.width, e.data.id);
    if(e.origin.indexOf('memo')>-1) {
        //console.log("message boomerang recu : ",e, e.origin, e.data.height,e.data.width, e.data.id);
        var ifr = document.getElementById(e.data.id);

        var style="width: " + e.data.width + "px; height:" + e.data.height + "px; ";
        if(e.data.border!=undefined)
            style+="border: "+ e.data.border+"px;";

        ifr.setAttribute("style", style);
    }
})

// ajout des <iframe>

for(var i= 0, l  = ctjButtons.length; i<l; ++i)
{
    var ifr, aNode, prt, du, h, w, id, job;

    //remplacer par une iframe
    aNode = ctjButtons[i];
    du = aNode.getAttribute("data-url");
    h = aNode.getAttribute("data-height");
    w = aNode.getAttribute("data-width");
    sh = aNode.getAttribute("data-show");
    job = aNode.getAttribute("data-job");

    id = "ctj-iframe-"+i;

    ifr = document.createElement("iframe");

    ifr.setAttribute("id",id);

    var ifrUrl = "";
    if(window.location.hostname.indexOf('boomerang')>=0)
    	ifrUrl = "http://boomerang:8080/jsp/importButton.jsp?id="+id+"&height="+h+"&width="+w;
    else if(window.location.hostname.indexOf('beta')>=0)
    	ifrUrl = "https://memo.beta.pole-emploi.fr/jsp/importButton.jsp?id="+id+"&height="+h+"&width="+w;
    else
    	ifrUrl = "https://memo.pole-emploi.fr/jsp/importButton.jsp?id="+id+"&height="+h+"&width="+w;

    if(du)
        ifrUrl += "&url="+encodeURIComponent(du);
    if(sh)
        ifrUrl += "&show="+sh;
    if(job)
        ifrUrl += "&job="+encodeURIComponent(job);

    ifr.setAttribute("src",ifrUrl);
    ifr.setAttribute("style","overflow:hidden;width: 0px; height:0px;");
    ifr.setAttribute("class","memoImportButton");
    aNode.parentNode.insertBefore(ifr,aNode.nextSibling);
}


// suppression des <a>

while(ctjButtons.length>0)
{
    aNode = ctjButtons[0];
    prt = aNode.parentNode;
    prt.removeChild(aNode);
}
