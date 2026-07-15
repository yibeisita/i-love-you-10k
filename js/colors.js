import { ORB_COLORS } from './constants.js';
import { getActiveSkill } from './state.js';

function findActivityForSkill(skill, actId, block) {
    if (block?.archivedActivities?.length) {
        const archived = block.archivedActivities.find((act) => act.id === actId);
        if (archived) return archived;
    }

    return skill?.activities.find((act) => act.id === actId) ?? null;
}

export function getActivityLabelForSkill(skill, actId, block = null) {
    return findActivityForSkill(skill, actId, block)?.label ?? '';
}

export function getActivityGradientForSkill(skill, actId, block = null) {
    const act = findActivityForSkill(skill, actId, block);
    return act ? ORB_COLORS[act.colorIndex].gradient : '';
}

export function getActivityGradient(actId) {
    return getActivityGradientForSkill(getActiveSkill(), actId);
}
