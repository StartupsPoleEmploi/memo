Object.assign(Calendar.prototype, {
    render : () => {
        ReactDOM.render(
            e('div', {},
                e(CalendarButtons,{}),
                e(CalendarTitle,{currentMonth:lBR.calendar.monthStore.getState()}),
                e(CalendarButton,{className:'calClose fa fa-close', buttonClass:'closeCalendar', srOnly:'Fermer le calendrier et retourner au tableau de bord', title:'Fermer', onClick: () => {lBR.calendar.closeCalendar();}}),
                e('div',{className:'calendarGrid',style: {clear:'both'}},
                    e(CalendarDays,{currentMonth:lBR.calendar.monthStore.getState()})
                )
            ),
            document.getElementById('calendarContent')
        )
    },

    initUserEvent : () => {     // construit la liste des événements de l'utilisateur trié chronologiquement et rangés par jours.
        let res = {};

        for(let k1 in lBR.board.candidatures)
        {
            const c = lBR.board.candidatures[k1];

            if(c && c.events)
            {
                for(let k2 in c.events)
                {
                    const cEv = new CalendarEvent(c.events[k2]);

                    // rangement des événements des types utiles pour le calendier
                    lBR.calendar.addEventToState(res,cEv);
                }
            }
        }

        return res;
    },

    addEventToState : (store,event) =>
    {
        // rangement des événements des types utiles pour le calendier
        if( event.eventType==CS.TYPES.AI_POSTULE ||
            event.eventType==CS.TYPES.ENTRETIEN ||
            event.eventType==CS.TYPES.DOIS_RELANCER ||
            event.eventType==CS.TYPES.RAPPEL)
        {
            const key = event.eventTime.format(lBR.calendar.keyFormat);

            if(!store[key])
                store[key] = [event];
            else
            {
                let idx = 0;
                for(const value of store[key])
                {
                    if(event.eventTime.isBefore(value.eventTime))
                        break;

                    idx++;
                }
                store[key].splice(idx,0,event); // insertion de l'événement dans le tableau des événements à sa place chronologique
            }
        }
        // else événement pas utilisé pour le calendrier
    },

    testMonthCalendar : () => {

        const today = moment();
        const currentDate = moment("2018-04-01");

        deepFreeze(currentDate);

        expect(this.monthCalendarReducer(currentDate,{type:"NEXT_MONTH"}).get("month")).toEqual(4);
        expect(this.monthCalendarReducer(currentDate,{type:"PREVIOUS_MONTH"}).get("month")).toEqual(2);
        expect(this.monthCalendarReducer(currentDate,{type:"THIS_MONTH"}).get("month")).toEqual(today.get("month"));

        console.log("test passed");
    },

    updateEvent : (event, eventId) => {
        if (!event.id || event.id=="0")
            lBR.calendar.addEvent(Object.assign({ __proto__: event.__proto__ },event,{id:eventId}))
        else
            lBR.calendar.editEvent(event);
    },

    editEvent : (event) => {
        lBR.calendar.eventStore.dispatch({type:'EDIT_USER_EVENT', event});
    },

        changeEventInStore : (state,event) => {

        let res = lBR.calendar.removeEventFromStore(state,event);
        const calEvent = new CalendarEvent(event);
        lBR.calendar.addEventToState(res,calEvent);

        return res;
    },

    removeEvent : (event) => {
        lBR.calendar.eventStore.dispatch({type:'REMOVE_USER_EVENT', event});
    },

    removeEventFromStore : (state, event) => {
        let res = {};

        for(let k1 in state)
        {
            let dayEvents = [];

            for(let k2 in state[k1])
            {
                const evt = state[k1][k2];

                if(evt.id != event.id)
                    dayEvents.push( Object.assign({ __proto__: evt.__proto__ },evt) );
            }

            res[k1] = dayEvents;
        }
        return res;
    },

    addEvent : (event) => {
        lBR.calendar.eventStore.dispatch({type:'ADD_USER_EVENT', event});
    },

    addEventToStore : (state,event) => {
        let res = lBR.calendar.removeEventFromStore(state,{id:0});   // en pratique clone du state
        const calEvent = new CalendarEvent(event);
        lBR.calendar.addEventToState(res,calEvent);

        return res;
    },

    removeCandidature : (candidature) => {
        lBR.calendar.eventStore.dispatch({type:'REMOVE_CANDIDATURE', candidature});
    },

    removeCandidatureEventsFromStore : (state, candidature) =>
    {
        let res = {};

        for(let k1 in state)
        {
            let dayEvents = [];

            for(let k2 in state[k1])
            {
                const evt = state[k1][k2];
                if(evt.candidatureId != candidature.id)
                    dayEvents.push( Object.assign({ __proto__: evt.__proto__ },evt) );
            }

            res[k1] = dayEvents;
        }
        return res;
    }
});