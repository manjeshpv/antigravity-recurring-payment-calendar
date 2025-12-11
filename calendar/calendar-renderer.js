class CalendarRenderer {
    constructor(elCalendar) {
        this.elCalendar = elCalendar;
        this.calendar = null;
    }

    initCalendar() {
        this.calendar = new tui.Calendar('#calendar', {
            defaultView: 'month',
            usageStatistics: false,
            useDetailPopup: true,
            month: { dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], visibleWeeksCount: 0 },
            timezone: { zones: [{ timezoneName: 'Asia/Kolkata' }] }
        });
    }

    createEvents(events) {
        this.calendar.createEvents(events);
    }

    clear() {
        this.calendar.clear();
    }

    getDate() {
        return this.calendar.getDate();
    }

    next() { this.calendar.next(); }
    prev() { this.calendar.prev(); }
    today() { this.calendar.today(); }
}
