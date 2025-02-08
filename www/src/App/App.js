import { AbstractApp } from '../../lib/jenyx/components/AbstractApp/AbstractApp.js'
import { Control } from '../../lib/jenyx/components/Control/Control.js';
import { CssRule } from '../../lib/jenyx/components/CssRule/CssRule.js';
import { Bar } from './Bar.js';
import { Board } from './Board.js';
import { Footer } from './Footer.js';
import { Gear } from './Gear.js';

export class App extends AbstractApp {
    constructor() {
        super({
            layout: {
                class: Control,
                parentNode: document.body,
                margin: 0,
                children: {
                    bar: { class: Bar, },
                    board: { class: Board, 
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
                    'font-family: cursive',
                ]
            },
            gear: { class: Gear, },
        });

        new CssRule({
            selector: 'html, body',
            style: [
                'height: 100%',
                'max-height: 100%',
                'margin: 0',
            ]
        });

        App.init.call(this);
    }

    static init() {
        this.gear.bind('moves', this.layout.bar);
        this.gear.bind('winner', this.layout.bar);
        this.gear.bind('isDraw', this.layout.bar);

        this.gear.bind('moves', this.layout.board);
        this.gear.bind('winner', this.layout.board);
        this.gear.bind('isDraw', this.layout.board);
    }
}

new App(window);