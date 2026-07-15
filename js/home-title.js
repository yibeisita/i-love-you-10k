import { LOVE_PHRASES } from './constants.js';
import { escapeHTML } from './utils.js';

let loveIndex = 0;
let loveTimer = null;

function pickNextLoveIndex() {
    if (LOVE_PHRASES.length <= 1) return 0;

    let next = loveIndex;
    while (next === loveIndex) {
        next = Math.floor(Math.random() * LOVE_PHRASES.length);
    }
    return next;
}

function renderLovePhrase() {
    const el = document.getElementById('home-title-lang');
    if (!el) return;

    const phrase = LOVE_PHRASES[loveIndex];
    el.classList.toggle('rtl', !!phrase.rtl);
    el.innerHTML = `${escapeHTML(phrase.line1)}<br>${escapeHTML(phrase.line2)}`;
}

function cycleLovePhrase() {
    const el = document.getElementById('home-title-lang');
    if (!el) return;

    el.classList.add('fading');
    setTimeout(() => {
        loveIndex = pickNextLoveIndex();
        renderLovePhrase();
        el.classList.remove('fading');
    }, 1500);
}

export function startLoveCycler() {
    loveIndex = Math.floor(Math.random() * LOVE_PHRASES.length);
    renderLovePhrase();
    if (loveTimer) clearInterval(loveTimer);
    loveTimer = setInterval(cycleLovePhrase, 10000);
}
