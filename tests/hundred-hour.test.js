import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import {
    checkHundredHourMilestone,
    completeBlockAndStartNew,
    getActivityHoursSummary,
    getBlockMilestoneHours,
    getCompletedBlocks,
    getCurrentBlock,
    getFinalHourActivity,
    getSkillEndDate,
    getTotalHours,
    isBlockReflectComplete,
    isBlockStartComplete,
    isFinalBlock,
    isLoggingAllowed,
    isReflectingSectionUnlocked,
    isSetupComplete,
    isSkillComplete,
    resolveTrackerEntryView,
} from '../js/hundred-hour.js';
import {
    createTestSkill,
    createSkillAtFinalBlock,
    completeSkillToTenThousand,
    fillBlockReflect,
    fillBlockStart,
    fillSetupPrompts,
    logHours,
} from './helpers/fixtures.js';

describe('hundred-hour logic', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('tracks total hours across completed and active blocks', () => {
        const skill = createTestSkill();
        logHours(skill, 25);

        expect(getTotalHours(skill)).toBe(25);

        completeBlockAndStartNew(skill);
        logHours(skill, 10);

        expect(getTotalHours(skill)).toBe(110);
        expect(getCompletedBlocks(skill)).toHaveLength(1);
        expect(isSkillComplete(skill)).toBe(false);
    });

    it('unlocks reflection at 100 logged hours', () => {
        const skill = createTestSkill();
        const block = getCurrentBlock(skill);

        logHours(skill, 100);
        expect(checkHundredHourMilestone(skill)).toBe(true);
        expect(block.status).toBe('awaiting-reflection');
        expect(isReflectingSectionUnlocked(block)).toBe(true);
    });

    it('does not unlock reflection before 100 hours', () => {
        const skill = createTestSkill();
        const block = getCurrentBlock(skill);

        logHours(skill, 99);
        expect(checkHundredHourMilestone(skill)).toBe(false);
        expect(block.status).toBe('active');
    });

    it('resolves tracker entry view based on setup and block progress', () => {
        const skill = createTestSkill();
        const block = getCurrentBlock(skill);

        expect(resolveTrackerEntryView(skill)).toBe('setup');

        fillSetupPrompts(skill);
        expect(resolveTrackerEntryView(skill)).toBe('reflection');

        fillBlockStart(block);
        expect(resolveTrackerEntryView(skill)).toBe('landing');

        block.status = 'awaiting-reflection';
        expect(resolveTrackerEntryView(skill)).toBe('reflection');

        fillBlockReflect(block);
        expect(resolveTrackerEntryView(skill)).toBe('landing');
    });

    it('validates setup and block prompt completion', () => {
        const skill = createTestSkill();
        const block = getCurrentBlock(skill);

        expect(isSetupComplete(skill)).toBe(false);
        fillSetupPrompts(skill);
        expect(isSetupComplete(skill)).toBe(true);

        expect(isBlockStartComplete(block)).toBe(false);
        fillBlockStart(block);
        expect(isBlockStartComplete(block)).toBe(true);

        expect(isBlockReflectComplete(block)).toBe(false);
        fillBlockReflect(block);
        expect(isBlockReflectComplete(block)).toBe(true);
    });

    it('computes milestone hours from cycle number', () => {
        const skill = createTestSkill();
        const block = getCurrentBlock(skill);

        expect(getBlockMilestoneHours(block)).toBe(100);

        completeBlockAndStartNew(skill);
        expect(getBlockMilestoneHours(getCurrentBlock(skill))).toBe(200);
    });

    it('completes the skill on the final block without creating block 101', () => {
        const skill = createSkillAtFinalBlock();
        const block = getCurrentBlock(skill);

        expect(block.cycleNumber).toBe(100);
        expect(isFinalBlock(block)).toBe(true);

        logHours(skill, 100);
        fillBlockReflect(block);

        const { skillCompleted } = completeBlockAndStartNew(skill);

        expect(skillCompleted).toBe(true);
        expect(isSkillComplete(skill)).toBe(true);
        expect(skill.completedAt).toBe('04/10/2026');
        expect(getTotalHours(skill)).toBe(10000);
        expect(skill.hundredHourBlocks).toHaveLength(100);
    });

    it('summarises activity hours across all completed blocks', () => {
        const skill = createSkillAtFinalBlock();
        const block = getCurrentBlock(skill);

        logHours(skill, 60, 'act0');
        for (let hour = 61; hour <= 100; hour += 1) {
            skill.loggedHoursData[String(hour)] = 'act1';
        }
        fillBlockReflect(block);
        completeBlockAndStartNew(skill);

        const summary = getActivityHoursSummary(skill);
        const byId = Object.fromEntries(summary.map((entry) => [entry.id, entry.hours]));

        expect(summary.reduce((total, entry) => total + entry.hours, 0)).toBe(10000);
        expect(byId.act0 + byId.act1).toBe(10000);
        expect(byId.act0).toBeGreaterThan(0);
        expect(byId.act1).toBeGreaterThan(0);
    });

    it('opens completed skills on the landing view', () => {
        const skill = createSkillAtFinalBlock();
        const block = getCurrentBlock(skill);

        logHours(skill, 100);
        fillBlockReflect(block);
        completeBlockAndStartNew(skill);

        expect(resolveTrackerEntryView(skill)).toBe('landing');
    });

    it('disallows logging once 10,000 hours are reached', () => {
        const skill = createSkillAtFinalBlock();
        const block = getCurrentBlock(skill);

        logHours(skill, 100);
        fillBlockReflect(block);
        completeBlockAndStartNew(skill);

        expect(getTotalHours(skill)).toBe(10000);
        expect(isLoggingAllowed(skill)).toBe(false);
    });

    it('disallows logging on the milestone circle at 10,000 hours before completion', () => {
        const skill = createSkillAtFinalBlock();

        logHours(skill, 100);

        expect(getTotalHours(skill)).toBe(10000);
        expect(isLoggingAllowed(skill)).toBe(false);
    });

    it('resolves the activity for the 10,000th logged hour from block 100', () => {
        const skill = createSkillAtFinalBlock();
        const block = getCurrentBlock(skill);

        logHours(skill, 99, 'act0');
        skill.loggedHoursData['100'] = 'act2';
        fillBlockReflect(block);
        completeBlockAndStartNew(skill);

        expect(getFinalHourActivity(skill)).toEqual({ actId: 'act2', block: expect.objectContaining({ cycleNumber: 100 }) });
    });

    it('treats a skill as complete when completedAt is set', () => {
        const skill = createTestSkill();
        skill.completedAt = '04/10/2026';

        expect(isSkillComplete(skill)).toBe(true);
    });

    it('returns the finish date from block 100 for completed skills', () => {
        const skill = createSkillAtFinalBlock();
        completeSkillToTenThousand(skill);

        expect(getSkillEndDate(skill)).toBe('04/10/2026');
    });

    it('caps displayed total hours at 10,000 for completed skills with stray logged data', () => {
        const skill = createSkillAtFinalBlock();
        completeSkillToTenThousand(skill);
        skill.loggedHoursData = { '1': 'act0' };

        expect(getTotalHours(skill)).toBe(10000);
    });
});
