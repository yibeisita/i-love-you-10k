import { escapeHTML } from './utils.js';

const PREFS_KEY = 'cosmic_multi_10k_prefs';
const DEFAULT_LANGUAGE = 'en';
const SUPPORTED_LANGUAGES = ['en', 'es', 'it'];

let currentLanguage = DEFAULT_LANGUAGE;

const STRINGS = {
    en: {
        faq: 'FAQ',
        settings: 'Settings',
        backToDashboard: '← Back to Dashboard',
        returnToTracker: '← Return to Log Tracker',
        skillInputPlaceholder: 'Type a new skill & press Enter...',
        hoursLogged: 'HOURS LOGGED',
        deleteProfile: 'Delete Profile',
        totalHours: '/ 10,000 hours',
        today: 'Today',
        faqTitle: 'How to Use This Tracker',
        settingsTitle: 'Settings',
        languageLabel: 'Language',
        dataLabel: 'Your Data',
        dataDesc: 'All progress is stored locally in your browser. Export a backup before switching devices or browsers, then import it here to restore everything.',
        exportData: 'Export data',
        importData: 'Import data',
        importSuccess: 'Your data was imported successfully.',
        importInvalid: 'That file does not look like a valid tracker backup.',
        importConfirm: 'Importing will replace all current skills, logs, and reflections. Continue?',
        exportFilePrefix: '10000-hours-tracker',
        keepOneProfile: 'You should keep at least one active tracking profile.',
        deleteConfirm: 'Are you sure you want to delete all historical logs for "{name}"?',
        langEn: 'English',
        langEs: 'Español',
        langIt: 'Italiano',
    },
    es: {
        faq: 'FAQ',
        settings: 'Ajustes',
        backToDashboard: '← Volver al panel',
        returnToTracker: '← Volver al registro',
        skillInputPlaceholder: 'Escribe una habilidad y pulsa Enter...',
        hoursLogged: 'HORAS REGISTRADAS',
        deleteProfile: 'Eliminar perfil',
        totalHours: '/ 10.000 horas',
        today: 'Hoy',
        faqTitle: 'Cómo usar este rastreador',
        settingsTitle: 'Ajustes',
        languageLabel: 'Idioma',
        dataLabel: 'Tus datos',
        dataDesc: 'Todo el progreso se guarda localmente en tu navegador. Exporta una copia antes de cambiar de dispositivo o navegador, e impórtala aquí para restaurar todo.',
        exportData: 'Exportar datos',
        importData: 'Importar datos',
        importSuccess: 'Tus datos se importaron correctamente.',
        importInvalid: 'Ese archivo no parece una copia de seguridad válida.',
        importConfirm: 'La importación reemplazará todas las habilidades, registros y reflexiones actuales. ¿Continuar?',
        exportFilePrefix: 'rastreador-10000-horas',
        keepOneProfile: 'Debes mantener al menos un perfil activo.',
        deleteConfirm: '¿Seguro que quieres eliminar todos los registros históricos de "{name}"?',
        langEn: 'English',
        langEs: 'Español',
        langIt: 'Italiano',
    },
    it: {
        faq: 'FAQ',
        settings: 'Impostazioni',
        backToDashboard: '← Torna alla dashboard',
        returnToTracker: '← Torna al registro',
        skillInputPlaceholder: 'Scrivi una competenza e premi Invio...',
        hoursLogged: 'ORE REGISTRATE',
        deleteProfile: 'Elimina profilo',
        totalHours: '/ 10.000 ore',
        today: 'Oggi',
        faqTitle: 'Come usare questo tracker',
        settingsTitle: 'Impostazioni',
        languageLabel: 'Lingua',
        dataLabel: 'I tuoi dati',
        dataDesc: 'Tutti i progressi sono salvati localmente nel browser. Esporta un backup prima di cambiare dispositivo o browser, poi importalo qui per ripristinare tutto.',
        exportData: 'Esporta dati',
        importData: 'Importa dati',
        importSuccess: 'I tuoi dati sono stati importati con successo.',
        importInvalid: 'Quel file non sembra un backup valido del tracker.',
        importConfirm: "L'importazione sostituirà tutte le competenze, i registri e le riflessioni attuali. Continuare?",
        exportFilePrefix: 'tracker-10000-ore',
        keepOneProfile: 'Devi mantenere almeno un profilo attivo.',
        deleteConfirm: 'Sei sicuro di voler eliminare tutti i registri storici di "{name}"?',
        langEn: 'English',
        langEs: 'Español',
        langIt: 'Italiano',
    },
};

