import { getLocale, t } from './i18n.js';
import { formatPunchedDate, getLoggedPunchedAt } from './logged-hours.js';

let tooltipEl = null;

function getTooltip() {
    if (!tooltipEl?.isConnected) {
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
    const hasHours = hours != null;
    const hoursLabel = hasHours
        ? t('activitySummaryHours', { hours: Number(hours || 0).toLocaleString(getLocale()) })
        : null;

    if (date && hasHours) {
        return t('hourTooltipWithHours', { date, label, hours: hoursLabel });
    }
    if (date) {
        return t('hourTooltip', { date, label });
    }
    if (hasHours) {
        return t('hourTooltipNoDateWithHours', { label, hours: hoursLabel });
    }
    return label || t('hourNotLogged');
}

/** Tracker circles: punch date + activity name (hour counts live on activity rows). */
export function formatTrackerCircleTooltip(entry, label) {
    return formatHourTooltipText({
        punchedAt: getLoggedPunchedAt(entry),
        label,
    });
}

export function formatActivityHoursTooltip(hours) {
    return t('activitySummaryHours', {
        hours: Number(hours || 0).toLocaleString(getLocale()),
    });
}

export function showHourTooltip(event, text, { align = 'center' } = {}) {
    const tooltip = getTooltip();
    tooltip.textContent = text;
    tooltip.hidden = false;
    tooltip.dataset.align = align;

    const rect = event.currentTarget.getBoundingClientRect();
    const tooltipHeight = tooltip.offsetHeight || 28;
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow < tooltipHeight + 12 ? rect.top - tooltipHeight - 8 : rect.bottom + 8;

    tooltip.style.left = align === 'left' ? `${rect.left}px` : `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${top}px`;
}

export function hideHourTooltip() {
    getTooltip().hidden = true;
}
