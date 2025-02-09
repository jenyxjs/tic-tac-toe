import { ActiveControl } from '../../lib/jenyx/components/ActiveControl/ActiveControl.js';

export class IconButton extends ActiveControl {
    constructor(options) {
        super({
            style: [
                'display: inline-block',
                'flex-shrink: 0',
                'width: 6vmin',
                'height: 6vmin',
                'padding: 3vmin',
                'border-radius: 6vmin',
                'text-decoration: none',
                'cursor: pointer',
                'font-size: 0',
                //'fill: red',
                'background: green',
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