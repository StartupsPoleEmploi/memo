function Stats(rootUrl)
{
    this.init(rootUrl);
}

Stats.prototype = {

    activities : {},
    visitorLinks : {},
    userEmails : {},

    init : function(rootUrl)
    {
        var t=this;

        if(rootUrl)
            t.rootURL = rootUrl;
        else
        {
            if (window.location.host.indexOf("boomerang:8080") > -1)
                t.rootURL = "http://" + window.location.hostname;
            else
                t.rootURL = "https://" + window.location.hostname;

            if (window.location.port)
                t.rootURL += ":" + window.location.port;

            t.rootURL += "/rest";
        }
    },

    initGraph : function() {
        var t=this;

        t.getNPS();
        t.getUsersAssidus();
        t.getUsersEntretien();
        t.getUsersRetourEmploi();
    },

    getNPS : function() {
        var data = {
            labels: ['10/16', '01/17', '03/17', '05/17', '09/17', '11/17', '12/17', '01/18', '02/18', '03/18', '04/18', '05/18', '06/18'],

            series: [
                [-42, -3, 13, -12, 7, 23, 24, 11, 2, 15, -4, -1, -6]
            ]
        };

        var options = {
            high: 60, low: -60,
            plugins: [
                /*Chartist.plugins.ctPointLabels({
                 textAnchor: 'middle'
                 }),*/
                Chartist.plugins.ctBarLabels(),
                /*Chartist.plugins.ctThreshold({
                 threshold: 0
                 })*/
            ],
            axisX: {

            }
        };

        new Chartist.Bar('.ct-chartNPS', data, options).on('draw', function(data) {
            if (data) {
                if(data.type === 'grid') {
                    if (data.axis.units.pos=='y' && data.axis.ticks[data.index]==0){
                        data.element.addClass("axis");
                    }
                }
            }
        });
    },

    getUsersAssidus : function()
    {
        var tabLabels, tabSeries;

        $("#chartUsersAssidus").hide();
        $("#spinnerChartUsersAssidus").show();

        $.ajax({
            type: 'GET',
            url: this.rootURL + '/stats/utilisateursAssidus',
            dataType: "json",

            success: function (response)
            {
                if(response.result=="ok")
                {
                    stats.setGraphUsersAssidus(response.tabKeys, response.tabValues);

                    $("#chartUsersAssidus").show();
                    $("#spinnerChartUsersAssidus").hide();
                }
                else
                {
                    toastr['error']("Erreur stats lors du chargement du nombre d'utilisateurs assidus","Une erreur s'est produite "+response.msg);
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                console.log('/stats error: ' + textStatus);

                $("#chartUsersAssidus").show();
                $("#spinnerChartUsersAssidus").hide();
            }
        });


    },

    setGraphUsersAssidus : function(tabLabels, tabSeries)
    {
        var tabSeriesPrev, labelMoisCourant, data, options, max;

        if (tabLabels && tabSeries) {
            labelMoisCourant = tabLabels[tabLabels.length-1];
            // retourne la projection prévisionnelle du mois courant
            tabSeriesPrev = this.getTabSeriesPrev(tabSeries[0], labelMoisCourant);
            data = { labels: tabLabels, series: [tabSeries[0], tabSeriesPrev]  };
            max = Math.max.apply(null, tabSeries[0].concat(tabSeriesPrev));
            // On ajoute 10% à la plus grande valeur pour un bon dimensionnement du graphique
            max = max + 0.1*max;

            options = {
                high: max,
                plugins: [
                    Chartist.plugins.ctBarLabels(),
                    Chartist.plugins.legend({
                        legendNames: ['Réel', 'Prévisionnel'],
                    })
                ]
            };
            new Chartist.Bar('.ct-chartUsersAssidus', data, options).on('draw', function(data) {
                if(data.type === 'bar') {
                    data.element.attr({
                        style: 'stroke-width: 30px'
                    });
                }
            });
        }

    },

    getUsersEntretien : function()
    {
        var tabLabels, tabSeries;

        $("#chartUsersEntretien").hide();
        $("#spinnerChartUsersEntretien").show();

        $.ajax({
            type: 'GET',
            url: this.rootURL + '/stats/utilisateursEntretien',
            dataType: "json",

            success: function (response)
            {
                if(response.result=="ok")
                {
                    stats.setGraphUsersEntretien(response.tabKeys, response.tabValues);

                    $("#chartUsersEntretien").show();
                    $("#spinnerChartUsersEntretien").hide();
                }
                else
                {
                    toastr['error']("Erreur stats lors du chargement du nombre d'utilisateurs avec entretien","Une erreur s'est produite "+response.msg);
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                console.log('/stats error: ' + textStatus);

                $("#chartUsersEntretien").show();
                $("#spinnerChartUsersEntretien").hide();
            }
        });


    },

    setGraphUsersEntretien : function(tabLabels, tabSeries)
    {
        var tabSeriesPrev, labelMoisCourant, data, options, max;

        if (tabLabels && tabSeries) {
            labelMoisCourant = tabLabels[tabLabels.length-1];
            // retourne la projection prévisionnelle du mois courant
            tabSeriesPrev = this.getTabSeriesPrev(tabSeries[0], labelMoisCourant);
            data = { labels: tabLabels, series: [tabSeries[0], tabSeriesPrev] };
            max = Math.max.apply(null, tabSeries[0].concat(tabSeriesPrev));
            // On ajoute 10% à la plus grande valeur pour un bon dimensionnement du graphique
            max = max + 0.1*max;

            options = {
                high: max,
                plugins: [
                    Chartist.plugins.ctBarLabels(),
                    Chartist.plugins.legend({
                        legendNames: ['Réel', 'Prévisionnel'],
                    })
                ]
            };
            new Chartist.Bar('.ct-chartUsersEntretien', data, options).on('draw', function(data) {
                if(data.type === 'bar') {
                    data.element.attr({
                        style: 'stroke-width: 30px'
                    });
                }
            });
        }

    },

    getUsersRetourEmploi : function()
    {
        var tabLabels, tabSeries;

        $("#chartUsersRetourEmploi").hide();
        $("#spinnerChartUsersRetourEmploi").show();

        $.ajax({
            type: 'GET',
            url: this.rootURL + '/stats/utilisateursRetourEmploi',
            dataType: "json",

            success: function (response)
            {
                if(response.result=="ok")
                {
                    stats.setGraphUsersRetourEmploi(response.tabKeys, response.tabValues);

                    $("#chartUsersRetourEmploi").show();
                    $("#spinnerChartUsersRetourEmploi").hide();
                }
                else
                {
                    toastr['error']("Erreur stats lors du chargement du nombre d'utilisateurs en retour à l'emploi","Une erreur s'est produite "+response.msg);
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                console.log('/stats error: ' + textStatus);

                $("#chartUsersRetourEmploi").show();
                $("#spinnerChartUsersRetourEmploi").hide();
            }
        });


    },

    setGraphUsersRetourEmploi : function(tabLabels, tabSeries)
    {
        var tabSeriesPrev, labelMoisCourant, data, options, max;

        if (tabLabels && tabSeries) {
            labelMoisCourant = tabLabels[tabLabels.length-1];
            // retourne la projection prévisionnelle du mois courant
            tabSeriesPrev = this.getTabSeriesPrev(tabSeries[0], labelMoisCourant);
            data = { labels: tabLabels, series: [tabSeries[0], tabSeriesPrev] };
            max = Math.max.apply(null, tabSeries[0].concat(tabSeriesPrev));
            // On ajoute 10% à la plus grande valeur pour un bon dimensionnement du graphique
            max = max + 0.1*max;

            options = {
                high: max,
                plugins: [
                    Chartist.plugins.ctBarLabels(),
                    Chartist.plugins.legend({
                        legendNames: ['Réel', 'Prévisionnel'],
                    })
                ]
            };
            new Chartist.Bar('.ct-chartUsersRetourEmploi', data, options).on('draw', function(data) {
                if(data.type === 'bar') {
                    data.element.attr({
                        style: 'stroke-width: 30px'
                    });
                }
            });
        }
    },

    /*
     * Retourne un tableau avec comme dernier élément, la valeur prévisionnelle pour le mois courant (si celle-ci est calculable car en tout début de mois, il se peut qu'il n'y ait pas encore d'utilisateur assidu)
     * les autres éléments sont à zéro.  
     */
    getTabSeriesPrev : function(tabSeries, labelMoisCourant)
    {
        var tabResult, jour, dateMoisCourant, currentMoment, nbJours;
        if(tabSeries && tabSeries.length>0) {
            dateMoisCourant = moment().format('MM/YY');
            jour = moment().format('D');
            currentMoment = moment();
            if(jour>1)
                jour--;
            nbJours = currentMoment.daysInMonth();
            tabResult = Array(tabSeries.length);
            for(var i= 0; i < tabSeries.length; i++) {
                tabResult[i] = 0;
            }
            // On vérifie que le calcul de la projection se fait bien sur le mois courant
            if(labelMoisCourant == dateMoisCourant) {
                // valorisation de la projection du mois courant (calcul via produit en croix)
                tabResult[tabSeries.length-1] = Math.round(tabSeries[tabSeries.length-1] * nbJours / jour);
                tabSeries[tabSeries.length-1] = 0;
            }
        }
        return tabResult;
    },

    getUsersIncomming : function()
    {
        var tabLabels, tabSeries;

        $("#chartUsersIncoming").hide();
        $("#spinnerChartUsersIncoming").show();

        $.ajax({
            type: 'GET',
            url: this.rootURL + '/stats/utilisateursEntrants',
            dataType: "json",

            success: function (response)
            {
                if(response.result=="ok")
                {
                    stats.setGraphUsersIncomming(response.tabKeys, response.tabValues);

                    $("#chartUsersIncoming").show();
                    $("#spinnerChartUsersIncoming").hide();
                }
                else
                {
                    toastr['error']("Erreur stats lors du chargement du nombre d'utilisateurs en provenance de PE ou LBB","Une erreur s'est produite "+response.msg);
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                console.log('/stats error: ' + textStatus);

                $("#chartUsersIncoming").show();
                $("#spinnerChartUsersIncoming").hide();
            }
        });


    },

    setGraphUsersIncomming : function(tabLabels, tabSeries)
    {
        var tabConcat, labelMoisCourant, data, options, max;

        if (tabLabels && tabSeries) {
            labelMoisCourant = tabLabels[tabLabels.length-1];
            // retourne la projection prévisionnelle du mois courant
            //tabSeriesPrev = this.getTabSeriesPrev(tabSeries[0], tabSeries[1]);
            data = { labels: tabLabels, series: [tabSeries[0], tabSeries[1], tabSeries[2], tabSeries[3]] };
            tabConcat = tabSeries[0].concat(tabSeries[1]);
            tabConcat = tabConcat.concat(tabSeries[2]);
            tabConcat = tabConcat.concat(tabSeries[3]);

            max = Math.max.apply(null, tabConcat);
            // On ajoute 10% à la plus grande valeur pour un bon dimensionnement du graphique
            max = max + 0.1*max;

            options = {
                high: max,
                fullWidth: true,
                chartPadding: {
                    right: 40
                },
                plugins: [
                    Chartist.plugins.ctPointLabels({
                        textAnchor: 'middle'
                    }),
                    Chartist.plugins.legend({
                        legendNames: ['PE.FR', 'LBB', 'ES', 'Autres'],
                    })
                ]
            };
            new Chartist.Line('.ct-chartUsersIncoming', data, options).on('draw', function(data) {

            });
        }
    },

    getCandidaturesIncomming : function()
    {
        var tabLabels, tabSeries;

        $("#chartCandidaturesIncoming").hide();
        $("#spinnerChartCandidaturesIncoming").show();

        $.ajax({
            type: 'GET',
            url: this.rootURL + '/stats/candidaturesEntrantes',
            dataType: "json",

            success: function (response)
            {
                if(response.result=="ok")
                {
                    stats.setGraphCandidaturesIncomming(response.tabKeys, response.tabValues);

                    $("#chartCandidaturesIncoming").show();
                    $("#spinnerChartCandidaturesIncoming").hide();
                }
                else
                {
                    toastr['error']("Erreur stats lors du chargement du nombre de candidatures en provenance de PE ou LBB","Une erreur s'est produite "+response.msg);
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                console.log('/stats error: ' + textStatus);

                $("#chartCandidaturesIncoming").show();
                $("#spinnerChartCandidaturesIncoming").hide();
            }
        });


    },

    setGraphCandidaturesIncomming : function(tabLabels, tabSeries)
    {
        var tabSeriesPrev, labelMoisCourant, data, options, max;

        if (tabLabels && tabSeries) {
            labelMoisCourant = tabLabels[tabLabels.length-1];
            // retourne la projection prévisionnelle du mois courant
            //tabSeriesPrev = this.getTabSeriesPrev(tabSeries[0], tabSeries[1]);
            data = { labels: tabLabels, series: [tabSeries[0], tabSeries[1], tabSeries[2]] };
            max = Math.max.apply(null, (tabSeries[0].concat(tabSeries[1])).concat(tabSeries[2]));
            // On ajoute 10% à la plus grande valeur pour un bon dimensionnement du graphique
            max = max + 0.1*max;

            options = {
                high: max,
                fullWidth: true,
                chartPadding: {
                    right: 40
                },
                plugins: [
                    Chartist.plugins.ctPointLabels({
                        textAnchor: 'middle'
                    }),
                    Chartist.plugins.legend({
                        legendNames: ['PE.FR', 'LBB', 'Autres'],
                    })
                ]
            };
            new Chartist.Line('.ct-chartCandidaturesIncoming', data, options).on('draw', function(data) {

            });
        }
    },

    getCandidaturesButtonIncomming : function()
    {
        var tabLabels, tabSeries;

        $("#chartCandidaturesButtonIncoming").hide();
        $("#spinnerChartCandidaturesButtonIncoming").show();

        $.ajax({
            type: 'GET',
            url: this.rootURL + '/stats/candidaturesButtonEntrantes',
            dataType: "json",

            success: function (response)
            {
                if(response.result=="ok")
                {
                    stats.setGraphCandidaturesButtonIncomming(response.tabKeys, response.tabValues);

                    $("#chartCandidaturesButtonIncoming").show();
                    $("#spinnerChartCandidaturesButtonIncoming").hide();
                }
                else
                {
                    toastr['error']("Erreur stats lors du chargement du nombre de candidatures en provenance de PE ou LBB","Une erreur s'est produite "+response.msg);
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                console.log('/stats error: ' + textStatus);

                $("#chartCandidaturesButtonIncoming").show();
                $("#spinnerChartCandidaturesButtonIncoming").hide();
            }
        });


    },

    setGraphCandidaturesButtonIncomming : function(tabLabels, tabSeries)
    {
        var tabSeriesPrev, labelMoisCourant, data, options, max;

        if (tabLabels && tabLabels.length>0 && tabSeries && tabSeries.length>0) {
            labelMoisCourant = tabLabels[tabLabels.length-1];
            // retourne la projection prévisionnelle du mois courant
            //tabSeriesPrev = this.getTabSeriesPrev(tabSeries[0], tabSeries[1]);
            data = { labels: tabLabels, series: [tabSeries[0], tabSeries[1]] };
            max = Math.max.apply(null, tabSeries[0].concat(tabSeries[1]));
            // On ajoute 10% à la plus grande valeur pour un bon dimensionnement du graphique
            max = max + 0.1*max;

            options = {
                high: max,
                fullWidth: true,
                chartPadding: {
                    right: 40
                },
                plugins: [
                    Chartist.plugins.ctPointLabels({
                        textAnchor: 'middle'
                    }),
                    Chartist.plugins.legend({
                        legendNames: ['PE.FR', 'LBB'],
                    })
                ]
            };
            new Chartist.Line('.ct-chartCandidaturesButtonIncoming', data, options).on('draw', function(data) {

            });
        }
    },

    getTypeCandidature : function()
    {
        var tabLabels, tabSeries;

        $("#chartTypeCandidature").hide();
        $("#spinnerChartTypeCandidature").show();
        $("#chartCandidatureReseau").hide();
        $("#spinnerChartCandidatureReseau").show();

        $.ajax({
            type: 'GET',
            url: this.rootURL + '/stats/typeCandidature',
            dataType: "json",

            success: function (response)
            {
                if(response.result=="ok")
                {
                    stats.setGraphTypeCandidature(response.tabKeys, response.tabValues);
                    stats.setGraphCandidatureReseau(response.tabKeys, response.tabValues);

                    $("#chartTypeCandidature").show();
                    $("#spinnerChartTypeCandidature").hide();

                    $("#chartCandidatureReseau").show();
                    $("#spinnerChartCandidatureReseau").hide();
                }
                else
                {
                    toastr['error']("Erreur stats lors du chargement du type de candidatures","Une erreur s'est produite "+response.msg);
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                console.log('/stats error: ' + textStatus);

                $("#chartTypeCandidature").show();
                $("#spinnerChartTypeCandidature").hide();
            }
        });


    },

    setGraphTypeCandidature : function(tabLabels, tabSeries)
    {
        var tabSeriesPrev, labelMoisCourant, data, options, max;

        if (tabLabels && tabSeries) {
            labelMoisCourant = tabLabels[tabLabels.length-1];

            data = { labels: tabLabels, series: [tabSeries[0], tabSeries[1], tabSeries[2]/*, tabSeries[3]*/] }; // mise en commentaire des "autres" pour rendre visible les "réseau"
            tabConcat = tabSeries[0].concat(tabSeries[1]);
            tabConcat = tabConcat.concat(tabSeries[2]);
            tabConcat = tabConcat.concat(tabSeries[3]);


            max = Math.max.apply(null, tabConcat);
            // On ajoute 10% à la plus grande valeur pour un bon dimensionnement du graphique
            max = max + 0.1*max;

            options = {
                high: max,
                fullWidth: true,
                chartPadding: {
                    right: 40
                },
                plugins: [
                    Chartist.plugins.ctPointLabels({
                        textAnchor: 'middle'
                    }),
                    Chartist.plugins.legend({
                        legendNames: ['Spontanée', 'Offre', 'Réseau'/*, 'Autres'*/],
                    })
                ]
            };
            new Chartist.Line('.ct-chartTypeCandidature', data, options).on('draw', function(data) {

            });
        }
    },

    setGraphCandidatureReseau : function(tabLabels, tabSeries)
    {
        var tabSeriesPrev, labelMoisCourant, data, options, max;

        if (tabLabels && tabLabels.length>0 && tabSeries[2] && tabSeries[2].length>0) {
            labelMoisCourant = tabLabels[tabLabels.length-1];
            // retourne la projection prévisionnelle du mois courant
            //tabSeriesPrev = this.getTabSeriesPrev(tabSeries[0], tabSeries[1]);

            var tabPercents = [], tabSum = [];

            for(var i=0; i<tabSeries[0].length; ++i)
            {
                tabSum[i] = eval(tabSeries[0][i])+eval(tabSeries[1][i])+eval(tabSeries[2][i])+eval(tabSeries[3][i]);
                tabPercents[i] = (tabSeries[2][i]/tabSum[i])*100;
                tabPercents[i] = Math.round(tabPercents[i] * 100) / 100;
            }

            data = { labels: tabLabels, series: [tabPercents] };

            max = Math.max.apply(null, tabPercents);
            // On ajoute 10% à la plus grande valeur pour un bon dimensionnement du graphique
            max = max + 3;

            options = {
                high: max,
                fullWidth: true,
                chartPadding: {
                    right: 40
                },
                plugins: [
                    Chartist.plugins.ctBarLabels()
                ]
            };
            new Chartist.Bar('.ct-chartCandidatureReseau', data, options).on('draw', function(data) {
                if(data.type === 'bar') {
                    data.element.attr({
                        style: 'stroke-width: 30px'
                    });
                }
            });
        }
    },

    getNbCandidatureReseau : function()
    {
        var tabLabels, tabSeries;

        $("#chartNbCandidatureReseau").hide();
        $("#spinnerChartNbCandidatureReseau").show();

        $.ajax({
            type: 'GET',
            url: this.rootURL + '/stats/nbCandidatureReseau',
            dataType: "json",

            success: function (response)
            {
                if(response.result=="ok")
                {
                    stats.setGraphNbCandidatureReseau(response.values);

                    $("#chartNbCandidatureReseau").show();
                    $("#spinnerChartNbCandidatureReseau").hide();
                }
                else
                {
                    toastr['error']("Erreur stats lors du chargement des nombres de candidatures réseau","Une erreur s'est produite "+response.msg);
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                // gestion d'erreur : ajouter un message dans un div sur le formulaire de création de compte
                console.log('/stats error: ' + textStatus);

                $("#chartNbCandidatureReseau").show();
                $("#spinnerChartNbCandidatureReseau").hide();
            }
        });


    },

    setGraphNbCandidatureReseau : function(values)
    {
        new Chartist.Bar('#chartNbCandidatureReseau', values, {
            fullWidth: true,
            stackBars: true,
            axisY: {
                labelInterpolationFnc: function(value) {
                    return (value / 1000) + 'k';
                }
            },
            chartPadding: {
                right: 40
            },
            plugins: [
                Chartist.plugins.tooltip()
            ]

        }).on('draw', function(data) {
                if(data.type === 'bar') {
                    data.element.attr({
                        style: 'stroke-width: 30px'
                    });
                }
            });

    }

}