function Attachment(a)
{
    if(a)
        this.init(a);
}


Attachment.prototype = {

    id : 0,

    init : function(a)
    {
        var t=this;
        $.extend(t,a);

        if(a.fileName)
            t.fileName = $sc(t.fileName);
        if(a.type)
            t.type = $sc(t.type);

    }
}

