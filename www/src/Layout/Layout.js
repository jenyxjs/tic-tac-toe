import { Control } from '../../lib/jenyx/components/Control/Control.js';
import { CssRule } from '../../lib/jenyx/components/CssRule/CssRule.js';
import { Bar } from './Bar.js';
import { Board } from './Board.js';
import { Footer } from './Footer.js';

export class Layout extends Control {
    constructor(options) {
        super({
            children: {
                bar: { class: Bar, },
                board: {
                    class: Board,
                    style: [
                        'height: 80vmin',
                        'width: 80vmin',
                    ]
                },
                footer: { class: Footer, },
            },
            style: [
                'display: flex',
                'flex-direction: column',
                'align-items: center',
                'font-family: system-ui',
                'width: fit-content',
                'margin: auto',
            ],
            options
        });

        Layout.init.call(this);
    }

    static init() {
        new CssRule({
            selector: 'html, body',
            style: [
                'height: 100%',
                'max-height: 100%',
                'margin: 0',
            ]
        });
    }
}
