import { getActiveSkill, saveState } from './state.js';
import { getActivityGradient, getActivityGradientForSkill, getActivityLabelForSkill } from './colors.js';
import { renderDashboard } from './render.js';
import {
    getTotalHours,
    checkHundredHourMilestone,
    getCurrentBlock,
    getBlockMilestoneHours,
    isLoggingAllowed,
    getFinalHourActivity,
    MAX_HOURS,
} from './hundred-hour.js';
import { openCurrentReflection, scrollToReflectingSection } from './prompts.js';
import { playPunchSound } from './sound.js';
import { syncControlsSidebarHeight } from './sidebar-layout.js';
import {
    createLoggedHour,
    getLoggedActId,
    getLoggedPunchedAt,
    countActivityHoursForSkill,
} from './logged-hours.js';
import { formatHourTooltipText, showHourTooltip, hideHourTooltip } from './hour-tooltip.js';
import { t } from './i18n.js';

export function assembleTrackerGrid() {
    const gridTarget = document.getElementById('hour-grid-target');
    gridTarget.innerHTML = '';
    hideHourTooltip();

    const current = getActiveSkill();
    if (!current) return;

    for (let i = 1; i <= 99; i++) {
        gridTarget.appendChild(createHourCircle(i, current));
    }

    gridTarget.appendChild(createHourCircle(100, current, true));
    syncControlsSidebarHeight();
}

export function assembleCompletedMilestone() {
    const gridTarget = document.getElementById('hour-grid-target');
    if (!gridTarget) return;

    gridTarget.innerHTML = '';
    hideHourTooltip();

    const skill = getActiveSkill();
    const circle = document.createElement('div');
    circle.className = 'hour-circle milestone-hundred hour-circle-readonly skill-complete-milestone';
    circle.setAttribute('aria-label', String(MAX_HOURS));

    const { actId, block } = getFinalHourActivity(skill ?? {});
    if (actId && skill) {
        const gradient = getActivityGradientForSkill(skill, actId, block);
        if (gradient) {
            circle.style.background = gradient;
            circle.dataset.actId = actId;
            circle.classList.add('filled');
        }
    }

    const label = document.createElement('span');
    label.className = 'milestone-label';
    label.textContent = String(MAX_HOURS);
    circle.appendChild(label);

    gridTarget.appendChild(circle);
    syncControlsSidebarHeight();
}

function bindHourTooltip(circle, index, skill) {
    circle.addEventListener('mouseenter', (event) => {
        const current = getActiveSkill() ?? skill;
        const entry = current?.loggedHoursData?.[index];
        const actId = getLoggedActId(entry);

        if (!actId) {
            showHourTooltip(event, t('hourNotLogged'));
            return;
        }

        const label = getActivityLabelForSkill(current, actId) || t('hourNotLogged');
        const hours = countActivityHoursForSkill(current, actId);
        showHourTooltip(
            event,
            formatHourTooltipText({
                punchedAt: getLoggedPunchedAt(entry),
                label,
                hours,
            })
        );
    });
    circle.addEventListener('mouseleave', hideHourTooltip);
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

    const entry = skill.loggedHoursData[index];
    const actId = getLoggedActId(entry);
    if (actId) {
        circle.style.background = getActivityGradient(actId);
        circle.dataset.actId = actId;
        circle.classList.add('filled');
    }

    bindHourTooltip(circle, index, skill);

    if (!isLoggingAllowed(skill)) {
        circle.classList.add('hour-circle-readonly');
        return circle;
    }

    circle.addEventListener('click', () => {
        if (!isLoggingAllowed(getActiveSkill())) return;

        if (circle.classList.contains('filled')) {
            clearCircleColor(circle, index);
        } else {
            assignCircleColor(circle, index);
        }
    });
    circle.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        if (!isLoggingAllowed(getActiveSkill())) return;
        clearCircleColor(circle, index);
    });

    return circle;
}

function assignCircleColor(element, index) {
    const current = getActiveSkill();
    if (!isLoggingAllowed(current)) return;
    element.style.background = getActivityGradient(current.activeActivityId);
    element.dataset.actId = current.activeActivityId;
    element.classList.add('filled');

    current.loggedHoursData[index] = createLoggedHour(current.activeActivityId);
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
    if (!isLoggingAllowed(current)) return;
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