const FAQ_SECTIONS = {
    en: [
        {
            title: 'What this is',
            body: 'A local-first tracker for the 10,000-hour journey. Everything stays in your browser — no account, no server. Host it on GitHub Pages and your data still lives only on your device.',
        },
        {
            title: 'Dashboard',
            body: 'The home screen lists every skill you are tracking. Click a skill to open its hour log. Type a new name in the input at the bottom left and press Enter to add another skill.',
        },
        {
            title: 'Logging hours',
            body: 'Inside a skill, click empty circles in the grid to log one hour each. Pick an activity from the sidebar first — each activity has its own colour. Click a filled circle again to remove that hour.',
        },
        {
            title: 'Activities',
            body: 'Use the Activities panel to switch what you are logging. Add custom activities with the + button and assign each one a colour from the palette.',
        },
        {
            title: 'Where The Work Begins',
            body: 'Open this from Reflections when you want to capture your purpose, identity, starting point, endurance, and non-negotiables for the skill. Answers save automatically as you type.',
        },
        {
            title: '100-Hour Reflections',
            body: 'Each skill moves in 100-hour blocks. At the start of a block, write your guidelines and goals. After 100 hours are logged, the reflecting section unlocks so you can review the block and archive it before starting the next one.',
        },
        {
            title: 'Retrospective',
            body: 'Completed blocks appear in Retrospective as read-only track logs — a visual history of every hour in that block.',
        },
        {
            title: 'Backup & migration',
            body: 'Because data is stored locally, use Settings → Export data to download a JSON backup. Import that file on another browser or device to pick up where you left off.',
        },
    ],
    es: [
        {
            title: 'Qué es esto',
            body: 'Un rastreador local para el viaje de las 10.000 horas. Todo permanece en tu navegador — sin cuenta, sin servidor. Aunque esté alojado en GitHub Pages, tus datos viven solo en tu dispositivo.',
        },
        {
            title: 'Panel principal',
            body: 'La pantalla de inicio lista cada habilidad que sigues. Haz clic en una para abrir su registro de horas. Escribe un nombre nuevo en el campo inferior izquierdo y pulsa Enter para añadir otra habilidad.',
        },
        {
            title: 'Registrar horas',
            body: 'Dentro de una habilidad, haz clic en los círculos vacíos de la cuadrícula para registrar una hora cada uno. Elige primero una actividad en la barra lateral — cada actividad tiene su propio color. Haz clic de nuevo en un círculo relleno para quitar esa hora.',
        },
        {
            title: 'Actividades',
            body: 'Usa el panel de Actividades para cambiar lo que estás registrando. Añade actividades personalizadas con el botón + y asigna a cada una un color de la paleta.',
        },
        {
            title: 'Donde comienza el trabajo',
            body: 'Ábrelo desde Reflexiones cuando quieras capturar tu propósito, identidad, punto de partida, resistencia y límites para la habilidad. Las respuestas se guardan automáticamente mientras escribes.',
        },
        {
            title: 'Reflexiones de 100 horas',
            body: 'Cada habilidad avanza en bloques de 100 horas. Al inicio de un bloque, escribe tus directrices y metas. Tras registrar 100 horas, se desbloquea la sección de reflexión para revisar el bloque y archivarlo antes de empezar el siguiente.',
        },
        {
            title: 'Retrospectiva',
            body: 'Los bloques completados aparecen en Retrospectiva como registros de solo lectura — un historial visual de cada hora en ese bloque.',
        },
        {
            title: 'Copia de seguridad y migración',
            body: 'Como los datos se guardan localmente, usa Ajustes → Exportar datos para descargar un backup JSON. Importa ese archivo en otro navegador o dispositivo para continuar donde lo dejaste.',
        },
    ],
    it: [
        {
            title: 'Cos\'è',
            body: 'Un tracker locale per il viaggio delle 10.000 ore. Tutto resta nel browser — nessun account, nessun server. Anche su GitHub Pages, i dati vivono solo sul tuo dispositivo.',
        },
        {
            title: 'Dashboard',
            body: 'La schermata iniziale elenca ogni competenza che stai seguendo. Clicca su una per aprire il registro ore. Scrivi un nuovo nome nel campo in basso a sinistra e premi Invio per aggiungere un\'altra competenza.',
        },
        {
            title: 'Registrare le ore',
            body: 'Dentro una competenza, clicca i cerchi vuoti nella griglia per registrare un\'ora ciascuno. Scegli prima un\'attività dalla barra laterale — ogni attività ha il proprio colore. Clicca di nuovo un cerchio pieno per rimuovere quell\'ora.',
        },
        {
            title: 'Attività',
            body: 'Usa il pannello Attività per cambiare cosa stai registrando. Aggiungi attività personalizzate con il pulsante + e assegna a ciascuna un colore dalla tavolozza.',
        },
        {
            title: 'Dove inizia il lavoro',
            body: 'Aprilo da Riflessioni quando vuoi catturare scopo, identità, punto di partenza, resistenza e limiti per la competenza. Le risposte si salvano automaticamente mentre scrivi.',
        },
        {
            title: 'Riflessioni da 100 ore',
            body: 'Ogni competenza avanza in blocchi da 100 ore. All\'inizio di un blocco, scrivi linee guida e obiettivi. Dopo 100 ore registrate, si sblocca la sezione di riflessione per rivedere il blocco e archiviarlo prima del successivo.',
        },
        {
            title: 'Retrospettiva',
            body: 'I blocchi completati compaiono in Retrospettiva come registri di sola lettura — una cronologia visiva di ogni ora in quel blocco.',
        },
        {
            title: 'Backup e migrazione',
            body: 'Poiché i dati sono salvati localmente, usa Impostazioni → Esporta dati per scaricare un backup JSON. Importa quel file su un altro browser o dispositivo per riprendere da dove avevi lasciato.',
        },
    ],
};

