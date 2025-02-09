import { ActiveControl } from '../../lib/jenyx/components/ActiveControl/ActiveControl.js';

export class Button extends ActiveControl {
    constructor (options) {
        super({
            style: [
                'display: flex',
                'align-items: center',
                'justify-content: center',
                'text-decoration: none',
                'cursor: pointer',
                'aspect-ratio: 1 / 1',
            ],
            styleSet: {
                hovered: [
                    'filter: brightness(1.05)',
                ],
                disabled: [
                    'background: var(--jn-grey)',
                    'cursor: default',
                ],
                selected_disabled: [
                    'background: var(--jn-grey)',
                    'cursor: default',
                ],
                selected_focused: [
                    'filter: brightness(1.05)',
                ],
                selected_pressed: [
                    'filter: brightness(1.05)',
                ],
                selected: [
                    'filter: brightness(1.05)',
                ],
                selected_hovered: [
                    'filter: brightness(1.05)',
                ],
            },
            options
        });
    }
}