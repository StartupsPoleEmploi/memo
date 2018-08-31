<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%
    long candidatureId = 0;

    try
    {
        if(request.getParameter("c")!=null)
            candidatureId = Long.parseLong(request.getParameter("c"));
    }
    catch(Exception e){}

    String url = request.getParameter("url");
    if(url!=null)
        url = StringEscapeUtils.escapeXml11(url).toLowerCase();

    String faq = request.getParameter("faq");
    if(faq!=null)
        faq = StringEscapeUtils.escapeXml11(faq);

    String priorities = request.getParameter("priorities");
    if(priorities!=null)
        priorities = StringEscapeUtils.escapeXml11(priorities);

    String resetToken = request.getParameter("resetToken");
    if(resetToken!=null)
        resetToken = StringEscapeUtils.escapeXml11(resetToken);

    String jobTitle = request.getParameter("jobTitle");
    if(jobTitle!=null)
        jobTitle = StringEscapeUtils.escapeXml11(jobTitle);

    String srcIp = request.getHeader("X-FORWARDED-FOR");

    String PEAMError = request.getParameter("PEAMError");
    if(PEAMError!=null)
        PEAMError = StringEscapeUtils.escapeXml11(PEAMError);
    String PEAMConnect = request.getParameter("PEAMConnect");
    if(PEAMConnect!=null)
        PEAMConnect = StringEscapeUtils.escapeXml11(PEAMConnect);

%>