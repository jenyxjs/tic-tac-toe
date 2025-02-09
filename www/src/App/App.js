import { AbstractApp } from '../../lib/jenyx/components/AbstractApp/AbstractApp.js';
import { Layout } from '../Layout/Layout.js';
import { Gear } from './Gear.js';

export class App extends AbstractApp {
    constructor() {
        super({
            layout: {
                class: Layout,
                parentNode: document.body,
            },
            gear: { class: Gear, },
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

        this.layout.board.bind('newgame', this.gear, 'reset');
    }
}

new App(window);