import { getLocale, t } from './i18n.js';
import { formatPunchedDate } from './logged-hours.js';

let tooltipEl = null;

function getTooltip() {
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'hour-tooltip';
        tooltipEl.className = 'hour-tooltip';
        tooltipEl.hidden = true;
        document.body.appendChild(tooltipEl);
    }
    return tooltipEl;
}

export function formatHourTooltipText({ punchedAt, label, hours }) {
    const date = formatPunchedDate(punchedAt, getLocale());
    const hoursLabel = t('activitySummaryHours', { hours: Number(hours || 0).toLocaleString(getLocale()) });

    if (date) {
        return t('hourTooltip', { date, label, hours: hoursLabel });
    }

    return t('hourTooltipNoDate', { label, hours: hoursLabel });
}

export function showHourTooltip(event, text) {
    const tooltip = getTooltip();
    tooltip.textContent = text;
    tooltip.hidden = false;

    const rect = event.currentTarget.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.bottom + 8}px`;
}

export function hideHourTooltip() {
    getTooltip().hidden = true;
}
