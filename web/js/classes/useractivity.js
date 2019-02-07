function UserActivity(ua)
{
    if(ua)
        this.init(ua);
}


UserActivity.prototype = {

    email : null,
    receiveEmail : null,
    todos : null,
    entretiens : null,
    candidatures : null,
    relances : null,
    conns : null,
    fbConns : null,
    lastActivity : null,

    init : function(ua)
    {
        var t=this;
        $.extend(t,ua);
      /* if(ua.lastActivity)
            t.lastActivity = moment(ua.lastActivity,"YYYY-MM-DD HH:mm");*/
    }
}

