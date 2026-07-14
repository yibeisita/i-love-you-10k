import { LOVE_PHRASES } from './constants.js';
import { escapeHTML } from './utils.js';

let loveIndex = 0;
let loveTimer = null;

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
        loveIndex = (loveIndex + 1) % LOVE_PHRASES.length;
        renderLovePhrase();
        el.classList.remove('fading');
    }, 1500);
}

export function startLoveCycler() {
    renderLovePhrase();
    if (loveTimer) clearInterval(loveTimer);
    loveTimer = setInterval(cycleLovePhrase, 10000);
}
