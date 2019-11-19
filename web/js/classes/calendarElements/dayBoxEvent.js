class DayBoxEvents extends React.Component {
    buildDayBoxEvents()
    {
        const key = this.props.day.format(lBR.calendar.keyFormat);

        const events = lBR.calendar.eventStore.getState()[key];

        let res = "";

        if(events && events.length>0)
        {
            let eventList = [];
            let idx=0;
            for (const event of events)
                eventList.push(e(DayBoxEvent,{event:event,key:idx++}));

            res = e("ul",null,eventList);
        }

        return res;
    }


    render()
    {
        return this.buildDayBoxEvents();
    }
}

class DayBoxEvent extends React.Component {

    getClassName(evt)
    {
        let cName = 'calAPostule';

        switch(evt.eventType)
        {
            case 1 :  { cName = 'calDoisRelancer'; break; }
            case 3 :  { cName = 'calEntretien'; break; }
            case 7 :  {
                if(evt.eventSubType==12)
                    cName = 'calDoisRelancer';
                else if(evt.eventSubType>12)
                    cName = 'calEntretien';
                else
                    cName = 'calRappel';
                break;
            }
        }

        return cName;
    }

    getLabel(evt)
    {
        let label = CS.TYPES_LIBELLE[evt.eventType];
        let addCandidatureName = 1;

        const c = lBR.board.candidatures[evt.candidatureId];

        if(evt.eventType == 7)
        {
            addCandidatureName = 0;
            switch(evt.eventSubType)
            {
                case 12 : {
                    label = 'Relancer';
                    break;
                }
                case 13 : {
                    label = 'Relancer après entretien';
                    break;
                }
                case 14 : {
                    label = 'Remercier après entretien';
                    break;
                }
            }
        }

        if(evt.eventType == 3 || (evt.eventType ==7 && evt.eventSubType < 12) )
        {
            label = evt.eventTime.format('hh:mm')+' '+label;
            addCandidatureName = 0;
        }

        if(addCandidatureName || !c.nomSociete)
            label+=' '+c.nomCandidature;
        else
            label+=' '+c.nomSociete;

        return label;
    }

    getContent(evt)
    {
        const c = lBR.board.candidatures[evt.candidatureId];

        let logo = (c.logoUrl)?"<div style='text-align:center'><img style='max-width:100px' src='"+c.logoUrl+"' alt='Logo "+ c.nomSociete+ "' /></div>":"";
        let title = c.nomCandidature;
        let body  = '';

        if(evt.eventType == 3)
        {
            title = "Entretien "+title;
            body += "<i class='fa fa-calendar'></i>"+evt.eventTime.format('dddd DD MMMM')+' à '+evt.eventTime.format('hh:mm')+"<br />";
        }

        if(c.nomSociete)
            body += "<i class='fa fa-building'></i>"+c.nomSociete+"<br />";
        if(c.ville)
            body += "<i class='fa fa-map-marker'></i>"+c.ville+"<br />";
        if(c.nomContact)
            body += "<i class='fa fa-address-card'></i>"+c.nomContact+"<br />";
        if(evt.comment)
            body += "<i class='fa fa-comment'></i>"+evt.comment+"<br />";

        let content = `<div class='calEventTitle'>${title}</div>
                       <div class='calEventContent'>${body}
                       ${logo}<br />
                       <div class='calEventOpenMsg'>Cliquez sur un événement pour ouvrir la fiche candidature correspondante</div>
                       </div>`;

        return content;
    }

    getSrOnly(evt, label)
    {
        const eT = evt.eventTime;
        return 'Cliquer pour ouvrir la fiche candidature correspondant à l\'événement '+label+' du '+eT.format('dddd DD MMMM YYYY')+' à '+eT.format('hh:mm');
    }

    handleKeyPress(keyPressedEvent)
    {
        if(keyPressedEvent.key == 'Enter'){
            const evt = new CalendarEvent({candidatureId:keyPressedEvent.target.getAttribute("candidatureId")});
            lBR.board.openCandidature(evt);
            keyPressedEvent.target._tippy.hide();
        }
    }

    render()
    {
        const evt = this.props.event;

        const className = this.getClassName(evt);
        const content = this.getContent(evt);
        const label = this.getLabel(evt);
        const srOnly = this.getSrOnly(evt,label);

        return e('li', null,
            e(Tippy, {content, allowHTML:true, arrow:true, theme:className+' calEventTippy', interactive: false, animation:'shift-toward', placement: "right", trigger: "mouseenter focus", popperOptions: {
                    modifiers: {
                        preventOverflow: {
                            escapeWithReference: true
                        }
                    }
                }},
                e('div',
                    {
                        onKeyPress:this.handleKeyPress,
                        onClick:()=>{lBR.board.openCandidature(evt);},
                        className,
                        candidatureId:evt.candidatureId
                    },
                    e('span',{className:'sr-only'},srOnly),
                    label
                )
            )
        );
    }
}