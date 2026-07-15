import { ORB_COLORS } from './constants.js';
import { getActiveSkill, saveState } from './state.js';
import { escapeHTML } from './utils.js';
import { renderDashboard } from './render.js';
import { assembleTrackerGrid, recalculateCounters } from './tracker.js';
import { syncControlsSidebarHeight } from './sidebar-layout.js';
import { t, getColorName } from './i18n.js';
import { isSkillComplete, getActivityHoursSummary } from './hundred-hour.js';

let pickerTargetId = null;

export function buildSwatchGrid() {
    const grid = document.getElementById('color-swatch-grid');
    grid.innerHTML = '';

    ORB_COLORS.forEach((orb, index) => {
        const swatch = document.createElement('button');
        swatch.type = 'button';
        swatch.className = 'color-swatch';
        swatch.style.background = orb.gradient;
        swatch.title = getColorName(index);
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
        row.innerHTML = `
            <div class="activity-row-left">
                <div class="color-preview-dot" id="dot-${act.id}" style="background:${gradient}; border:none;"></div>
                <input type="text" class="activity-label-input" value="${escapeHTML(act.label)}">
            </div>
            <div class="activity-row-right">
                <button type="button" class="delete-activity-btn" title="${t('removeActivity')}">&times;</button>
                <div class="radio-indicator"></div>
            </div>
        `;

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
    document.querySelectorAll('.color-swatch').forEach((swatch, index) => {
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
