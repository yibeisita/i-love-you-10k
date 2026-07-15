import { escapeHTML } from './utils.js';
import { UI_STRINGS, FAQ_SECTIONS, COLOR_NAME_KEYS } from './i18n-strings.js';
import { CONTACT_EMAIL, GITHUB_REPO_URL } from './constants.js';

const PREFS_KEY = 'cosmic_multi_10k_prefs';
const DEFAULT_LANGUAGE = 'en';
const SUPPORTED_LANGUAGES = ['en', 'es', 'it'];

const LOCALE_MAP = {
    en: 'en-US',
    es: 'es-ES',
    it: 'it-IT',
};

let currentLanguage = DEFAULT_LANGUAGE;

export function getLanguage() {
    return currentLanguage;
}

export function getLocale() {
    return LOCALE_MAP[currentLanguage] ?? LOCALE_MAP.en;
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
    const lang = UI_STRINGS[currentLanguage] ?? UI_STRINGS.en;
    let text = lang[key] ?? UI_STRINGS.en[key] ?? key;

    Object.entries(vars).forEach(([name, value]) => {
        text = text.replaceAll(`{${name}}`, String(value));
    });

    return text;
}

export function tCount(key, count, vars = {}) {
    const pluralKey = count === 1 ? `${key}_one` : `${key}_other`;
    return t(pluralKey, { ...vars, count });
}

export function getDefaultActivityLabels() {
    return [t('activityPractice'), t('activityTheory'), t('activityFreeFlow')];
}

export function getColorName(index) {
    const key = COLOR_NAME_KEYS[index];
    return key ? t(key) : '';
}

export function getFaqSections() {
    return FAQ_SECTIONS[currentLanguage] ?? FAQ_SECTIONS.en;
}

function formatFaqBody(body) {
    const emailLink = `<a class="faq-email-link" href="mailto:${CONTACT_EMAIL}">${escapeHTML(CONTACT_EMAIL)}</a>`;
    const repoLink = `<a class="faq-external-link" href="${GITHUB_REPO_URL}" target="_blank" rel="noopener noreferrer">GitHub</a>`;

    return body
        .split(/(\{email\}|\{repoLink\})/)
        .map((part) => {
            if (part === '{email}') return emailLink;
            if (part === '{repoLink}') return repoLink;
            return escapeHTML(part);
        })
        .join('');
}

export function renderFaqContent() {
    const container = document.getElementById('faq-content');
    if (!container) return;

    container.innerHTML = getFaqSections()
        .map(
            (section) => `
            <article class="faq-section">
                <h3 class="faq-section-title">${escapeHTML(section.title)}</h3>
                <p class="faq-section-body">${formatFaqBody(section.body)}</p>
            </article>
        `,
        )
        .join('');
}

export function applyTranslations() {
    document.documentElement.lang = currentLanguage;
    document.title = t('pageTitle');

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
