import { createInitialSkillData } from '../../js/state.js';

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
