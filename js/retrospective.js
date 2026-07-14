import { getActiveSkill } from './state.js';
import { getCompletedBlocks } from './hundred-hour.js';
import { getActivityGradientForSkill, getActivityLabelForSkill } from './colors.js';
import { setView } from './views.js';

let viewingRetrospectiveBlockId = null;
let tooltipEl = null;

function getRetrospectiveBlocks(skill) {
    return getCompletedBlocks(skill);
}

function getViewingRetrospectiveBlock(skill) {
    if (viewingRetrospectiveBlockId) {
        return skill.hundredHourBlocks.find((block) => block.id === viewingRetrospectiveBlockId) ?? null;
    }

    const completed = getRetrospectiveBlocks(skill);
    return completed[completed.length - 1] ?? null;
}

function getTooltip() {
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'retrospective-tooltip';
        tooltipEl.className = 'retrospective-tooltip';
        tooltipEl.hidden = true;
        document.body.appendChild(tooltipEl);
    }
    return tooltipEl;
}

function showRetrospectiveTooltip(event, hour, actId, skill) {
    const tooltip = getTooltip();
    const label = actId ? getActivityLabelForSkill(skill, actId) : 'Not logged';

    tooltip.textContent = actId ? `Hour ${hour} · ${label}` : `Hour ${hour} · ${label}`;
    tooltip.hidden = false;

    const rect = event.currentTarget.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.bottom + 8}px`;
}

function hideRetrospectiveTooltip() {
    getTooltip().hidden = true;
}

function createReadonlyHourCircle(index, skill, loggedHours) {
    const circle = document.createElement('div');
    circle.className = 'hour-circle hour-circle-readonly retrospective-hour';

    const actId = loggedHours[index];
    if (actId) {
        circle.style.background = getActivityGradientForSkill(skill, actId);
        circle.classList.add('filled');
        circle.setAttribute('aria-label', `Hour ${index}: ${getActivityLabelForSkill(skill, actId)}`);
    } else {
        circle.setAttribute('aria-label', `Hour ${index}: not logged`);
    }

    circle.dataset.hour = index;
    circle.addEventListener('mouseenter', (event) => showRetrospectiveTooltip(event, index, actId, skill));
    circle.addEventListener('mouseleave', hideRetrospectiveTooltip);

    return circle;
}

function assembleRetrospectiveGrid(skill, block) {
    const grid = document.getElementById('retrospective-grid');
    const emptyNote = document.getElementById('retrospective-empty');
    const label = document.getElementById('retrospective-block-label');

    if (!grid || !emptyNote) return;

    grid.innerHTML = '';
    hideRetrospectiveTooltip();

    if (!block) {
        label.textContent = '';
        emptyNote.hidden = false;
        return;
    }

    emptyNote.hidden = true;
    label.textContent = `Block ${block.cycleNumber}`;

    const loggedHours = block.loggedHours || {};

    for (let i = 1; i <= 100; i++) {
        grid.appendChild(createReadonlyHourCircle(i, skill, loggedHours));
    }
}

function updateRetrospectiveNavState(skill, block) {
    const mainBtn = document.getElementById('retrospective-main-btn');
    const completed = getRetrospectiveBlocks(skill);
    const latestBlock = completed.at(-1);

    mainBtn?.classList.toggle('active', block?.id === latestBlock?.id);

    document.querySelectorAll('.retrospective-block-nav-btn').forEach((btn) => {
        btn.classList.toggle('active', block && btn.dataset.blockId === block.id);
    });

    const desc = document.getElementById('sidebar-retrospective-desc');
    if (desc) {
        const completedCount = completed.length;
        desc.textContent =
            completedCount > 0
                ? `${completedCount} completed block${completedCount === 1 ? '' : 's'} archived`
                : 'No completed logs yet';
    }
}

export function renderRetrospectiveBlockNav(skill) {
    const nav = document.getElementById('retrospective-block-nav');
    if (!nav) return;

    nav.innerHTML = '';

    const completed = getRetrospectiveBlocks(skill);
    const desc = document.getElementById('sidebar-retrospective-desc');
    if (desc) {
        desc.textContent =
            completed.length > 0
                ? `${completed.length} completed block${completed.length === 1 ? '' : 's'} archived`
                : 'No completed logs yet';
    }

    completed.forEach((block) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'reflection-block-nav-btn retrospective-block-nav-btn';
        btn.dataset.blockId = block.id;
        btn.textContent = `Block ${block.cycleNumber}`;
        btn.addEventListener('click', () => openRetrospectiveBlock(block.id));
        nav.appendChild(btn);
    });
}

export function resetViewingRetrospective() {
    viewingRetrospectiveBlockId = null;
    hideRetrospectiveTooltip();
}

export function openRetrospectiveBlock(blockId) {
    viewingRetrospectiveBlockId = blockId;
    loadRetrospectiveIntoUI();
    setView('retrospective');
}

export function openLatestRetrospective() {
    const skill = getActiveSkill();
    if (!skill) return;

    const completed = getRetrospectiveBlocks(skill);
    if (completed.length === 0) {
        viewingRetrospectiveBlockId = null;
        loadRetrospectiveIntoUI();
        setView('retrospective');
        return;
    }

    viewingRetrospectiveBlockId = completed[completed.length - 1].id;
    loadRetrospectiveIntoUI();
    setView('retrospective');
}

export function loadRetrospectiveIntoUI() {
    const skill = getActiveSkill();
    if (!skill) return;

    const block = getViewingRetrospectiveBlock(skill);
    assembleRetrospectiveGrid(skill, block);
    updateRetrospectiveNavState(skill, block);
}
