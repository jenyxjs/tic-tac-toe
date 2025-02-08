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
                children: {
                    bar: { class: Bar, },
                    board: { class: Board, },
                },
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
    }
}

new App(window);

