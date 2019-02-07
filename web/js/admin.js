function BackOffice()
{
    this.init();
}

BackOffice.prototype = {

    activities : {},
    visitorLinks : {},
    userEmails : {},
    stats : null,

    init : function()
    {
        var t=this;

        t.rootURL = window.location.protocol+"//"+window.location.hostname;

        if(window.location.port)
            t.rootURL+=":"+window.location.port;

        t.rootURL += "/rest";

        console.log("rootUrl : ", t.rootURL);

        if(cohorte)
            $("#cohortePicker").val(cohorte);

        $("#cohortePicker").on("change",$.proxy( t.changeCohorte, t));

        $("#btGetUserActivities").on("click",$.proxy( t.getUserActivities, t));
        $("#btGetSpecificUserActivities").on("click",$.proxy( t.getSpecificUserActivities, t));
        $("#btGetCandAndUserCount").on("click",$.proxy( t.getCandAndUserCount, t));

        $("#btStartQuartzMaster").on("click",$.proxy( t.startQuartzMaster, t));
        $("#btStopQuartzMaster").on("click",$.proxy( t.stopQuartzMaster, t));

        t.setDisplay();

        t.getStats();

        stats = new Stats(t.rootURL);

        t.hideStatsBO();

        t.getQuartzInfo();
    },

    changeCohorte : function()
    {
        cohorte = eval($("#cohortePicker").val());
        this.getStats();
    },

    getStats : function()
    {
        var t=this;
        t.getUserCount();


        if(!isDemo)
        {
            t.getCandidatureCount();
            t.getCandidaturePerUser();
        }
    },

    setDisplay : function()
    {
        if(isDemo)
        {
            //cacher les blocs inutiles
            $("#nbFichesParUser").hide();
            $("#nbUser14").hide();
            $("#nbFiches").hide();
            $("#userStateRow").hide();
            $("#userInterviewRow").hide();

            //masquer les textes inutiles
            $("#nbUser30Rule").hide();

            // afficher les blocs dédiés
            $("#nbInterviewUsers").show();

            //augmenter la taille des blocs en ajoutant un style dédié*/
            $("body").addClass("stats");

        }
    },

    getUserCount : function()
    {
        var chte="";
        if(cohorte)
            chte="?cohorte="+cohorte;

        $.ajax({
            type: 'GET',
            url: this.rootURL + '/admin/userCount' + chte,
            dataType: "json",

            success: function (response)
            {
                if(response.result=="ok")
                {
                    $("#userCount").html(response.userCount);
                }
                else
                {
                    toastr['error']("Erreur lors du chargement du nombre d'utilisateurs","Une erreur s'est produite "+response.msg);
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                console.log('/candidature error: ' + textStatus);
            }
        });
    },

    getCandidatureCount : function()
    {
        var chte="";
        if(cohorte)
            chte="?cohorte="+cohorte;

        $.ajax({
            type: 'GET',
            url: this.rootURL + '/admin/candidatureCount'+chte,
            dataType: "json",

            success: function (response)
            {
                if(response.result=="ok")
                {
                    $("#candidatureCount").html(response.candidatureCount);
                }
                else
                {
                    toastr['error']("Erreur lors du chargement du nombre de candidature","Une erreur s'est produite "+response.msg);
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                console.log('/candidature error: ' + textStatus);
            }
        });
    },

    getCandidaturePerUser : function()
    {
        var chte="";
        if(cohorte)
            chte="?cohorte="+cohorte;

        $.ajax({
            type: 'GET',
            url: this.rootURL + '/admin/candidaturePerUser'+chte,
            dataType: "json",

            success: function (response)
            {
                if(response.result=="ok")
                {
                    $("#candidaturePerUser").html(response.candidaturePerUser);
                }
                else
                {
                    toastr['error']("Erreur lors du chargement candidaturePerUser","Une erreur s'est produite "+response.msg);
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                console.log('/candidature error: ' + textStatus);
            }
        });
    },

    getCandAndUserCount : function()
    {
        var t=this;
        t.getCandidatureAndUserCount(30);
        t.getCandidatureAndUserCount(14);
    },

    getCandidatureAndUserCount : function(d)
    {
        var chte="";
        if(cohorte)
            chte="?cohorte="+cohorte;

        $.ajax({
            type: 'GET',
            url: this.rootURL + '/admin/candidatureAndUserCount/'+d+chte,
            dataType: "json",

            success: function (response)
            {
                if(response.result=="ok")
                {
                    if(d<30) {
                        $("#weekUsers").html(response.userCount);
                        $("#weekCandidatures").html(response.candidatureCount);
                    }
                    else
                    {
                        $("#monthUsers").html(response.userCount);
                        $("#monthCandidatures").html(response.candidatureCount);
                    }
                }
                else
                {
                    toastr['error']("Erreur lors du chargement getCandidatureAndUserCount","Une erreur s'est produite "+response.msg);
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                console.log('/candidature error: ' + textStatus);
            }
        });
    },

    getSpecificUserActivities : function()
    {
        this.getUserActivities($("#btSpecificUserEmail").val());
    },

    getUserActivities : function(email)
    {
        var chte="?";
        if(cohorte)
            chte="&cohorte="+cohorte;

        if(email)
            chte+="&email="+encodeURIComponent(email);

        $.ajax({
            type: 'GET',
            url: this.rootURL + '/admin/getUserActivities'+chte,
            dataType: "json",

            success: function (response)
            {
                if(response.result=="ok")
                {
                    var a, as = response.activities,
                        h = "<table><tr><th>ID</th><th>EMAIL</th><th>A FAIRE</th><th>CANDIDATURES</th><th>RELANCES</th><th>ENTRETIENS</th>" +
                            "<th>NB CONNEXIONS</th><th>NB CONNEXIONS FACEBOOK</th><th>DERNIERE ACTIVITE</th><th>ACTIVITES</th><th>EMAIL TEST</th></tr>";

                    for(var i=0; i<as.length; ++i)
                    {
                        a = new UserActivity(as[i]);

                        backOffice.visitorLinks[""+ a.userId] = "/?link="+ a.visitorLink;
                        backOffice.userEmails[""+ a.userId] = a.email;

                        h+="<tr><td><a href='"+backOffice.visitorLinks[""+ a.userId]+"' target='_blank'>"+ a.userId+"</a></td><td>"+ a.email+"</td><td>"+ a.todos+ "</td><td>"+ a.candidatures+"</td><td>" + a.relances + "</td><td>";
                        h+= a.entretiens+"</td><td>"+ a.conns+"</td><td>"+ a.fbConns+"</td><td>"+ a.lastActivity+"</td>";
                        h+= "<td><a onclick='javascript:backOffice.getActivities("+ a.userId+");'>Voir</a> </td>";
                        if (a.receiveEmail) {
                            h+= "<td><a onclick='javascript:backOffice.sendTestEmail("+ a.userId+");'>Envoyer</a> </td></tr>";
                        } else {
                            h+= "<td>Désinscrit</td></tr>";
                        }
                    }
                    h+="</table>";

                    $("#userAndCandidatureState").html(h);
                }
                else
                {
                    toastr['error']("Erreur lors du chargement getUserActivities","Une erreur s'est produite "+response.msg);
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                console.log('/candidature error: ' + textStatus);
            }
        });
    },

    sendTestEmail : function(userId)
    {

        $.ajax({
            type: 'POST',
            url: this.rootURL + '/admin/sendWeeklyEmailReminder/'+userId,
            dataType: "json",

            success: function (response)
            {
                if(response.result=="ok")
                {
                    toastr['success']("Email envoyé","");
                }
                else
                {
                    toastr['error']("Erreur lors de l'envoi d'un email de test","Une erreur s'est produite "+response.msg);
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                console.log('/candidature error: ' + textStatus);
            }

        });


    },

    getUserInterviews : function()
    {
        var chte="";
        if(cohorte)
            chte="?cohorte="+cohorte;

        $.ajax({
            type: 'GET',
            url: this.rootURL + '/admin/userInterviews'+chte,
            dataType: "json",

            success: function (response)
            {
                if(response.result=="ok")
                {
                    var a, as = response.interviews, uCt=0, uId,
                        h = "<table><tr><th>ID UTILISATEUR</th><th>EMAIL</th><th>TITRE</th><th>VOIR LES ACTIVITES</th><th>VOIR LA CANDIDATURE</th></tr>";

                    $("#countInterviews").text(as.length);
                    $("#nbInterviews").text(as.length);

                    for(var i=0; i<as.length; ++i)
                    {
                        a = new UserInterview(as[i]);

                        if(!uId || uId!=a.userId)
                        {
                            uId = a.userId;
                            uCt++;
                        }

                        if(a.archived)
                            h+="<tr class='archivedRow'>";
                        else
                            h+="<tr class='boldRow'>";
                        h+="<td><a onclick='javascript:backOffice.visitUserBoard("+ a.userId+")'>"+ a.userId+"</a></td><td>"+ a.email+"</td><td>"+a.title+"</td>";
                        h+= "<td><a onclick='javascript:backOffice.getActivities("+ a.userId+");'>Activités</a> </td>";
                        h+= "<td><a onclick='javascript:backOffice.openCandidature("+ a.userId+","+ a.candidatureId+");'>"+ a.candidatureId+"</a> </td></tr>";
                    }
                    h+="</table>";

                    $("#countInterviewUsers").text(uCt);
                    $("#interviewUsers").text(uCt);



                    $("#userInterviews").html(h);
                }
                else
                {
                    toastr['error']("Erreur lors du chargement userInterviews","Une erreur s'est produite "+response.msg);
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                console.log('/candidature error: ' + textStatus);
            }
        });
    },

    getActivities : function(userId)
    {
        if(this.activities[userId])
        {
            this.showActivities(userId);
        }
        else
        {
            //backOffice.showActivities(userId);

            $.ajax({
                type: 'GET',
                url: this.rootURL + '/admin/activities/'+userId,
                dataType: "json",

                success: function (response)
                {
                    if(response.result=="ok")
                    {
                        backOffice.activities[userId]  = response.actions;
                        backOffice.showActivities(userId);
                    }
                    else
                    {
                        toastr['error']("Erreur lors de la récupération des activités d'un utilisateur","Une erreur s'est produite "+response.msg);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown)
                {
                    // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                    console.log('/candidature error: ' + textStatus);
                }

            });
        }

    },

    showActivities : function(userId)
    {
        console.log("construction du tableau des activités du user");

        $("#userIdLabel").html("<a href='"+this.visitorLinks[userId]+"' target='_blank'>"+userId+"</a> "+this.userEmails[userId]);

        var h = "<table><tr><th>Date</th><th>Action</th><th>Domaine</th><th>Candidature</th></tr>",
            bo = this, as = bo.activities[userId], a, vL = bo.visitorLinks[userId];

        for(var i= 0, l=as.length; i<l; ++i)
        {
            a = as[i];

            if(a.action.startsWith("Connexion"))
                h+="<tr class='boldRow'>";
            else
                h+="<tr>";

            h+="<td>"+ a.creationTime+"</td>";
            h+="<td>"+ a.action+"</td>";
            h+="<td>"+ a.domaine+"</td>";
            if(a.candidatureId && a.domaine=="Candidature")
            {
                h += "<td><b><a target='_blank' href='"+vL+"&c="+ a.candidatureId+"'>";
                h += a.candidatureId +"</a></b></td>";
            }
            else
            {
                h += "<td></td>";
            }

            h+="</tr>";
        }

        h+="</table>";


        $("#userActivityArray").html(h);

        $('#mdUserActivities').modal('show');
    },

    visitUserBoard : function(userId)
    {
        window.open(this.visitorLinks[userId]);
    },

    openCandidature : function(userId, candidatureId)
    {
        window.open(this.visitorLinks[userId]+"&c="+candidatureId);
    },

    getExtractUserActivities : function()
    {
        $("#lienExtractUserActivities").hide();
        $("#spinnerExtract").show();

        var fileUrl = this.rootURL + "/admin/getExtractUserActivities",
            element = document.createElement('a');
        element.setAttribute('href', fileUrl);
        element.setAttribute('download', "extract-userActivities.zip");
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    },

    getOriginesStats : function()
    {
        $('#blocUsersIncoming').show();
        stats.getUsersIncomming();

        $('#blocCandidaturesIncoming').show();
        stats.getCandidaturesIncomming();

        $('#blocCandidaturesButtonIncoming').show();
        stats.getCandidaturesButtonIncomming();
    },

    getTypesCandidaturesStats : function()
    {
        $('#blocTypeCandidature').show();
        $('#blocCandidatureReseau').show();
        stats.getTypeCandidature();

        $('#blocNbCandidatureReseau').show();
        stats.getNbCandidatureReseau();
    },

    hideStatsBO : function()
    {
        $('#blocUsersIncoming').hide();
        $('#blocCandidaturesIncoming').hide();
        $('#blocCandidaturesButtonIncoming').hide();
        $('#blocTypeCandidature').hide();
        $('#blocCandidatureReseau').hide();
        $('#blocNbCandidatureReseau').hide();
    },

    getQuartzInfo : function()
    {
        $.ajax({
            type: 'GET',
            url: this.rootURL + '/admin/quartz',
            dataType: "json",

            success: function (response)
            {
                if(response.result=="ok")
                {
                    $("#quartz").html("hostname : " + response.hostname + ", <br/>quartz : " + response.quartzIsRunning + ", is quartz master : " + response.isQuartzMaster + " (host quartz master=" + response.hostQuartzMaster + ")");
                }
                else
                {
                    toastr['error']("Erreur lors du chargement du status Quartz","Une erreur s'est produite "+response.msg);
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                console.log('/quartz error: ' + textStatus);
            }
        });
    },

    startQuartzMaster : function()
    {
        $.ajax({
            type: 'GET',
            url: this.rootURL + '/admin/startQuartzMaster',
            dataType: "json",

            success: function (response)
            {
                if(response.result=="ok")
                {
                    $("#quartz").html("hostname : " + response.hostname + ", <br/>quartz : " + response.quartzIsRunning + ", is quartz master : " + response.isQuartzMaster + " (host quartz master=" + response.hostQuartzMaster + ")");
                }
                else
                {
                    toastr['error']("Erreur lors de startQuartzMaster","Une erreur s'est produite "+response.msg);
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                console.log('/quartz error: ' + textStatus);
            }
        });
    },

    stopQuartzMaster : function()
    {
        $.ajax({
            type: 'GET',
            url: this.rootURL + '/admin/stopQuartzMaster',
            dataType: "json",

            success: function (response)
            {
                if(response.result=="ok")
                {
                    $("#quartz").html("hostname : " + response.hostname + ", <br/>quartz : " + response.quartzIsRunning + ", is quartz master : " + response.isQuartzMaster + " (host quartz master=" + response.hostQuartzMaster + ")");
                }
                else
                {
                    toastr['error']("Erreur lors de stopQuartzMaster","Une erreur s'est produite "+response.msg);
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                console.log('/quartz error: ' + textStatus);
            }
        });
    }


}

function UserAction(p)
{
    this.domaine = p.domaine;
    this.action= p.action;
    this.creationTime = p.creationTime;
    this.candidatureId = p.candidatureId;
    this.userId = p.userId;
}
UserAction.prototype = {
    domaine : null,
    action : null,
    candidatureId : null,
    creationTime : null,
    userId : null
}