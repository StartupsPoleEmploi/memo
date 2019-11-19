class CalendarTitle extends React.Component {
    render()
    {
        return e('div', {className:'calendarTitle'}, `${this.props.currentMonth.format("MMMM YYYY")}`);
    }
}