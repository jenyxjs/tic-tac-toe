import { Control } from '../../lib/jenyx/components/Control/Control.js';
import { CssRule } from '../../lib/jenyx/components/CssRule/CssRule.js';
import { Bar } from '../Bar/Bar.js';
import { Board } from '../Board/Board.js';
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
                'width: fit-content',
                'margin: auto',
                `font-family: 'Patrick Hand', cursive`,
                'font-size: clamp(1rem, 6vmin, 3rem)',
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

        new CssRule({
            selector: ':root',
            style: [
                `--jn-primary: hsl(200 50% 90%)`,
                `--jn-bg: hsl(0 0% 100%)`,
                `--jn-text: hsl(0 0% 10%)`,
                `--jn-link: hsl(0 0% 15%)`,
                `--jn-grey: hsl(0 0% 50%)`,
            ]
        });
    }
}
