class GoogleSheetLoader {
    getExportUrl(url) {
        if (!url || typeof url !== 'string') return ''; // ← safeguard

        if (url.includes('/export?') || url.includes('/gviz/tq?')) return url;

        const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (match && match[1]) {
            return `https://docs.google.com/spreadsheets/d/${match[1]}/gviz/tq?tqx=out:csv&sheet=Master`;
        }

        return url;
    }
}
