
function ga(){}

function startGoogleAnalytics()
{
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-77025427-1', 'auto');

    try
    {
        var gaHref = window.location.href.toLowerCase();
        if (gaHref.indexOf("?") > -1 && gaHref.indexOf(",") > -1)
        {
            var gaCampaign = gaHref.substring(gaHref.indexOf(",") + 1), gaContent = '';
            if (gaCampaign.indexOf(",") > -1)
            {
                gaContent = gaCampaign.substring(gaCampaign.indexOf(",") + 1);
                gaCampaign = gaCampaign.substring(0, gaCampaign.indexOf(","));
            }

            ga('set', {
                'campaignSource': 'recrutement',
                'campaignMedium': 'email',
                'campaignName': gaCampaign,
                'campaignContent': gaContent
            });

            //console.log("campaign : ",campaign);
        }
    }
    catch(err){console.log("ga err ",err);}

    ga('send', 'pageview');
}