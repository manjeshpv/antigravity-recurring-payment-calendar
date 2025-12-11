// -----------------------------
// Configuration & Helpers
// -----------------------------
const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1Dpl_UdIL_TS-6pJMQosp3h1clHiMY7imtCMiidFuhzY';

// Helper: Convert View URL to Export URL
function getExportUrl(url) {
    // Check if it's already a CSV export or GViz URL
    if (url.includes('/export?') || url.includes('/gviz/tq?')) return url;

    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
        // Use Google Visualization API to fetch by Sheet Name ("Master")
        // Format: /gviz/tq?tqx=out:csv&sheet={SheetName}
        return `https://docs.google.com/spreadsheets/d/${match[1]}/gviz/tq?tqx=out:csv&sheet=Master`;
    }
    return url;
}

// -----------------------------
// Data Loading Logic
// -----------------------------
const tableBody = document.querySelector('#data-table tbody');
const loadingState = document.getElementById('loading-state');
const REQUESTED_COLUMNS = [
    'Frequency',
    'Due Date',
    'Account Number',
    'Account', // Trying both 'Account' and 'Accoount' in logic below if helpful, or just strict match
    'Expense Type',
    'Payment Category',
    'Ledger Name',
    'Payment Method',
    'Budget'
];

// Variant mapping for the typo mentioned
const COL_VARIANTS = {
    'Account': ['Account', 'Accoount']
};

function getColValue(row, colName) {
    // Check exact match
    if (row[colName] !== undefined) return row[colName];

    // Check variants
    if (COL_VARIANTS[colName]) {
        for (let variant of COL_VARIANTS[colName]) {
            if (row[variant] !== undefined) return row[variant];
        }
    }

    return ''; // Default empty
}

function renderTable(data) {
    tableBody.innerHTML = '';

    if (data.length === 0) {
        loadingState.textContent = 'No data found found in the sheet.';
        loadingState.style.display = 'block';
        return;
    }

    loadingState.style.display = 'none';

    data.forEach(row => {
        const tr = document.createElement('tr');

        // If the row is empty (PapaParse usually handles skipEmptyLines, but good to check)
        if (Object.keys(row).length === 0) return;

        REQUESTED_COLUMNS.forEach(col => {
            const td = document.createElement('td');
            td.textContent = getColValue(row, col);
            tr.appendChild(td);
        });

        tableBody.appendChild(tr);
    });
}

function loadGoogleSheet(sheetUrl) {
    const csvUrl = getExportUrl(sheetUrl);
    loadingState.textContent = 'Loading...';
    loadingState.style.display = 'block';
    tableBody.innerHTML = '';

    Papa.parse(csvUrl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            console.log("Sheet Loaded:", results.data);
            renderTable(results.data);
        },
        error: function (err) {
            console.error("Error loading sheet:", err);
            loadingState.textContent = "Failed to load Google Sheet. Please check the URL.";
        }
    });
}

// -----------------------------
// URL Parameter & Input Handling
// -----------------------------
const urlInput = document.getElementById('sheet-url');
const loadBtn = document.getElementById('btn-load-sheet');
const linkCalendar = document.getElementById('link-calendar');

function init() {
    // Check URL Params
    const params = new URLSearchParams(window.location.search);
    let sheetUrl = params.get('sheet');

    if (!sheetUrl) {
        sheetUrl = DEFAULT_SHEET_URL;
    }

    // Set Input
    urlInput.value = sheetUrl;

    // Update Calendar Link to persist the sheet param
    updateCalendarLink(sheetUrl);

    // Load Data
    loadGoogleSheet(sheetUrl);
}

function updateCalendarLink(url) {
    const params = new URLSearchParams();
    if (url && url !== DEFAULT_SHEET_URL) {
        params.set('sheet', url);
        linkCalendar.href = `/calendar?${params.toString()}`;
    } else {
        linkCalendar.href = '/calendar';
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

    // Update Calendar Link
    updateCalendarLink(newUrl);

    // Reload Data
    loadGoogleSheet(newUrl);
});

// Initialize App
init();