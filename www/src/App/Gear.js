import { Component } from '../../lib/jenyx/components/Component/Component.js'

export class Gear extends Component {
    constructor(options) {
        super({
            moves: '',
            winner: null, // {player: 'x', path: '159'},
            isDraw: false,
            options
        });

        Gear.init.call(this);
    }

    static init() {
        this.bind('moves', this, 'update', { run: true });
    }

    reset() {
        this.activePlayer  = 'x';
        this.winner = null;
        this.isDraw = false;
        this.moves = '';
    }

    update() {
        this.isDraw = (this.moves.length === 9 && !this.winner);
        this.winner = this.getWinner();
        this.activePlayer  = (this.moves.length % 2 === 0) ? 'x' : 'o';

        if (this.activePlayer  === 'o' && !this.winner && !this.isDraw) {
            var move = this.getBotMove();

            if (move) {
                this.moves += move;
            }
        }
    }

    getWinner() {
        var wins = ['123', '456', '789', '147', '258', '369', '159', '357'];

        var xMoves = [...this.moves].filter((_, i) => i % 2 === 0).sort().join('');
        var oMoves = [...this.moves].filter((_, i) => i % 2 !== 0).sort().join('');

        for (var win of wins) {
            if ([...win].every(cell => xMoves.includes(cell))) {
                return { player: 'x', path: win };
            }
            if ([...win].every(cell => oMoves.includes(cell))) {
                return { player: 'o', path: win };
            }
        }


        return null;
    }

    getBotMove() {
        const wins = ['123', '456', '789', '147', '258', '369', '159', '357'];
        const xMovesSet = new Set([...this.moves].filter((_, i) => i % 2 === 0));
        const oMovesSet = new Set([...this.moves].filter((_, i) => i % 2 !== 0));
        const availableMoves = '123456789'.split('').filter(cell => !this.moves.includes(cell));

        const findWinningMove = (movesSet, opponentMovesSet) => {
            for (const win of wins) {
                const winSet = new Set([...win]);
                const currentCells = [...winSet].filter(cell => movesSet.has(cell));
                const missing = [...winSet].filter(cell => !movesSet.has(cell));
                const opponentHasMissing = [...winSet].some(cell => opponentMovesSet.has(cell));

                if (currentCells.length === 2 && missing.length === 1 && !opponentHasMissing) {
                    if (availableMoves.find(m => m === missing[0])) {
                        return missing[0];
                    }
                }
            }
            return null;
        };

        const winningMove = findWinningMove(oMovesSet, xMovesSet);
        if (winningMove) {
            return winningMove;
        }

        const blockingMove = findWinningMove(xMovesSet, oMovesSet);
        if (blockingMove) {
            return blockingMove;
        }

        return availableMoves.find(cell => cell === '5') ||
            availableMoves.find(cell => '1379'.includes(cell)) ||
            availableMoves.find(cell => '2468'.includes(cell)) ||
            availableMoves[0];
    }
}