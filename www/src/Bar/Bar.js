import { Control } from '../../lib/jenyx/components/Control/Control.js';
import { Label } from '../../lib/jenyx/components/Label/Label.js';
import { IconButton } from '../IconButton/IconButton.js';
import { MENU_SVG } from './MENU_SVG.js';

export class Bar extends Control {
    constructor(options) {
        super({
            moves: '',
            winner: null,
            isDraw: false,
            children: {
                mwnuButton: {
                    class: IconButton,
                    text: MENU_SVG,
                    onclick: event => {

                    },
                },
                message: {
                    class: Label,
                    style: [
                        'flex-basis: 100%',
                    ],
                },
                micButton: {
                    class: IconButton,
                    text: MIC_OFF_SVG,
                    selected: false,
                    onclick: event => {
                        var button = event.target;
                        button.selected = !button.selected;
                        button.text = button.selected ? MIC_SVG : MIC_OFF_SVG;
                    },
                },
                soundButton: {
                    class: IconButton,
                    text: VOLUME_OFF_SVG,
                    selected: false,
                    onclick: event => {
                        var button = event.target;
                        button.selected = !button.selected;
                        button.text = button.selected ? VOLUME_SVG : VOLUME_OFF_SVG;
                    },
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

var MIC_SVG = `<svg style="transform: scale(1.0); stroke-width: 0px; width: 100%; height: 100%" viewBox="0 -960 960 960"><path d="M480-423q-43 0-72-30.92-29-30.91-29-75.08v-251q0-41.67 29.44-70.83Q437.88-880 479.94-880t71.56 29.17Q581-821.67 581-780v251q0 44.17-29 75.08Q523-423 480-423Zm0-228Zm-30 531v-136q-106-11-178-89t-72-184h60q0 91 64.29 153t155.5 62q91.21 0 155.71-62Q700-438 700-529h60q0 106-72 184t-178 89v136h-60Zm30-363q18 0 29.5-13.5T521-529v-251q0-17-11.79-28.5T480-820q-17.42 0-29.21 11.5T439-780v251q0 19 11.5 32.5T480-483Z"/></svg>`;
var MIC_OFF_SVG = `<svg style="transform: scale(1.0); stroke-width: 0px; width: 100%; height: 100%" viewBox="0 -960 960 960"><path d="m710-362-58-58q14-23 21-48t7-52h80q0 44-13 83.5T710-362ZM480-594Zm112 112-72-72v-206q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v126l-80-80v-46q0-50 35-85t85-35q50 0 85 35t35 85v240q0 11-2.5 20t-5.5 18ZM440-120v-123q-104-14-172-93t-68-184h80q0 83 57.5 141.5T480-320q34 0 64.5-10.5T600-360l57 57q-29 23-63.5 39T520-243v123h-80Zm352 64L56-792l56-56 736 736-56 56Z"/></svg>`;
var VOLUME_SVG = `<svg style="transform: scale(1.25); stroke-width: 0px; width: 100%; height: 100%" viewBox="0 -960 960 960"><path d="M200-360v-240h160l200-200v640L360-360H200Zm440 40v-322q45 21 72.5 65t27.5 97q0 53-27.5 96T640-320ZM480-606l-86 86H280v80h114l86 86v-252ZM380-480Z"/></svg>`;
var VOLUME_OFF_SVG = `<svg style="transform: scale(1.25); stroke-width: 0px; width: 100%; height: 100%" viewBox="0 -960 960 960"><path d="m616-320-56-56 104-104-104-104 56-56 104 104 104-104 56 56-104 104 104 104-56 56-104-104-104 104Zm-496-40v-240h160l200-200v640L280-360H120Zm280-246-86 86H200v80h114l86 86v-252ZM300-480Z"/></svg>`;
