class Event {
    constructor (options) {
        this.type = options.type;
        this.target = options.target;
        this.value = options.value;
        this.targetType = options.targetType;
        this.send();
    }

    send () {
        var context = this.target;

        do {
            for (var i in context._.listeners) {
                var listener = context._.listeners[i];

                var isHandler = listener.handler;
                var isType = (listener.type == this.targetType);
                var isTarget = (listener.context == this.target);
                var isBubbling = listener.bubbling;
                if (!isHandler || !isType || !(isTarget || isBubbling)) continue;

                if (listener.final) {
                    clearTimeout(listener.finalTmeoutId);
                    listener.finalTmeoutId = setTimeout(() => {
                        listener.handler.call(listener.context, this, listener);
                    });
                } else {
                    listener.handler.call(listener.context, this, listener);
                }
            }

            context = context.parent;
        } while (context);
    }
}

class Listener {
    constructor (options) {
        this.id = ++Listener.id;
        options.context._.listeners[this.id] = this;
        this.type = options.type;
        this.context = options.context;
        this.handler = options.handler;
        this.bubbling = options.bubbling;
        this.final = options.final;
        this.finalTmeoutId = 0;
        options.run && this.run();
        options.exist && this.exist();
    }

    static id = 0;

    remove () {
        delete this.context._.listeners[this.id];
    }

    run () {
        this.handler.call(this.context);
    }

    exist () {
        if (this.context[this.type]) {
            this.handler.call(this.context);
        }
    }
}

/**
 * Jenyx UI Library
 * 
 * Author: Alexey Khakhalin (https://github.com/jenyxjs)
 * Contact: alexey.hahalin@gmail.com
 * License: MIT
 */


class Component {
    constructor (options) {
        Object.defineProperty(this, '_', { enumerable: false, value: {} });
        this.defineProperty('name', { enumerable: false });
        this.defineProperty('host', { enumerable: false });
        this.defineProperty('parent', { enumerable: false });
        this._.jenyxClass = true;
        this._.children = {};
        this._.listeners = {};
        this.options = options;
    }

    static version = '0.x';

    get fullname () {
        var fullname = [];

        var constructor = this.constructor;

        while (constructor.name) {
            fullname.unshift(constructor.name);
            constructor = constructor.__proto__;
        }

        return fullname.join('_');
    }

    get listeners () {
        return this._.listeners;
    }

    set listeners (listeners) {
        for (var type in listeners) {
            var handler = listeners[type];
            this.on(type, handler);
        }
    }

    removeListeners (type) {
        for (var i in this._.listeners) {
            var listener = this._.listeners[i];
            (listener.type == type) && listener.remove();
        }
    }

    emit (type, value) {
        var event = new Event({
            targetType: type,
            type: type,
            value: value,
            target: this,
        });

        this['on' + type] && this['on' + type](event);

        new Event({
            targetType: '*',
            type: type,
            value: value,
            target: this,
        });
    }

    on (type, handler, options) {
        return new Listener({
            context: this,
            type: type,
            handler: handler,
            bubbling: options?.bubbling,
            run: options?.run,
            exist: options?.exist,
            final: options?.final,
        });
    }

    wait (type, options) {
        if (this[type]) return this[type];

        return new Promise(resolve => {
            var listener = this.on(type, event => {
                listener.remove();
                resolve(this[type]);
            }, options);
        });
    }

    bind (type, object, key, options) {
        key ||= type;

        if (typeof object[key] == 'function') {
            this._bindFunction(type, object, key, options);
        } else {
            this._bindProperty(type, object, key, options);
        }
    }

    _bindFunction (type, object, key, options) {
        this.on(type, event => {
            object[key].call(object, event, this[type]);
        }, options);
    }

    _bindProperty (type, object, key, options) {
        var runOptions = { ...options, run: true };

        this.on(type, event => {
            object[key] = this[type];
        }, runOptions);

        object?._?.jenyxClass && object.on(key, event => {
            this[type] = object[key];
        }, runOptions);
    }

    defineProperty (name, options) {
        var enumerable = (options?.enumerable === false) ? false : true;

        Object.defineProperty(this, name, {
            get: function () {
                return this._[name];
            },
            set: function (value) {
                if (this._[name] !== value) {
                    this._[name] = value;
                    this.emit(name, value);
                }
            },
            enumerable: enumerable,
        });
    }

