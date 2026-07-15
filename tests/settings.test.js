import { describe, expect, it } from 'vitest';
import { isValidImportPayload } from '../js/settings.js';

describe('import validation', () => {
    it('accepts valid export payloads', () => {
        expect(
            isValidImportPayload({
                version: 1,
                appState: {
                    activeSkillId: 'skill_1',
                    skills: { skill_1: { name: 'Piano' } },
                },
            }),
        ).toBe(true);
    });

    it('rejects malformed payloads', () => {
        expect(isValidImportPayload(null)).toBe(false);
        expect(isValidImportPayload({})).toBe(false);
        expect(isValidImportPayload({ appState: {} })).toBe(false);
        expect(isValidImportPayload({ appState: { skills: null } })).toBe(false);
    });
});
