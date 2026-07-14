import { loadState } from './state.js';
import { startLiveClock } from './clock.js';
import { setView, handleHeaderBack, initHomeView } from './views.js';
import { addSkillFromInput, renameActiveSkill, bindSkillDashboardEvents } from './skills.js';
import { renderDashboard } from './render.js';
import { buildSwatchGrid, addActivity, closeColorPicker } from './activities.js';
import { loadActiveSkillIntoUI } from './ui.js';
import { saveCurrentPrompts, openCurrentReflection } from './prompts.js';
import { openLatestRetrospective } from './retrospective.js';
import { startLoveCycler } from './home-title.js';
import { getActiveSkill } from './state.js';
import { completeBlockAndStartNew } from './hundred-hour.js';

function initApp() {
    loadState();
    buildSwatchGrid();
    renderDashboard();
    loadActiveSkillIntoUI();
    startLiveClock();
}

function handleCompleteReflection() {
    const skill = getActiveSkill();
    if (!skill) return;

    completeBlockAndStartNew(skill);
    loadActiveSkillIntoUI();
    openCurrentReflection();
}

function bindEvents() {
    bindSkillDashboardEvents();

    document.getElementById('header-back-btn').addEventListener('click', handleHeaderBack);

    document.getElementById('editable-skill').addEventListener('blur', (event) => {
        renameActiveSkill(event.target.innerText);
    });

    document.getElementById('skill-input').addEventListener('keydown', (event) => {
        if (event.key === 'Enter') addSkillFromInput();
    });

    document.getElementById('add-activity-btn').addEventListener('click', addActivity);

    document.querySelector('[data-view="setup"]').addEventListener('click', () => setView('setup'));
    document.getElementById('reflection-current-btn').addEventListener('click', openCurrentReflection);
    document.getElementById('retrospective-main-btn').addEventListener('click', openLatestRetrospective);

    document.querySelectorAll('[data-prompt], [data-block-field]').forEach((field) => {
        field.addEventListener('input', saveCurrentPrompts);
    });

    document.getElementById('complete-reflection-btn').addEventListener('click', handleCompleteReflection);

    document.addEventListener('click', (event) => {
        const popup = document.getElementById('color-picker-popup');
        if (popup && !popup.contains(event.target) && !event.target.closest('.color-preview-dot')) {
            closeColorPicker();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    initApp();
    initHomeView();
    startLoveCycler();
});
