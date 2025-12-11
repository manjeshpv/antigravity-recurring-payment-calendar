const Calendar = tui.Calendar;

// Global array to hold all events for year view
const events = [];

// -----------------------------
// Initialize Calendar
// -----------------------------
const calendar = new Calendar('#calendar', {
    defaultView: 'month',
    usageStatistics: false,
    useDetailPopup: true,
    month: {
        dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        visibleWeeksCount: 0,
    },
    timezone: {
        zones: [{ timezoneName: 'Asia/Kolkata' }]
    }
});


// -----------------------------
// Fetch & Load Events
// -----------------------------
// -----------------------------
// Fetch & Load Events
// -----------------------------
const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1Dpl_UdIL_TS-6pJMQosp3h1clHiMY7imtCMiidFuhzY';

// Helper: Convert View URL to Export URL
function getExportUrl(url) {
    // Check if it's already a CSV export or GViz URL
    if (url.includes('/export?') || url.includes('/gviz/tq?')) return url;

    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
        // Use Google Visualization API to fetch by Sheet Name ("Master")
        return `https://docs.google.com/spreadsheets/d/${match[1]}/gviz/tq?tqx=out:csv&sheet=Master`;
    }
    return url;
}

// Helper: Get color based on category/type (simple hash)
function getColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
}

function generateDynamicEvents(masterRows) {
    const generatedEvents = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-11

    masterRows.forEach((row, index) => {
        // Required fields
        if (!row['Account'] && !row['Accoount']) return; // Handle typo

        const account = row['Account'] || row['Accoount'];
        const ledger = row['Ledger Name'] || '';
        const title = `${account} (${ledger})`;

        const freq = (row['Frequency'] || '').toLowerCase();
        const dueVal = row['Due Date']; // Can be "1", "01", "1/1/2025" or "2025-01-01"

        // Helper to parse day from various formats
        let day = 1;
        let specificDate = null;

        if (dueVal) {
            if (dueVal.includes('/') || dueVal.includes('-')) {
                // It's a full date
                specificDate = new Date(dueVal);
                if (!isNaN(specificDate.getTime())) {
                    day = specificDate.getDate();
                }
            } else {
                // It's just a day number
                day = parseInt(dueVal, 10);
            }
        }

        if (isNaN(day)) day = 1;

        // --- recurrence logic ---

        if (freq.includes('monthly')) {
            // Generate for Current Month
            const date1 = new Date(currentYear, currentMonth, day);
            // Generate for Next Month
            const date2 = new Date(currentYear, currentMonth + 1, day);

            [date1, date2].forEach((d, i) => {
                generatedEvents.push({
                    id: `master-${index}-m${i}`,
                    calendarId: 'master',
                    title: title,
                    body: `Expense: ${row['Expense Type'] || ''}\nMethod: ${row['Payment Method'] || ''}\nBudget: ${row['Budget'] || ''}`,
                    start: d.toISOString(),
                    end: d.toISOString(), // All day or same time
                    category: 'allday', // Using allday for simplicity
                    backgroundColor: getColor(row['Payment Category'] || 'default'),
                    amount: row['Budget'] // Store amount for year view summing
                });
            });

        } else if (freq.includes('annually') || freq.includes('yearly')) {
            // Annual event
            // If specific date provided, use its month/day. If just day provided? Ambiguous, assume Jan?
            // Usually annual events have a specific date.

            let annualMonth = 0; // Default Jan
            let annualDay = day;

            if (specificDate) {
                annualMonth = specificDate.getMonth();
                annualDay = specificDate.getDate();
            }

            // Generate for this year
            const d = new Date(currentYear, annualMonth, annualDay);

            // Only show if it matches the logic "till end of this year"
            // (Actually standard calendar shows all annual events for the year usually)
            // We will just add it for the current year.

            generatedEvents.push({
                id: `master-${index}-a`,
                calendarId: 'master',
                title: title,
                body: `Expense: ${row['Expense Type'] || ''}\nMethod: ${row['Payment Method'] || ''}\nBudget: ${row['Budget'] || ''}`,
                start: d.toISOString(),
                end: d.toISOString(),
                category: 'allday',
                backgroundColor: getColor(row['Payment Category'] || 'default'),
                amount: row['Budget']
            });
        }
        // Handle one-time or other frequencies later if needed
    });

    return generatedEvents;
}

function loadGoogleSheetEvents(sheetUrl) {
    const csvUrl = getExportUrl(sheetUrl);

    // Clear existing events
    calendar.clear();
    events.length = 0;

    Papa.parse(csvUrl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            console.log("Sheet Loaded:", results.data);

            // Generate Events dynamically
            const dynamicEvents = generateDynamicEvents(results.data);

            calendar.createEvents(dynamicEvents);

            // Update global events array for Year View
            events.push(...dynamicEvents);
            updateTitle();

            if (currentView === 'year') {
                renderYearView();
            }
        },
        error: function (err) {
            console.error("Error loading sheet:", err);
            alert("Failed to load Google Sheet. Please check the URL.");
        }
    });
}


// -----------------------------
// URL Parameter & Input Handling
// -----------------------------
const urlInput = document.getElementById('sheet-url');
const loadBtn = document.getElementById('btn-load-sheet');
const linkTable = document.getElementById('link-table');