    set options (options) {
        for (var name in options) {
            var value = options[name];
            var newClass = value?.class;
            var newProperty = !(name in this);

            if (newClass) {
                !Object.hasOwn(this, name) && this.defineProperty(name);
                this[name] = this.getNewClass(name, value);
            } else if (newProperty) {
                this.defineProperty(name);
                this[name] = value;
            } else if (
                this[name]?._?.jenyxClass &&
                name != 'host' &&
                this[name].options !== value
            ) {
                this[name].options = value;
            } else {
                this[name] = value;
            }
        }

        this.emit('options', options);
    }

    get children () {
        return this._.children;
    }

    set children (children) {
        for (var name in children) {
            var value = children[name];

            if (value?.class) {
                var child = this.getNewClass(name, value);
                this.appendChild(name, child);
            }
        }

        this.emit('children');
    }

    getNewClass (name, value = {}) { 
        var { class: Class, ...newOptions } = Object.assign({
            name: name,
            host: this,
        }, value);

        return new Class(newOptions);
    }

    appendChild (name, child) {
        child.parent = this;
        this._.children[name] = child;

        !this.hasOwnProperty(name) && Object.defineProperty(this, name, {
            get: function () {
                return this.children[name];
            },
            set: function (child) {
                this.children[name] = child;
            }
        });

        this.emit('child', child);
    }

    removeChildren () {
        this._.children = {};
        this.emit('child');
    }

    replaceChildren (children) {
        this.removeChildren();
        this.children = children;
    }
}

class AbstractApp extends Component {
    constructor (options) {
        super({ app: null });

        (options.root || window).app = this;
        this.options = options;

        this.app = this;
    }
}

function createElement (tagName, parentNode, attrs, css) {
	var node = document.createElement(tagName);

	parentNode?.appendChild(node);
	return node;
}

class Control extends Component {
	constructor (options) {
		super();

		this.defineProperty('node', { enumerable: false });
		var tagName = options?.tagName || 'div';
		this.node = document.createElement(tagName);
		this._.visible = true;
		this.options = options;

		Control.init.call(this);
	}

	static stylesheet = createElement('style', document.head).sheet;

	static async init () {
		this.node.className = this.className;

		this.on('name', event => {
			this.node.setAttribute('data-name', this.name);
		});
	}

	get visible () {
		return this._.visible;
	}

	set visible (visible) {
		if (this.visible != visible) {
			this._.visible = visible;
			this.refreshVisible();
			this.emit('visible');
		}
	}

	refreshVisible () {
		if (this.visible) {
			var display = this._.styleIndex?.display || '';
		} else {
			var display = 'none';
		}

		this.node.style.display = display;
	}

	get style () {
		return this._.style || [];
	}

	set style (style) {
		if (typeof style == 'string') style = style.split(';');
		this._.styleIndex = concatStyle(this.style, style);
		this._.style = indexToStyle(this._.styleIndex);
		this.node.style.cssText = this._.style.join(';');
		this.refreshVisible();
	}

	get className () {
		var cssName = [];
		var constructor = this.constructor;

		while (constructor.name) {
			cssName.push(constructor.name);
			constructor = constructor.__proto__;
		}
		cssName.pop();

		return 'jn-' + cssName.join('-');
	}

	get parentNode () {
		return this.node.parentNode;
	}

	set parentNode (parentNode) {
		this.node && parentNode.appendChild(this.node);
	}

	set options (options) {
		if (options?.node) {
			for (var attr in options.node) {
				this.node[attr] = options.node[attr];
			}
			delete options.node;
		}

		super.options = options;
	}

	appendChild (name, child) {
		super.appendChild(name, child);

		if (child.parentNode) {
			child.parentNode.appendChild(child.node);
		} else {
			this.node
				&& child.node
				&& !child.node.parentNode
				&& this.node.appendChild(child.node);
		}
	}

	removeChildren () {
		this.node.innerHTML = '';
		super.removeChildren();
	}
}

function concatStyle (styles1, styles2) {
	var index = {};

	styles1.forEach(value => {
		var key = value.split(':')[0];
		var value = value.split(':')[1];
		index[key] = value.trim();
	});

	styles2.forEach(value => {
		if (value.trim()) {
			var key = value.split(':')[0].trim();
			var value = value.split(':')[1].trim();
			index[key] = value;
		}
	});

	return index;
}

