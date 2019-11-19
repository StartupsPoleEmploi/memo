class CalendarDays extends React.Component {

    buildCalendar()
    {
        let dateCursor = moment(this.props.currentMonth);

        dateCursor.startOf("month");    // on se positionne en début de mois par rapport à la date courante
        dateCursor.startOf("week");     // on se positionne en début de semaine par rapport au 1er du mois courant

        let rows = [];
        for(let i = 0; i<6; ++i)
        {
            if(i<4 || dateCursor.get("month")==this.props.currentMonth.get("month"))
                rows.push(e(CalendarLine,{firstDayOfWeek:moment(dateCursor),currentMonth:this.props.currentMonth,key:i,week:i}))

            dateCursor.add(7,"day");
        }
        return rows;
    }

    render()
    {
        return this.buildCalendar();
    }
}

class CalendarLine extends React.Component {

    buildDayBoxes()
    {
        let dateCursor = moment(this.props.firstDayOfWeek);

        let cols = [];

        for(let i = 0; i<7; ++i)
        {
            cols.push(e(DayBox,{day:moment(dateCursor),week:this.props.week,currentMonth:this.props.currentMonth,key:i}))
            dateCursor.add(1,"day");
        }
        return cols;
    }

    render()
    {
        /*return e('div',
         {
         className:'row week'+this.props.week,
         },this.buildDayBoxes());*/
        return this.buildDayBoxes();
    }
}

class DayBox extends React.Component {

    buildDayBox() {
        let className='dayBox calWeek'+this.props.week;
        let d = this.props.day.get("day");

        let m = this.props.currentMonth.get("month");

        className += ' calDay'+d;

        if(d>5 || d<1)
            className+=' weekend';

        if(m!= this.props.day.get("month"))
            className+=' otherMonth';

        return e('div',
            {
                className : className
            },
            e(DayBoxTitle, {day:this.props.day}),
            e(DayBoxEvents, {day:this.props.day})
        );
    }

    render()
    {
        return this.buildDayBox();
    }
}

class DayBoxTitle extends React.Component {

    render()
    {
        const d = this.props.day;
        let dayTxt = d.format("dd D");

        if(d.get("date")==1)
            dayTxt = d.format("dd D MMM");

        return e('div', {className:'dayBoxTitle'}, dayTxt);
    }
}