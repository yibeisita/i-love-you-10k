import { describe, expect, it, vi } from 'vitest';
import { renderBlockNav } from '../js/block-nav.js';

describe('block nav', () => {
    it('renders all blocks inside a dropdown', () => {
        const container = document.createElement('nav');
        const blocks = Array.from({ length: 12 }, (_, index) => ({
            id: `block_${index + 1}`,
            cycleNumber: index + 1,
        }));

        renderBlockNav(container, blocks, { onSelect: vi.fn() });

        expect(container.querySelectorAll(':scope > .reflection-block-nav-btn')).toHaveLength(0);

        const dropdown = container.querySelector('.block-nav-dropdown');
        expect(dropdown).not.toBeNull();

        const dropdownButtons = dropdown.querySelectorAll('.reflection-block-nav-btn');
        expect(dropdownButtons).toHaveLength(12);
        expect(dropdownButtons[0].textContent).toBe('Block 1');
        expect(dropdownButtons[11].textContent).toBe('Block 12');
    });

    it('keeps the dropdown closed even when a block is active', () => {
        const container = document.createElement('nav');
        const blocks = [
            { id: 'block_1', cycleNumber: 1 },
            { id: 'block_2', cycleNumber: 2 },
        ];

        renderBlockNav(container, blocks, { onSelect: vi.fn(), activeBlockId: 'block_2' });

        expect(container.querySelector('.block-nav-dropdown')?.open).toBe(false);
        expect(container.querySelector('[data-block-id="block_2"]')?.classList.contains('active')).toBe(true);
    });

    it('calls onSelect when a block button is clicked', () => {
        const container = document.createElement('nav');
        const onSelect = vi.fn();
        const blocks = [{ id: 'block_7', cycleNumber: 7 }];

        renderBlockNav(container, blocks, { onSelect });

        container.querySelector('[data-block-id="block_7"]')?.click();

        expect(onSelect).toHaveBeenCalledWith('block_7');
    });

    it('renders nothing when there are no completed blocks', () => {
        const container = document.createElement('nav');

        renderBlockNav(container, [], { onSelect: vi.fn() });

        expect(container.innerHTML).toBe('');
    });
});
