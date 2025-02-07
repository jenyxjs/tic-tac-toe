import { Component } from '../../lib/jenyx/components/Component/Component.js'

export class Gear extends Component {
    constructor (options) {
        super({
            moves: '',
            winner: null, // {user: 'x', path: '159'},
            isDraw: false,
            options
        });

        Gear.init.call(this);
    }

    static init () {
        this.bind('moves', this, 'update', {run: true});
    }

    reset () {
        this.currentPlayer = 'x';
        this.winner = null;
        this.isDraw = false;
        this.moves = '';
    }

    update () {
        this.isDraw = (this.moves.length === 9 && !this.winner);
        this.winner = this.getWinner();
        this.currentPlayer = (this.moves.length % 2 === 0) ? 'x' : 'o';

        if (this.currentPlayer === 'o' && !this.winner && !this.isDraw) {
            var move = this.getBotMove();

            if (move) {
                this.moves += move;
            }
        }
    }

    getWinner () {
        var wins = ['123', '456', '789', '147', '258', '369', '159', '357'];

        var xMoves = [...this.moves].filter((_, i) => i % 2 === 0).sort().join('');
        var oMoves = [...this.moves].filter((_, i) => i % 2 !== 0).sort().join('');

        for (var win of wins) {
            if ([...win].every(cell => xMoves.includes(cell))) {
                return { user: 'x', path: win };
            }
            if ([...win].every(cell => oMoves.includes(cell))) {
                return { user: 'o', path: win };
            }
        }

        return null;
    }
    
    getBotMove () {
        var wins = ['123', '456', '789', '147', '258', '369', '159', '357'];
        var xMoves = [...this.moves].filter((_, i) => i % 2 === 0).sort().join('');
        var oMoves = [...this.moves].filter((_, i) => i % 2 !== 0).sort().join('');
        var availableMoves = '123456789'.split('').filter(cell => !this.moves.includes(cell));

        for (var win of wins) {
            var oCells = [...win].filter(cell => oMoves.includes(cell));
            var missing = [...win].filter(cell => !oMoves.includes(cell));

            if (oCells.length === 2 && availableMoves.includes(missing[0])) {
                return missing[0];
            }
        }

        for (var win of wins) {
            var xCells = [...win].filter(cell => xMoves.includes(cell));
            var missing = [...win].filter(cell => !xMoves.includes(cell));

            if (xCells.length === 2 && availableMoves.includes(missing[0])) {
                return missing[0];
            }
        }

        return availableMoves.includes('5') ? '5' :
            availableMoves.find(cell => '1379'.includes(cell)) || 
            availableMoves.find(cell => '2468'.includes(cell)) || 
            availableMoves[0];
    }
}