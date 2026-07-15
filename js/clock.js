import { formatLocalDate, formatLocalTime } from './utils.js';
import { getLocale } from './i18n.js';

let clockTimer = null;

export function updateClock() {
    const dateEl = document.getElementById('live-date');
    const timeEl = document.getElementById('live-time');
    if (!dateEl || !timeEl) return;

    const locale = getLocale();
    dateEl.textContent = formatLocalDate(locale);
    timeEl.textContent = formatLocalTime(locale);
}

export function startLiveClock() {
    updateClock();
    if (clockTimer) clearInterval(clockTimer);
    clockTimer = setInterval(updateClock, 1000);
}