function indexToStyle (index) {
	var style = [];

	for (var i in index) {
		style.push(`${i}: ${index[i]}`);
	}

	return style;
}

class CssRule extends Component {
    constructor (options) {
        super({
            selector: '',
            style: [],
            index: null,
            options
        });

        CssRule.init.call(this);
    }

    static async init () {
        this.bind('selector', this, 'refresh');
        this.bind('style', this, 'refresh', { run: true });
    }

    static stylesheet = null;

    refresh () {
        CssRule.stylesheet ||= createElement('style', document.head).sheet;

        if (this.index !== null) {
            CssRule.stylesheet.deleteRule(this.index);
        }

        if (this.selector) {
            this.index = this.createStylesheetRule();
        }
    }

    createStylesheetRule () {
        try {
            var stylesheet = CssRule.stylesheet;
            var styles = this.style.join(';');
            var rule = this.selector + '{' + styles + '}';
            var index = this.index || stylesheet.cssRules.length;
            return stylesheet.insertRule(rule, index);
        } catch (ex) {
            return null;
        }
    }
}

class Label extends Control {
    constructor (options) {
        super({
            text: '',
            options
        });

        this.bind('text', this.node, 'innerHTML');
    }
}

class Bar extends Control {
    constructor(options) {
        super({
            moves: '',
            winner: null,
            isDraw: false,
            children: {
                message: {
                    class: Label,
                    style: [
                        'padding: 2vmin',
                        'text-align: center',
                        'font-size: 5vmin',
                    ],
                },
            },
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
            this.message.text = 'Game in progress';
        } else {
            this.message.text = 'Start the game';
        }
    }
}

class ActiveControl extends Control {
    constructor (options) {
        super({
            tagName: options?.tagName || 'a',

            text: undefined,
            href: undefined,
            target: '_self', // '_self' || '_blank' 

            style: [
                'user-select: none',
                'border: 0',
                'outline: 0',
            ],
            styleSet: {
                class: Component,

                selected_disabled: [],
                selected_pressed: [],
                selected_focused: [],
                selected_hovered: [],

                selected: [],
                disabled: [],
                pressed: [],
                focused: [],
                hovered: [],
            },

            selected: undefined,
            disabled: undefined,
            pressed: undefined,
            focused: undefined,
            hovered: undefined,

            currentStyle: [],
            options
        });

        ActiveControl.init.call(this);
    }

    static init () {
        this.node.onclick = event => {
            if (!this.disabled && event.which == 1) {
                this.emit('click', event);
                event.stopPropagation();
            }
        };

        this.node.onmouseover = event => {
            this.hovered = true;
        };

        this.node.onmouseout = event => {
            if (this.visible) {
                this.hovered = false;
            }
        };

        this.node.onmousedown = event => {
            if (this.visible) {
                this.pressed = true;
            }
        };

        this.node.onmouseup = event => {
            if (this.visible) {
                this.pressed = false;
            }
        };

        this.node.onblur = event => {
            if (this.visible) {
                this.focused = false;
            }
        };

        this.node.onfocus = event => {
            if (this.visible) {
                this.focused = true;
            }
        };

        this.on('text', event => {
            if (this.text !== undefined) {
                this.node.innerHTML = this.text;
            }
        }, { run: true });

        this.on('href', event => {
            if (this.href !== undefined) {
                this.node.href = this.href;
            }
        }, { run: true });

        this.on('target', event => {
            this.node.target = this.target;
        }, { run: true });

        this.on('focused', event => {
            if (this.focused) {
                this.node.focus();
            } else {
                this.node.blur();
            }
        }, { run: true });

        this.on('hovered', event => {
            if (this.focused && !this.hovered) {
                this.focused = false;
            }
        });

        [
            'selected_disabled',
            'selected_pressed',
            'selected_focused',
            'selected_hovered',

            'selected',
            'disabled',
            'pressed',
            'focused',
            'hovered',
        ].forEach(prop => {
            this.styleSet.bind(prop, this, 'refreshStyle');
        });

        [
            'visible',
            'disabled',
            'selected',
            'pressed',
            'focused',
            'hovered',
        ].forEach(prop => {
            this.bind(prop, this, 'refreshStyle');
        });

        this.refreshStyle();
    }

