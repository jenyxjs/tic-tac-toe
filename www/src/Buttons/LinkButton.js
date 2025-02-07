import { ActiveControl } from '../../lib/jenyx/components/ActiveControl/ActiveControl.js';

export class LinkButton extends ActiveControl {
    constructor (options) {
        super({
            style: [
                'text-decoration: none',
                'cursor: pointer',
                'color: var(--jn-link)',
                'filter: none',
            ],
            styleSet: {
                hovered: [
                    'filter: brightness(0.8)',
                    'text-decoration: underline',
                ],
                disabled: [
                    'cursor: default',
                    'color: var(--jn-grey)',
                ],
                selected_disabled: [
                    'cursor: default',
                    'color: var(--jn-grey)',
                ],
                selected: [
                    'filter: brightness(0.8)',
                ],
                selected_hovered: [
                    'color: var(--jn-bg)',
                    'filter: brightness(0.8)',
                ],
            },
            options: options
        });
    }
}
