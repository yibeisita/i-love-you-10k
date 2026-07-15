import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { confirmDialog, initDialog, showToast } from '../js/dialog.js';
import { savePreferences } from '../js/i18n.js';

describe('dialog notifications', () => {
    beforeAll(() => {
        initDialog();
    });

    beforeEach(() => {
        savePreferences({ language: 'en' });
    });

    it('resolves confirm dialogs when confirmed or cancelled', async () => {
        const dialog = confirmDialog({ messageKey: 'importConfirm' });
        document.querySelector('.app-dialog-confirm').click();
        await expect(dialog).resolves.toBe(true);

        const cancelled = confirmDialog({
            messageKey: 'deleteConfirm',
            messageVars: { name: 'Piano' },
            confirmTextKey: 'deleteSkill',
            destructive: true,
        });
        document.querySelector('.app-dialog-cancel').click();
        await expect(cancelled).resolves.toBe(false);
    });

    it('shows translated dialog labels', () => {
        confirmDialog({
            messageKey: 'deleteConfirm',
            messageVars: { name: 'Piano' },
            confirmTextKey: 'deleteSkill',
        });

        expect(document.querySelector('.app-dialog-message').textContent).toContain('Piano');
        expect(document.querySelector('.app-dialog-cancel').textContent).toBe('Cancel');
        expect(document.querySelector('.app-dialog-confirm').textContent).toBe('Delete Skill');
    });

    it('shows toast notifications', () => {
        showToast({ messageKey: 'importSuccess', variant: 'success' });

        const toast = document.getElementById('app-toast');
        expect(toast.hidden).toBe(false);
        expect(toast.textContent).toBe('Your data was imported successfully.');
        expect(toast.dataset.variant).toBe('success');
    });
});
