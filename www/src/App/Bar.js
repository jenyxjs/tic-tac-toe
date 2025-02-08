import { Control } from '../../lib/jenyx/components/Control/Control.js';
import { Label } from '../../lib/jenyx/components/Label/Label.js';

export class Bar extends Control {
    constructor(options) {
        super({
            children: {
                cell_1: {
                    class: Label,
                    text: 'Button',
                },
            },
            style: [

            ],
            options
        });

        Bar.init.call(this);
    }

    static init() {

        // this.gear.on('isDraw', event => {
        //     if (this.gear.isDraw) {
        //         console.log('Draw', this.gear);
        //         setTimeout(() => { this.gear.reset(); }, 500);
        //     }
        // });

        // this.gear.on('winner', event => {
        //     if (this.gear.winner) {
        //         console.log('Win', this.gear);
        //         setTimeout(() => { this.gear.reset(); }, 500);
        //     }
        // });
    }
}