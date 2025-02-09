import { Control } from '../../lib/jenyx/components/Control/Control.js';
import { Label } from '../../lib/jenyx/components/Label/Label.js';
import { LinkButton } from '../../lib/jenyx/components/LinkButton/LinkButton.js';

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
                        'font-size: 5vmin',
                        'flex-basis: 100%',
                    ],
                },
                micButton: {
                    class: LinkButton,
                    text: 'Mic',
                    href: 'https://github.com/jenyxjs/jenyx',
                },
            },
            style: [
                'display: flex',
                'align-items: center',
                'width: 100%',
                'gap: 2vmin',
                'margin: 2vmin 0',
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
        } else if (this.moves) {
            this.message.text = ' ';
        } else {
            this.message.text = 'Make move!';
        }
    }
}