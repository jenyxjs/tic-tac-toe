import { Control } from '../../lib/jenyx/components/Control/Control.js';
import { Label } from '../../lib/jenyx/components/Label/Label.js';

export class Footer extends Control {
    constructor(options) {
        super({
            children: {
                message: {
                    class: Label,
                    text: '© 2025',
                    style: [
                        'padding-top: 2vmin',
                        'font-size: 3vmin',
                    ],
                },
            },
            options
        });
    } 
}