export function mountTrackerPageDOM() {
    document.body.insertAdjacentHTML(
        'beforeend',
        `
        <header class="tracker-header">
            <div id="editable-skill" contenteditable="true">Skill</div>
            <span id="hours-logged-count">0</span>
            <span id="calc-percentage">0.00</span>
        </header>
        <section id="view-landing" class="view-section grid-layout-three-col">
            <div class="tracker-grid-container" id="hour-grid-target"></div>
            <aside class="controls-sidebar">
                <div class="sidebar-panel sidebar-activities-panel">
                    <div class="activity-select-list" id="activity-list"></div>
                    <button type="button" id="add-activity-btn">+ Add activity</button>
                </div>
                <div class="sidebar-panel sidebar-reflections-panel">
                    <button type="button" data-view="setup">Setup</button>
                    <nav id="reflection-block-nav"></nav>
                    <div class="reflection-group">
                        <button type="button" id="retrospective-main-btn">Retrospective</button>
                        <nav id="retrospective-block-nav"></nav>
                    </div>
                </div>
            </aside>
        </section>
        <div class="skills-display-container" id="skills-display-list"></div>
        <div id="color-swatch-grid"></div>
        `
    );
}
