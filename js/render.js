import { appState } from './state.js';
import { escapeHTML, seededRandom } from './utils.js';
import { getTotalHours, isSkillComplete, getSkillEndDate } from './hundred-hour.js';
import { t, getLocale } from './i18n.js';

const ENTRY_ROW_HEIGHT_REM = 5.5;
const TITLE_TOP_OFFSET = 'calc(var(--home-title-block-height) + 2.5rem)';
const ENTRY_LANE_OFFSETS = [0, 0.2, 0.45, 0.65, 0.85];

function getLanePosition(index) {
    const left = ENTRY_LANE_OFFSETS[index % ENTRY_LANE_OFFSETS.length];

    return {
        left,
        row: index,
        top: `calc(${TITLE_TOP_OFFSET} + ${index * ENTRY_ROW_HEIGHT_REM}rem)`,
    };
}

function skillSeed(id) {
    return parseInt(id.replace(/\D/g, ''), 10) || 0;
}

function getLineIndents(seed, lineCount = 3) {
    const step = (offset) => 10 + Math.round(seededRandom(seed + offset) * 3) * 10;
    const indents = [0, step(1) + 10, step(2)];
    if (lineCount > 3) {
        indents.push(step(3) + 5);
    }
    return indents;
}

function formatSkillDate(raw) {
    if (!raw?.trim()) return '-';

    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
        const day = String(parsed.getDate()).padStart(2, '0');
        const month = parsed.toLocaleString(getLocale(), { month: 'long' }).toLowerCase();
        return `${day}-${month}-${parsed.getFullYear()}`;
    }

    return raw;
}

function formatSkillStartDate(skill) {
    const raw = skill.hundredHourBlocks?.[0]?.start?.startDate?.trim();
    return formatSkillDate(raw);
}

function formatSkillEndDate(skill) {
    return formatSkillDate(getSkillEndDate(skill));
}

export function renderDashboard() {
    const container = document.getElementById('skills-display-list');
    container.innerHTML = '';

    const entries = Object.entries(appState.skills);

    let maxRow = 0;

    entries.forEach(([id, skill], index) => {
        const hoursCount = getTotalHours(skill);
        const complete = isSkillComplete(skill);
        const entryNumber = String(index + 1).padStart(2, '0');
        const lineCount = complete ? 4 : 3;
        const indents = getLineIndents(skillSeed(id), lineCount);
        const startDate = formatSkillStartDate(skill);
        const endDate = complete ? formatSkillEndDate(skill) : '';
        const titleSuffix = complete ? ' ☆' : '';

        const { left, top, row } = getLanePosition(index);
        maxRow = Math.max(maxRow, row);

        const node = document.createElement('div');
        node.className = complete ? 'skill-entry skill-entry-complete' : 'skill-entry';
        node.dataset.skillId = id;
        node.style.top = top;
        node.style.left = `${left * 100}%`;

        node.innerHTML = `
            <div class="skill-entry-line" style="padding-left: ${indents[0]}px">${entryNumber}  ${escapeHTML(skill.name).toUpperCase()}${titleSuffix}</div>
            <div class="skill-entry-line" style="padding-left: ${indents[1]}px">${hoursCount} ${t('hoursLogged')}</div>
            <div class="skill-entry-line" style="padding-left: ${indents[2]}px">${escapeHTML(startDate).toUpperCase()}</div>
            ${complete ? `<div class="skill-entry-line" style="padding-left: ${indents[3]}px">${escapeHTML(endDate).toUpperCase()}</div>` : ''}
            <button type="button" class="node-delete-btn" title="${t('deleteSkill')}" aria-label="${t('deleteSkill')}">&times;</button>
        `;

        container.appendChild(node);
    });

    const rowsHeight = `${(maxRow + 1) * ENTRY_ROW_HEIGHT_REM}rem`;
    container.style.minHeight = `calc(${TITLE_TOP_OFFSET} + ${rowsHeight})`;
}

