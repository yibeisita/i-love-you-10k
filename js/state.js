import { STORAGE_KEY } from './constants.js';
import { getDefaultActivityLabels } from './i18n.js';
import { migrateLegacyColorIndex } from './orb-palette.js';

const MAX_BLOCKS = 100;
const COLOR_PALETTE_VERSION = 2;

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
    const [practice, theory, freeFlow] = getDefaultActivityLabels();

    return {
        name,
        actIdCounter: 5,
        activeActivityId: 'act0',
        activities: [
            { id: 'act0', label: practice, colorIndex: 0 },
            { id: 'act1', label: theory, colorIndex: 2 },
            { id: 'act2', label: freeFlow, colorIndex: 9 },
        ],
        loggedHoursData: {},
        prompts: { purpose: '', identity: '', starting: '', endurance: '', negotiables: '' },
        currentBlockId: block.id,
        hundredHourBlocks: [block],
        colorPaletteVersion: COLOR_PALETTE_VERSION,
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

function normalizeSkillCompletion(skill) {
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

function migrateColorPalette(skill) {
    if ((skill.colorPaletteVersion ?? 1) >= COLOR_PALETTE_VERSION) return skill;

    skill.activities?.forEach((activity) => {
        activity.colorIndex = migrateLegacyColorIndex(activity.colorIndex);
    });

    skill.hundredHourBlocks?.forEach((block) => {
        block.archivedActivities?.forEach((activity) => {
            activity.colorIndex = migrateLegacyColorIndex(activity.colorIndex);
        });
    });

    skill.colorPaletteVersion = COLOR_PALETTE_VERSION;
    return skill;
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
    migrateColorPalette(skill);
    normalizeSkillCompletion(skill);

    return skill;
}

export function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const parsed = JSON.parse(saved);
        appState.activeSkillId = parsed.activeSkillId ?? null;
        appState.skills = parsed.skills ?? {};
        Object.values(appState.skills).forEach(migrateSkill);

        if (appState.activeSkillId && !appState.skills[appState.activeSkillId]) {
            const remainingIds = Object.keys(appState.skills);
            appState.activeSkillId = remainingIds[0] ?? null;
        }
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
