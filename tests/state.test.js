import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEY } from '../js/constants.js';
import {
    appState,
    createHundredHourBlock,
    createInitialSkillData,
    getActiveSkill,
    loadState,
    migrateSkill,
    saveState,
} from '../js/state.js';

describe('state persistence', () => {
    beforeEach(() => {
        localStorage.clear();
        appState.activeSkillId = null;
        appState.skills = {};
    });

    it('creates a skill with default activities and an active block', () => {
        const skill = createInitialSkillData('Violin');

        expect(skill.name).toBe('Violin');
        expect(skill.activities).toHaveLength(3);
        expect(skill.hundredHourBlocks).toHaveLength(1);
        expect(skill.hundredHourBlocks[0].status).toBe('active');
        expect(skill.currentBlockId).toBe(skill.hundredHourBlocks[0].id);
        expect(skill.activities.map((activity) => activity.colorIndex)).toEqual([0, 2, 9]);
    });

    it('saves and loads app state from localStorage', () => {
        const skill = createInitialSkillData('Drawing');
        appState.skills.skill_1 = skill;
        appState.activeSkillId = 'skill_1';

        saveState();

        appState.activeSkillId = null;
        appState.skills = {};
        loadState();

        expect(appState.activeSkillId).toBe('skill_1');
        expect(getActiveSkill()?.name).toBe('Drawing');
        expect(localStorage.getItem(STORAGE_KEY)).toContain('"Drawing"');
    });

    it('starts with no skills when no saved state exists', () => {
        loadState();

        expect(appState.activeSkillId).toBeNull();
        expect(Object.keys(appState.skills)).toHaveLength(0);
        expect(getActiveSkill()).toBeNull();
    });

    it('migrates legacy skill data into hundred-hour blocks', () => {
        const legacySkill = {
            name: 'Legacy Skill',
            actIdCounter: 5,
            activeActivityId: 'act0',
            activities: [{ id: 'act0', label: 'Practice', colorIndex: 0 }],
            loggedHoursData: Object.fromEntries(Array.from({ length: 100 }, (_, i) => [String(i + 1), 'act0'])),
            prompts: { purpose: '', identity: '', starting: '', endurance: '', negotiables: '' },
            reflections: { breakthrough: 'Big insight', pivot: 'New direction' },
        };

        migrateSkill(legacySkill);

        expect(legacySkill.hundredHourBlocks).toHaveLength(1);
        expect(legacySkill.hundredHourBlocks[0].status).toBe('awaiting-reflection');
        expect(legacySkill.hundredHourBlocks[0].reflect.lessons).toBe('Big insight');
        expect(legacySkill.hundredHourBlocks[0].reflect.growth).toBe('New direction');
        expect(legacySkill.reflections).toBeUndefined();
    });

    it('normalizes skills with 100 completed blocks by trimming extra blocks and stray hours', () => {
        const skill = createInitialSkillData('Mastery');
        skill.hundredHourBlocks = Array.from({ length: 101 }, (_, index) => {
            const block = createHundredHourBlock(index + 1);
            block.status = 'completed';
            block.loggedHours = Object.fromEntries(
                Array.from({ length: 100 }, (_, hourIndex) => [String(hourIndex + 1), 'act0'])
            );
            block.reflect.finishDate = '04/10/2026';
            return block;
        });
        skill.currentBlockId = skill.hundredHourBlocks[100].id;
        skill.loggedHoursData = { '1': 'act1' };

        migrateSkill(skill);

        expect(skill.hundredHourBlocks).toHaveLength(100);
        expect(skill.hundredHourBlocks.at(-1)?.cycleNumber).toBe(100);
        expect(skill.loggedHoursData).toEqual({});
        expect(skill.completedAt).toBe('04/10/2026');
        expect(skill.currentBlockId).toBe(skill.hundredHourBlocks[99].id);
    });

    it('remaps legacy mint and aqua color indices on migrate', () => {
        const skill = createInitialSkillData('Colors');
        skill.colorPaletteVersion = 1;
        skill.activities[0].colorIndex = 1;
        skill.activities[1].colorIndex = 4;
        skill.activities[2].colorIndex = 11;

        migrateSkill(skill);

        expect(skill.activities.map((activity) => activity.colorIndex)).toEqual([0, 2, 9]);
        expect(skill.colorPaletteVersion).toBe(2);
    });
});
