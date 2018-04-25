<%@page import="fr.gouv.motivaction.mails.MailTools"%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<script>

    var memoVars = {};

    memoVars.uLI = <%=(userId>0)?1:0%>;

    memoVars.user = JSON.parse('<%=(user==null)?"{}":user.toJSON()%>');
    memoVars.isVisitor = <%=(isVisitor)?1:0%>;
    memoVars.visitorLink = '<%=(visitorLink!=null)?visitorLink:""%>';
    memoVars.rootURL = (window.location.origin+window.location.pathname).match(/^.*\//)[0];

    memoVars.cId = <%=candidatureId%>;
    memoVars.url = '<%=((url!=null)?url:"")%>';
    memoVars.jobTitle = '<%=((jobTitle!=null)?jobTitle:"")%>';

    memoVars.openFaqOnStartup = '<%=((faq!=null)?faq:"")%>';
    memoVars.resetToken = '<%=((resetToken!=null)?resetToken:"")%>';

    if(!memoVars.url && localStorage.getItem("peamUrl"))
        memoVars.url = localStorage.getItem("peamUrl");
    memoVars.peamSource = localStorage.getItem("peamSource");
    memoVars.PEAMError = '<%=((PEAMError!=null)?PEAMError:"")%>';
    memoVars.PEAMConnect = <%=((PEAMConnect!=null)?1:0)%>;

    memoVars.host = '<%= MailTools.getHostname()%>';
    
    localStorage.removeItem("peamUrl");
    localStorage.removeItem("peamSource");

    var importOnStartup = (memoVars.url?1:0);

</script>