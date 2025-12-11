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
            this.renderYearView();
        }
    }

    updateTitle(currentView, events) {
        const dt = this.calendarRenderer.getDate().toDate();
        const year = dt.getFullYear();
        const month = dt.toLocaleString('default', { month: 'long' });
        this.elTitle.textContent = currentView === 'month' ? `${month} ${year}` : `${year}`;
    }

    renderYearView(events, currentView) {
        this.elYearView.innerHTML = '';
        const currentDate = this.calendarRenderer.getDate().toDate();
        const currentYear = currentDate.getFullYear();
        const currentMonthIndex = currentDate.getMonth();

        const allMonths = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const monthsToShow = [
            (currentMonthIndex - 1 + 12) % 12,
            currentMonthIndex,
            (currentMonthIndex + 1) % 12
        ];

        const yearsEvents = events.filter(e => e.start.startsWith(currentYear.toString()));

        monthsToShow.forEach(monthIndex => {
            const monthName = allMonths[monthIndex];
            const monthStr = `${currentYear}-${(monthIndex + 1).toString().padStart(2, '0')}`;
            const monthEvents = yearsEvents.filter(e => e.start.startsWith(monthStr));

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

                    html += `<div class="event-item" style="border-left-color: ${e.backgroundColor || '#ccc'}">
                        <span>${e.title}</span>
                        ${amountStr}
                    </div>`;
                });
            }

            if (totalAmount > 0) {
                html += `<div class="total-row"><span>Total Payments</span><span>$${totalAmount.toFixed(2)}</span></div>`;
            }

            card.innerHTML = html;
            this.elYearView.appendChild(card);
        });
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
