import { describe, expect, it } from 'vitest';
import { getActivityGradientForSkill, getActivityLabelForSkill } from '../js/colors.js';
import { completeBlockAndStartNew } from '../js/hundred-hour.js';
import { createTestSkill, logHours } from './helpers/fixtures.js';

describe('activity colors', () => {
    it('returns labels and gradients for current activities', () => {
        const skill = createTestSkill();

        expect(getActivityLabelForSkill(skill, 'act0')).toBeTruthy();
        expect(getActivityGradientForSkill(skill, 'act0')).toContain('radial-gradient');
    });

    it('uses archived activities for completed blocks', () => {
        const skill = createTestSkill();
        skill.activities[0].label = 'Custom Practice';

        logHours(skill, 100, 'act0');
        completeBlockAndStartNew(skill);

        const completedBlock = skill.hundredHourBlocks[0];
        expect(getActivityLabelForSkill(skill, 'act0', completedBlock)).toBe('Custom Practice');
    });
});
