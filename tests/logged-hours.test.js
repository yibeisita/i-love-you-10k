import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    getLoggedActId,
    getLoggedPunchedAt,
    createLoggedHour,
    countActivityHoursForSkill,
    formatPunchedDate,
} from '../js/logged-hours.js';
import { formatHourTooltipText } from '../js/hour-tooltip.js';
import { createTestSkill } from './helpers/fixtures.js';
import { assembleTrackerGrid } from '../js/tracker.js';
import { appState } from '../js/state.js';
import { mountTrackerPageDOM } from './helpers/dom.js';

vi.mock('../js/sidebar-layout.js', () => ({
    syncControlsSidebarHeight: vi.fn(),
}));

describe('logged hours helpers', () => {
    it('reads legacy string entries and object entries', () => {
        expect(getLoggedActId('act0')).toBe('act0');
        expect(getLoggedPunchedAt('act0')).toBeNull();

        const entry = createLoggedHour('act1', '2026-07-21');
        expect(getLoggedActId(entry)).toBe('act1');
        expect(getLoggedPunchedAt(entry)).toBe('2026-07-21');
    });

    it('counts activity hours across completed and current blocks', () => {
        const skill = createTestSkill();
        skill.loggedHoursData = {
            1: createLoggedHour('act0', '2026-07-01'),
            2: createLoggedHour('act0', '2026-07-02'),
            3: createLoggedHour('act1', '2026-07-03'),
            4: 'act0',
        };

        expect(countActivityHoursForSkill(skill, 'act0')).toBe(3);
        expect(countActivityHoursForSkill(skill, 'act1')).toBe(1);
    });

    it('formats punched dates for display', () => {
        expect(formatPunchedDate('2026-07-21', 'en-US')).toMatch(/Jul/);
        expect(formatPunchedDate(null)).toBeNull();
    });
});

describe('hour tooltip text', () => {
    it('includes date, activity label, and hour count', () => {
        expect(
            formatHourTooltipText({
                punchedAt: '2026-07-21',
                label: 'Practice/Drills',
                hours: 12,
            })
        ).toMatch(/Practice\/Drills/);
        expect(
            formatHourTooltipText({
                punchedAt: '2026-07-21',
                label: 'Practice/Drills',
                hours: 12,
            })
        ).toMatch(/12 hours/);
        expect(
            formatHourTooltipText({
                punchedAt: null,
                label: 'Theory/Study',
                hours: 3,
            })
        ).toBe('Theory/Study · 3 hours');
    });
});

describe('tracker hover tooltips', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        mountTrackerPageDOM();
        appState.skills = {};
        appState.activeSkillId = null;
        document.getElementById('hour-tooltip')?.remove();
    });

    it('shows punch date and activity hour count on hover', () => {
        const skill = createTestSkill();
        skill.loggedHoursData = {
            1: createLoggedHour('act0', '2026-07-21'),
            2: createLoggedHour('act0', '2026-07-22'),
        };
        appState.skills.skill_1 = skill;
        appState.activeSkillId = 'skill_1';

        assembleTrackerGrid();

        const circle = document.querySelector('#hour-grid-target .hour-circle.filled');
        expect(circle).not.toBeNull();

        circle.dispatchEvent(new Event('mouseenter', { bubbles: true }));

        const tooltip = document.getElementById('hour-tooltip');
        expect(tooltip).not.toBeNull();
        expect(tooltip.hidden).toBe(false);
        expect(tooltip.textContent).toMatch(/Practice\/Drills/);
        expect(tooltip.textContent).toMatch(/2 hours/);
        expect(tooltip.textContent).toMatch(/2026|Jul/);
    });
});
