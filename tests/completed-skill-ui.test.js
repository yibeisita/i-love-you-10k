import { beforeEach, describe, expect, it, vi } from 'vitest';
import { appState } from '../js/state.js';
import { loadActiveSkillIntoUI } from '../js/ui.js';
import { completeSkillToTenThousand, createSkillAtFinalBlock, createTestSkill } from './helpers/fixtures.js';
import { mountTrackerPageDOM } from './helpers/dom.js';

vi.mock('../js/sidebar-layout.js', () => ({
    syncControlsSidebarHeight: vi.fn(),
    bindControlsSidebarHeightSync: vi.fn(),
}));

vi.mock('../js/clock.js', () => ({
    updateClock: vi.fn(),
}));

describe('completed skill UI', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        mountTrackerPageDOM();
        appState.skills = {};
        appState.activeSkillId = null;
    });

    it('applies completed layout and hides editing controls for finished skills', () => {
        const skill = createSkillAtFinalBlock('Cello');
        completeSkillToTenThousand(skill);

        appState.skills.skill_1 = skill;
        appState.activeSkillId = 'skill_1';

        loadActiveSkillIntoUI();

        const landing = document.getElementById('view-landing');
        expect(landing?.classList.contains('skill-completed')).toBe(true);
        expect(document.getElementById('add-activity-btn')?.hidden).toBe(true);
        expect(document.querySelector('[data-view="setup"]')?.hidden).toBe(true);
        expect(document.getElementById('retrospective-main-btn')?.closest('.reflection-group')?.hidden).toBe(true);
        expect(document.getElementById('editable-skill')?.contentEditable).toBe('false');
        expect(document.querySelector('.skill-complete-milestone')).not.toBeNull();
        expect(document.querySelector('.activity-summary-row')).not.toBeNull();
    });

    it('restores the standard tracker UI for in-progress skills', () => {
        const skill = createTestSkill('Drums');
        appState.skills.skill_1 = skill;
        appState.activeSkillId = 'skill_1';

        loadActiveSkillIntoUI();

        const landing = document.getElementById('view-landing');
        expect(landing?.classList.contains('skill-completed')).toBe(false);
        expect(document.getElementById('add-activity-btn')?.hidden).toBe(false);
        expect(document.querySelector('[data-view="setup"]')?.hidden).toBe(false);
        expect(document.getElementById('editable-skill')?.contentEditable).toBe('true');
        expect(document.querySelectorAll('#hour-grid-target .hour-circle')).toHaveLength(100);
        expect(document.querySelector('.activity-row')).not.toBeNull();
    });

    it('renders block nav dropdowns closed on load', () => {
        const skill = createSkillAtFinalBlock();
        completeSkillToTenThousand(skill);

        appState.skills.skill_1 = skill;
        appState.activeSkillId = 'skill_1';

        loadActiveSkillIntoUI();

        expect(document.querySelector('#reflection-block-nav .block-nav-dropdown')?.open).toBe(false);
        expect(document.querySelector('#retrospective-block-nav .block-nav-dropdown')?.open).toBe(false);
    });
});
