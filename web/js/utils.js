// polyfill internet explorer
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
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

// supprime les images
function $rIMG(txt)
{
    var c = document.createElement('div');
    c.innerHTML = txt;
    $(c).find('img').remove();
    return c.innerHTML;
}

function $Hist(p)
{
    //console.log("saving history : ",p);
    history.pushState(p,"","");
}

// remplace les br
function $rBR(v,s)
{
    var r = /<br\s*[\/]?>/gi,
        tok = "\n";

    if(s)
        tok=s;
    return v.replace(r, tok);
}

// supprime les \r\n et les remplace par s ou par "" si s n'est pas précisé
function $rRN(v,s)
{
    var r = /\r?\n|\r/gi,
        tok = "";

    if(s)
        tok=s;
    return v.replace(r, tok);
}

// supprimer les balises span en conservant leur contenu
// attention la routine retourne exclusivement le contenu de l'élément et pas les balises enclosant l'élément
function $rSPAN(v)
{
    var el = $(v);//convert string to JQuery element

    el.find("span").each(function () {
        var text = $(this).html();//get span content
        $(this).replaceWith(text);//replace all span with just content
    });

    return el.html();//get back new string
}

function getTextNodesIn(node, includeWhitespaceNodes) {
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


function $rHx(v)
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
function $rP(v)
{
    var r1 = /<p[^>]*>/gi,
        r2 = /<\/?p[^>]*>/gi;
    v = v.replace(r1, "\n");
    v = v.replace(r2, "");
    return v;
}

// remplace les &
function $rAMP(v)
{
    var r = /&amp;/gi;
    return v.replace(r, "&");
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

/*$.toaster({ settings : { timeout : {
    "danger" : 10000,
    "info" : 5000,
    "warning" : 5000,
    "success" : 5000
} } });*/

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
        error: function (jqXHR, textStatus, errorThrown){}
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

function getAccountSource()
{
    var res = "";

    if(!memoVars.cId)
    {
        if (memoVars.url)
        {
            for (var i = 0; i < CS.MEMO_PARTNERS.length; ++i)
            {
                if(memoVars.url.indexOf(CS.MEMO_PARTNERS[i]) >= 0)
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