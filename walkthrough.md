Calendar Navigation & Year View Update
Changes Implemented
I have enhanced the calendar with a full navigation bar and a custom Year View Dashboard functionality.

1. Navigation Bar
Added a top navigation bar with:
Prev/Next/Today: Easy navigation between months/years.
Title: Displays the current context (e.g., "December 2025" or "2026").
View Switcher: Toggle between "Month" and "Year" views.
2. Custom Year View Dashboard
Since the standard calendar doesn't support a year view, I built a custom dashboard.

Grid Layout: Displays 12 cards, one for each month of the selected year.
Event Summary: Lists all events for that month.
Payment Tracking: Automatically calculates and displays the Total Payments for each month based on your recurring events.
Validation Results
I verified the changes using the browser:

Navigation: Confirmed that clicking "Next" correctly advances the calendar and updates the title.
View Switching: Confirmed toggling between Month and Year views works seamlessly.
Data Accuracy: Verified that the "Year View" for 2026 correctly shows the recurring payments (Rent, Netflix, Internet) for each month.
Visual Proof
Initial Load Figure 1: New Navigation Bar in Month View.

Year View 2026 Figure 2: Custom Year Dashboard showing monthly summaries and payment totals for 2026.

Next Steps
You can style the "Year View" further to differentiate payment types (e.g., color-coding).
The "Total Payments" logic currently sums up any event with an amount property.