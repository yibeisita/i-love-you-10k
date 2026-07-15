import { appState, saveState, migrateSkill } from './state.js';
import { getPreferences, setLanguage, t, applyTranslations } from './i18n.js';
import { renderDashboard } from './render.js';
import { loadActiveSkillIntoUI, refreshDynamicUI } from './ui.js';
import { getCurrentView, setView, updateHeaderBackLabel } from './views.js';
import { confirmDialog, showToast } from './dialog.js';

const EXPORT_VERSION = 1;

export function isValidImportPayload(data) {
    return Boolean(
        data &&
            typeof data === 'object' &&
            data.appState &&
            typeof data.appState === 'object' &&
            data.appState.skills &&
            typeof data.appState.skills === 'object',
    );
}

export function exportAllData() {
    const payload = {
        version: EXPORT_VERSION,
        exportedAt: new Date().toISOString(),
        appState: {
            activeSkillId: appState.activeSkillId,
            skills: appState.skills,
        },
        preferences: getPreferences(),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${t('exportFilePrefix')}-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
}

function applyImportedState(imported) {
    appState.activeSkillId = imported.activeSkillId;
    appState.skills = imported.skills;
    Object.values(appState.skills).forEach(migrateSkill);
    saveState();
}

export function importAllData(file) {
    const reader = new FileReader();

    reader.onload = async () => {
        try {
            const parsed = JSON.parse(reader.result);

            if (!isValidImportPayload(parsed)) {
                showToast({ messageKey: 'importInvalid', variant: 'error' });
                return;
            }

            const confirmed = await confirmDialog({ messageKey: 'importConfirm' });
            if (!confirmed) return;

            applyImportedState(parsed.appState);

            if (parsed.preferences?.language) {
                setLanguage(parsed.preferences.language);
            } else {
                applyTranslations();
            }

            refreshDynamicUI();
            updateHeaderBackLabel();

            if (getCurrentView() !== 'home') {
                setView('home');
            }

            showToast({ messageKey: 'importSuccess', variant: 'success' });
        } catch {
            showToast({ messageKey: 'importInvalid', variant: 'error' });
        }
    };

    reader.readAsText(file);
}

export function initSettings() {
    document.getElementById('export-data-btn')?.addEventListener('click', exportAllData);

    document.getElementById('import-data-btn')?.addEventListener('click', () => {
        document.getElementById('import-data-input')?.click();
    });

    document.getElementById('import-data-input')?.addEventListener('change', (event) => {
        const file = event.target.files?.[0];
        if (file) importAllData(file);
        event.target.value = '';
    });

    document.querySelectorAll('.language-option').forEach((btn) => {
        btn.addEventListener('click', () => {
            const changed = setLanguage(btn.dataset.lang);
            if (changed) {
                refreshDynamicUI();
                updateHeaderBackLabel();
            }
        });
    });
}
