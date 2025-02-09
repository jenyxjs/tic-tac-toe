import { AbstractApp } from '../../lib/jenyx/components/AbstractApp/AbstractApp.js';
import { CssRule } from '../../lib/jenyx/components/CssRule/CssRule.js';
import { Layout } from './Layout.js';
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