    refreshStyle () {
        this.node.tabIndex = this.disabled ? -1 : 0;
        this.currentStyle = this.getStyle();
    }

    getStyle () {
        var set = this.styleSet;
        
        if (this.selected && this.disabled) {
            return set.selected_disabled;
        } else if (this.selected && this.pressed) {
            return set.selected_pressed;
        } else if (this.selected && this.focused) {
            return set.selected_focused;
        } else if (this.selected && this.hovered) {
            return set.selected_hovered;
        } else if (this.disabled) {
            return set.disabled;
        } else if (this.selected) {
            return set.selected;
        } else if (this.pressed) {
            return set.pressed;
        } else if (this.focused) {
            return set.focused;
        } else if (this.hovered) {
            return set.hovered;
        }

        return [];
    }

    set currentStyle (value) {
        var styles = [...this.style, ...value];
        this.node.style.cssText = styles.join(';');
        this.refreshVisible();
    }
}

class Button extends ActiveControl {
    constructor (options) {
        super({
            style: [
                'display: flex',
                'align-items: center',
                'justify-content: center',
                'text-decoration: none',
                'cursor: pointer',
                'border: 1px solid black',
                'aspect-ratio: 1 / 1',
                'background: var(--jn-sf)',
                'color: var(--jn-on-sf)',
                'fill: var(--jn-on-sf)',
            ],
            styleSet: {
                hovered: [
                    'filter: brightness(1.05)',
                ],
                disabled: [
                    'background: var(--jn-grey)',
                    'cursor: default',
                ],
                selected_disabled: [
                    'background: var(--jn-grey)',
                    'cursor: default',
                ],
                selected_focused: [
                    'filter: brightness(1.05)',
                ],
                selected_pressed: [
                    'filter: brightness(1.05)',
                ],
                selected: [
                    'filter: brightness(1.05)',
                ],
                selected_hovered: [
                    'filter: brightness(1.05)',
                ],
            },
            options
        });
    }
}

class Board extends Control {
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
                'font-size: 20vmin',
                'border: 1px solid black',
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

        this.bind('moves', this, 'redraw');
        this.bind('winner', this, 'effect');
        this.bind('isDraw', this, 'effect');

        this.effect();
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
        }

        this.effect();
    }

    effect() {
        if (this.winner) {
            var color = (this.winner.player == 'x') ? 'lightgreen' : 'lightcoral';

            for (var i in this.winner.path) {
                var cell = this['cell_' + this.winner.path[i]];
                cell.style = 'background: ' + color;
            }
        } else if (this.isDraw) {
            this.style = 'background: lightyellow';
        } else {
            this.style = 'background: aliceblue';

            for (var i in this.children) {
                this[i].style = 'background: none';
            }
        }
    };
}

var X_SVG = `<svg width="100%" height="100%" viewBox="0 0 960 960">
<path d="M607 725L474 547C436.667 599.667 399.667 658 363 722C355 736.667 344.333 745 331 747C318.333 749 306.333 746.667 295 740C283.667 733.333 275.667 724 271 712C266.333 699.333 268.333 686 277 672C320.333 600.667 364.667 530.667 410 462L286 297C276 283.667 272.333 270.667 275 258C278.333 245.333 285.333 235.333 296 228C306.667 220 318.667 216.333 332 217C345.333 217.667 356.667 224.333 366 237L470 374C506 327.333 542.667 281 580 235C589.333 223.667 600.667 217.667 614 217C627.333 215.667 639.333 219 650 227C660.667 234.333 666.667 245.333 668 260C670 274 666.667 286.333 658 297C616 347.667 574.333 401.667 533 459L689 669C698.333 682.333 701.333 695.333 698 708C694.667 720 687.333 729.667 676 737C665.333 744.333 653.333 747.667 640 747C627.333 745.667 616.333 738.333 607 725Z" fill="black"/>
</svg>`;

