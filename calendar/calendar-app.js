class CalendarApp {
    constructor(options = {}) {
        this.DEFAULT_SHEET_URL = options.defaultSheetUrl;
        this.elCalendar = document.getElementById('calendar');
        this.elYearView = document.getElementById('year-view');
        this.elTitle = document.getElementById('calendar-title');
        this.urlInput = document.getElementById('sheet-url');
        this.loadBtn = document.getElementById('btn-load-sheet');
        this.linkTable = document.getElementById('link-table');
        this.btnMonth = document.getElementById('view-month');
        this.btnYear = document.getElementById('view-year');

        // Dependencies
        this.calendarRenderer = new CalendarRenderer(this.elCalendar);
        this.sheetLoader = new GoogleSheetLoader();
        this.eventGenerator = new EventGenerator();
        this.navigation = new CalendarNavigation(
            this.calendarRenderer,
            this.elYearView,
            this.elTitle,
            this.btnMonth,
            this.btnYear,
            this.elCalendar
        );

        this.events = [];
        this.currentView = 'year';

        this.init();
    }

    init() {
        this.calendarRenderer.initCalendar();

        const params = new URLSearchParams(window.location.search);
        const sheetUrl = params.get('sheet') || this.DEFAULT_SHEET_URL;
        this.urlInput.value = sheetUrl;
        this.updateTableLink(sheetUrl);

        this.loadGoogleSheetEvents(sheetUrl);
        this.handleLoadButton();
        this.navigation.attachNavigation();

        // Force Year View initially
        this.currentView = 'year';
        this.elCalendar.style.display = 'none';
        this.elYearView.classList.add('active');
        this.btnMonth.classList.remove('active');
        this.btnYear.classList.add('active');
        this.navigation.updateTitle(this.currentView, this.events);
        this.navigation.renderYearView(this.events, this.currentView);
    }

    updateTableLink(url) {
        this.navigation.updateTableLink(url, this.DEFAULT_SHEET_URL, this.linkTable);
    }

    handleLoadButton() {
        this.loadBtn.addEventListener('click', () => {
            const newUrl = this.urlInput.value.trim();
            if (!newUrl) return;
            const newParams = new URLSearchParams(window.location.search);
            newParams.set('sheet', newUrl);
            window.history.pushState({}, '', '?' + newParams.toString());
            this.updateTableLink(newUrl);
            this.loadGoogleSheetEvents(newUrl);
        });
    }

    loadGoogleSheetEvents(sheetUrl) {
        this.events.length = 0;
        const csvUrl = this.sheetLoader.getExportUrl(sheetUrl);

        Papa.parse(csvUrl, {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const dynamicEvents = this.eventGenerator.generateDynamicEvents(results.data);
                this.calendarRenderer.createEvents(dynamicEvents);
                this.events.push(...dynamicEvents);
                this.navigation.updateTitle(this.currentView, this.events);
                if (this.currentView === 'year') {
                    this.navigation.renderYearView(this.events, this.currentView);
                }
            },
            error: (err) => {
                console.error("Error loading sheet:", err);
                alert("Failed to load Google Sheet. Please check the URL.");
            }
        });
    }
}

const calendarApp = new CalendarApp({
    defaultSheetUrl: 'https://docs.google.com/spreadsheets/d/1Dpl_UdIL_TS-6pJMQosp3h1clHiMY7imtCMiidFuhzY'
});
