class CalendarButtons extends React.Component{
    render()
    {
        return e('div', {className:'calendarButtons'},
            e(CalendarButton,{className:'thisMonth', title:'Aujourd\'hui', srOnly:'Afficher le calendrier du mois courant', value:'Aujourd\'hui',onClick: () => {lBR.calendar.monthStore.dispatch({type:'THIS_MONTH'});}}),
            e(CalendarButton,{className:'fa fa-chevron-left', title:'Mois précédent', srOnly:'Afficher le calendrier du mois précédent',onClick: () => {lBR.calendar.monthStore.dispatch({type:'PREVIOUS_MONTH'});}}),
            e(CalendarButton,{className:'fa fa-chevron-right', title:'Mois suivant', srOnly:'Afficher le calendrier du mois suivant', onClick: () => {lBR.calendar.monthStore.dispatch({type:'NEXT_MONTH'});}})
        )
    }
}

class CalendarButton extends React.Component{
    render()
    {
        let res;
        const content = this.props.title;

        if(this.props.value)
            res = e('button',
                {
                    type:'button',
                    onClick:this.props.onClick,
                    className:'calendarMonthButton'+(this.props.className?' '+this.props.className:''),
                    tabIndex:0
                },
                e('span',{className:'sr-only'},this.props.srOnly),
                this.props.value);
        else
            res = e('button',
                {
                    type:'button',
                    onClick:this.props.onClick,
                    className:'calendarMonthButton'+(this.props.buttonClass?' '+this.props.buttonClass:''),
                    tabIndex:0
                },
                e('i',{className:this.props.className}),
                e('span',{className:'sr-only'},this.props.srOnly));

        return e(Tippy, {content, allowHTML:true, animation:'shift-toward', placement: "top", trigger: "mouseenter focus"},res);
    }
}