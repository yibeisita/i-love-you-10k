import { appState } from './state.js';
import { escapeHTML, seededRandom } from './utils.js';
import { getTotalHours } from './hundred-hour.js';

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

function getLineIndents(seed) {
    const step = (offset) => 10 + Math.round(seededRandom(seed + offset) * 3) * 10;
    return [0, step(1) + 10, step(2)];
}

function formatSkillStartDate(skill) {
    const raw = skill.hundredHourBlocks?.[0]?.start?.startDate?.trim();
    if (!raw) return '—';

    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
        const day = String(parsed.getDate()).padStart(2, '0');
        const month = parsed.toLocaleString('en', { month: 'long' }).toLowerCase();
        return `${day}-${month}-${parsed.getFullYear()}`;
    }

    return raw;
}

export function renderDashboard() {
    const container = document.getElementById('skills-display-list');
    container.innerHTML = '';

    const entries = Object.entries(appState.skills);

    let maxRow = 0;

    entries.forEach(([id, skill], index) => {
        const hoursCount = getTotalHours(skill);
        const entryNumber = String(index + 1).padStart(2, '0');
        const [line1Indent, line2Indent, line3Indent] = getLineIndents(skillSeed(id));
        const startDate = formatSkillStartDate(skill);

        const { left, top, row } = getLanePosition(index);
        maxRow = Math.max(maxRow, row);

        const node = document.createElement('div');
        node.className = 'skill-entry';
        node.dataset.skillId = id;
        node.style.top = top;
        node.style.left = `${left * 100}%`;

        node.innerHTML = `
            <div class="skill-entry-line" style="padding-left: ${line1Indent}px">${entryNumber}  ${escapeHTML(skill.name).toUpperCase()}</div>
            <div class="skill-entry-line" style="padding-left: ${line2Indent}px">${hoursCount} HOURS LOGGED</div>
            <div class="skill-entry-line" style="padding-left: ${line3Indent}px">${escapeHTML(startDate).toUpperCase()}</div>
            <button type="button" class="node-delete-btn" title="Delete Profile" aria-label="Delete skill">&times;</button>
        `;

        container.appendChild(node);
    });

    const rowsHeight = `${(maxRow + 1) * ENTRY_ROW_HEIGHT_REM}rem`;
    container.style.minHeight = `calc(${TITLE_TOP_OFFSET} + ${rowsHeight})`;
}

