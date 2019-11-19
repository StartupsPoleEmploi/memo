import $ from 'jquery';
import Moment from 'moment';
import linkifyHtml from 'linkifyjs/html'
import { MEMO } from '../index.js';
import { Constantes as CS } from '../constantes';

export const Url = {

    // public method for url encoding
    encode : function (string) {
        return escape(this._utf8_encode(string));
    },

    // public method for url decoding
    decode : function (string) {
    	var r = "";
    	if(string != undefined && string!=null)
    		r = this._utf8_decode(unescape(string))
        return r;
    },

    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    // modification pour convertir le + non encode en espace
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = 0, c1 = 0, c2 = 0, c3;

        while ( i < utftext.length ) {

            c = utftext.charCodeAt(i);

			if (c == 43) {
				string += ' ';
                i++;
			}
			else if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }
}

export function $sc(txt)
{
    if(txt)
    {
        var c = document.createElement('div');
        c.innerHTML = txt;
        $(c).find('noscript').remove();
        $(c).find('script').remove();
        $(c).find('iframe').remove();
        $(c).find('style').remove();
        $(c).find('link').remove();
        $(c).find('select').remove();
        $(c).find('input').remove();
        $(c).find('textarea').remove();
        return c.innerHTML;
    }
    else
        return "";
}

export function setLocalStorageConsentPolicy(accept) {

    localStorage.setItem("hasConsent", accept);

    if(accept)
    {
        var now = Moment();
        now.add(13, "months");
        localStorage.setItem("consentExpire", now.toDate().getTime());        
    }
    else
        localStorage.setItem("consentExpire", null);

}

export function getCookie(cname)
{
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}

export function getValueFromPath(key)
{
    const url = new URL(window.location);
    const searchParams = new URLSearchParams(url.search);
    //console.log("searchParams : ",searchParams.get(key));
    return $sc(searchParams.get(key));
}


export function isInDomain(url, domain)
{
	var u = url, res = 0;
    try
    {
        if (url.indexOf("http") != 0) {
            u = "http://" + u;
        }
        u = new URL(u);
        if (u.hostname.indexOf(domain) > -1) {
            res = 1;
        }
    }
    catch(err){
        //fallback IE11
        if (url.indexOf(domain) > -1) {
            res = 1;
        }
    }
	return res;
}

export function getEmailInText(v)
{
    var res = "", atIdx;

    if (v)
        atIdx = v.indexOf('@');

    if(atIdx>-1)
    {
        try
        {
            var pfx, sfx;
            pfx = v.substring(0,atIdx);
            pfx = pfx.replace(/[\r\n]/g,' ');
            sfx = v.substring(atIdx);
            sfx = sfx.replace(/[\r\n]/g,' ');
            pfx = pfx.substring(pfx.lastIndexOf(' ')+1);
            if(sfx.indexOf(' ')>-1)
                sfx = sfx.substring(0,sfx.indexOf(' '));

            res = pfx+sfx;

            res = $rNBSP(res).trim();

            if(!isEmail(res))
                res="";
        }
        catch(err){res="";}
    }

    return res;
}

export function $rNBSP(v)
{
    var r = /&nbsp;/gi;
    return v.replace(r, " ");
}

