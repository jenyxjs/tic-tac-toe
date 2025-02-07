import { Component } from '../../lib/jenyx/components/Component/Component.js'

export class SpeechRecognition extends Component {
    constructor(options) {
        super({
            recognition: {
                class: window.SpeechRecognition || window.webkitSpeechRecognition,
            },
            lang: navigator.language,
            isActive: false,
            currentState: 'stop',
            text: '',
            options
        });

        this.recognition.interimResults = true;
        this.recognition.continuous = true;

        SpeechRecognition.init.call(this);
    }

    static async init() {
        this.recognition.addEventListener('result', event => {
            this.update(event);
        });

        this.recognition.addEventListener('start', event => {
            this.currentState = 'start';
        });

        this.recognition.addEventListener('end', event => {
            this.currentState = 'stop';
        });

        this.bind('lang', this.recognition);
        this.bind('currentState', this, 'refresh');
        this.bind('isActive', this, 'refresh', { run: true });
    };

    refresh() {
        if (this.isActive && this.currentState == 'stop') {
            this.transcripted = '';
            this.text = '';
            this.recognition.start();
        } else {
            this.recognition.stop();
        }
    }

    update(event) {
        for (var i = event.resultIndex; i < event.results.length; i++) {
            var result = event.results[i];
            this.text = result[0].transcript.trim();
        }
    }
};