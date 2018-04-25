// log 135
function TextField(p){
    this.init(p);
}

//attributs de l'objet
TextField.prototype = {

    field : null,		 	// l'element field
    el : null,
    id : null,
    defaultValue : "",
    ctrl : function(){ return true; }, // contrôle spécifique supplémentaire
    type : 1,				// 1 text, 2 integer, 3 real, 4 email, 5 pwd
    min : null,				// pour les cas de contr?les num?riques le minimum accept?, pour texte la longeur min
    max : null,				// cf. ci dessus
    previousValue : null,	// valeur précédente, utile pour les contr?les corrigeant la valeur
    errSt : "error",		// classe css en cas d'erreur
    tag : null,				// le placeHolder
    lTag : null,            // le label
    tagOnTop : null,        // position du label au dessus.
    control : false,		// true : check s'applique, false pas de contr?le
    isMetronic : true,      // true appliquer le style métronic, false resté sur du boostrap standar
    forceMetronicLabel: false,  // true ajouter le label dans tous les cas
    keyPressFct : null,            // fonction en cas de pression de touche
    nulValue : true,

    init : function(p)
    {
        var t=this, el, html="";

        $.extend(t,p);

        t.type = eval(t.type || 1);

        if(t.min || t.max ||t.type>1 || !t.nulValue)
            t.control=true;

        t.el = el = $("#"+t.id);

        if(t.isMetronic)
        {
            /*
             <div class="form-group">
             <label class="control-label visible-ie8 visible-ie9">Username</label>
             <input class="form-control form-control-solid placeholder-no-fix" type="text" autocomplete="off" placeholder="Username" name="username" />
             </div>
                 */
            el.addClass("form-group");
            /*if (t.control)
                el.addClass("has-error");*/

            if (t.lTag) {
                html += "<label class='control-label";
                if (!t.forceMetronicLabel)
                    html += " visible-ie8 visible-ie9";
                html += "' id='" + t.id + "L' for='" + t.id + "F'>" + t.lTag + "</label>";
            }

            if(t.errMsg)
                html += "<div class='tfErr'>"+ t.errMsg+"</div>";

            html += "<div class='input-group'>";

            if (t.type == 4)
                html += "<span class='input-group-addon'><i class='fa fa-envelope'></i></span>";
            else if(t.type ==5)
                html += "<span class='input-group-addon'><i class='fa fa-lock'></i></span>";

            html += "<input type='";

            if (t.type == 4)
                html += 'email';
            else if (t.type == 5)
                html += 'password';
            else if (t.type == 1)
                html += 'text';
            else
                html += 'number';

            html += "' ";

            if(t.name)
                html +="name='"+ t.name+"' ";

            html += "class='form-control' id='" + t.id + "F' aria-describedby='" + t.id + "L' placeholder='" + t.tag + "'>";


            if (t.control) {
                //html += "<span class='glyphicon glyphicon-remove form-control-feedback' id='" + t.id + "Ico' aria-hidden='true'></span>";
                html += "<span id='" + t.id + "Status' class='sr-only'>(failure)</span>";
            }

            html += "</div>";
        }
        else
        {
            el.addClass("form-group");
            /*if (t.control)
                el.addClass("has-error");*/

            if (t.lTag)
            {
                if(t.tagOnTop)
                    html += "<label id='" + t.id + "L' for='" + t.id + "F'>" + t.lTag + "</label>";
                else
                    html += "<label class='col-md-3 control-label' id='" + t.id + "L' for='" + t.id + "F'>" + t.lTag + "</label>";
            }

            if(t.errMsg)
                html += "<div class='tfErr'>"+ t.errMsg+"</div>";

            if(!t.tagOnTop)
            {
                if(t.button && t.lTag)
                    html+="<div class='col-md-6 tfStyle'>";
                else
                    html+="<div class='col-md-9 tfStyle'>";
            }
            else
            {
                html+="<div>";
            }

            html += "<div class='input-group  col-xs-12'>";

            //if (t.type == 4)
              //  html += "<span class='input-group-addon'>@</span>";

            html += "<input type='";

            if (t.type == 4)
                html += 'email';
            else if (t.type == 5)
                html += 'password';
            else if (t.type == 1)
                html += 'text';
            else
                html += 'number';

            html += "' ";

            if(t.name)
                html +="name='"+ t.name+"' ";

            html += "class='form-control' id='" + t.id + "F' aria-describedby='" + t.id + "L' placeholder='" + t.tag + "'>";

            /*if (t.control) {
                html += "<span class='glyphicon glyphicon-remove form-control-feedback' id='" + t.id + "Ico' aria-hidden='true'></span>";
                html += "<span id='" + t.id + "Status' class='sr-only'>(failure)</span>";
            }*/

            html += "</div></div>";

            if(t.button)
                html+="<div class='col-md-3 tfStyle pull-right'><button type='button' id='"+ t.button.id+"' class='btn green'>"+ t.button.tag+"</button></div>";
        }

        el.append(html);

        if(t.button)
        {
            $("#"+ t.button.id).on("click",$.proxy(t.button.onClick, t.button.scope));
        }


        t.field=$("#"+t.id+"F");

        if(t.type!=1 && !t.defaultValue)
            t.defaultValue=0;

        t.field.val(p.defaultValue);

        var fct = function(event)
        {
            if(this.keyCheck(event))
                this.check();
        }

        t.field.on("keyup", $.proxy( fct, t) );

        if(t.keyPressFct)
            t.field.keypress(t.keyPressFct);

        t.hideError();
    },

    showError : function(msg)
    {
        var eMsg = this.el.find(".tfErr"), m;

        if(eMsg.length>0)
        {
            if(msg)
                eMsg.html(msg);
            eMsg.show();
        }
    },

    hideError : function()
    {
        var eMsg = this.el.find(".tfErr");

        if(eMsg.length>0)
            eMsg.hide();
    },

    getValue : function()
    {
        var t=this,
            f = t.field,
            v = $sc(f.val()),
            c = t.control;

        t.check();

        if(c && t.type==2)
        {
            if(v=="-" || v=="+")
                v = 0;
            else
            {
                v=parseInt(v);
                if(isNaN(v))
                    v=0;
            }
        }

        return v;
    },

    setValue : function(val)
    {
        var v = $sc(val);
        v = $rAMP(v);
        this.field.val(v);
        this.check();
    },

    // la version pr�te � �tre post�e
    getQParam : function()
    {
        return encodeURIComponent(this.field.val());
    },

    setOK : function()
    {
        this.el.removeClass("has-error").addClass("has-success");
        //$("#"+this.id+"Ico").removeClass("glyphicon-remove").addClass("glyphicon-ok");
    },

    setError : function()
    {
        this.el.removeClass("has-success").addClass("has-error");
        //$("#"+this.id+"Ico").removeClass("glyphicon-ok").addClass("glyphicon-remove");
    },

    setNoColor :function() {
    	this.el.removeClass("has-success").removeClass("has-error");
    },
    
    keyCheck : function(event)
    {
        var keyCode = event.keyCode, res=true;
        if(keyCode==32 || (keyCode<41 && keyCode>36))
            res=false;
        return res;
    },

    check : function()
    {
        var t=this,
            f = t.field,
            res = true;

        if(t.control)
        {
            var val = $rAMP($sc(f.val()));

            if(!val && !t.nulValue)
                res = false;
            else
            {
                switch(this.type)
                {
                    case 1 :
                    {
                        var val2 = val.trim();
                        if(t.min!=null && val2.length<t.min)
                            res=false;
                        if(t.max!=null && val2.length>t.max)
                            res=false;
                        break;
                    }
                    case 2 :
                    {
                        val = val.trim();
                        if(val!="-" && val!="+")
                        {
                            if(isNaN(val))
                            {
                                if(t.previousValue!=null)
                                    val = t.previousValue;
                                else
                                    val = t.defaultValue;
                            }
                            if(t.min!=null && (val=="" || val<t.min))
                            {
                                res=false;
                                val=t.min;
                            }
                            if(t.max!=null && val>t.max)
                            {
                                res=false;
                                val = t.max;
                            }
                        }

                        t.previousValue = val;

                        break;
                    }
                    case 3 :
                    {
                        val = parseFloat(val);
                        if(isNaN(val))
                            val = t.defaultValue;
                        if(t.min!=null && (val=="" || val<t.min))
                            res=false;
                        if(t.max!=null && val>t.max)
                            res=false;
                        break;
                    }
                    case 4 :
                    {
                        var val2 = val.trim();
                        if(val2 && !isEmail(val2))
                            res=false;
                        if(t.min!=null && val2.length<t.min)
                            res=false;
                        if(t.max!=null && val2.length>t.max)
                            res=false;
                    }
                    case 5 :
                    {
                        var val2 = val.trim();
                        if(t.min!=null && val2.length<t.min)
                            res=false;
                        if(t.max!=null && val2.length>t.max)
                            res=false;
                        break;
                    }
                }
            }

            if(f.val() != val)
                f.val(val);

            res = res && t.ctrl();

            if(res)
                t.setOK();
            else
                t.setError();
        }
        return res;
    },


    hasValue : function()
    {
        return this.field.present();
    }
}