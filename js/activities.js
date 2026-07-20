import { ORB_COLORS } from './constants.js';
import { getSwatchDisplayOrder } from './orb-palette.js';
import { getActiveSkill, saveState } from './state.js';
import { escapeHTML } from './utils.js';
import { renderDashboard } from './render.js';
import { assembleTrackerGrid, recalculateCounters } from './tracker.js';
import { syncControlsSidebarHeight } from './sidebar-layout.js';
import { t, getColorName } from './i18n.js';
import { isSkillComplete, getActivityHoursSummary } from './hundred-hour.js';

let pickerTargetId = null;
let dragFromHandle = false;

function clearDragFromHandle() {
    dragFromHandle = false;
}

export function buildSwatchGrid() {
    const grid = document.getElementById('color-swatch-grid');
    grid.innerHTML = '';

    getSwatchDisplayOrder(ORB_COLORS.length).forEach((index) => {
        const orb = ORB_COLORS[index];
        const swatch = document.createElement('button');
        swatch.type = 'button';
        swatch.className = 'color-swatch';
        swatch.style.background = orb.gradient;
        swatch.title = getColorName(index);
        swatch.dataset.colorIndex = String(index);
        swatch.addEventListener('click', () => assignColorToActivity(index));
        grid.appendChild(swatch);
    });
}

export function renderActivityList() {
    const current = getActiveSkill();
    const list = document.getElementById('activity-list');
    list.innerHTML = '';

    if (!current) return;

    if (isSkillComplete(current)) {
        renderActivitySummary(current, list);
        return;
    }

    current.activities.forEach((act) => {
        const gradient = ORB_COLORS[act.colorIndex].gradient;
        const isSelected = act.id === current.activeActivityId;

        const row = document.createElement('div');
        row.className = `activity-row${isSelected ? ' selected' : ''}`;
        row.id = `act-row-${act.id}`;
        row.draggable = true;
        row.innerHTML = `
            <div class="activity-row-left">
                <span class="activity-drag-handle" title="${t('reorderActivity')}" aria-label="${t('reorderActivity')}" role="button" tabindex="-1"></span>
                <div class="color-preview-dot" id="dot-${act.id}" style="background:${gradient}; border:none;"></div>
                <input type="text" class="activity-label-input" value="${escapeHTML(act.label)}">
            </div>
            <div class="activity-row-right">
                <button type="button" class="delete-activity-btn" title="${t('removeActivity')}">&times;</button>
                <div class="radio-indicator"></div>
            </div>
        `;

        const handle = row.querySelector('.activity-drag-handle');
        handle.addEventListener('mousedown', () => {
            dragFromHandle = true;
            window.addEventListener('mouseup', clearDragFromHandle, { once: true });
        });

        row.addEventListener('dragstart', (event) => {
            if (!dragFromHandle) {
                event.preventDefault();
                return;
            }
            row.classList.add('dragging');
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', act.id);
        });

        row.addEventListener('dragend', () => {
            clearDragFromHandle();
            row.classList.remove('dragging');
            syncActivityOrderFromDom();
        });

        row.addEventListener('dragover', (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';

            const dragging = list.querySelector('.activity-row.dragging');
            if (!dragging || dragging === row) return;

            const rect = row.getBoundingClientRect();
            const placeAfter = event.clientY > rect.top + rect.height / 2;
            if (placeAfter) {
                row.after(dragging);
            } else {
                row.before(dragging);
            }
        });

        row.addEventListener('drop', (event) => {
            event.preventDefault();
        });

        row.querySelector('.color-preview-dot').addEventListener('click', (event) => {
            openColorPicker(event, act.id);
        });

        const labelInput = row.querySelector('.activity-label-input');
        labelInput.addEventListener('change', () => renameActivity(act.id, labelInput.value));
        labelInput.addEventListener('mousedown', (event) => event.stopPropagation());
        labelInput.addEventListener('focus', () => selectActivity(act.id, { rerender: false }));

        row.querySelector('.delete-activity-btn').addEventListener('click', (event) => {
            deleteActivity(event, act.id);
        });

        row.querySelector('.radio-indicator').addEventListener('click', () => selectActivity(act.id));

        list.appendChild(row);
    });

    syncControlsSidebarHeight();
}

export function syncActivityOrderFromDom() {
    const current = getActiveSkill();
    if (!current || isSkillComplete(current)) return;

    const list = document.getElementById('activity-list');
    if (!list) return;

    const ids = [...list.querySelectorAll('.activity-row')].map((row) => row.id.slice('act-row-'.length));
    const byId = new Map(current.activities.map((activity) => [activity.id, activity]));
    const next = ids.map((id) => byId.get(id)).filter(Boolean);

    if (next.length !== current.activities.length) return;
    if (next.every((activity, index) => activity.id === current.activities[index].id)) return;

    current.activities = next;
    saveState();
}

