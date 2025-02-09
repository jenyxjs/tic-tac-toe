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
                    style: [
                        'padding: 2vmin',
                        'text-align: center',
                        'font-size: 5vmin',
                    ],
                },
            },
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
        } else if (this.moves) {
            this.message.text = 'Game in progress';
        } else {
            this.message.text = 'Start the game';
        }
    }
}