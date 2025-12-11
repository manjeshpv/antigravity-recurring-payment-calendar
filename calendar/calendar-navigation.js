class CalendarNavigation {
    constructor(calendarRenderer, elYearView, elTitle, btnMonth, btnYear, elCalendar) {
        this.calendarRenderer = calendarRenderer;
        this.elYearView = elYearView;
        this.elTitle = elTitle;
        this.btnMonth = btnMonth;
        this.btnYear = btnYear;
        this.elCalendar = elCalendar;
    }

    attachNavigation() {
        document.querySelector('.toolbar').addEventListener('click', e => {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                this.onClickDetails(e); // <-- Error here
            }
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowRight') { this.calendarRenderer.next(); }
            if (e.key === 'ArrowLeft') { this.calendarRenderer.prev(); }
        });
    }

    // -----------------------------
    // Logic: Navigation Handlers
    // -----------------------------
    onClickDetails(e) {
        const action = e.target.closest('button').id;

        switch (action) {
            case 'btn-prev':
                this.calendarRenderer.prev();
                break;
            case 'btn-next':
                this.calendarRenderer.next();
                break;
            case 'btn-today':
                this.calendarRenderer.today();
                break;
            case 'view-month':
                this.currentView = 'month';
                this.elCalendar.style.display = 'block';
                this.elYearView.classList.remove('active');
                this.btnMonth.classList.add('active');
                this.btnYear.classList.remove('active');
                break;
            case 'view-year':
                this.currentView = 'year';
                this.elCalendar.style.display = 'none';
                this.elYearView.classList.add('active');
                this.btnMonth.classList.remove('active');
                this.btnYear.classList.add('active');
                break;
        }

        // Refresh UI
        this.updateTitle();
        if (this.currentView === 'year') {
            this.renderYearView(this.events, this.currentView);
        }
    }

    updateTitle(currentView, events) {
        const dt = this.calendarRenderer.getDate().toDate();
        const year = dt.getFullYear();
        const month = dt.toLocaleString('default', { month: 'long' });
        this.elTitle.textContent = currentView === 'month' ? `${month} ${year}` : `${year}`;
    }

    renderYearView(events) {
        this.elYearView.innerHTML = '';

        const currentDate = this.calendarRenderer.getDate().toDate();
        const startMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

        const labels = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        for (let i = 0; i < 13; i++) {
            const d = new Date(startMonthDate.getFullYear(), startMonthDate.getMonth() + i, 1);

            const year = d.getFullYear();
            const monthIndex = d.getMonth();
            const monthName = labels[monthIndex];
            const monthStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

            // 🔥 Show BOTH monthly + annual events
            const monthEvents = events.filter(e => e.start.substring(0, 7) === monthStr);

            const card = document.createElement('div');
            card.className = 'month-card';

            let html = `<div class="month-name">${monthName} ${year}</div>`;
            let totalAmount = 0;

            if (monthEvents.length === 0) {
                html += `<div style="color:#999; font-style:italic; font-size:0.9rem;">No events</div>`;
            } else {
                monthEvents.forEach(e => {
                    let amt = e.amount ? `<strong>${e.amount}</strong>` : '';
                    html += `
                <div class="event-item" style="border-left-color:${e.backgroundColor || '#ccc'}">
                    <span>${e.title}</span>
                    ${amt}
                </div>`;
                });
            }

            card.innerHTML = html;
            this.elYearView.appendChild(card);
        }
    }



    updateTableLink(url, defaultUrl, linkEl) {
        const params = new URLSearchParams();
        if (url && url !== defaultUrl) {
            params.set('sheet', url);
            linkEl.href = `/index.html?${params.toString()}`;
        } else {
            linkEl.href = '/index.html';
        }
    }
}
