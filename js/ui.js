import { getActiveSkill } from './state.js';
import { renderActivityList, buildSwatchGrid } from './activities.js';
import { assembleTrackerGrid, recalculateCounters } from './tracker.js';
import { loadPromptsIntoUI, resetViewingBlock, loadReflectionBlockIntoUI } from './prompts.js';
import { renderRetrospectiveBlockNav, resetViewingRetrospective, loadRetrospectiveIntoUI } from './retrospective.js';
import { syncControlsSidebarHeight } from './sidebar-layout.js';
import { updateClock } from './clock.js';
import { renderDashboard } from './render.js';
import { getCurrentView } from './views.js';

export function loadActiveSkillIntoUI() {
    const current = getActiveSkill();
    if (!current) return;

    resetViewingBlock();
    resetViewingRetrospective();
    document.getElementById('editable-skill').innerText = current.name;
    renderActivityList();
    assembleTrackerGrid();
    recalculateCounters();
    loadPromptsIntoUI();
    renderRetrospectiveBlockNav(current);
    syncControlsSidebarHeight();
}

export function refreshDynamicUI() {
    updateClock();
    buildSwatchGrid();
    renderDashboard();
    loadActiveSkillIntoUI();

    const view = getCurrentView();
    if (view === 'reflection') loadReflectionBlockIntoUI();
    if (view === 'retrospective') loadRetrospectiveIntoUI();
}
