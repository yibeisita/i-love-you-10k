import { describe, expect, it } from 'vitest';
import { ORB_COLORS } from '../js/constants.js';
import { COLOR_NAME_KEYS } from '../js/i18n-strings.js';
import {
    createOrbGradient,
    EXTENDED_ORB_PALETTE,
    getSwatchDisplayOrder,
    migrateLegacyColorIndex,
} from '../js/orb-palette.js';
import { getColorName } from '../js/i18n.js';

describe('orb palette', () => {
    it('builds radial gradients from hex values', () => {
        const gradient = createOrbGradient('#C85078');

        expect(gradient).toContain('#C85078');
        expect(gradient).toContain('radial-gradient');
    });

    it('includes the extended palette after the legacy colors', () => {
        expect(ORB_COLORS.length).toBe(15 + EXTENDED_ORB_PALETTE.length);
        expect(ORB_COLORS[15].gradient).toContain(EXTENDED_ORB_PALETTE[0].hex);
    });

    it('keeps color names aligned with the orb palette', () => {
        expect(COLOR_NAME_KEYS.length).toBe(ORB_COLORS.length);
        expect(getColorName(15)).toBe('Light Blue');
        expect(getColorName(ORB_COLORS.length - 1)).toBe('Deep Violet');
    });

    it('orders swatches by hue group for the picker grid', () => {
        const order = getSwatchDisplayOrder(ORB_COLORS.length);

        expect(order).toHaveLength(ORB_COLORS.length);
        expect(order[0]).toBe(0);
        expect(order.at(-1)).toBe(41);
        expect(new Set(order).size).toBe(ORB_COLORS.length);
    });

    it('remaps removed legacy palette indices', () => {
        expect(migrateLegacyColorIndex(0)).toBe(0);
        expect(migrateLegacyColorIndex(1)).toBe(0);
        expect(migrateLegacyColorIndex(2)).toBe(0);
        expect(migrateLegacyColorIndex(4)).toBe(2);
        expect(migrateLegacyColorIndex(11)).toBe(9);
    });
});
