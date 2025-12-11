class EventGenerator {
    getColor(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++)
            hash = str.charCodeAt(i) + ((hash << 5) - hash);

        const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
        return '#' + '00000'.substring(0, 6 - c.length) + c;
    }

    // Parse "27 Feb" / "27 February" safely
    parseDateText(due) {
        if (!due) return null;

        // Handle DD MMM or DD MMMM
        const regex = /^(\d{1,2})\s+([A-Za-z]+)$/;
        const match = due.trim().match(regex);

        if (match) {
            const day = parseInt(match[1], 10);
            const monthName = match[2];

            const month = new Date(`${monthName} 1, 2000`).getMonth();
            if (!isNaN(month)) return { day, month };
        }

        // Handle DD/MM/YYYY, DD-MM-YYYY
        const dt = new Date(due);
        if (!isNaN(dt)) {
            return { day: dt.getDate(), month: dt.getMonth() };
        }

        return null;
    }

    generateDynamicEvents(masterRows) {
        const events = [];
        const today = new Date();
        const yr = today.getFullYear();
        const curMonth = today.getMonth();

        masterRows.forEach((row, index) => {
            const account = row['Account'] || row['Accoount'];
            if (!account) return;

            const ledger = row['Ledger Name'] || '';
            const title = `${account} (${ledger})`;

            const freq = (row['Frequency'] || '').toLowerCase();
            const due = this.parseDateText(row['Due Date']);

            let day = (due?.day ?? 1);
            let month = due?.month ?? curMonth;

            // 🔵 MONTHLY events → generate for current + next month
            if (freq.includes("monthly")) {
                [curMonth].forEach((m, i) => {
                    const d = new Date(yr, m, day);
                    events.push(
                        this.createEvent(row, title, `m-${index}-${i}`, d)
                    );
                });
            }

            // 🔵 ANNUAL events → create 1 event in correct month
            else if (freq.includes("annual") || freq.includes("year")) {
                let eventMonth = month;  // month from sheet
                let eventYear = yr;

                // If the event month already passed this year → move to next year
                if (eventMonth < curMonth) {
                    eventYear = yr + 1;
                }

                const d = new Date(eventYear, eventMonth, day);

                events.push(
                    this.createEvent(row, title, `a-${index}`, d)
                );
            }


        });

        return events;
    }

    createEvent(row, title, id, date) {
        const iso = date.toISOString();
        return {
            id,
            calendarId: "master",
            title,
            frequency: row['Frequency'],   // <-- ADD THIS
            start: iso,
            end: iso,
            amount: row['Budget'],
            category: "allday",
            backgroundColor: this.getColor(row['Payment Category'] || 'default'),
            body: `Expense: ${row['Expense Type'] || ''}\nMethod: ${row['Payment Method'] || ''}\nBudget: ${row['Budget'] || ''}`
        };
    }
}
