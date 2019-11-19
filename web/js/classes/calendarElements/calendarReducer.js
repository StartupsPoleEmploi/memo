const monthCalendarReducer = (state = moment(), action) => {

    let res = moment(state);

    switch(action.type)
    {
        case 'NEXT_MONTH' : {
            res.add(1,'month');
            break;
        }
        case 'PREVIOUS_MONTH' : {
            res.add(-1,'month');
            break;
        }
        case 'THIS_MONTH' : {
            res = moment();
            break;
        }
        //default : break;
    }

    return res;
}


const userEventReducer = (state = {}, action) =>
{
    let res = {};

    switch(action.type)
    {
        case 'INIT_USER_EVENT' : {
            res  = lBR.calendar.initUserEvent();
            break;
        }

        case 'EDIT_USER_EVENT' : {
            res  = lBR.calendar.changeEventInStore(state,action.event);
            break;
        }

        case 'REMOVE_USER_EVENT' : {
            res  = lBR.calendar.removeEventFromStore(state,action.event);
            break;
        }

        case 'ADD_USER_EVENT' : {
            res  = lBR.calendar.addEventToStore(state,action.event);
            break;
        }

        case 'REMOVE_CANDIDATURE' : {
            res  = lBR.calendar.removeCandidatureEventsFromStore(state,action.candidature);
            break;
        }

        default : {
            res = state;
            break;
        }
    }

    return res;
}