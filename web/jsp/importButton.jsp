<%@ taglib prefix="pack" uri="https://github.com/d8bitr/packtag" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="org.apache.commons.lang3.StringEscapeUtils" %>

<%
    // ici récupérer les paramètres de l'URL pour instancier l'URL
    String url = (String)request.getParameter("url");
	// stripscript (XSS)
	url = StringEscapeUtils.escapeXml11(url);	
    if(url==null)
        url="";

    String job = (String)request.getParameter("job");
    // stripscript (XSS)
    job = StringEscapeUtils.escapeXml11(job);
    if(job==null)
        job="";

    String height = (String)request.getParameter("height");
	// stripscript (XSS)
	height = StringEscapeUtils.escapeXml11(height);
    if(height==null)
        height="40";
    String width = (String)request.getParameter("width");
	// stripscript (XSS)
	width = StringEscapeUtils.escapeXml11(width);
    if(width==null)
        width="200";

    String id = (String)request.getParameter("id");
 	// stripscript (XSS)
 	id = StringEscapeUtils.escapeXml11(id);    
    String show = (String)request.getParameter("show");
 	// stripscript (XSS)
    show = StringEscapeUtils.escapeXml11(show); 
    
    String css = "40x200";

    try
    {
        int h = Integer.parseInt(height);
        int w = Integer.parseInt(width);

        if(h<26)
        {
            if(w<36)
                css = "20x20";
            else if(w<151)
                css = "20x150";
            else
                css = "20x250";
        }
        else if(h<36)
        {
            if(w<46)
                css = "30x30";
            else if(w<201)
                css = "30x200";
            else
                css = "30x250";
        }
        else if(h<46)
        {
            if(w<56)
                css = "40x40";
            else if(w<251)
                css = "40x250";
            else
                css = "40x300";
        }
        else
        {
            if(w<66)
                css = "50x50";
            else if(w<251)
                css = "50x250";
            else
                css = "50x300";
        }
    }
    catch(Exception e){}

%>
<html>
<head>
    <title>MEMO, bouton d'import</title>

    <link rel="stylesheet" href="../css/importButton/importButton.css">
    <link rel="stylesheet" href="../css/importButton/<%=css%>.css">

    <script src="https://use.fontawesome.com/b34a69b0a1.js"></script>

</head>
<body>
    <table style="width:100%; height: 100%">
        <tr>
            <td class="imgCell"><img class="logoMemo" src="../pic/logo_memo_notext.png" alt="Logo MEMO"/></td>
            <td class="txtCell"><div id="btn" class="btn">Importer dans MEMO</div></td>
        </tr>
    </table>
    <div id="importContainer" style="display:none;" ></div>
</body>


<script src="../js/jquery-2.1.3.min.js"></script>

<pack:script>
    <src>/js/utf8UrlEncoder.js</src>
    <src>/js/utils.js</src>
    <src>/js/classes/candidature.js</src>
    <src>/js/board/parser.js</src>

    <src>/js/board/parsers/apec.js</src>
    <src>/js/board/parsers/cadremploi.js</src>
    <src>/js/board/parsers/envirojob.js</src>
    <src>/js/board/parsers/indeed.js</src>
    <src>/js/board/parsers/jobalim.js</src>
    <src>/js/board/parsers/keljob.js</src>
    <src>/js/board/parsers/labonneboite.js</src>
    <src>/js/board/parsers/leboncoin.js</src>
    <src>/js/board/parsers/linkedin.js</src>
    <src>/js/board/parsers/meteojob.js</src>
    <src>/js/board/parsers/monster.js</src>
    <src>/js/board/parsers/poleemploi.js</src>
    <src>/js/board/parsers/regionsjob.js</src>
    <src>/js/board/parsers/stepstone.js</src>
    <src>/js/board/parsers/vivastreet.js</src>
    <src>/js/board/parsers/generic.js</src>

    <src>/js/buttonQuery.js</src>

</pack:script>


<script>
    var url = "<%=url%>",
            height = "<%=height%>",
            id = "<%=id%>",
            width = "<%=width%>",
            importActive = 1,
            job = "<%=job%>",
            show = "<%=show%>";

    url = decodeURIComponent(url);
    url.replace(/\s/gi,'+');

    url = url.trim();

    if(url.toLowerCase().indexOf("http")!=0)
        url = "http://"+ url;

    var ck = getCookie("auth");

    if(ck)
    {
        document.body.addEventListener('click',function(e) {
            //console.log("click: ",e,url);

            if(importActive)
            	importOffre();
        })

        activate(id,height,width);
    }
    else
    {
        if(!show || show!="no")
        {
            document.body.addEventListener('click',function(e) {
                window.open("https://memo.pole-emploi.fr?url=<%=url%>","_blank");
            })

            $("#btn").html("Importer dans MEMO");

            activate(id,height,width);
        }
        else
            activate(id,0,0,0);
    }

</script>

</html>
