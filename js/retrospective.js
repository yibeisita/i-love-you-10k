import { getActiveSkill } from './state.js';
import { getCompletedBlocks, getBlockMilestoneHours } from './hundred-hour.js';
import { getActivityGradientForSkill, getActivityLabelForSkill } from './colors.js';
import { setView } from './views.js';
import { renderBlockNav } from './block-nav.js';
import { syncControlsSidebarHeight } from './sidebar-layout.js';
import { t, tCount } from './i18n.js';
import {
    RETROSPECTIVE_GRID_COLUMNS,
    RETROSPECTIVE_HOUR_COUNT,
    RETROSPECTIVE_MILESTONE_SCALE,
    RETROSPECTIVE_ROWS,
    RETROSPECTIVE_STANDARD_COLUMNS,
} from './constants.js';
import {
    getLoggedActId,
    getLoggedPunchedAt,
    countActivityHoursForSkill,
} from './logged-hours.js';
import { formatHourTooltipText, showHourTooltip, hideHourTooltip } from './hour-tooltip.js';

let viewingRetrospectiveBlockId = null;
let layoutGrid = null;

function getRetrospectiveAvailableHeight(grid) {
    const gridTop = grid.getBoundingClientRect().top;
    const bodyPaddingBottom = Number.parseFloat(getComputedStyle(document.body).paddingBottom) || 0;
    return window.innerHeight - gridTop - bodyPaddingBottom;
}

function getOptimalRetrospectiveCellSize(grid) {
    const styles = getComputedStyle(grid);
    const columnGap = Number.parseFloat(styles.columnGap) || 0;
    const rowGap = Number.parseFloat(styles.rowGap) || columnGap;
    const milestoneGap = Number.parseFloat(styles.getPropertyValue('--retro-milestone-gap')) || 0;
    const availableWidth = grid.clientWidth;
    const availableHeight = getRetrospectiveAvailableHeight(grid);

    if (availableWidth <= 0 || availableHeight <= 0) {
        return null;
    }

    const cellFromWidth =
        (availableWidth - (RETROSPECTIVE_GRID_COLUMNS - 1) * columnGap - milestoneGap) /
        (RETROSPECTIVE_STANDARD_COLUMNS + RETROSPECTIVE_MILESTONE_SCALE);
    const cellFromHeight = (availableHeight - (RETROSPECTIVE_ROWS - 1) * rowGap) / RETROSPECTIVE_ROWS;

    return Math.min(cellFromWidth, cellFromHeight);
}

function updateRetrospectiveGridLayout() {
    if (!layoutGrid?.isConnected) return;

    const cellSize = getOptimalRetrospectiveCellSize(layoutGrid);
    if (cellSize == null || cellSize <= 0) return;

    const styles = getComputedStyle(layoutGrid);
    const columnGap = Number.parseFloat(styles.columnGap) || 0;
    const milestoneGap = Number.parseFloat(styles.getPropertyValue('--retro-milestone-gap')) || 0;
    const milestoneSize = cellSize * RETROSPECTIVE_MILESTONE_SCALE;
    const gridWidth =
        cellSize * RETROSPECTIVE_STANDARD_COLUMNS +
        milestoneSize +
        milestoneGap +
        columnGap * (RETROSPECTIVE_GRID_COLUMNS - 1);

    layoutGrid.style.gridTemplateColumns = `repeat(${RETROSPECTIVE_STANDARD_COLUMNS}, ${cellSize}px) ${milestoneSize}px`;
    layoutGrid.style.gridTemplateRows = `repeat(${RETROSPECTIVE_ROWS}, ${cellSize}px)`;
    layoutGrid.style.width = `${Math.min(gridWidth, layoutGrid.clientWidth || gridWidth)}px`;
    layoutGrid.style.setProperty('--retro-cell-size', `${cellSize}px`);
    layoutGrid.style.setProperty('--retro-milestone-size', `${milestoneSize}px`);
}

function scheduleRetrospectiveGridLayout(grid) {
    layoutGrid = grid;

    const runLayout = (attempt = 0) => {
        updateRetrospectiveGridLayout();

        const cellSize = getOptimalRetrospectiveCellSize(layoutGrid);
        if ((cellSize == null || cellSize <= 0) && attempt < 5) {
            requestAnimationFrame(() => runLayout(attempt + 1));
        }
    };

    requestAnimationFrame(() => {
        requestAnimationFrame(() => runLayout());
    });
}

window.addEventListener('resize', updateRetrospectiveGridLayout);

function getRetrospectiveBlocks(skill) {
    return getCompletedBlocks(skill);
}

function formatRetrospectiveDesc(completedCount) {
    return completedCount > 0 ? tCount('completedBlocksArchived', completedCount) : t('noCompletedLogs');
}

function getViewingRetrospectiveBlock(skill) {
    if (viewingRetrospectiveBlockId) {
        return skill.hundredHourBlocks.find((block) => block.id === viewingRetrospectiveBlockId) ?? null;
    }

    const completed = getRetrospectiveBlocks(skill);
    return completed[completed.length - 1] ?? null;
}

