import { t } from './i18n.js';

function createNavButton(block, onSelect, activeBlockId, extraClass) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `reflection-block-nav-btn${extraClass ? ` ${extraClass}` : ''}`;
    btn.dataset.blockId = block.id;
    btn.textContent = t('blockLabel', { n: block.cycleNumber });
    btn.classList.toggle('active', block.id === activeBlockId);
    btn.addEventListener('click', () => onSelect(block.id));
    return btn;
}

export function renderBlockNav(container, blocks, { onSelect, activeBlockId = null, extraButtonClass = '' } = {}) {
    if (!container) return;

    container.innerHTML = '';

    if (blocks.length === 0) return;

    const dropdown = document.createElement('details');
    dropdown.className = 'block-nav-dropdown';

    const summary = document.createElement('summary');
    summary.className = 'block-nav-dropdown-toggle';
    summary.textContent = t('blockNavAll', {
        from: blocks[0].cycleNumber,
        to: blocks[blocks.length - 1].cycleNumber,
    });

    const dropdownList = document.createElement('div');
    dropdownList.className = 'block-nav-dropdown-list';

    blocks.forEach((block) => {
        dropdownList.appendChild(createNavButton(block, onSelect, activeBlockId, extraButtonClass));
    });

    dropdown.appendChild(summary);
    dropdown.appendChild(dropdownList);
    container.appendChild(dropdown);
}
