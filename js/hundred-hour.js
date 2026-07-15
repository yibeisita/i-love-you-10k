import { saveState, createHundredHourBlock } from './state.js';

export const MAX_BLOCKS = 100;
export const MAX_HOURS = 10000;

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
    const total = completedHours + getCurrentBlockHours(skill);
    if (isSkillComplete(skill)) return Math.min(total, MAX_HOURS);
    return total;
}

export function isLoggingAllowed(skill) {
    if (!skill || isSkillComplete(skill)) return false;

    const block = getCurrentBlock(skill);
    if (!block || block.status !== 'active') return false;

    return getTotalHours(skill) < MAX_HOURS;
}

export function normalizeSkillCompletion(skill) {
    const completedBlocks = skill.hundredHourBlocks.filter((block) => block.status === 'completed');
    if (completedBlocks.length < MAX_BLOCKS) return skill;

    skill.hundredHourBlocks = skill.hundredHourBlocks
        .filter((block) => block.cycleNumber <= MAX_BLOCKS)
        .sort((a, b) => a.cycleNumber - b.cycleNumber);

    skill.loggedHoursData = {};

    const block100 =
        skill.hundredHourBlocks.find((block) => block.cycleNumber === MAX_BLOCKS && block.status === 'completed') ??
        completedBlocks.sort((a, b) => a.cycleNumber - b.cycleNumber).at(-1);

    if (block100) {
        skill.currentBlockId = block100.id;
    }

    if (!skill.completedAt) {
        skill.completedAt = block100?.reflect?.finishDate?.trim() || 'complete';
    }

    return skill;
}

export function isSkillComplete(skill) {
    if (!skill) return false;
    if (skill.completedAt) return true;

    const completedBlocks = getCompletedBlocks(skill);
    if (completedBlocks.length >= MAX_BLOCKS) return true;

    return completedBlocks.some((block) => block.cycleNumber >= MAX_BLOCKS);
}

export function isFinalBlock(block) {
    return (block?.cycleNumber ?? 0) >= MAX_BLOCKS;
}

export function getSkillEndDate(skill) {
    if (!isSkillComplete(skill)) return null;

    const blocks = getCompletedBlocks(skill);
    const lastBlock = blocks[blocks.length - 1];
    const finishDate = lastBlock?.reflect?.finishDate?.trim();
    if (finishDate) return finishDate;

    const completedAt = skill.completedAt?.trim();
    return completedAt || null;
}

export function getFinalHourActivity(skill) {
    const block100 =
        getCompletedBlocks(skill).find((block) => block.cycleNumber === MAX_BLOCKS) ??
        getCompletedBlocks(skill).at(-1) ??
        null;

    if (!block100?.loggedHours) {
        return { actId: null, block: block100 };
    }

    const actId =
        block100.loggedHours['100'] ??
        block100.loggedHours[100] ??
        Object.entries(block100.loggedHours)
            .sort(([hourA], [hourB]) => Number(hourB) - Number(hourA))
            .map(([, id]) => id)[0] ??
        null;

    return { actId, block: block100 };
}

export function getActivityHoursSummary(skill) {
    const counts = {};

    skill.hundredHourBlocks.forEach((block) => {
        const hours =
            block.status === 'completed'
                ? block.loggedHours
                : block.id === skill.currentBlockId
                  ? skill.loggedHoursData
                  : {};

        Object.values(hours || {}).forEach((actId) => {
            counts[actId] = (counts[actId] || 0) + 1;
        });
    });

    const activityById = new Map(skill.activities.map((act) => [act.id, act]));

    skill.hundredHourBlocks.forEach((block) => {
        (block.archivedActivities || []).forEach((act) => {
            if (!activityById.has(act.id)) {
                activityById.set(act.id, act);
            }
        });
    });

    return Object.entries(counts)
        .map(([id, hours]) => {
            const act = activityById.get(id);
            return {
                id,
                label: act?.label ?? id,
                colorIndex: act?.colorIndex ?? 0,
                hours,
            };
        })
        .sort((a, b) => b.hours - a.hours);
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
    if (!block) return { skillCompleted: false };

    block.loggedHours = { ...skill.loggedHoursData };
    snapshotBlockActivities(skill, block);
    block.status = 'completed';

    skill.loggedHoursData = {};

    if (isFinalBlock(block)) {
        skill.completedAt = block.reflect.finishDate?.trim() || new Date().toISOString().slice(0, 10);
        saveState();
        return { skillCompleted: true };
    }

    const newBlock = createHundredHourBlock(block.cycleNumber + 1);
    skill.hundredHourBlocks.push(newBlock);
    skill.currentBlockId = newBlock.id;
    saveState();

    return { skillCompleted: false, newBlock };
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
    if (isSkillComplete(skill)) return 'landing';

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
