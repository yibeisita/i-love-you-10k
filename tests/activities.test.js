import { beforeEach, describe, expect, it } from 'vitest';
import { appState } from '../js/state.js';
import { moveActivity } from '../js/activities.js';
import { createTestSkill } from './helpers/fixtures.js';

describe('activity reorder', () => {
    beforeEach(() => {
        localStorage.clear();
        const skill = createTestSkill('Piano');
        appState.skills = { skill_1: skill };
        appState.activeSkillId = 'skill_1';
    });

    it('moves an activity to a new index and persists order', () => {
        const skill = appState.skills.skill_1;
        expect(skill.activities.map((a) => a.id)).toEqual(['act0', 'act1', 'act2']);

        expect(moveActivity('act2', 0)).toBe(true);
        expect(skill.activities.map((a) => a.id)).toEqual(['act2', 'act0', 'act1']);

        const saved = JSON.parse(localStorage.getItem('cosmic_multi_10k_state'));
        expect(saved.skills.skill_1.activities.map((a) => a.id)).toEqual(['act2', 'act0', 'act1']);
    });

    it('does nothing for invalid moves', () => {
        const skill = appState.skills.skill_1;
        expect(moveActivity('act0', 0)).toBe(false);
        expect(moveActivity('missing', 1)).toBe(false);
        expect(moveActivity('act0', 99)).toBe(false);
        expect(skill.activities.map((a) => a.id)).toEqual(['act0', 'act1', 'act2']);
    });
});
