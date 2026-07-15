import { saveState, createHundredHourBlock } from './state.js';

function snapshotBlockActivities(skill, block) {
    const usedActIds = new Set(Object.values(block.loggedHours || {}));
    block.archivedActivities = skill.activities
        .filter((act) => usedActIds.has(act.id))
        .map((act) => ({ id: act.id, label: act.label, colorIndex: act.colorIndex }));
}

export function getBlockById(skill, blockId) {
    return skill.hundredHourBlocks.find((block) => block.id === blockId) ?? null;
}

export function getCompletedBlocks(skill) {
    return skill.hundredHourBlocks
        .filter((block) => block.status === 'completed')
        .sort((a, b) => a.cycleNumber - b.cycleNumber);
}

export function getCurrentBlock(skill) {
    return skill.hundredHourBlocks.find((block) => block.id === skill.currentBlockId) ?? null;
}

export function getBlockMilestoneHours(block) {
    return (block?.cycleNumber ?? 1) * 100;
}

export function getCurrentBlockHours(skill) {
    return Object.keys(skill.loggedHoursData || {}).length;
}

export function getTotalHours(skill) {
    const completedHours = skill.hundredHourBlocks.filter((block) => block.status === 'completed').length * 100;
    return completedHours + getCurrentBlockHours(skill);
}

export function isSetupComplete(skill) {
    return ['purpose', 'identity', 'starting', 'endurance', 'negotiables'].every(
        (key) => (skill.prompts[key] || '').trim().length > 0
    );
}

export function isBlockStartComplete(block) {
    return Object.values(block.start).every((value) => (value || '').trim().length > 0);
}

export function isBlockReflectComplete(block) {
    return Object.values(block.reflect).every((value) => (value || '').trim().length > 0);
}

export function completeBlockAndStartNew(skill) {
    const block = getCurrentBlock(skill);
    if (!block) return null;

    block.loggedHours = { ...skill.loggedHoursData };
    snapshotBlockActivities(skill, block);
    block.status = 'completed';

    skill.loggedHoursData = {};

    const newBlock = createHundredHourBlock(block.cycleNumber + 1);
    skill.hundredHourBlocks.push(newBlock);
    skill.currentBlockId = newBlock.id;
    saveState();

    return newBlock;
}

export function checkHundredHourMilestone(skill) {
    if (getCurrentBlockHours(skill) !== 100) return false;

    const block = getCurrentBlock(skill);
    if (!block || block.status !== 'active') return false;

    block.status = 'awaiting-reflection';
    saveState();
    return true;
}

export function resolveTrackerEntryView(skill) {
    if (!isSetupComplete(skill)) return 'setup';

    const block = getCurrentBlock(skill);
    if (!block) return 'landing';

    if (!isBlockStartComplete(block)) return 'reflection';
    if (block.status === 'awaiting-reflection' && !isBlockReflectComplete(block)) return 'reflection';

    return 'landing';
}

export function isReflectingSectionUnlocked(block) {
    return block.status === 'awaiting-reflection' || block.status === 'completed';
}
