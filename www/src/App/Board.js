import { Control } from '../../lib/jenyx/components/Control/Control.js';
import { Button } from './Button.js'

export class Board extends Control {
    constructor (options) {
        super({
            moves: '',
            children: {
                cell_1: { class: Button },
                cell_2: { class: Button },
                cell_3: { class: Button },
                cell_4: { class: Button },
                cell_5: { class: Button },
                cell_6: { class: Button },
                cell_7: { class: Button },
                cell_8: { class: Button },
                cell_9: { class: Button },
            },
            style: [
                'display: grid',
                'grid-template-columns: repeat(3, 1fr)',
                'max-height: 50vh',
                'max-width: 50vh',
                'margin: 0 auto',
                'font-size: 2vw',
                'font-family: cursive',
                'background: aliceblue',
            ],
            options
        });

        Board.init.call(this);
    }

    static init () {
        Object.entries(this.children).forEach(([key, cell], index) => {
            cell.on('click', () => {
                if (!cell.text) {
                    this.moves += (index + 1);
                }
            });
        });

        this.bind('moves', this, 'redraw');
    }

    redraw () {
        for (var i in this.children) {
            this[i].text = '';
        }

        for (var i in this.moves) {
            var cell = this['cell_' + this.moves[i]];
            cell.text = i % 2 ? 'o' : 'x';
        }
    }
}