import { createInitialSkillData, createHundredHourBlock } from '../../js/state.js';
import { getCurrentBlock, completeBlockAndStartNew } from '../../js/hundred-hour.js';

export function createTestSkill(name = 'Piano') {
    return createInitialSkillData(name);
}

export function fillSetupPrompts(skill) {
    skill.prompts = {
        purpose: 'Why',
        identity: 'Who',
        starting: 'Where',
        endurance: 'How',
        negotiables: 'What',
    };
    return skill;
}

export function fillBlockStart(block) {
    block.start = {
        startDate: '01/01/2026',
        guidelines: 'Practice daily',
        achieve: 'Improve technique',
        habitsLeaving: 'Procrastination',
    };
    return block;
}

export function fillBlockReflect(block) {
    block.reflect = {
        finishDate: '04/10/2026',
        bestMoments: 'Breakthrough week',
        appreciate: 'Support',
        lessons: 'Consistency',
        expectations: 'Met them',
        growth: 'Rhythm',
        rating: '8',
        win1: 'One',
        win2: 'Two',
        win3: 'Three',
    };
    return block;
}

export function logHours(skill, count, actId = 'act0') {
    for (let hour = 1; hour <= count; hour += 1) {
        skill.loggedHoursData[String(hour)] = actId;
    }
    return skill;
}

export function createSkillAtFinalBlock(name = 'Piano') {
    const skill = createTestSkill(name);
    fillSetupPrompts(skill);

    for (let cycle = 1; cycle < 100; cycle += 1) {
        const block = getCurrentBlock(skill);
        fillBlockStart(block);
        logHours(skill, 100, cycle % 2 === 0 ? 'act0' : 'act1');
        fillBlockReflect(block);
        completeBlockAndStartNew(skill);
    }

    const finalBlock = getCurrentBlock(skill);
    fillBlockStart(finalBlock);
    return skill;
}

export function completeSkillToTenThousand(skill) {
    const block = getCurrentBlock(skill);
    if (Object.keys(skill.loggedHoursData || {}).length < 100) {
        logHours(skill, 100);
    }
    fillBlockReflect(block);
    return completeBlockAndStartNew(skill);
}