function init() {
    // Check URL Params
    const params = new URLSearchParams(window.location.search);
    let sheetUrl = params.get('sheet');

    if (!sheetUrl) {
        sheetUrl = DEFAULT_SHEET_URL;
    }

    urlInput.value = sheetUrl;
    updateTableLink(sheetUrl);

    // Load events first
    loadGoogleSheetEvents(sheetUrl);

    // ---- Force Year View on initial load ----
    currentView = 'year';
    elCalendar.style.display = 'none';
    elYearView.classList.add('active');
    btnMonth.classList.remove('active');
    btnYear.classList.add('active');

    // Render year view immediately
    renderYearView();
}


function updateTableLink(url) {
    const params = new URLSearchParams();
    if (url && url !== DEFAULT_SHEET_URL) {
        params.set('sheet', url);
        linkTable.href = `index.html?${params.toString()}`;
    } else {
        linkTable.href = 'index.html';
    }
}

// Handle "Load" Button
loadBtn.addEventListener('click', () => {
    const newUrl = urlInput.value.trim();
    if (!newUrl) return;

    // Update URL Params without reload
    const newParams = new URLSearchParams(window.location.search);
    newParams.set('sheet', newUrl);
    window.history.pushState({}, '', '?' + newParams.toString());

    // Update Table Link
    updateTableLink(newUrl);

    // Reload Data
    loadGoogleSheetEvents(newUrl);
});

// 'month' or 'year'
let currentView = 'year';


// -----------------------------
// State & DOM Elements
// -----------------------------
const elTitle = document.getElementById('calendar-title');
const elYearView = document.getElementById('year-view');
const elCalendar = document.getElementById('calendar');

const btnMonth = document.getElementById('view-month');
const btnYear = document.getElementById('view-year');

// Initialize App
init();



// -----------------------------
// Logic: Update Title & UI
// -----------------------------
// -----------------------------
// Logic: Update Title & UI
// -----------------------------
function updateTitle() {
    // Toast UI Calendar returns a custom TZDate object, convert to native Date
    const dt = calendar.getDate();
    const date = new Date(dt.toDate());

    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'long' });

    if (currentView === 'month') {
        elTitle.textContent = `${month} ${year}`;
    } else {
        elTitle.textContent = `${year}`;
    }
}

// -----------------------------
// Logic: Render Year View
// -----------------------------
function renderYearView() {
    // Clear previous content
    elYearView.innerHTML = '';

    const currentDate = calendar.getDate().toDate(); // Convert TZDate → native Date
    const currentYear = currentDate.getFullYear();
    const currentMonthIndex = currentDate.getMonth(); // 0–11

    // Month Names
    const allMonths = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Month indexes (with wrap-around)
    const lastMonthIndex = (currentMonthIndex - 1 + 12) % 12;
    const nextMonthIndex = (currentMonthIndex + 1) % 12;

    // Display months in order: Last → Current → Next
    const monthsToShow = [lastMonthIndex, currentMonthIndex, nextMonthIndex];

    // Filter events for the visible 3 months
    const yearsEvents = events.filter(e =>
        e.start.startsWith(currentYear.toString())
    );

    // Build Month Cards
    monthsToShow.forEach((monthIndex) => {
        const monthName = allMonths[monthIndex];
        const monthStr = `${currentYear}-${(monthIndex + 1).toString().padStart(2, '0')}`;

        // Filter events in this month
        const monthEvents = yearsEvents.filter(e => e.start.startsWith(monthStr));

        // Create card
        const card = document.createElement('div');
        card.className = 'month-card';

        let html = `<div class="month-name">${monthName}</div>`;

        let totalAmount = 0;

        if (monthEvents.length === 0) {
            html += `<div style="color:#999; font-style:italic; font-size:0.9rem;">No events</div>`;
        } else {
            monthEvents.forEach(e => {
                let amountStr = "";
                if (e.amount) {
                    const val = parseFloat(e.amount.replace('$', ''));
                    if (!isNaN(val)) totalAmount += val;
                    amountStr = `<span style="font-weight:bold;">${e.amount}</span>`;
                }

                html += `
                    <div class="event-item" style="border-left-color: ${e.backgroundColor || '#ccc'}">
                        <span>${e.title}</span>
                        ${amountStr}
                    </div>
                `;
            });
        }

        if (totalAmount > 0) {
            html += `
                <div class="total-row">
                    <span>Total Payments</span>
                    <span>$${totalAmount.toFixed(2)}</span>
                </div>
            `;
        }

        card.innerHTML = html;
        elYearView.appendChild(card);
    });
}

// -----------------------------
// Logic: Navigation Handlers
// -----------------------------
function onClickDetails(e) {
    const action = e.target.closest('button').id;

    switch (action) {
        case 'btn-prev':
            calendar.prev();
            break;
        case 'btn-next':
            calendar.next();
            break;
        case 'btn-today':
            calendar.today();
            break;
        case 'view-month':
            currentView = 'month';
            elCalendar.style.display = 'block';
            elYearView.classList.remove('active');
            btnMonth.classList.add('active');
            btnYear.classList.remove('active');
            break;
        case 'view-year':
            currentView = 'year';
            elCalendar.style.display = 'none';
            elYearView.classList.add('active');
            btnMonth.classList.remove('active');
            btnYear.classList.add('active');
            break;
    }

    // Refresh UI
    updateTitle();
    if (currentView === 'year') {
        renderYearView();
    }
}

// Attach Click Listener to Toolbar
document.querySelector('.toolbar').addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
        onClickDetails(e);
    }
});

// Keyboard support
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { calendar.next(); updateTitle(); if (currentView === 'year') renderYearView(); }
    if (e.key === 'ArrowLeft') { calendar.prev(); updateTitle(); if (currentView === 'year') renderYearView(); }
});

// Initial render
updateTitle();