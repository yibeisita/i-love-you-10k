let sidebarHeightSyncBound = false;

export function syncControlsSidebarHeight() {
    const tracker = document.getElementById('hour-grid-target');
    const sidebar = document.querySelector('.controls-sidebar');
    const activityList = document.getElementById('activity-list');
    if (!tracker || !sidebar) return;

    requestAnimationFrame(() => {
        sidebar.style.setProperty('--tracker-grid-height', `${tracker.offsetHeight}px`);

        const firstRow = activityList?.querySelector('.activity-row');
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
