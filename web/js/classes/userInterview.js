function UserInterview(ui)
{
    if(ui)
        this.init(ui);
}


UserInterview.prototype = {

    email : null,
    candidatureId : null,
    userId : null,
    title : null,
    archived : null,

    init : function(ui)
    {
        var t=this;
        $.extend(t,ui);
    }
}

