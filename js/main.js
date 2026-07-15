import { loadState } from './state.js';
import { startLiveClock } from './clock.js';
import { setView, handleHeaderBack, initHomeView, updateHeaderBackLabel } from './views.js';
import { addSkillFromInput, renameActiveSkill, bindSkillDashboardEvents } from './skills.js';
import { addActivity, closeColorPicker } from './activities.js';
import { bindControlsSidebarHeightSync } from './sidebar-layout.js';
import { loadActiveSkillIntoUI, refreshDynamicUI } from './ui.js';
import { saveCurrentPrompts, openCurrentReflection } from './prompts.js';
import { openLatestRetrospective } from './retrospective.js';
import { startLoveCycler } from './home-title.js';
import { getActiveSkill } from './state.js';
import { completeBlockAndStartNew } from './hundred-hour.js';
import { loadPreferences, applyTranslations } from './i18n.js';
import { initSettings } from './settings.js';
import { initDialog } from './dialog.js';

function initApp() {
    loadPreferences();
    loadState();
    startLiveClock();
    applyTranslations();
    refreshDynamicUI();
    updateHeaderBackLabel();
}

function handleCompleteReflection() {
    const skill = getActiveSkill();
    if (!skill) return;

    const { skillCompleted } = completeBlockAndStartNew(skill);
    loadActiveSkillIntoUI();

    if (skillCompleted) {
        setView('landing');
        return;
    }

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

    document.getElementById('nav-faq-btn')?.addEventListener('click', () => setView('faq'));
    document.getElementById('nav-settings-btn')?.addEventListener('click', () => setView('settings'));

    document.querySelectorAll('.secondary-view-back-btn').forEach((btn) => {
        btn.addEventListener('click', () => setView('home'));
    });

    document.addEventListener('click', (event) => {
        const popup = document.getElementById('color-picker-popup');
        if (popup && !popup.contains(event.target) && !event.target.closest('.color-preview-dot')) {
            closeColorPicker();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    bindControlsSidebarHeightSync();
    initApp();
    initHomeView();
    initDialog();
    initSettings();
    startLoveCycler();
});
