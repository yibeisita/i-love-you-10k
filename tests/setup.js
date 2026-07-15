import { beforeEach } from 'vitest';

function ensureLocalStorage() {
    if (globalThis.localStorage && typeof globalThis.localStorage.clear === 'function') {
        return globalThis.localStorage;
    }

    const store = new Map();

    const storage = {
        getItem: (key) => (store.has(key) ? store.get(key) : null),
        setItem: (key, value) => store.set(key, String(value)),
        removeItem: (key) => store.delete(key),
        clear: () => store.clear(),
        key: (index) => [...store.keys()][index] ?? null,
        get length() {
            return store.size;
        },
    };

    Object.defineProperty(globalThis, 'localStorage', {
        value: storage,
        writable: true,
        configurable: true,
    });

    return storage;
}

beforeEach(() => {
    ensureLocalStorage().clear();

    document.body.innerHTML = `
        <div id="app-dialog" class="app-dialog" hidden>
            <div class="app-dialog-backdrop"></div>
            <div class="app-dialog-panel">
                <p class="app-dialog-message" id="app-dialog-message"></p>
                <div class="app-dialog-actions">
                    <button type="button" class="app-dialog-btn app-dialog-cancel"></button>
                    <button type="button" class="app-dialog-btn app-dialog-confirm"></button>
                </div>
            </div>
        </div>
        <div id="app-toast" class="app-toast" hidden></div>
        <div id="faq-content" class="faq-content"></div>
    `;
});
