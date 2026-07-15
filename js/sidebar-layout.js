let sidebarHeightSyncBound = false;

export function syncControlsSidebarHeight() {
    const tracker = document.getElementById('hour-grid-target');
    const sidebar = document.querySelector('.controls-sidebar');
    const activityList = document.getElementById('activity-list');
    const landing = document.getElementById('view-landing');
    if (!sidebar) return;

    requestAnimationFrame(() => {
        const isCompleted = landing?.classList.contains('skill-completed');

        if (isCompleted) {
            sidebar.style.removeProperty('--tracker-grid-height');
            sidebar.style.removeProperty('--activity-list-max-height');
            return;
        }

        if (!tracker) return;

        sidebar.style.setProperty('--tracker-grid-height', `${tracker.offsetHeight}px`);

        const firstRow = activityList?.querySelector('.activity-row, .activity-summary-row');
        if (!firstRow) return;

        const listStyles = getComputedStyle(activityList);
        const rowGap = Number.parseFloat(listStyles.rowGap || listStyles.gap) || 0;
        const maxListHeight = firstRow.offsetHeight * 10 + rowGap * 9;
        sidebar.style.setProperty('--activity-list-max-height', `${maxListHeight}px`);
    });
}

export function bindControlsSidebarHeightSync() {
    if (sidebarHeightSyncBound) return;
    sidebarHeightSyncBound = true;
    window.addEventListener('resize', syncControlsSidebarHeight);
}
