import { getActiveSkill } from './state.js';
import { renderActivityList, buildSwatchGrid } from './activities.js';
import { assembleTrackerGrid, assembleCompletedMilestone, recalculateCounters } from './tracker.js';
import { loadPromptsIntoUI, resetViewingBlock, loadReflectionBlockIntoUI } from './prompts.js';
import { renderRetrospectiveBlockNav, resetViewingRetrospective, loadRetrospectiveIntoUI } from './retrospective.js';
import { syncControlsSidebarHeight } from './sidebar-layout.js';
import { updateClock } from './clock.js';
import { renderDashboard } from './render.js';
import { getCurrentView } from './views.js';
import { isSkillComplete } from './hundred-hour.js';

function updateCompletedSkillUI(skill) {
    const complete = isSkillComplete(skill);
    const landing = document.getElementById('view-landing');

    landing?.classList.toggle('skill-completed', complete);

    document.getElementById('add-activity-btn')?.toggleAttribute('hidden', complete);
    document.querySelector('[data-view="setup"]')?.toggleAttribute('hidden', complete);
    document.getElementById('retrospective-main-btn')?.closest('.reflection-group')?.toggleAttribute('hidden', complete);

    const editableSkill = document.getElementById('editable-skill');
    if (editableSkill) {
        editableSkill.contentEditable = complete ? 'false' : 'true';
    }
}

export function loadActiveSkillIntoUI() {
    const current = getActiveSkill();
    if (!current) return;

    resetViewingBlock();
    resetViewingRetrospective();
    document.getElementById('editable-skill').innerText = current.name;
    updateCompletedSkillUI(current);
    renderActivityList();

    if (!isSkillComplete(current)) {
        assembleTrackerGrid();
        recalculateCounters();
    } else {
        assembleCompletedMilestone();
        recalculateCounters();
    }

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
