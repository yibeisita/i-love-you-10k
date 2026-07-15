import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import {
    checkHundredHourMilestone,
    completeBlockAndStartNew,
    getBlockMilestoneHours,
    getCompletedBlocks,
    getCurrentBlock,
    getTotalHours,
    isBlockReflectComplete,
    isBlockStartComplete,
    isReflectingSectionUnlocked,
    isSetupComplete,
    resolveTrackerEntryView,
} from '../js/hundred-hour.js';
import { createTestSkill, fillBlockReflect, fillBlockStart, fillSetupPrompts, logHours } from './helpers/fixtures.js';

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
});
