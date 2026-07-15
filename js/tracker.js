import { getActiveSkill, saveState } from './state.js';
import { getActivityGradient } from './colors.js';
import { renderDashboard } from './render.js';
import { getTotalHours, checkHundredHourMilestone, getCurrentBlock, getBlockMilestoneHours } from './hundred-hour.js';
import { openCurrentReflection, scrollToReflectingSection } from './prompts.js';
import { playPunchSound } from './sound.js';
import { syncControlsSidebarHeight } from './sidebar-layout.js';

export function assembleTrackerGrid() {
    const gridTarget = document.getElementById('hour-grid-target');
    gridTarget.innerHTML = '';

    const current = getActiveSkill();
    if (!current) return;

    for (let i = 1; i <= 99; i++) {
        gridTarget.appendChild(createHourCircle(i, current));
    }

    gridTarget.appendChild(createHourCircle(100, current, true));
    syncControlsSidebarHeight();
}

function createHourCircle(index, skill, isMilestone = false) {
    const circle = document.createElement('div');
    circle.className = `hour-circle${isMilestone ? ' milestone-hundred' : ''}`;

    if (isMilestone) {
        const label = document.createElement('span');
        label.className = 'milestone-label';
        label.textContent = String(getBlockMilestoneHours(getCurrentBlock(skill)));
        circle.appendChild(label);
    }

    if (skill.loggedHoursData[index]) {
        circle.style.background = getActivityGradient(skill.loggedHoursData[index]);
        circle.dataset.actId = skill.loggedHoursData[index];
        circle.classList.add('filled');
    }

    circle.addEventListener('click', () => {
        if (circle.classList.contains('filled')) {
            clearCircleColor(circle, index);
        } else {
            assignCircleColor(circle, index);
        }
    });
    circle.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        clearCircleColor(circle, index);
    });

    return circle;
}

function assignCircleColor(element, index) {
    const current = getActiveSkill();
    element.style.background = getActivityGradient(current.activeActivityId);
    element.dataset.actId = current.activeActivityId;
    element.classList.add('filled');

    current.loggedHoursData[index] = current.activeActivityId;
    saveState();
    playPunchSound();
    recalculateCounters();
    renderDashboard();

    if (checkHundredHourMilestone(current)) {
        openCurrentReflection();
        scrollToReflectingSection();
    }
}

function clearCircleColor(element, index) {
    const current = getActiveSkill();
    element.style.background = '';
    element.dataset.actId = '';
    element.classList.remove('filled');

    delete current.loggedHoursData[index];
    saveState();
    recalculateCounters();
    renderDashboard();
}

export function recalculateCounters() {
    const current = getActiveSkill();
    const count = current ? getTotalHours(current) : 0;

    document.getElementById('hours-logged-count').innerText = count;
    document.getElementById('calc-percentage').innerText = ((count / 10000) * 100).toFixed(2);
}
