import { Component } from '../../lib/jenyx/components/Component/Component.js';
import { bindLocalStorage } from '../Utils/bindLocalStorage.js';
import { SpeechRecognition } from '../Utils/SpeechRecognition.js';

export class Mic extends Component {
    constructor(options) {
        super({
          isActive: false,
          speechRecognition: {
            class: SpeechRecognition,
          },
          options,
        });

        Mic.init.call(this);
    }
    
    static init() {
        this.bind('isActive', this.speechRecognition);
        this.speechRecognition.bind('text', this, 'recognize');
        bindLocalStorage('isActive', this, 'mic_is_activated');
    }

    static numberMap = {
        'start': 'start', 'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', // en
        'start': 'start', 'eins': '1', 'zwei': '2', 'drei': '3', 'vier': '4', 'fünf': '5', 'sechs': '6', 'sieben': '7', 'acht': '8', 'neun': '9', // de
        'début': 'start', 'un': '1', 'deux': '2', 'trois': '3', 'quatre': '4', 'cinq': '5', 'six': '6', 'sept': '7', 'huit': '8', 'neuf': '9', // fr
        'inicio': 'start', 'uno': '1', 'dos': '2', 'tres': '3', 'cuatro': '4', 'cinco': '5', 'seis': '6', 'siete': '7', 'ocho': '8', 'nueve': '9', // es
        'старт': 'start', 'один': '1', 'два': '2', 'три': '3', 'четыре': '4', 'пять': '5', 'шесть': '6', 'семь': '7', 'восемь': '8', 'девять': '9', // ru
    };

    recognize(event) {
        const recognizedText = event.target.text.toLowerCase();

        const result = Mic.numberMap[recognizedText] ||
            recognizedText.replace(/\D/g, '');

        if (result == 'start') {
            app.moves = '';
        }

        if (result.length === 1 && '123456789'.includes(result)) {    
            if (app.winner || app.isDraw) {
                app.moves = '';
            }

            if (!app.moves.includes(result)) {
                app.moves += result;
            }
        }
    }
}
