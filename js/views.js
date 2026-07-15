import { syncControlsSidebarHeight } from './sidebar-layout.js';

let currentActiveView = 'home';

function playEnterAnimation(element) {
    if (!element) return;

    element.classList.remove('view-enter');
    void element.offsetWidth;
    element.classList.add('view-enter');
}

function animatePromptTitles(viewName) {
    if (viewName !== 'setup' && viewName !== 'reflection' && viewName !== 'retrospective') return;

    const view = document.getElementById(`view-${viewName}`);
    if (!view) return;

    view.querySelectorAll('.prompts-heading').forEach((heading, index) => {
        heading.classList.remove('title-reveal');
        heading.style.animationDelay = `${index * 2}s`;
        void heading.offsetWidth;
        heading.classList.add('title-reveal');
    });
}

export function getCurrentView() {
    return currentActiveView;
}

export function setView(viewName) {
    if (viewName === currentActiveView) return;

    const wasHome = currentActiveView === 'home';
    currentActiveView = viewName;

    document.querySelectorAll('.view-section').forEach((section) => {
        section.classList.remove('active-view', 'view-enter');
    });

    const nextView = document.getElementById(`view-${viewName}`);
    nextView?.classList.add('active-view');
    playEnterAnimation(nextView);
    animatePromptTitles(viewName);

    const headerBar = document.getElementById('tracker-header');
    const backBtn = document.getElementById('header-back-btn');

    if (viewName === 'home') {
        headerBar.classList.remove('view-enter');
        headerBar.style.display = 'none';
        return;
    }

    headerBar.style.display = 'block';
    backBtn.innerHTML =
        viewName === 'setup' || viewName === 'reflection' || viewName === 'retrospective'
            ? '&larr; Return to Log Tracker'
            : '&larr; Back to Dashboard';

    if (wasHome) {
        playEnterAnimation(headerBar);
    }

    if (viewName === 'landing') {
        requestAnimationFrame(() => syncControlsSidebarHeight());
    }
}

export function handleHeaderBack() {
    if (currentActiveView === 'setup' || currentActiveView === 'reflection' || currentActiveView === 'retrospective') {
        setView('landing');
    } else {
        setView('home');
    }
}

export function initHomeView() {
    playEnterAnimation(document.getElementById('view-home'));
}
