import { Control } from '../../lib/jenyx/components/Control/Control.js';
import { Button } from '../Buttons/Button.js'

export class Board extends Control {
    constructor(options) {
        super({
            moves: '',
            winner: null,
            isDraw: false,
            children: {
                cell_1: { class: Button },
                cell_2: { class: Button },
                cell_3: { class: Button },
                cell_4: { class: Button },
                cell_5: { class: Button },
                cell_6: { class: Button },
                cell_7: { class: Button },
                cell_8: { class: Button },
                cell_9: { class: Button },
            },
            style: [
                'display: grid',
                'grid-template-columns: repeat(3, 1fr)',
                'line-height: 0',
                'font-size: 0',
                'margin: auto',
                `background: url("src/Assets/BOARD_SVG.svg")`,
            ],
            options
        });

        Board.init.call(this);
    }

    static init() {
        this.on('click', event => {
            if (this.winner || this.isDraw) {
                this.emit('newgame');
            } else {
                this.appendMove(event);
            }
        }, { bubbling: true });

        this.bind('moves', this, 'redraw', { run: true });
    }

    appendMove(event) {
        if (!event.target.text) {
            var index = event.target.name.split('_')[1];
            this.moves += index;
        }
    }

    redraw() {
        for (var i in this.children) {
            this[i].text = '';
        }

        for (var i in this.moves) {
            var cell = this['cell_' + this.moves[i]];
            cell.text = i % 2 ? O_SVG : X_SVG;
            cell.style = 'transition: opacity 0s; opacity: 1;';
        }

        if (cell) {
            var ms = 200;

            cell.style = 'transition: opacity 0s; opacity: 0;';
            setTimeout(() => {
                cell.style = `transition: opacity ${ms}ms; opacity: 1;`;
                setTimeout(() => this.effect(), ms);
            });
        }

        if (!this.moves.length) {
            this.effect();
        }
    }

    effect() {
        if (this.winner) {
            var color = (this.winner.player == 'x') ? 'LimeGreen' : 'Tomato';

            for (var i in this.winner.path) {
                var cell = this['cell_' + this.winner.path[i]];
                cell.style = 'fill: ' + color;
            }
        } else if (this.isDraw) {
            for (var i in this.children) {
                this[i].style = 'fill: gray';
            }
        } else {
            for (var i in this.children) {
                this[i].style = 'fill: var(--jn-text)';
            }
        }
    };
}

var X_SVG = `<svg width="100%" height="100%" viewBox="0 0 960 960">
<path d="M607 725L474 547C436.667 599.667 399.667 658 363 722C355 736.667 344.333 745 331 747C318.333 749 306.333 746.667 295 740C283.667 733.333 275.667 724 271 712C266.333 699.333 268.333 686 277 672C320.333 600.667 364.667 530.667 410 462L286 297C276 283.667 272.333 270.667 275 258C278.333 245.333 285.333 235.333 296 228C306.667 220 318.667 216.333 332 217C345.333 217.667 356.667 224.333 366 237L470 374C506 327.333 542.667 281 580 235C589.333 223.667 600.667 217.667 614 217C627.333 215.667 639.333 219 650 227C660.667 234.333 666.667 245.333 668 260C670 274 666.667 286.333 658 297C616 347.667 574.333 401.667 533 459L689 669C698.333 682.333 701.333 695.333 698 708C694.667 720 687.333 729.667 676 737C665.333 744.333 653.333 747.667 640 747C627.333 745.667 616.333 738.333 607 725Z"/>
</svg>`;

var O_SVG = `<svg width="100%" height="100%" viewBox="0 0 960 960">
<path d="M535 739C447 760.333 376.667 742.667 324 686C282 642.667 256 587 246 519C238.667 465.667 245 415 265 367C289 305.667 327 260.333 379 231C389.667 225 403 220.667 419 218C419.667 218 424.333 217.667 433 217C436.333 216.333 439 215.667 441 215C451 213 461 214 471 218C476.333 218 484 218.333 494 219C504.667 219.667 515 220.667 525 222C535 222.667 542.667 223.667 548 225L567 232C575 234.667 582.667 238 590 242C597.333 246 605.333 250.667 614 256C636 270.667 654.333 289 669 311C683.667 332.333 695.333 355.333 704 380C712.667 404 718 427.333 720 450C722 472.667 721 492 717 508C711 544 700.333 577.333 685 608C669.667 639.333 648.333 667 621 691C594.333 715 565.667 731 535 739ZM504 635C529.333 631.667 550.667 621.667 568 605C585.333 587.667 598.333 567 607 543C615.667 518.333 619.667 493 619 467C618.333 440.333 613 415.667 603 393C593 370.333 578 352.667 558 340C550.667 334.667 544.667 331 540 329C535.333 326.333 530 324 524 322C520 321.333 513 320.667 503 320C493.667 319.333 484 318.667 474 318C464 317.333 457 317 453 317C451 317 448.667 316.667 446 316C438.667 316.667 434.667 317 434 317L427 319C407.667 329.667 391 345 377 365C363.667 384.333 354 406.333 348 431C342 455 341.333 479.333 346 504C353.333 549.333 369.667 583.667 395 607C422.333 632.333 458.667 641.667 504 635Z"/>
</svg>`;