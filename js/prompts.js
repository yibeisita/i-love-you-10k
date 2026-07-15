import { getActiveSkill, saveState } from './state.js';
import { renderDashboard } from './render.js';
import { setView } from './views.js';
import { syncControlsSidebarHeight } from './sidebar-layout.js';
import { t, tCount } from './i18n.js';
import {
    getCurrentBlock,
    getBlockById,
    getCompletedBlocks,
    isReflectingSectionUnlocked,
    isBlockReflectComplete,
} from './hundred-hour.js';

let viewingBlockId = null;

const SETUP_FIELDS = [
    { id: 'setup-purpose', key: 'purpose' },
    { id: 'setup-identity', key: 'identity' },
    { id: 'setup-starting', key: 'starting' },
    { id: 'setup-endurance', key: 'endurance' },
    { id: 'setup-negotiables', key: 'negotiables' },
];

const BLOCK_START_FIELDS = [
    { id: 'block-start-date', key: 'startDate' },
    { id: 'block-guidelines', key: 'guidelines' },
    { id: 'block-achieve', key: 'achieve' },
    { id: 'block-habits', key: 'habitsLeaving' },
];

const BLOCK_REFLECT_FIELDS = [
    { id: 'block-finish-date', key: 'finishDate' },
    { id: 'block-best-moments', key: 'bestMoments' },
    { id: 'block-appreciate', key: 'appreciate' },
    { id: 'block-lessons', key: 'lessons' },
    { id: 'block-expectations', key: 'expectations' },
    { id: 'block-growth', key: 'growth' },
    { id: 'block-rating', key: 'rating' },
    { id: 'block-win-1', key: 'win1' },
    { id: 'block-win-2', key: 'win2' },
    { id: 'block-win-3', key: 'win3' },
];

function getViewingBlock(skill) {
    const blockId = viewingBlockId ?? skill.currentBlockId;
    return getBlockById(skill, blockId) ?? getCurrentBlock(skill);
}

function isViewingCurrentBlock(skill, block) {
    return block?.id === skill.currentBlockId;
}

function loadSetupFields(skill) {
    SETUP_FIELDS.forEach(({ id, key }) => {
        const el = document.getElementById(id);
        if (el) el.value = skill.prompts[key] || '';
    });
}

function loadBlockFields(block) {
    BLOCK_START_FIELDS.forEach(({ id, key }) => {
        const el = document.getElementById(id);
        if (el) el.value = block.start[key] || '';
    });

    BLOCK_REFLECT_FIELDS.forEach(({ id, key }) => {
        const el = document.getElementById(id);
        if (el) el.value = block.reflect[key] || '';
    });
}

function updateReflectionPageState(skill, block) {
    const cycleLabel = document.getElementById('reflection-cycle-label');
    const reflectingSection = document.getElementById('reflecting-section');
    const completeBtn = document.getElementById('complete-reflection-btn');
    const sidebarReflection = document.getElementById('sidebar-reflection-desc');
    const currentBlock = getCurrentBlock(skill);
    const viewingCurrent = isViewingCurrentBlock(skill, block);

    if (cycleLabel) {
        cycleLabel.textContent = t('blockLabel', { n: block.cycleNumber });
    }

    if (sidebarReflection && currentBlock) {
        sidebarReflection.textContent = t('sidebarReflectionDesc', { n: currentBlock.cycleNumber });
    }

    const unlocked = isReflectingSectionUnlocked(block);
    reflectingSection?.classList.toggle('locked', !unlocked);

    if (completeBtn) {
        const showComplete =
            viewingCurrent &&
            block.status === 'awaiting-reflection' &&
            isBlockReflectComplete(block);
        completeBtn.hidden = !showComplete;
    }

    BLOCK_START_FIELDS.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) el.disabled = !viewingCurrent && block.status === 'completed';
    });

    BLOCK_REFLECT_FIELDS.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) el.disabled = !unlocked;
    });

    updateReflectionNavState(skill, block);
}

export function renderReflectionBlockNav(skill) {
    const nav = document.getElementById('reflection-block-nav');
    if (!nav) return;

    nav.innerHTML = '';
    const completedBlocks = getCompletedBlocks(skill);

    completedBlocks.forEach((block) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'reflection-block-nav-btn';
        btn.dataset.blockId = block.id;
        btn.textContent = t('blockLabel', { n: block.cycleNumber });
        btn.addEventListener('click', () => openReflectionBlock(block.id));
        nav.appendChild(btn);
    });

    syncControlsSidebarHeight();
}

function updateReflectionNavState(skill, block) {
    const currentBtn = document.getElementById('reflection-current-btn');
    const viewingCurrent = isViewingCurrentBlock(skill, block);

    currentBtn?.classList.toggle('active', viewingCurrent);

    document.querySelectorAll('.reflection-block-nav-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.blockId === block.id);
    });
}

export function resetViewingBlock() {
    viewingBlockId = null;
}

export function openCurrentReflection() {
    const skill = getActiveSkill();
    if (!skill) return;

    viewingBlockId = skill.currentBlockId;
    loadReflectionBlockIntoUI();
    setView('reflection');
}

export function openReflectionBlock(blockId) {
    viewingBlockId = blockId;
    loadReflectionBlockIntoUI();
    setView('reflection');
}

export function loadReflectionBlockIntoUI() {
    const skill = getActiveSkill();
    if (!skill) return;

    const block = getViewingBlock(skill);
    if (!block) return;

    loadBlockFields(block);
    updateReflectionPageState(skill, block);
}

export function loadPromptsIntoUI() {
    const skill = getActiveSkill();
    if (!skill) return;

    loadSetupFields(skill);
    renderReflectionBlockNav(skill);

    const block = getViewingBlock(skill);
    if (!block) return;

    loadBlockFields(block);
    updateReflectionPageState(skill, block);
}

export function saveCurrentPrompts() {
    const skill = getActiveSkill();
    if (!skill) return;

    SETUP_FIELDS.forEach(({ id, key }) => {
        const el = document.getElementById(id);
        if (el) skill.prompts[key] = el.value;
    });

    const block = getViewingBlock(skill);
    if (block) {
        BLOCK_START_FIELDS.forEach(({ id, key }) => {
            const el = document.getElementById(id);
            if (el && !el.disabled) block.start[key] = el.value;
        });

        BLOCK_REFLECT_FIELDS.forEach(({ id, key }) => {
            const el = document.getElementById(id);
            if (el && !el.disabled) block.reflect[key] = el.value;
        });

        updateReflectionPageState(skill, block);
    }

    saveState();
    renderDashboard();
}

export function scrollToReflectingSection() {
    document.getElementById('reflecting-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
