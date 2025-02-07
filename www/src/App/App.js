import { AbstractApp } from './AbstractApp.js';
import { Layout } from '../Layout/Layout.js';
import { Gear } from './Gear.js';
import { Sound } from './Sound.js';
import { Mic } from './Mic.js';
import { Pwa } from './Pwa.js';
import { GoogleTagManager } from '../GoogleAnalytics/GoogleTagManager.js';
import { GoogleAnalytics } from '../GoogleAnalytics/GoogleAnalytics.js';

export class App extends AbstractApp {
    constructor() {
        super({
            moves: '',
            winner: null,
            isDraw: false,
            gear: { class: Gear, },
            mic: { class: Mic, },
            sound: { class: Sound, },
            layout: {
                class: Layout,
                parentNode: document.body,
            },
            pwa: {
                class: Pwa,
                serviceWorkerFileName: './serviceWorker.js',
            },
            googleAnalytics: {
                class: GoogleAnalytics,
                id: 'G-E5FS8CEFK4',
            },
            googleTagManager: {
                class: GoogleTagManager,
                id: 'GTM-PLSCZB4Z',
            },
        });

        App.init.call(this);
    }

    static init() {
        this.bind('moves', this.gear);
        this.bind('winner', this.gear);
        this.bind('isDraw', this.gear);

        this.bind('moves', this.layout.bar);
        this.bind('winner', this.layout.bar);
        this.bind('isDraw', this.layout.bar);

        this.bind('moves', this.layout.board);
        this.bind('winner', this.layout.board);
        this.bind('isDraw', this.layout.board);

        this.bind('moves', this.sound);
        this.bind('winner', this.sound);
        this.bind('isDraw', this.sound);

        this.layout.board.bind('newgame', this.gear, 'reset');
    }
}

new App(window);