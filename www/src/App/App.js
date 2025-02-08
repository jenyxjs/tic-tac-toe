import { AbstractApp } from '../../lib/jenyx/components/AbstractApp/AbstractApp.js'
import { Control } from '../../lib/jenyx/components/Control/Control.js';
import { CssRule } from '../../lib/jenyx/components/CssRule/CssRule.js';
import { Bar } from './Bar.js';
import { Board } from './Board.js';
import { Gear } from './Gear.js';

export class App extends AbstractApp {
    constructor() {
        super({
            layout: {
                class: Control,
                parentNode: document.body,
                margin: 0,
                children: {
                    bar: {
                        class: Bar,
                        style: [
                            'font-size: 5vmin',
                        ],
                    },
                    board: {
                        class: Board,
                        style: [
                            'font-size: 20vmin',
                        ],
                    },
                },
                style: [
                    'display: flex',
                    'flex-direction: column',
                    'margin: 0 1em',
                ]
            },
            gear: {
                class: Gear,
            },
        });

        App.init.call(this);
    }

    static init() {
        this.gear.bind('moves', this.layout.board);
        this.gear.bind('winner', this.layout.board);
        this.gear.bind('isDraw', this.layout.board);

        new CssRule({
            selector: 'html, body',
            style: [
                'height: 100%',
                'max-height: 100%',
                'margin: 0',
            ]
        });

        new ResizeObserver(() => {
            clearTimeout(resizeTimeout);
            var resizeTimeout = setTimeout(() => {
                this.layout.margin = 0;
                this.redraw();
            }, 500);
        }).observe(document.body);
    }

    redraw() {
        var scroll = document.body.scrollHeight - window.innerHeight

        if (scroll > 0) {
            this.layout.margin++;
        } else if (scroll < -24) {
            this.layout.margin--;
        }

        this.layout.node.style.margin = '0 ' + (this.layout.margin || 1) + 'em';

        if (document.body.scrollHeight - window.innerHeight > 0) {
            this.redraw();
        } else {
            setTimeout(() => this.redraw());
        }
    }
}

new App(window);

