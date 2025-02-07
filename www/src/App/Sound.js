import { Component } from '../../lib/jenyx/components/Component/Component.js'
import { bindLocalStorage } from '../Utils/bindLocalStorage.js';

export class Sound extends Component {
    constructor(options) {
        super({
            isActive: false,
            speakMoves: '',
            moves: null,
            winner: null,
            isDraw: false,
            options
        });

        Sound.init.call(this);
    }

    static init() {
        this.on('moves', () => {
            const preLastMove = this.moves.slice(-2, -1);
            const lastMove = this.moves.slice(-1);

            if (this.moves.length > this.speakMoves.length) {
                const newMoves = this.moves.slice(this.speakMoves.length);
                for (const move of newMoves) {
                    this.play(move);
                }
                this.speakMoves = this.moves;
            }

            if (this.winner) {
                var player = this.winner.player;
                var text = (player == 'x') ? 'crosses win' : 'noughts win';
                this.play(text);
                this.speakMoves = '';
            } else if (this.isDraw) {
                this.play('draw');
                this.speakMoves = '';
            }
        });
    }

    play(text) {
        if (!this.isActive) return;

        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = navigator.language;
            utterance.volume = 1;
            utterance.rate = 1;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        } else {
            alert("Your browser does not support text-to-speech.");
        }
    }
}