export function moveActivity(fromId, toIndex) {
    const current = getActiveSkill();
    if (!current) return false;

    const fromIndex = current.activities.findIndex((activity) => activity.id === fromId);
    if (fromIndex < 0 || toIndex < 0 || toIndex >= current.activities.length || fromIndex === toIndex) {
        return false;
    }

    const [moved] = current.activities.splice(fromIndex, 1);
    current.activities.splice(toIndex, 0, moved);
    saveState();
    return true;
}

function renderActivitySummary(skill, list) {
    const summary = getActivityHoursSummary(skill);

    summary.forEach((entry) => {
        const gradient = ORB_COLORS[entry.colorIndex].gradient;
        const row = document.createElement('div');
        row.className = 'activity-summary-row';
        row.innerHTML = `
            <div class="activity-row-left">
                <div class="color-preview-dot" style="background:${gradient}; border:none;"></div>
                <span class="activity-summary-label">${escapeHTML(entry.label)}</span>
            </div>
            <span class="activity-summary-hours">${t('activitySummaryHours', { hours: entry.hours.toLocaleString() })}</span>
        `;
        list.appendChild(row);
    });

    syncControlsSidebarHeight();
}

export function selectActivity(id, { rerender = true } = {}) {
    const current = getActiveSkill();
    if (current.activeActivityId === id) return;

    current.activeActivityId = id;
    saveState();

    if (rerender) {
        renderActivityList();
        return;
    }

    document.querySelectorAll('.activity-row').forEach((activityRow) => {
        activityRow.classList.toggle('selected', activityRow.id === `act-row-${id}`);
    });
}

function renameActivity(id, label) {
    const act = getActiveSkill().activities.find((a) => a.id === id);
    if (act) act.label = label;
    saveState();
}

export function deleteActivity(event, id) {
    event.stopPropagation();
    const current = getActiveSkill();
    if (current.activities.length <= 1) return;

    current.activities = current.activities.filter((a) => a.id !== id);
    if (current.activeActivityId === id) {
        current.activeActivityId = current.activities[0].id;
    }

    Object.keys(current.loggedHoursData).forEach((key) => {
        if (current.loggedHoursData[key] === id) {
            delete current.loggedHoursData[key];
        }
    });

    saveState();
    renderActivityList();
    assembleTrackerGrid();
    recalculateCounters();
    renderDashboard();
}

export function addActivity() {
    const current = getActiveSkill();
    const id = `act${current.actIdCounter++}`;
    const usedIndexes = current.activities.map((a) => a.colorIndex);
    const nextColor = ORB_COLORS.findIndex((_, i) => !usedIndexes.includes(i));

    current.activities.push({
        id,
        label: t('newActivity'),
        colorIndex: nextColor >= 0 ? nextColor : 0,
    });
    current.activeActivityId = id;

    saveState();
    renderActivityList();

    setTimeout(() => {
        const input = document.querySelector(`#act-row-${id} input`);
        if (input) {
            input.focus();
            input.select();
        }
    }, 50);
}

export function openColorPicker(event, actId) {
    event.stopPropagation();
    pickerTargetId = actId;

    const popup = document.getElementById('color-picker-popup');
    popup.classList.add('visible');

    const act = getActiveSkill().activities.find((a) => a.id === actId);
    document.querySelectorAll('.color-swatch').forEach((swatch) => {
        const index = Number(swatch.dataset.colorIndex);
        swatch.classList.toggle('selected', index === act.colorIndex);
    });

    const dot = document.getElementById(`dot-${actId}`);
    const rect = dot.getBoundingClientRect();
    popup.style.top = `${rect.bottom + window.scrollY + 6}px`;
    popup.style.left = `${Math.max(0, rect.left - 10)}px`;
}

function assignColorToActivity(colorIndex) {
    const act = getActiveSkill().activities.find((a) => a.id === pickerTargetId);
    if (act) {
        act.colorIndex = colorIndex;
        document.querySelectorAll('.hour-circle').forEach((el) => {
            if (el.dataset.actId === pickerTargetId) {
                el.style.background = ORB_COLORS[colorIndex].gradient;
            }
        });
    }

    closeColorPicker();
    saveState();
    renderActivityList();
}

export function closeColorPicker() {
    document.getElementById('color-picker-popup').classList.remove('visible');
    pickerTargetId = null;
}
