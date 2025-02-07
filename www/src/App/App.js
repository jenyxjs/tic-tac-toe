import { AbstractApp } from '../../lib/jenyx/components/AbstractApp/AbstractApp.js'
import { Board } from './Board.js';
import { Gear } from './Gear.js';

export class App extends AbstractApp {
    constructor () {
        super({
            board: {
                class: Board,
                parentNode: document.body,
            },
            gear: {
                class: Gear,
            },
        });

        App.init.call(this);
    }

    static init () {
        this.gear.bind('moves', this.board);

        this.gear.on('isDraw', event => {
            if (this.gear.isDraw) {
                console.log('Draw', this.gear);
                setTimeout(() => { this.gear.reset(); }, 500);
            }
        });

        this.gear.on('winner', event => {
            if (this.gear.winner) {
                console.log('Win', this.gear);
                setTimeout(() => { this.gear.reset(); }, 500);
            }
        });
    }
}

new App(window);

