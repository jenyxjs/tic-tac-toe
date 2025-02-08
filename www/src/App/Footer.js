import { Control } from '../../lib/jenyx/components/Control/Control.js';
import { Label } from '../../lib/jenyx/components/Label/Label.js';
import { LinkButton } from '../../lib/jenyx/components/LinkButton/LinkButton.js';

export class Footer extends Control {
    constructor(options) {
        super({
            children: {
                message: {
                    class: Label,
                    text: '© 2025',
                },
                gihub: {
                    class: LinkButton,
                    text: 'GitHub',
                    href: 'https://github.com/jenyxjs/jenyx',
                },
            },
            style: [
                'display: flex',
                'width: 100%',
                'gap: 3vmin',
                'font-size: 4vmin',
                'padding-top: 2vmin',
            ],
            options
        });
    } 
}