import { STORAGE_KEY } from './constants.js';

export const appState = {
    activeSkillId: null,
    skills: {},
};

export function createHundredHourBlock(cycleNumber) {
    return {
        id: `block_${Date.now()}_${cycleNumber}`,
        cycleNumber,
        status: 'active',
        start: {
            startDate: '',
            guidelines: '',
            achieve: '',
            habitsLeaving: '',
        },
        reflect: {
            finishDate: '',
            bestMoments: '',
            appreciate: '',
            lessons: '',
            expectations: '',
            growth: '',
            rating: '',
            win1: '',
            win2: '',
            win3: '',
        },
        loggedHours: {},
        archivedActivities: [],
    };
}

export function createInitialSkillData(name) {
    const block = createHundredHourBlock(1);

    return {
        name,
        actIdCounter: 5,
        activeActivityId: 'act0',
        activities: [
            { id: 'act0', label: 'Practice/Drills', colorIndex: 0 },
            { id: 'act1', label: 'Theory/Study', colorIndex: 4 },
            { id: 'act2', label: 'Free Flow/Form', colorIndex: 11 },
        ],
        loggedHoursData: {},
        prompts: { purpose: '', identity: '', starting: '', endurance: '', negotiables: '' },
        currentBlockId: block.id,
        hundredHourBlocks: [block],
    };
}

function snapshotBlockActivities(skill, block) {
    const usedActIds = new Set(Object.values(block.loggedHours || {}));
    block.archivedActivities = skill.activities
        .filter((act) => usedActIds.has(act.id))
        .map((act) => ({ id: act.id, label: act.label, colorIndex: act.colorIndex }));
}

function backfillArchivedActivities(skill) {
    skill.hundredHourBlocks.forEach((block) => {
        if (block.status !== 'completed' || block.archivedActivities?.length) return;

        snapshotBlockActivities(skill, block);
    });
}

export function migrateSkill(skill) {
    if (!skill.hundredHourBlocks) {
        const block = createHundredHourBlock(1);
        block.loggedHours = { ...(skill.loggedHoursData || {}) };

        if (Object.keys(skill.loggedHoursData || {}).length >= 100) {
            block.status = 'awaiting-reflection';
        }

        if (skill.reflections) {
            block.reflect.lessons = skill.reflections.breakthrough || '';
            block.reflect.growth = skill.reflections.pivot || '';
        }

        skill.currentBlockId = block.id;
        skill.hundredHourBlocks = [block];
        delete skill.reflections;
    }

    backfillArchivedActivities(skill);
    return skill;
}

export function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const parsed = JSON.parse(saved);
        appState.activeSkillId = parsed.activeSkillId;
        appState.skills = parsed.skills;
        Object.values(appState.skills).forEach(migrateSkill);
        return;
    }

    const id = `skill_${Date.now()}`;
    appState.skills[id] = createInitialSkillData('Italian');
    appState.activeSkillId = id;
}

export function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

export function getActiveSkill() {
    return appState.skills[appState.activeSkillId] ?? null;
}
