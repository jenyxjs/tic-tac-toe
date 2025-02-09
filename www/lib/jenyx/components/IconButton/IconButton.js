import { ActiveControl } from '../ActiveControl/ActiveControl.js';

export class IconButton extends ActiveControl {
    constructor (options) {
        super({
            style: [
                'display: inline-block',
                'flex-shrink: 0',
                'width: 20px',
                'height: 20px',
                'border-radius: 2rem',
                'text-decoration: none',
                'cursor: pointer',
                'font-size: 0',
                'padding: 1rem',
                'fill: var(--ax-on-sf)',
                'background: none',
                'filter: none',
            ],
            styleSet: {
                hovered: [
                    'filter: brightness(0.9)',
                    'background: var(--ax-sf)',
                ],
                disabled: [
                    'fill: var(--ax-grey-bg)',
                    'cursor: default',
                ],
                selected_disabled: [
                    'fill: var(--ax-grey-bg)',
                    'cursor: default',
                ],
                selected: [
                    'filter: brightness(0.8)',
                    'background: var(--ax-sf)',
                ],
                selected_hovered: [
                    'filter: brightness(0.8)',
                    'background: var(--ax-sf)',
                ],
            },
            options
        });
    }
}