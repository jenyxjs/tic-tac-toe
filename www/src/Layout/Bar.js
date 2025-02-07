import { Control } from '../../lib/jenyx/components/Control/Control.js';
import { Label } from '../../lib/jenyx/components/Label/Label.js';

export class Bar extends Control {
    constructor(options) {
        super({
            moves: '',
            winner: null,
            isDraw: false,
            children: {
                message: {
                    class: Label,
                },
            },
            style: [
                'display: flex',
                'align-items: center',
                'justify-content: center',
                'margin: .5rem 0',
                'font-size: 1.25rem'
            ],
            options
        });

        Bar.init.call(this);
    }

    static init() {
        this.bind('moves', this, 'refresh');
        this.bind('isDraw', this, 'refresh');
        this.bind('winner', this, 'refresh', { run: true });
    }

    refresh() {
        if (this.isDraw) {
            this.message.text = 'Draw';
        } else if (this.winner) {
            this.message.text = 'Win - ' + this.winner.player.toUpperCase();

            if (this.winner.player === 'x') {
                this.message.style = 'color: LimeGreen';
            } if (this.winner.player === 'o') {
                this.message.style = 'color: Tomato';
            }
        } else {
            this.message.text = 'Make move!';
            this.message.style = 'color: none';
        }
    }
}