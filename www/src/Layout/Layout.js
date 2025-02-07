import { Control } from '../../lib/jenyx/components/Control/Control.js';
import { CssRule } from '../Utils/CssRule.js';
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
                        'height: 70vmin',
                        'width: 70vmin',
                    ]
                },
                footer: { class: Footer, },
            },
            style: [
                'display: flex',
                'flex-direction: column',
                'align-items: center',
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
                'font-size: clamp(14px, 5vmin, 36px)',
                `font-family: monospace`,
            ]
        });

        new CssRule({
            selector: ':root',
            style: [
                `--jn-bg: hsl(0 0% 100%)`,
                `--jn-text: hsl(210 0% 30%)`,
                `--jn-grey: hsl(0 0% 50%)`,
                `--jn-link: hsl(0 0% 15%)`,
                `--jn-primary: hsl(200 50% 90%)`,
            ]
        });
    }
}
