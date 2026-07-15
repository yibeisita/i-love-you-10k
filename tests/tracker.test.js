import { beforeEach, describe, expect, it, vi } from 'vitest';
import { appState } from '../js/state.js';
import { ORB_COLORS } from '../js/constants.js';
import { assembleCompletedMilestone, assembleTrackerGrid } from '../js/tracker.js';
import { completeSkillToTenThousand, createSkillAtFinalBlock, createTestSkill, logHours } from './helpers/fixtures.js';
import { mountTrackerPageDOM } from './helpers/dom.js';

vi.mock('../js/sidebar-layout.js', () => ({
    syncControlsSidebarHeight: vi.fn(),
}));

describe('tracker milestone UI', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        mountTrackerPageDOM();
        appState.skills = {};
        appState.activeSkillId = null;
    });

    it('renders a read-only 10,000 milestone filled with the final hour activity color', () => {
        const skill = createSkillAtFinalBlock('Violin');
        logHours(skill, 99, 'act0');
        skill.loggedHoursData['100'] = 'act2';
        completeSkillToTenThousand(skill);

        appState.skills.skill_1 = skill;
        appState.activeSkillId = 'skill_1';

        assembleCompletedMilestone();

        const circle = document.querySelector('#hour-grid-target .skill-complete-milestone');
        expect(circle).not.toBeNull();
        expect(circle.classList.contains('hour-circle-readonly')).toBe(true);
        expect(circle.classList.contains('filled')).toBe(true);
        expect(circle.dataset.actId).toBe('act2');
        expect(circle.style.background).toBe(ORB_COLORS[9].gradient);
        expect(circle.querySelector('.milestone-label')?.textContent).toBe('10000');
        expect(circle.getAttribute('aria-label')).toBe('10000');
    });

    it('renders only one milestone circle for completed skills', () => {
        const skill = createSkillAtFinalBlock();
        completeSkillToTenThousand(skill);

        appState.skills.skill_1 = skill;
        appState.activeSkillId = 'skill_1';

        assembleCompletedMilestone();

        expect(document.querySelectorAll('#hour-grid-target .hour-circle')).toHaveLength(1);
    });

    it('renders 100 interactive circles for in-progress skills', () => {
        const skill = createTestSkill();
        appState.skills.skill_1 = skill;
        appState.activeSkillId = 'skill_1';

        assembleTrackerGrid();

        expect(document.querySelectorAll('#hour-grid-target .hour-circle')).toHaveLength(100);
        expect(document.querySelector('#hour-grid-target .skill-complete-milestone')).toBeNull();
    });
});
