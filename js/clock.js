import { formatLocalDate, formatLocalTime } from './utils.js';

let clockTimer = null;

function updateClock() {
    const dateEl = document.getElementById('live-date');
    const timeEl = document.getElementById('live-time');
    if (!dateEl || !timeEl) return;

    dateEl.textContent = formatLocalDate();
    timeEl.textContent = formatLocalTime();
}

export function startLiveClock() {
    updateClock();
    if (clockTimer) clearInterval(clockTimer);
    clockTimer = setInterval(updateClock, 1000);
}
