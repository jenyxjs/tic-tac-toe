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
                'height: 100%',
                'aspect-ratio: 1 / 1',
                'justify-items: stretch',
                'font-size: 20vw',
                'font-family: cursive',
                'background: aliceblue',
            ],
            options
        });

        Board.init.call(this);
    }

    static init () {
        this.initGrid();
        this.bind('moves', this, 'redraw');
    }

    initGrid () {
        Object.entries(this.children).forEach(([key, cell], index) => {
            let borderStyle = [];

            if (![0, 1, 2].includes(index)) borderStyle.push('border-top: 2px solid black');
            if (![6, 7, 8].includes(index)) borderStyle.push('border-bottom: 2px solid black');
            if (![0, 3, 6].includes(index)) borderStyle.push('border-left: 2px solid black');
            if (![2, 5, 8].includes(index)) borderStyle.push('border-right: 2px solid black');

            cell.style = borderStyle;

            cell.on('click', () => {
                if (!cell.text) {
                    this.moves += (index + 1);
                }
            });
        });
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