export function isEmail(email)
{
    var filter  = /^(")?(?:[^\."])(?:(?:[\.])?(?:[\w\-!#$%&'*+/=?^_`{|}~]))*\1@(\w[\-\w]*\.){1,5}([A-Za-z]){2,6}$/;
    return filter.test(email);
}

// remplace les br
export function $rBR(v,s)
{
    var r = /<br\s*[\/]?>/gi,
        tok = "\n";

    if(s)
        tok=s;
    return v.replace(r, tok);
}

export function getTextNodesIn(node, includeWhitespaceNodes) {
    var textNodes = [], nonWhitespaceMatcher = /\S/;

    function getTextNodes(node) {
        if (node.nodeType == 3) {
            if (includeWhitespaceNodes || nonWhitespaceMatcher.test(node.nodeValue)) {
                textNodes.push(node);
            }
        } else {
            for (var i = 0, len = node.childNodes.length; i < len; ++i) {
                getTextNodes(node.childNodes[i]);
            }
        }
    }

    getTextNodes(node);
    return textNodes;
}

export function $rHx(v)
{
    var r1 = /<h[0-4][^>]*>/gi,
        r2 = /<\/?h[0-4][^>]*>/gi;

    if(v) {
        v = v.replace(r1, "\n");
        v = v.replace(r2, "\n");
    }
    return v;
}

// remplace les p
export function $rP(v)
{
    var r1 = /<p[^>]*>/gi,
        r2 = /<\/?p[^>]*>/gi;
    v = v.replace(r1, "\n");
    v = v.replace(r2, "");
    return v;
}

// remplace les &
export function $rAMP(v)
{
    var r = /&amp;/gi;
    return v.replace(r, "&");
}

// supprimer les balises span en conservant leur contenu
// attention la routine retourne exclusivement le contenu de l'élément et pas les balises enclosant l'élément
export function $rSPAN(v)
{
    var el = $(v);//convert string to JQuery element

    el.find("span").each(function () {
        var text = $(this).html();//get span content
        $(this).replaceWith(text);//replace all span with just content
    });

    return el.html();//get back new string
}

// supprime les images
export function $rIMG(txt)
{
    var c = document.createElement('div');
    c.innerHTML = txt;
    $(c).find('img').remove();
    return c.innerHTML;
}

// supprime les \r\n et les remplace par le contenu de la variable s ou par "" si s n'est pas précisé
export function $rRN(v,s)
{
    var r = /\r?\n|\r/gi,
        tok = "";

    if(s)
        tok=s;
    return v.replace(r, tok);
}

export function formatText(v)
{
    let txt = v
    if(!txt)
        txt="";
    txt = txt.replace(/[\r\n]/g, '<br />');

    return {__html: linkifyHtml(txt)};
}

export function isPasswordValid(form)
{ 

    let errors = {};
    
    if(!form.newPassword || form.newPassword.length<12)
        errors.newPassword = "Mot de passe trop court. 12 caractères minimum requis.";

    if(form.newPassword && form.confirmNewPassword && form.newPassword !== form.confirmNewPassword)    
        errors.confirmNewPassword = "Le mot de passe et sa confirmation ne sont pas identiques.";

    return errors;
}


export function getAccountSource()
{
    var res = "";

    if(!MEMO.cId)
    {
        if (MEMO.url)
        {
            for (var i = 0; i < CS.MEMO_PARTNERS.length; ++i)
            {
                if(MEMO.url.indexOf(CS.MEMO_PARTNERS[i]) >= 0)
                {
                    res = CS.MEMO_PARTNERS[i];
                    break;
                }
            }
        }
        else
        {
            var loc = document.location,
                query = loc.search.substring(1),
                vars = query.split("&");

            for (var i=0;i<vars.length;i++)
            {
                var pair = vars[i].split("=");
                if(pair[0] && !pair[1])
                {
                    res = pair[0];
                    break;
                }
                else if(pair[0]=="utm_source")
                {
                    res = pair[1];
                    break;
                }
            }
        }
    }

    return res;
}

/*

// polyfill internet explorer
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
}

if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(searchString, position) {
        var subjectString = this.toString();
        if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.lastIndexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
}

// retourne faux si pas une adresse email, vrai si une adresse email valide
function isEmail(email)
{
    var filter  = /^(")?(?:[^\."])(?:(?:[\.])?(?:[\w\-!#$%&'*+/=?^_`{|}~]))*\1@(\w[\-\w]*\.){1,5}([A-Za-z]){2,6}$/;
    return filter.test(email);
}


// stripscripts
function $sc(txt)
{
    var c = document.createElement('div');
    c.innerHTML = txt;
    $(c).find('noscript').remove();
    $(c).find('script').remove();
    $(c).find('iframe').remove();
    $(c).find('style').remove();
    $(c).find('link').remove();
    $(c).find('select').remove();
    $(c).find('input').remove();
    $(c).find('textarea').remove();
    return c.innerHTML;
}



function $Hist(p)
{
    //console.log("saving history : ",p);
    history.pushState(p,"","");
}

function $rNBSP(v)
{
    var r = /&nbsp;/gi;
    return v.replace(r, " ");
}

function $wST(h,doNotAnimate)
{
    if(doNotAnimate)
        $(window).scrollTop(h);
    else
    {
        var speed = 500; // Durée de l'animation (en ms)
        $('html, body').animate({scrollTop: h}, speed);
    }
}

function $goTo(e)
{
    $wST($("#"+e).position().top);
}

function $goToFaq(e)
{
    $('#mdFAQ').animate({scrollTop: $("#"+e).position().top}, 500);
}


try{
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "positionClass": "toast-bottom-right",
        "onclick": null,
        "showDuration": "1000",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "8000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "preventDuplicates": true,
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
}catch(err){}

function $logErr(msg)
{
    var  p = "message="+Url.encode(msg);
    $.ajax({
        type: 'POST',
        url: lBR.rootURL + '/log',
        data: p,
        dataType: "json",
        success: function (response){},
        error: function (jqXHR, textStatus, errorThrown){
            Raven.captureException("$logErr ajax error : ",textStatus,errorThrown);
        }
    });
}

function isInDomain(url, domain)
{
	var u = url, res = 0;
    try
    {
        if (url.indexOf("http") != 0) {
            u = "http://" + u;
        }
        u = new URL(u);
        if (u.hostname.indexOf(domain) > -1) {
            res = 1;
        }
    }
    catch(err){
        //fallback IE11
        if (url.indexOf(domain) > -1) {
            res = 1;
        }
    }
	return res;
}



function isOnline() {
	var xhr = new XMLHttpRequest();
	var res = false;

	try {
		xhr.open('GET', memoVars.rootURL+'./pic/favicon.ico', true);
		xhr.setRequestHeader("Cache-Control", "no-cache"); // on force le no-cache car les img sont en cache
		xhr.send();

		xhr.onload = function (e) {
			  if (xhr.readyState === 4) {
				if (xhr.status == 200)
				    res = true;

				if (res)
					$('#mdNoInternet').modal('hide');
				else
					$('#mdNoInternet').modal('show');
			  }
		}
		xhr.onerror = function (e) {
				$('#mdNoInternet').modal('show');
		}

	} catch(err) {
            $('#mdNoInternet').modal('show');
	}

	return res;
}

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

function getEmailInText(v)
{
    var res = "", atIdx;

    if (v)
        atIdx = v.indexOf('@');

    if(atIdx>-1)
    {
        try
        {
            var pfx, sfx;
            pfx = v.substring(0,atIdx);
            pfx = pfx.replace(/[\r\n]/g,' ');
            sfx = v.substring(atIdx);
            sfx = sfx.replace(/[\r\n]/g,' ');
            pfx = pfx.substring(pfx.lastIndexOf(' ')+1);
            if(sfx.indexOf(' ')>-1)
                sfx = sfx.substring(0,sfx.indexOf(' '));

            res = pfx+sfx;

            res = $rNBSP(res).trim();

            if(!isEmail(res))
                res="";
        }
        catch(err){res="";}
    }

    return res;
}

function checkEs6()
{
    "use strict";

    if (typeof Symbol == "undefined")
    {
        return false;
    }
    try
    {
        eval("class Foo {}");
        eval("var bar = (x) => x+1");
    }
    catch (e)
    {
        return false;
    }

    return true;
}


*/
