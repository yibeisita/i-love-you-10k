import { describe, expect, it } from 'vitest';
import { escapeHTML, seededRandom } from '../js/utils.js';

describe('escapeHTML', () => {
    it('escapes HTML special characters', () => {
        expect(escapeHTML(`Tom & Jerry <script>"hi"</script>`)).toBe(
            'Tom &amp; Jerry &lt;script&gt;&quot;hi&quot;&lt;/script&gt;',
        );
    });

    it('returns plain strings unchanged', () => {
        expect(escapeHTML('Piano practice')).toBe('Piano practice');
    });
});

describe('seededRandom', () => {
    it('returns stable values for the same seed', () => {
        expect(seededRandom(42)).toBe(seededRandom(42));
    });

    it('returns values between 0 and 1', () => {
        for (let seed = 0; seed < 20; seed += 1) {
            const value = seededRandom(seed);
            expect(value).toBeGreaterThanOrEqual(0);
            expect(value).toBeLessThan(1);
        }
    });
});