var O_SVG = `<svg width="100%" height="100%" viewBox="0 0 960 960">
<path d="M535 739C447 760.333 376.667 742.667 324 686C282 642.667 256 587 246 519C238.667 465.667 245 415 265 367C289 305.667 327 260.333 379 231C389.667 225 403 220.667 419 218C419.667 218 424.333 217.667 433 217C436.333 216.333 439 215.667 441 215C451 213 461 214 471 218C476.333 218 484 218.333 494 219C504.667 219.667 515 220.667 525 222C535 222.667 542.667 223.667 548 225L567 232C575 234.667 582.667 238 590 242C597.333 246 605.333 250.667 614 256C636 270.667 654.333 289 669 311C683.667 332.333 695.333 355.333 704 380C712.667 404 718 427.333 720 450C722 472.667 721 492 717 508C711 544 700.333 577.333 685 608C669.667 639.333 648.333 667 621 691C594.333 715 565.667 731 535 739ZM504 635C529.333 631.667 550.667 621.667 568 605C585.333 587.667 598.333 567 607 543C615.667 518.333 619.667 493 619 467C618.333 440.333 613 415.667 603 393C593 370.333 578 352.667 558 340C550.667 334.667 544.667 331 540 329C535.333 326.333 530 324 524 322C520 321.333 513 320.667 503 320C493.667 319.333 484 318.667 474 318C464 317.333 457 317 453 317C451 317 448.667 316.667 446 316C438.667 316.667 434.667 317 434 317L427 319C407.667 329.667 391 345 377 365C363.667 384.333 354 406.333 348 431C342 455 341.333 479.333 346 504C353.333 549.333 369.667 583.667 395 607C422.333 632.333 458.667 641.667 504 635Z" fill="black"/>
</svg>`;

class LinkButton extends ActiveControl {
    constructor (options) {
        super({
            style: [
                'text-decoration: none',
                'cursor: pointer',
                'color: var(--ax-link-bg)',
                'filter: none',
            ],
            styleSet: {
                hovered: [
                    'filter: brightness(0.8)',
                    'text-decoration: underline',
                ],
                disabled: [
                    'cursor: default',
                    'color: var(--ax-grey-bg)',
                ],
                selected_disabled: [
                    'cursor: default',
                    'color: var(--ax-grey-bg)',
                ],
                selected: [
                    'filter: brightness(0.8)',
                ],
                selected_hovered: [
                    'color: var(--ax-bg)',
                    'filter: brightness(0.8)',
                ],
            },
            options: options
        });
    }
}

class Footer extends Control {
    constructor(options) {
        super({
            children: {
                message: {
                    class: Label,
                    text: '© 2025',
                },
                gihub: {
                    class: LinkButton,
                    text: 'GitHub',
                    href: 'https://github.com/jenyxjs/jenyx',
                },
            },
            style: [
                'display: flex',
                'width: 100%',
                'gap: 3vmin',
                'font-size: 4vmin',
                'padding-top: 3vmin',
            ],
            options
        });
    } 
}

class Layout extends Control {
    constructor(options) {
        super({
            children: {
                bar: { class: Bar, },
                board: {
                    class: Board,
                    style: [
                        'height: 80vmin',
                        'width: 80vmin',
                    ]
                },
                footer: { class: Footer, },
            },
            style: [
                'display: flex',
                'flex-direction: column',
                'align-items: center',
                'font-family: system-ui',
                'width: fit-content',
                'margin: auto',
            ],
            options
        });

        Layout.init.call(this);
    }

    static init() {
        new CssRule({
            selector: 'html, body',
            style: [
                'height: 100%',
                'max-height: 100%',
                'margin: 0',
            ]
        });
    }
}

class Gear extends Component {
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
        this.currentPlayer = 'x';
        this.winner = null;
        this.isDraw = false;
        this.moves = '';
    }

    update() {
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

class App extends AbstractApp {
    constructor() {
        super({
            layout: {
                class: Layout,
                parentNode: document.body,
            },
            gear: { class: Gear, },
        });

        App.init.call(this);
    }

    static init() {
        this.gear.bind('moves', this.layout.bar);
        this.gear.bind('winner', this.layout.bar);
        this.gear.bind('isDraw', this.layout.bar);

        this.gear.bind('moves', this.layout.board);
        this.gear.bind('winner', this.layout.board);
        this.gear.bind('isDraw', this.layout.board);

        this.layout.board.bind('newgame', this.gear, 'reset');
    }
}

new App(window);

export { App };
//# sourceMappingURL=bundle.js.map
