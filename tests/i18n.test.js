import { beforeEach, describe, expect, it } from 'vitest';
import {
    getFaqSections,
    getLanguage,
    renderFaqContent,
    savePreferences,
    setLanguage,
    t,
    tCount,
} from '../js/i18n.js';
import { CONTACT_EMAIL, GITHUB_REPO_URL } from '../js/constants.js';

describe('i18n', () => {
    beforeEach(() => {
        savePreferences({ language: 'en' });
    });

    it('returns English strings by default', () => {
        expect(t('deleteSkill')).toBe('Delete Skill');
        expect(t('dialogCancel')).toBe('Cancel');
    });

    it('interpolates variables in translated strings', () => {
        expect(t('deleteConfirm', { name: 'Piano' })).toContain('Piano');
    });

    it('switches languages', () => {
        expect(setLanguage('es')).toBe(true);
        expect(getLanguage()).toBe('es');
        expect(t('deleteSkill')).toBe('Eliminar habilidad');

        expect(setLanguage('it')).toBe(true);
        expect(t('deleteSkill')).toBe('Elimina competenza');
    });

    it('ignores unsupported or duplicate language changes', () => {
        expect(setLanguage('en')).toBe(false);
        expect(setLanguage('fr')).toBe(false);
    });

    it('selects pluralized strings', () => {
        expect(tCount('completedBlocksArchived', 1)).toBe('1 completed block archived');
        expect(tCount('completedBlocksArchived', 3)).toBe('3 completed blocks archived');
    });

    it('renders FAQ content with contact links', () => {
        renderFaqContent();

        const html = document.getElementById('faq-content').innerHTML;
        expect(html).toContain('faq-email-link');
        expect(html).toContain(`mailto:${CONTACT_EMAIL}`);
        expect(html).toContain(GITHUB_REPO_URL);
        expect(getFaqSections().some((section) => section.title === 'Contact')).toBe(true);
    });
});
