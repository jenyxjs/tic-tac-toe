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
                gihubButton: {
                    class: LinkButton,
                    text: 'Jenyx',
                    href: 'https://github.com/jenyxjs/tic-tac-toe',
                },
                installButton: {
                    class: LinkButton,
                    text: 'Install',
                    href: 'https://github.com/jenyxjs/jenyx',
                },
                themeButton: {
                    class: LinkButton,
                    text: 'Theme',
                    href: 'https://github.com/jenyxjs/jenyx',
                },
                languageButton: {
                    class: LinkButton,
                    text: 'Language',
                    href: 'https://github.com/jenyxjs/jenyx',
                },
            },
            style: [
                'display: flex',
                'gap: 3vmin',
                'font-size: 4vmin',
                'padding-top: 3vmin',
                'width: 100%',
            ],
            options
        });
    } 
}