function showRetrospectiveTooltip(event, entry, skill, block) {
    const actId = getLoggedActId(entry);

    if (!actId) {
        showHourTooltip(event, t('hourNotLogged'));
        return;
    }

    const label = getActivityLabelForSkill(skill, actId, block);
    const hours = countActivityHoursForSkill(skill, actId);
    showHourTooltip(
        event,
        formatHourTooltipText({
            punchedAt: getLoggedPunchedAt(entry),
            label,
            hours,
        })
    );
}

function createReadonlyHourCircle(index, skill, loggedHours, block, isMilestone = false) {
    const circle = document.createElement('div');
    circle.className = `hour-circle hour-circle-readonly retrospective-hour${isMilestone ? ' milestone-hundred' : ''}`;

    if (isMilestone) {
        const label = document.createElement('span');
        label.className = 'milestone-label';
        label.textContent = String(getBlockMilestoneHours(block));
        circle.appendChild(label);
    }

    const entry = loggedHours[index];
    const actId = getLoggedActId(entry);
    if (actId) {
        circle.style.background = getActivityGradientForSkill(skill, actId, block);
        circle.classList.add('filled');
        circle.setAttribute('aria-label', t('hourAriaLogged', { hour: index, label: getActivityLabelForSkill(skill, actId, block) }));
    } else {
        circle.setAttribute('aria-label', t('hourAriaNotLogged', { hour: index }));
    }

    circle.dataset.hour = index;
    circle.addEventListener('mouseenter', (event) => showRetrospectiveTooltip(event, entry, skill, block));
    circle.addEventListener('mouseleave', hideHourTooltip);

    return circle;
}

function assembleRetrospectiveGrid(skill, block) {
    const grid = document.getElementById('retrospective-grid');
    const emptyNote = document.getElementById('retrospective-empty');

    if (!grid || !emptyNote) return;

    grid.innerHTML = '';
    hideHourTooltip();

    if (!block) {
        emptyNote.hidden = false;
        return;
    }

    emptyNote.hidden = true;

    const loggedHours = block.loggedHours || {};

    for (let i = 1; i <= RETROSPECTIVE_HOUR_COUNT - 1; i++) {
        const circle = createReadonlyHourCircle(i, skill, loggedHours, block);
        const row = Math.ceil(i / RETROSPECTIVE_STANDARD_COLUMNS);
        const col = ((i - 1) % RETROSPECTIVE_STANDARD_COLUMNS) + 1;
        circle.style.gridRow = String(row);
        circle.style.gridColumn = String(col);
        grid.appendChild(circle);
    }

    const milestone = createReadonlyHourCircle(RETROSPECTIVE_HOUR_COUNT, skill, loggedHours, block, true);
    milestone.style.gridColumn = String(RETROSPECTIVE_GRID_COLUMNS);
    milestone.style.gridRow = '1 / -1';
    grid.appendChild(milestone);

    scheduleRetrospectiveGridLayout(grid);
}

export function refreshRetrospectiveGridLayout() {
    updateRetrospectiveGridLayout();
}

function updateRetrospectiveNavState(skill, block) {
    const mainBtn = document.getElementById('retrospective-main-btn');
    const completed = getRetrospectiveBlocks(skill);
    const latestBlock = completed.at(-1);

    mainBtn?.classList.toggle('active', block?.id === latestBlock?.id);

    document.querySelectorAll('#retrospective-block-nav .retrospective-block-nav-btn').forEach((btn) => {
        btn.classList.toggle('active', block && btn.dataset.blockId === block.id);
    });

    const desc = document.getElementById('sidebar-retrospective-desc');
    if (desc) {
        desc.textContent = formatRetrospectiveDesc(completed.length);
    }
}

export function renderRetrospectiveBlockNav(skill) {
    const nav = document.getElementById('retrospective-block-nav');
    if (!nav) return;

    const completed = getRetrospectiveBlocks(skill);
    const viewingBlock = getViewingRetrospectiveBlock(skill);
    const desc = document.getElementById('sidebar-retrospective-desc');
    if (desc) {
        desc.textContent = formatRetrospectiveDesc(completed.length);
    }

    renderBlockNav(nav, completed, {
        onSelect: openRetrospectiveBlock,
        activeBlockId: viewingBlock?.id ?? null,
        extraButtonClass: 'retrospective-block-nav-btn',
    });

    syncControlsSidebarHeight();
}

export function resetViewingRetrospective() {
    viewingRetrospectiveBlockId = null;
    hideHourTooltip();
}

export function openRetrospectiveBlock(blockId) {
    viewingRetrospectiveBlockId = blockId;
    setView('retrospective');
    loadRetrospectiveIntoUI();
}

export function openLatestRetrospective() {
    const skill = getActiveSkill();
    if (!skill) return;

    const completed = getRetrospectiveBlocks(skill);
    if (completed.length === 0) {
        viewingRetrospectiveBlockId = null;
        setView('retrospective');
        loadRetrospectiveIntoUI();
        return;
    }

    viewingRetrospectiveBlockId = completed[completed.length - 1].id;
    setView('retrospective');
    loadRetrospectiveIntoUI();
}

export function loadRetrospectiveIntoUI() {
    const skill = getActiveSkill();
    if (!skill) return;

    const block = getViewingRetrospectiveBlock(skill);
    assembleRetrospectiveGrid(skill, block);
    updateRetrospectiveNavState(skill, block);
}
