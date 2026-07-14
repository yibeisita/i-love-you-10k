import { appState } from './state.js';
import { escapeHTML } from './utils.js';
import { getTotalHours } from './hundred-hour.js';

export function renderDashboard() {
    const container = document.getElementById('skills-display-list');
    container.innerHTML = '';

    Object.entries(appState.skills).forEach(([id, skill]) => {
        const hoursCount = getTotalHours(skill);
        const node = document.createElement('div');
        node.className = 'circle-oval';
        node.dataset.skillId = id;

        node.innerHTML = `
            <button type="button" class="node-delete-btn" title="Delete Profile">&times;</button>
            <div class="node-title">${escapeHTML(skill.name)}</div>
            <div class="node-meta">${hoursCount} hours logged</div>
        `;

        container.appendChild(node);
    });
}
