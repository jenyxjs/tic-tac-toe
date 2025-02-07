import { Control } from '../../lib/jenyx/components/Control/Control.js';
import { LinkButton } from '../Buttons/LinkButton.js';
import { IconButton } from '../Buttons/IconButton.js';
import {
    MIC_SVG, MIC_OFF_SVG,
    VOLUME_SVG,
    VOLUME_OFF_SVG,
    INSTALL_MOBILE_SVG
} from '../Buttons/svg.js';

export class Footer extends Control {
    constructor(options) {
        super({
            children: {
                gihubButton: {
                    class: LinkButton,
                    text: '© 2025 Jenyx',
                    href: 'https://github.com/jenyxjs/tic-tac-toe',
                    style: [
                        'flex-shrink: 0',
                    ]
                },
                separator: {
                    class: Control,
                    style: [
                        'flex-basis: 100%',
                    ]
                },
                installButton: {
                    class: IconButton,
                    text: INSTALL_MOBILE_SVG,
                    selected: false,
                    onclick: event => {
                        app.pwa.install();
                    },
                },
                soundButton: {
                    class: IconButton,
                    text: VOLUME_OFF_SVG,
                    selected: false,
                    onclick: event => {
                        var button = event.target;
                        button.selected = !button.selected;
                    },
                    onselected: event => {
                        var button = event.target;
                        button.text = button.selected ? VOLUME_SVG : VOLUME_OFF_SVG;
                    },
                },
                micButton: {
                    class: IconButton,
                    text: MIC_OFF_SVG,
                    selected: false,
                    onclick: event => {
                        var button = event.target;
                        button.selected = !button.selected;
                    },
                    onselected: event => {
                        var button = event.target;
                        button.text = button.selected ? MIC_SVG : MIC_OFF_SVG;
                    },
                },
            },
            style: [
                'display: flex',
                'align-items: center',
                'gap: 0.5rem',
                'width: 100%',
                'padding-top: .5rem',
                'font-size: .7rem',
            ],
            options
        });

        Footer.init.call(this);
    }

    static async init() {
        app.sound.bind('isActive', this.soundButton, 'selected');
        app.mic.bind('isActive', this.micButton, 'selected');

        await app.wait('pwa');

        app.pwa.on('deferedPrompt', event => {
            this.installButton.visible = app.pwa.deferedPrompt;
        }, { run: true });
    }
}