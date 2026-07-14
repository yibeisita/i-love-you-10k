import { appState, createInitialSkillData, getActiveSkill, saveState } from './state.js';
import { renderDashboard } from './render.js';
import { setView } from './views.js';
import { loadActiveSkillIntoUI } from './ui.js';
import { resolveTrackerEntryView } from './hundred-hour.js';

export function selectSkillTracker(id) {
    appState.activeSkillId = id;
    saveState();
    loadActiveSkillIntoUI();
    setView(resolveTrackerEntryView(getActiveSkill()));
}

export function addSkillFromInput() {
    const input = document.getElementById('skill-input');
    const name = input.value.trim();
    if (!name) return;

    const newId = `skill_${Date.now()}`;
    appState.skills[newId] = createInitialSkillData(name);
    input.value = '';

    saveState();
    renderDashboard();
}

export function deleteSkillTracker(id) {
    if (Object.keys(appState.skills).length <= 1) {
        alert('You should keep at least one active tracking profile.');
        return;
    }

    if (!confirm(`Are you sure you want to delete all historical logs for "${appState.skills[id].name}"?`)) {
        return;
    }

    delete appState.skills[id];
    if (appState.activeSkillId === id) {
        appState.activeSkillId = Object.keys(appState.skills)[0];
    }

    saveState();
    renderDashboard();
    loadActiveSkillIntoUI();
}

export function renameActiveSkill(newName) {
    const current = getActiveSkill();
    if (current && newName.trim()) {
        current.name = newName.trim();
        saveState();
        renderDashboard();
    }
}

export function bindSkillDashboardEvents() {
    const container = document.getElementById('skills-display-list');

    container.addEventListener('click', (event) => {
        const deleteBtn = event.target.closest('.node-delete-btn');
        if (deleteBtn) {
            event.stopPropagation();
            const skillId = deleteBtn.closest('.circle-oval')?.dataset.skillId;
            if (skillId) deleteSkillTracker(skillId);
            return;
        }

        const node = event.target.closest('.circle-oval');
        if (node?.dataset.skillId) {
            selectSkillTracker(node.dataset.skillId);
        }
    });
}
