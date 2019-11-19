function Calendar(board)
{
    this.init(board);
}

// gère l'affichage des activités en ligne
Calendar.prototype = {

    board: null,
    keyFormat : "DD-MM-YYYY",

    init : function (board) {
        this.board = board;

        $(".calendarClose").on("click", $.proxy(this.closeCalendar, this));
    },

    show : function()
    {
        ga('send', { hitType : 'event', eventCategory : 'Calendrier', eventAction : 'ouverture' });

        // l'écran des conseils n'est jamais consulté en archiveMode
        lBR.board.archiveMode = 0;
        $("body").removeClass("archives");

        // elements masqués
        lBR.hideNewCandidatureButtons();
        lBR.board.displayQuickImportButton(0);
        $("#boardPanel").hide();
        $("#createCandidatureForm").hide();

        lBR.displayInnerPage("#calendarPage");

        lBR.showBreadcrumb("calendar");

        lBR.refreshMenu($("#calendarButton"));

        this.buildCalendar();
    },

    closeCalendar : function()
    {
        lBR.showActives();
    },

    buildCalendar : function()
    {
        if(!this.scriptLoaded)  // chargement de react
        {
            let js=document.createElement("script"),
                hostName = window.location.hostname,
                src = hostName+"/js/react/memoReact.js",
                fjs= document.getElementsByTagName("script")[0];

            js.async=true;

            if(hostName.indexOf('ft')==0 || hostName.indexOf('local')==0)
                src="http://"+src;
            else
                src="https://"+src;

            js.src = src;
            fjs.parentNode.insertBefore(js,fjs);
        }
        else if(!this.rendered)
        {
            this.rendered = 1;

            this.monthStore = createStore(monthCalendarReducer);
            this.eventStore = createStore(userEventReducer);

            // initialisation du store des événements de l'utilisateur
            this.eventStore.dispatch({type:'INIT_USER_EVENT'});

            this.monthStore.subscribe(this.render);
            this.eventStore.subscribe(this.render);

            this.render();
        }
    },

    reset : function(){
        this.rendered=0;
        this.monthStore = null;
        this.eventStore = null;
    }
}