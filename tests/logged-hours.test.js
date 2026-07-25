import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    getLoggedActId,
    getLoggedPunchedAt,
    createLoggedHour,
    countActivityHoursForSkill,
    formatPunchedDate,
} from '../js/logged-hours.js';
import { formatHourTooltipText, formatActivityHoursTooltip, formatTrackerCircleTooltip } from '../js/hour-tooltip.js';
import { createTestSkill } from './helpers/fixtures.js';
import { assembleTrackerGrid } from '../js/tracker.js';
import { renderActivityList } from '../js/activities.js';
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
    it('shows date and label without hours by default', () => {
        expect(
            formatHourTooltipText({
                punchedAt: '2026-07-21',
                label: 'Practice/Drills',
            })
        ).toMatch(/Practice\/Drills/);
        expect(
            formatHourTooltipText({
                punchedAt: '2026-07-21',
                label: 'Practice/Drills',
            })
        ).not.toMatch(/hours/);
        expect(
            formatHourTooltipText({
                punchedAt: null,
                label: 'Theory/Study',
            })
        ).toBe('Theory/Study');
    });

    it('includes hours when provided', () => {
        expect(
            formatHourTooltipText({
                punchedAt: '2026-07-21',
                label: 'Practice/Drills',
                hours: 12,
            })
        ).toMatch(/12 hours/);
    });

    it('formats activity hour counts', () => {
        expect(formatActivityHoursTooltip(5)).toBe('5 hours');
        expect(formatActivityHoursTooltip(0)).toBe('0 hours');
    });
});

describe('tracker and activity hover tooltips', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        mountTrackerPageDOM();
        appState.skills = {};
        appState.activeSkillId = null;
        document.getElementById('hour-tooltip')?.remove();
    });

    it('shows punch date and activity label on circle hover without hour count', () => {
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
        expect(tooltip.textContent).not.toMatch(/hours/);
        expect(tooltip.textContent).toMatch(/2026|Jul/);
        expect(formatTrackerCircleTooltip(skill.loggedHoursData[1], 'Practice/Drills')).toMatch(
            /Jul.*2026.*Practice\/Drills|Practice\/Drills.*Jul.*2026/
        );
    });

    it('shows activity hour count when hovering an activity row', () => {
        const skill = createTestSkill();
        skill.loggedHoursData = {
            1: createLoggedHour('act0', '2026-07-21'),
            2: createLoggedHour('act0', '2026-07-22'),
            3: createLoggedHour('act1', '2026-07-23'),
        };
        appState.skills.skill_1 = skill;
        appState.activeSkillId = 'skill_1';

        renderActivityList();

        const row = document.getElementById('act-row-act0');
        expect(row).not.toBeNull();

        row.dispatchEvent(new Event('mouseenter', { bubbles: true }));

        const tooltip = document.getElementById('hour-tooltip');
        expect(tooltip).not.toBeNull();
        expect(tooltip.hidden).toBe(false);
        expect(tooltip.textContent).toBe('2 hours');
    });
});
