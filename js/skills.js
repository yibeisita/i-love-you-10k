import { appState, createInitialSkillData, getActiveSkill, saveState } from './state.js';
import { renderDashboard } from './render.js';
import { setView } from './views.js';
import { loadActiveSkillIntoUI } from './ui.js';
import { resolveTrackerEntryView } from './hundred-hour.js';
import { confirmDialog } from './dialog.js';

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
    if (!appState.activeSkillId) {
        appState.activeSkillId = newId;
    }
    input.value = '';

    saveState();
    renderDashboard();
}

export async function deleteSkillTracker(id) {
    const confirmed = await confirmDialog({
        messageKey: 'deleteConfirm',
        messageVars: { name: appState.skills[id].name },
        confirmTextKey: 'deleteSkill',
        destructive: true,
    });
    if (!confirmed) return;

    delete appState.skills[id];

    const remainingIds = Object.keys(appState.skills);
    if (appState.activeSkillId === id) {
        appState.activeSkillId = remainingIds[0] ?? null;
    }

    saveState();
    renderDashboard();

    if (remainingIds.length === 0) {
        setView('home');
        return;
    }

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

    container.addEventListener('mousedown', (event) => {
        if (event.target.closest('.node-delete-btn')) {
            event.stopPropagation();
        }
    });

    container.addEventListener('click', (event) => {
        const deleteBtn = event.target.closest('.node-delete-btn');
        if (deleteBtn) {
            event.preventDefault();
            event.stopPropagation();
            const skillId = deleteBtn.closest('.skill-entry')?.dataset.skillId;
            if (skillId) deleteSkillTracker(skillId);
            return;
        }

        const node = event.target.closest('.skill-entry');
        if (node?.dataset.skillId) {
            selectSkillTracker(node.dataset.skillId);
        }
    });
}
