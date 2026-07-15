import { getActiveSkill } from './state.js';
import { renderActivityList } from './activities.js';
import { assembleTrackerGrid, recalculateCounters } from './tracker.js';
import { loadPromptsIntoUI, resetViewingBlock } from './prompts.js';
import { renderRetrospectiveBlockNav, resetViewingRetrospective } from './retrospective.js';
import { syncControlsSidebarHeight } from './sidebar-layout.js';

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
