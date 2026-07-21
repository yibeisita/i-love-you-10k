/** Normalize legacy string entries and `{ actId, punchedAt }` objects. */

export function getLoggedActId(entry) {
    if (!entry) return null;
    if (typeof entry === 'string') return entry;
    return entry.actId ?? null;
}

export function getLoggedPunchedAt(entry) {
    if (!entry || typeof entry === 'string') return null;
    return entry.punchedAt || null;
}

export function createLoggedHour(actId, punchedAt = new Date().toISOString().slice(0, 10)) {
    return { actId, punchedAt };
}

export function countActivityHoursInMap(hoursMap, actId) {
    if (!actId) return 0;
    return Object.values(hoursMap || {}).filter((entry) => getLoggedActId(entry) === actId).length;
}

export function countActivityHoursForSkill(skill, actId) {
    if (!skill || !actId) return 0;

    let total = 0;
    skill.hundredHourBlocks?.forEach((block) => {
        const hours =
            block.status === 'completed'
                ? block.loggedHours
                : block.id === skill.currentBlockId
                  ? skill.loggedHoursData
                  : {};
        total += countActivityHoursInMap(hours, actId);
    });
    return total;
}

export function formatPunchedDate(isoDate, locale = undefined) {
    if (!isoDate) return null;

    const parsed = new Date(`${isoDate}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) return isoDate;

    return parsed.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
