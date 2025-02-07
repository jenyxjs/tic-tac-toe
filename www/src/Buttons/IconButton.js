import { ActiveControl } from '../../lib/jenyx/components/ActiveControl/ActiveControl.js';

export class IconButton extends ActiveControl {
    constructor(options) {
        super({
            style: [
                'display: inline-block',
                'flex-shrink: 0',
                'width: 1rem',
                'height: 1rem',
                'padding: .5rem',
                'border-radius: 5rem',
                'text-decoration: none',
                'cursor: pointer',
                'font-size: 0',
                'fill: var(--jn-text)',
                'background: var(--jn-bg)',
            ],
            styleSet: {
                hovered: [
                    'background: color-mix(in srgb, var(--jn-bg), var(--jn-grey) 10%)'
                ],
                selected: [
                    'background: color-mix(in srgb, var(--jn-bg), var(--jn-grey) 10%)'
                ],
                selected_hovered: [
                    'background: color-mix(in srgb, var(--jn-bg), var(--jn-grey) 10%)'
                ],
            },
            options
        });
    }
}