export function getLanguage() {
    return currentLanguage;
}

export function getPreferences() {
    return { language: currentLanguage };
}

export function loadPreferences() {
    try {
        const saved = localStorage.getItem(PREFS_KEY);
        if (!saved) return;

        const parsed = JSON.parse(saved);
        if (SUPPORTED_LANGUAGES.includes(parsed.language)) {
            currentLanguage = parsed.language;
        }
    } catch {
        currentLanguage = DEFAULT_LANGUAGE;
    }
}

export function savePreferences(prefs) {
    if (prefs.language && SUPPORTED_LANGUAGES.includes(prefs.language)) {
        currentLanguage = prefs.language;
    }
    localStorage.setItem(PREFS_KEY, JSON.stringify(getPreferences()));
}

export function t(key, vars = {}) {
    const lang = STRINGS[currentLanguage] ?? STRINGS.en;
    let text = lang[key] ?? STRINGS.en[key] ?? key;

    Object.entries(vars).forEach(([name, value]) => {
        text = text.replace(`{${name}}`, value);
    });

    return text;
}

export function getFaqSections() {
    return FAQ_SECTIONS[currentLanguage] ?? FAQ_SECTIONS.en;
}

export function renderFaqContent() {
    const container = document.getElementById('faq-content');
    if (!container) return;

    container.innerHTML = getFaqSections()
        .map(
            (section) => `
            <article class="faq-section">
                <h3 class="faq-section-title">${escapeHTML(section.title)}</h3>
                <p class="faq-section-body">${escapeHTML(section.body)}</p>
            </article>
        `,
        )
        .join('');
}

export function applyTranslations() {
    document.documentElement.lang = currentLanguage;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.dataset.i18n;
        if (key) el.textContent = t(key);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const key = el.dataset.i18nPlaceholder;
        if (key) el.placeholder = t(key);
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
        const key = el.dataset.i18nAria;
        if (key) el.setAttribute('aria-label', t(key));
    });

    renderFaqContent();
    updateLanguageButtons();
}

function updateLanguageButtons() {
    document.querySelectorAll('.language-option').forEach((btn) => {
        const lang = btn.dataset.lang;
        btn.classList.toggle('selected', lang === currentLanguage);
        const labelKey = lang === 'en' ? 'langEn' : lang === 'es' ? 'langEs' : 'langIt';
        btn.textContent = t(labelKey);
    });
}

export function setLanguage(lang) {
    if (!SUPPORTED_LANGUAGES.includes(lang) || lang === currentLanguage) return false;

    savePreferences({ language: lang });
    applyTranslations();
    return true;
}

export { PREFS_KEY, SUPPORTED_LANGUAGES };
