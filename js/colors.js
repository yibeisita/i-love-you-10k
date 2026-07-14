import { ORB_COLORS } from './constants.js';
import { getActiveSkill } from './state.js';

export function getActivityLabelForSkill(skill, actId) {
    const act = skill?.activities.find((a) => a.id === actId);
    return act?.label ?? '';
}

export function getActivityGradientForSkill(skill, actId) {
    const act = skill?.activities.find((a) => a.id === actId);
    return act ? ORB_COLORS[act.colorIndex].gradient : '';
}

export function getActivityGradient(actId) {
    return getActivityGradientForSkill(getActiveSkill(), actId);
}
