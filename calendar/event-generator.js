class EventGenerator {
    getColor(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
        const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
        return '#' + '00000'.substring(0, 6 - c.length) + c;
    }

    generateDynamicEvents(masterRows) {
        const events = [];
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        masterRows.forEach((row, index) => {
            if (!row['Account'] && !row['Accoount']) return;

            const account = row['Account'] || row['Accoount'];
            const ledger = row['Ledger Name'] || '';
            const title = `${account} (${ledger})`;

            const freq = (row['Frequency'] || '').toLowerCase();
            const dueVal = row['Due Date'];

            let day = 1;
            let specificDate = null;

            if (dueVal) {
                if (dueVal.includes('/') || dueVal.includes('-')) {
                    specificDate = new Date(dueVal);
                    if (!isNaN(specificDate.getTime())) day = specificDate.getDate();
                } else {
                    day = parseInt(dueVal, 10);
                }
            }

            if (isNaN(day)) day = 1;

            if (freq.includes('monthly')) {
                [currentMonth, currentMonth + 1].forEach((m, i) => {
                    const d = new Date(currentYear, m, day);
                    events.push(this.createEvent(row, title, `master-${index}-m${i}`, d));
                });
            } else if (freq.includes('annually') || freq.includes('yearly')) {
                const month = specificDate ? specificDate.getMonth() : 0;
                const d = new Date(currentYear, month, day);
                events.push(this.createEvent(row, title, `master-${index}-a`, d));
            }
        });

        return events;
    }

    createEvent(row, title, id, date) {
        return {
            id: id,
            calendarId: 'master',
            title: title,
            body: `Expense: ${row['Expense Type'] || ''}\nMethod: ${row['Payment Method'] || ''}\nBudget: ${row['Budget'] || ''}`,
            start: date.toISOString(),
            end: date.toISOString(),
            category: 'allday',
            backgroundColor: this.getColor(row['Payment Category'] || 'default'),
            amount: row['Budget']
        };
    }
}
