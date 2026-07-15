import { t } from './i18n.js';

const TOAST_DURATION_MS = 4200;

let dialogRoot = null;
let toastRoot = null;
let toastTimer = null;
let dialogKeyHandler = null;

function getDialogRoot() {
    if (dialogRoot) return dialogRoot;

    dialogRoot = document.getElementById('app-dialog');
    if (!dialogRoot) return null;

    dialogRoot.querySelector('.app-dialog-backdrop')?.addEventListener('click', () => closeDialog(false));
    dialogRoot.querySelector('.app-dialog-cancel')?.addEventListener('click', () => closeDialog(false));
    dialogRoot.querySelector('.app-dialog-confirm')?.addEventListener('click', () => closeDialog(true));

    return dialogRoot;
}

function getToastRoot() {
    if (!toastRoot) {
        toastRoot = document.getElementById('app-toast');
    }
    return toastRoot;
}

let dialogResolve = null;

function closeDialog(result) {
    const root = getDialogRoot();
    if (!root || root.hidden) return;

    root.hidden = true;
    root.dataset.open = 'false';

    if (dialogKeyHandler) {
        document.removeEventListener('keydown', dialogKeyHandler);
        dialogKeyHandler = null;
    }

    const resolve = dialogResolve;
    dialogResolve = null;
    resolve?.(result);
}

export function confirmDialog(message, { confirmText, cancelText, destructive = false } = {}) {
    const root = getDialogRoot();
    if (!root) return Promise.resolve(window.confirm(message));

    if (dialogResolve) closeDialog(false);

    const messageEl = root.querySelector('.app-dialog-message');
    const cancelBtn = root.querySelector('.app-dialog-cancel');
    const confirmBtn = root.querySelector('.app-dialog-confirm');

    messageEl.textContent = message;
    cancelBtn.textContent = cancelText ?? t('dialogCancel');
    confirmBtn.textContent = confirmText ?? t('dialogContinue');
    confirmBtn.classList.toggle('destructive', destructive);

    root.hidden = false;
    root.dataset.open = 'true';

    dialogKeyHandler = (event) => {
        if (event.key === 'Escape') closeDialog(false);
    };
    document.addEventListener('keydown', dialogKeyHandler);

    cancelBtn.focus();

    return new Promise((resolve) => {
        dialogResolve = resolve;
    });
}

export function showToast(message, variant = 'info') {
    const root = getToastRoot();
    if (!root) return;

    if (toastTimer) {
        clearTimeout(toastTimer);
        toastTimer = null;
    }

    root.textContent = message;
    root.dataset.variant = variant;
    root.hidden = false;

    requestAnimationFrame(() => {
        root.dataset.visible = 'true';
    });

    toastTimer = setTimeout(() => {
        root.dataset.visible = 'false';
        toastTimer = setTimeout(() => {
            root.hidden = true;
            toastTimer = null;
        }, 280);
    }, TOAST_DURATION_MS);
}

export function initDialog() {
    getDialogRoot();

    getToastRoot()?.addEventListener('click', () => {
        const root = getToastRoot();
        if (!root || root.hidden) return;

        if (toastTimer) {
            clearTimeout(toastTimer);
            toastTimer = null;
        }

        root.dataset.visible = 'false';
        toastTimer = setTimeout(() => {
            root.hidden = true;
            toastTimer = null;
        }, 280);
    });
}
