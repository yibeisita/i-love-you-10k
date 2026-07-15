import { beforeEach, describe, expect, it } from 'vitest';
import { appState } from '../js/state.js';
import { renderDashboard } from '../js/render.js';
import { completeSkillToTenThousand, createSkillAtFinalBlock, createTestSkill, fillBlockStart } from './helpers/fixtures.js';

describe('dashboard rendering', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div class="skills-display-container" id="skills-display-list"></div>';
        appState.skills = {};
        appState.activeSkillId = null;
    });

    it('shows a star and end date line for completed skills', () => {
        const skill = createSkillAtFinalBlock('Piano');
        skill.hundredHourBlocks[0].start.startDate = '2024-01-15';
        completeSkillToTenThousand(skill);

        appState.skills.skill_1 = skill;

        renderDashboard();

        const entry = document.querySelector('.skill-entry');
        expect(entry?.textContent).toContain('PIANO ☆');
        expect(entry?.querySelectorAll('.skill-entry-line')).toHaveLength(4);
        expect(entry?.textContent).toContain('10000');
        expect(entry?.textContent).toMatch(/04\/10\/2026|10-april-2026|15-april-2026/i);
    });

    it('shows three lines without a star for in-progress skills', () => {
        const skill = createTestSkill('Guitar');
        fillBlockStart(skill.hundredHourBlocks[0]);
        skill.hundredHourBlocks[0].start.startDate = '2024-03-01';

        appState.skills.skill_1 = skill;

        renderDashboard();

        const entry = document.querySelector('.skill-entry');
        expect(entry?.textContent).toContain('GUITAR');
        expect(entry?.textContent).not.toContain('☆');
        expect(entry?.querySelectorAll('.skill-entry-line')).toHaveLength(3);
    });
});
