class CalendarEvent {
    constructor(event)
    {
        this.eventType = eval(event.eventType);
        this.eventTime = event.eventTime;
        this.candidatureId = eval(event.candidatureId);
        this.id = eval(event.id);
        this.eventSubType = eval(event.eventSubType);
        this.comment = event.comment;
    }
}