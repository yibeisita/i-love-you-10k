import { t, onTranslationsApplied } from './i18n.js';

const TOAST_DURATION_MS = 4200;

let dialogRoot = null;
let toastRoot = null;
let toastTimer = null;
let dialogKeyHandler = null;
let activeDialog = null;
let activeToast = null;

let dialogInitialized = false;

function getDialogRoot() {
    const el = document.getElementById('app-dialog');
    if (!el) return null;

    if (dialogRoot !== el) {
        dialogRoot = el;
        dialogRoot.querySelector('.app-dialog-backdrop')?.addEventListener('click', () => closeDialog(false));
        dialogRoot.querySelector('.app-dialog-cancel')?.addEventListener('click', () => closeDialog(false));
        dialogRoot.querySelector('.app-dialog-confirm')?.addEventListener('click', () => closeDialog(true));
    }

    return dialogRoot;
}

function getToastRoot() {
    const el = document.getElementById('app-toast');
    if (el) toastRoot = el;
    return toastRoot;
}

let dialogResolve = null;

function resolveDialogMessage(config) {
    if (config.messageKey) return t(config.messageKey, config.messageVars ?? {});
    return config.message ?? '';
}

function resolveDialogConfirmText(config) {
    if (config.confirmTextKey) return t(config.confirmTextKey);
    return config.confirmText ?? t('dialogContinue');
}

function resolveDialogCancelText(config) {
    if (config.cancelTextKey) return t(config.cancelTextKey);
    return config.cancelText ?? t('dialogCancel');
}

function renderDialog(config) {
    const root = getDialogRoot();
    if (!root) return;

    const messageEl = root.querySelector('.app-dialog-message');
    const cancelBtn = root.querySelector('.app-dialog-cancel');
    const confirmBtn = root.querySelector('.app-dialog-confirm');

    messageEl.textContent = resolveDialogMessage(config);
    cancelBtn.textContent = resolveDialogCancelText(config);
    confirmBtn.textContent = resolveDialogConfirmText(config);
    confirmBtn.classList.toggle('destructive', Boolean(config.destructive));
}

function closeDialog(result) {
    const root = getDialogRoot();
    if (!root || root.hidden) return;

    root.hidden = true;
    root.dataset.open = 'false';
    activeDialog = null;

    if (dialogKeyHandler) {
        document.removeEventListener('keydown', dialogKeyHandler);
        dialogKeyHandler = null;
    }

    const resolve = dialogResolve;
    dialogResolve = null;
    resolve?.(result);
}

export function confirmDialog(config) {
    const root = getDialogRoot();
    if (!root) {
        return Promise.resolve(window.confirm(resolveDialogMessage(config)));
    }

    if (dialogResolve) closeDialog(false);

    activeDialog = config;
    renderDialog(config);

    root.hidden = false;
    root.dataset.open = 'true';

    dialogKeyHandler = (event) => {
        if (event.key === 'Escape') closeDialog(false);
    };
    document.addEventListener('keydown', dialogKeyHandler);

    root.querySelector('.app-dialog-cancel')?.focus();

    return new Promise((resolve) => {
        dialogResolve = resolve;
    });
}

function renderToast(config) {
    const root = getToastRoot();
    if (!root) return;

    root.textContent = config.messageKey ? t(config.messageKey, config.messageVars ?? {}) : config.message ?? '';
    root.dataset.variant = config.variant ?? 'info';
}

function hideToast() {
    const root = getToastRoot();
    if (!root || root.hidden) return;

    root.dataset.visible = 'false';
    toastTimer = setTimeout(() => {
        root.hidden = true;
        activeToast = null;
        toastTimer = null;
    }, 280);
}

export function showToast(config) {
    const root = getToastRoot();
    if (!root) return;

    if (toastTimer) {
        clearTimeout(toastTimer);
        toastTimer = null;
    }

    activeToast = config;
    renderToast(config);
    root.hidden = false;

    requestAnimationFrame(() => {
        root.dataset.visible = 'true';
    });

    toastTimer = setTimeout(hideToast, TOAST_DURATION_MS);
}

export function refreshDialogTranslations() {
    if (!activeDialog || getDialogRoot()?.hidden) return;
    renderDialog(activeDialog);
}

export function refreshToastTranslations() {
    if (!activeToast || getToastRoot()?.hidden) return;
    renderToast(activeToast);
}

export function initDialog() {
    getDialogRoot();

    if (dialogInitialized) return;
    dialogInitialized = true;

    onTranslationsApplied(() => {
        refreshDialogTranslations();
        refreshToastTranslations();
    });

    getToastRoot()?.addEventListener('click', () => {
        if (!getToastRoot()?.hidden) hideToast();
    });
}
