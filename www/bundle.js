class Event {
    constructor(options) {
        this.type = options.type;
        this.target = options.target;
        this.value = options.value;
        this.targetType = options.targetType;
        this.send();
    }

    send() {
        var context = this.target;

        do {
            for (var i in context._.listeners) {
                var listener = context._.listeners[i];

                var isHandler = listener.handler;
                var isType = (listener.type == this.targetType || listener.type == '*');
                var isTarget = (listener.context == this.target);
                var isBubbling = listener.bubbling;
                if (!isHandler || !isType || !(isTarget || isBubbling)) continue;

                if (listener.final) {
                    clearTimeout(listener.finalTimeoutId);
                    listener.finalTimeoutId = setTimeout(() => {
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
    constructor(options) {
        this.id = ++Listener.id;
        options.context._.listeners[this.id] = this;
        this.type = options.type;
        this.context = options.context;
        this.handler = options.handler;
        this.bubbling = options.bubbling;
        this.final = options.final;
        this.finalTimeoutId = 0;
        options.run && this.run();
        options.exist && this.exist();
    }

    static id = 0;

    remove() {
        delete this.context._.listeners[this.id];
    }

    run() {
        this.handler.call(this.context);
    }

    exist() {
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
    constructor(options) {
        Object.defineProperty(this, '_', { enumerable: false, value: {} });
        this.defineProperty('name', { enumerable: false });
        this.defineProperty('host', { enumerable: false });
        this.defineProperty('parent', { enumerable: false });
        this._.jenyxClass = true;
        this._.children = {};
        this._.listeners = {};
        this.options = options;
    }

    static version = '0.3';

    get fullname() {
        var fullname = [];

        var constructor = this.constructor;

        while (constructor.name) {
            fullname.unshift(constructor.name);
            constructor = constructor.__proto__;
        }

        return fullname.join('_');
    }

    get listeners() {
        return this._.listeners;
    }

    set listeners(listeners) {
        for (var type in listeners) {
            var handler = listeners[type];
            this.on(type, handler);
        }
    }

    removeListeners(type) {
        for (var i in this._.listeners) {
            var listener = this._.listeners[i];
            (listener.type == type) && listener.remove();
        }
    }

    emit(type, value) {
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

    on(type, handler, options) {
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

    wait(type, options) {
        if (this[type]) return this[type];

        return new Promise(resolve => {
            var listener = this.on(type, event => {
                listener.remove();
                resolve(this[type]);
            }, options);
        });
    }

    bind(type, object, key, options) {
        key ||= type;

        if (typeof object[key] == 'function') {
            this._bindFunction(type, object, key, options);
        } else {
            this._bindProperty(type, object, key, options);
        }
    }

    _bindFunction(type, object, key, options) {
        this.on(type, event => {
            object[key].call(object, event, this[type]);
        }, options);
    }

    _bindProperty(type, object, key, options) {
        var runOptions = { ...options, run: true };

        this.on(type, event => {
            object[key] = this[type];
        }, runOptions);

        object?._?.jenyxClass && object.on(key, event => {
            this[type] = object[key];
        }, runOptions);
    }

    defineProperty(name, options) {
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

    set options(options) {
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

    get children() {
        return this._.children;
    }

    set children(children) {
        for (var name in children) {
            var value = children[name];

            if (value?.class) {
                var child = this.getNewClass(name, value);
                this.appendChild(name, child);
            }
        }

        this.emit('children');
    }

    getNewClass(name, value = {}) {
        var { class: Class, ...newOptions } = Object.assign({
            name: name,
            host: this,
        }, value);

        return new Class(newOptions);
    }

    appendChild(name, child) {
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

    removeChildren() {
        this._.children = {};
        this.emit('child');
    }

    replaceChildren(children) {
        this.removeChildren();
        this.children = children;
    }
}

class AbstractApp extends Component {
    constructor(options) {
        super({ app: null });

        (options.root || window).app = this;
        this.options = options;

        this.app = this;
    }
}

function createElement(tagName, parentNode, attrs, css) {
    var node = document.createElement(tagName);

    parentNode?.appendChild(node);
    return node;
}

class Control extends Component {
    constructor(options) {
        super();

        this.defineProperty('node', { enumerable: false });
        var tagName = options?.tagName || 'div';
        this.node = document.createElement(tagName);
        this._.visible = true;
        this.options = options;

        Control.init.call(this);
    }

    static stylesheet = createElement('style', document.head).sheet;

    static async init() {
        this.node.className = this.className;

        this.on('name', event => {
            this.node.setAttribute('data-name', this.name);
        });
    }

    get visible() {
        return this._.visible;
    }

    set visible(visible) {
        if (this.visible != visible) {
            this._.visible = visible;
            this.refreshVisible();
            this.emit('visible');
        }
    }

    refreshVisible() {
        if (this.visible) {
            var display = this._.styleIndex?.display || '';
        } else {
            var display = 'none';
        }

        this.node.style.display = display;
    }

    get style() {
        return this._.style || [];
    }

    set style(style) {
        if (typeof style == 'string') style = style.split(';');
        this._.styleIndex = concatStyle(this.style, style);
        this._.style = indexToStyle(this._.styleIndex);
        this.node.style.cssText = this._.style.join(';');
        this.refreshVisible();
    }

    get className() {
        var cssName = [];
        var constructor = this.constructor;

        while (constructor.name) {
            cssName.push(constructor.name);
            constructor = constructor.__proto__;
        }
        cssName.pop();

        return 'jn-' + cssName.join('-');
    }

    get parentNode() {
        return this.node.parentNode;
    }

    set parentNode(parentNode) {
        this.node && parentNode.appendChild(this.node);
    }

    set options(options) {
        if (options?.node) {
            for (var attr in options.node) {
                this.node[attr] = options.node[attr];
            }
            delete options.node;
        }

        super.options = options;
    }

    appendChild(name, child) {
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

    removeChildren() {
        this.node.innerHTML = '';
        super.removeChildren();
    }
}

function concatStyle(styles1, styles2) {
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

function indexToStyle(index) {
    var style = [];

    for (var i in index) {
        style.push(`${i}: ${index[i]}`);
    }

    return style;
}

class CssRule extends Component {
    constructor(options) {
        super({
            selector: '',
            style: [],
            index: null,
            options
        });

        CssRule.init.call(this);
    }

    static async init() {
        this.bind('selector', this, 'refresh');
        this.bind('style', this, 'refresh', { run: true });
    }

    static stylesheet = null;

    refresh() {
        CssRule.stylesheet ||= createElement('style', document.head).sheet;

        if (this.index !== null) {
            CssRule.stylesheet.deleteRule(this.index);
        }

        if (this.selector) {
            this.index = this.createStylesheetRule();
        }
    }

    createStylesheetRule() {
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
    constructor(options) {
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
                },
            },
            style: [
                'display: flex',
                'align-items: center',
                'justify-content: center',
                'margin: .5rem 0',
                'font-size: 1.25rem'
            ],
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

            if (this.winner.player === 'x') {
                this.message.style = 'color: LimeGreen';
            } if (this.winner.player === 'o') {
                this.message.style = 'color: Tomato';
            }
        } else {
            this.message.text = 'Make move!';
            this.message.style = 'color: none';
        }
    }
}

class ActiveControl extends Control {
    constructor(options) {
        super({
            tagName: options?.tagName || 'a',

            text: null,
            href: null,
            target: '_self', // '_self' || '_blank' 

            style: [
                'user-select: none',
                'border: 0',
                'outline: 0',
            ],
            styleSet: {
                class: Component,

                selected_disabled: null,
                selected_pressed: null,
                selected_focused: null,
                selected_hovered: null,

                selected: null,
                disabled: null,
                pressed: null,
                focused: null,
                hovered: null,
            },

            selected: null,
            disabled: null,
            pressed: null,
            focused: null,
            hovered: null,

            currentStyle: [],
            options
        });

        ActiveControl.init.call(this);
    }

    static init() {
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
            if (this.text !== undefined && this.text !== null) {
                this.node.innerHTML = this.text;
            }
        }, { run: true });

        this.on('href', event => {
            if (this.href !== undefined && this.href !== null) {
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

    refreshStyle() {
        this.node.tabIndex = this.disabled ? -1 : 0;
        this.currentStyle = this.getStyle();
    }

    getStyle() {
        var set = this.styleSet;

        if (this.selected && this.disabled) {
            return set.selected_disabled;
        } else if (this.selected && this.pressed && set.selected_pressed) {
            return set.selected_pressed;
        } else if (this.selected && this.focused && set.selected_focused) {
            return set.selected_focused;
        } else if (this.selected && this.hovered && set.selected_hovered) {
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

    set currentStyle(value) {
        var styles = [...this.style, ...value || []];
        this.node.style.cssText = styles.join(';');
        this.refreshVisible();
    }
}

class Button extends ActiveControl {
    constructor(options) {
        super({
            style: [
                'display: flex',
                'align-items: center',
                'justify-content: center',
                'text-decoration: none',
                'cursor: pointer',
                'aspect-ratio: 1 / 1',
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

class LinkButton extends ActiveControl {
    constructor(options) {
        super({
            style: [
                'text-decoration: none',
                'cursor: pointer',
                'color: var(--jn-link)',
                'filter: none',
            ],
            styleSet: {
                hovered: [
                    'filter: brightness(0.8)',
                    'text-decoration: underline',
                ],
                disabled: [
                    'cursor: default',
                    'color: var(--jn-grey)',
                ],
                selected_disabled: [
                    'cursor: default',
                    'color: var(--jn-grey)',
                ],
                selected: [
                    'filter: brightness(0.8)',
                ],
                selected_hovered: [
                    'color: var(--jn-bg)',
                    'filter: brightness(0.8)',
                ],
            },
            options: options
        });
    }
}

class IconButton extends ActiveControl {
    constructor(options) {
        super({
            style: [
                'display: inline-block',
                'flex-shrink: 0',
                'width: 1rem',
                'height: 1rem',
                'padding: .5rem',
                'border-radius: 5rem',
                'text-decoration: none',
                'cursor: pointer',
                'font-size: 0',
                'fill: var(--jn-text)',
                'background: var(--jn-bg)',
            ],
            styleSet: {
                hovered: [
                    'background: color-mix(in srgb, var(--jn-bg), var(--jn-grey) 10%)'
                ],
                selected: [
                    'background: color-mix(in srgb, var(--jn-bg), var(--jn-grey) 10%)'
                ],
                selected_hovered: [
                    'background: color-mix(in srgb, var(--jn-bg), var(--jn-grey) 10%)'
                ],
            },
            options
        });
    }
}

var MIC_SVG = `<svg style="transform: scale(1.0); stroke-width: 0px; width: 100%; height: 100%" viewBox="0 -960 960 960"><path d="M480-423q-43 0-72-30.92-29-30.91-29-75.08v-251q0-41.67 29.44-70.83Q437.88-880 479.94-880t71.56 29.17Q581-821.67 581-780v251q0 44.17-29 75.08Q523-423 480-423Zm0-228Zm-30 531v-136q-106-11-178-89t-72-184h60q0 91 64.29 153t155.5 62q91.21 0 155.71-62Q700-438 700-529h60q0 106-72 184t-178 89v136h-60Zm30-363q18 0 29.5-13.5T521-529v-251q0-17-11.79-28.5T480-820q-17.42 0-29.21 11.5T439-780v251q0 19 11.5 32.5T480-483Z"/></svg>`;
var MIC_OFF_SVG = `<svg style="transform: scale(1.0); stroke-width: 0px; width: 100%; height: 100%" viewBox="0 -960 960 960"><path d="m710-362-58-58q14-23 21-48t7-52h80q0 44-13 83.5T710-362ZM480-594Zm112 112-72-72v-206q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v126l-80-80v-46q0-50 35-85t85-35q50 0 85 35t35 85v240q0 11-2.5 20t-5.5 18ZM440-120v-123q-104-14-172-93t-68-184h80q0 83 57.5 141.5T480-320q34 0 64.5-10.5T600-360l57 57q-29 23-63.5 39T520-243v123h-80Zm352 64L56-792l56-56 736 736-56 56Z"/></svg>`;
var VOLUME_SVG = `<svg style="transform: scale(1.25); stroke-width: 0px; width: 100%; height: 100%" viewBox="0 -960 960 960"><path d="M200-360v-240h160l200-200v640L360-360H200Zm440 40v-322q45 21 72.5 65t27.5 97q0 53-27.5 96T640-320ZM480-606l-86 86H280v80h114l86 86v-252ZM380-480Z"/></svg>`;
var VOLUME_OFF_SVG = `<svg style="transform: scale(1.25); stroke-width: 0px; width: 100%; height: 100%" viewBox="0 -960 960 960"><path d="m616-320-56-56 104-104-104-104 56-56 104 104 104-104 56 56-104 104 104 104-56 56-104-104-104 104Zm-496-40v-240h160l200-200v640L280-360H120Zm280-246-86 86H200v80h114l86 86v-252ZM300-480Z"/></svg>`;
var INSTALL_MOBILE_SVG = `<svg height="100%" viewBox="0 -960 960 960" width="100%">
<path d="M280-40q-33 0-56.5-23.5T200-120v-720q0-33 23.5-56.5T280-920h280v80H280v40h280v80H280v480h400v-80h80v200q0 33-23.5 56.5T680-40H280Zm0-120v40h400v-40H280Zm440-240L520-600l56-56 104 104v-288h80v288l104-104 56 56-200 200ZM280-800v-40 40Zm0 640v40-40Z" />
</svg>`;

class Footer extends Control {
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

class Layout extends Control {
    constructor(options) {
        super({
            children: {
                bar: { class: Bar, },
                board: {
                    class: Board,
                    style: [
                        'height: 70vmin',
                        'width: 70vmin',
                    ]
                },
                footer: { class: Footer, },
            },
            style: [
                'display: flex',
                'flex-direction: column',
                'align-items: center',
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
                'font-size: clamp(14px, 5vmin, 36px)',
                `font-family: monospace`,
            ]
        });

        new CssRule({
            selector: ':root',
            style: [
                `--jn-bg: hsl(0 0% 100%)`,
                `--jn-text: hsl(210 0% 30%)`,
                `--jn-grey: hsl(0 0% 50%)`,
                `--jn-link: hsl(0 0% 15%)`,
                `--jn-primary: hsl(200 50% 90%)`,
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
        this.activePlayer = 'x';
        this.winner = null;
        this.isDraw = false;
        this.moves = '';
    }

    update() {
        this.isDraw = (this.moves.length === 9 && !this.winner);
        this.winner = this.getWinner();
        this.activePlayer = (this.moves.length % 2 === 0) ? 'x' : 'o';

        if (this.activePlayer === 'o' && !this.winner && !this.isDraw) {
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

function bindLocalStorage(property, target, name) {
    name ||= property;

    window.addEventListener('storage', event => {
        if (event.key == name)
            load(property, target, name);
    });

    target.on(property, event => {
        save(property, target, name);
    });

    load(property, target, name);
}

function load(property, target, name) {
    name ||= property;
    var value = localStorage[name];

    if (value != undefined) {
        target[property] = JSON.parse(localStorage[name]);
    }
}

function save(property, target, name) {
    name ||= property;
    localStorage[name] = JSON.stringify(target[property]);
}

class Sound extends Component {
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
            this.moves.slice(-2, -1);
            this.moves.slice(-1);

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

class SpeechRecognition extends Component {
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
}

class Mic extends Component {
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

class Pwa extends Component {
    constructor(options) {
        super({
            deferedPrompt: null,
            serviceWorkerFileName: '',
            registerServiceWorker: {
                class: RegisterServiceWorker
            },
            options
        });

        Pwa.init.call(this);
    }

    static async init() {
        window.addEventListener('beforeinstallprompt', event => {
            this.deferedPrompt = event;
            event.preventDefault();
        });

        this.bind('serviceWorkerFileName', this.registerServiceWorker);
    };

    install() {
        this.deferedPrompt.prompt();

        this.deferedPrompt.userChoice.then(choiceResult => {
            if (choiceResult.outcome === 'accepted') {
                this.deferedPrompt = null;
            }
        });
    }
}
class RegisterServiceWorker extends Component {
    constructor(options) {
        super({
            serviceWorkerFileName: '',
            serviceWorker: null,
            options
        });

        RegisterServiceWorker.init.call(this);
    }

    static async init() {
        this.register();
    };

    async register() {
        await this.wait('serviceWorkerFileName');
        var url = this.serviceWorkerFileName;
        var registration = await navigator.serviceWorker.register(url, { scope: './' });

        var serviceWorker = registration.installing
            || registration.waiting
            || registration.active;

        this.serviceWorker = serviceWorker;
    };
}

class GoogleTagManager extends Component {
    constructor(options) {
        super({
            id: '',
            options
        });

        GoogleTagManager.init.call(this);
    }

    static init() {
        (function (w, d, s, l, id) {
            w[l] = w[l] || [];
            w[l].push({
                'gtm.start': new Date().getTime(),
                event: 'gtm.js'
            });

            var j = d.createElement(s);
            j.async = true;
            j.src = 'https://www.googletagmanager.com/gtm.js?id=' + id +
                ('');

            var f = d.getElementsByTagName(s)[0];
            f.parentNode.insertBefore(j, f);

        })(window, document, 'script', 'dataLayer', this.id);
    }
}

class GoogleAnalytics extends Component {
    constructor(options) {
        super({
            id: '',
            options
        });

        GoogleAnalytics.init.call(this);
    }

    static init() {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.id}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', this.id);
    }
}

class App extends AbstractApp {
    constructor() {
        super({
            moves: '',
            winner: null,
            isDraw: false,
            gear: { class: Gear, },
            mic: { class: Mic, },
            sound: { class: Sound, },
            layout: {
                class: Layout,
                parentNode: document.body,
            },
            pwa: {
                class: Pwa,
                serviceWorkerFileName: './serviceWorker.js',
            },
            googleAnalytics: {
                class: GoogleAnalytics,
                id: 'G-E5FS8CEFK4',
            },
            googleTagManager: {
                class: GoogleTagManager,
                id: 'GTM-PLSCZB4Z',
            },
        });

        App.init.call(this);
    }

    static init() {
        this.bind('moves', this.gear);
        this.bind('winner', this.gear);
        this.bind('isDraw', this.gear);

        this.bind('moves', this.layout.bar);
        this.bind('winner', this.layout.bar);
        this.bind('isDraw', this.layout.bar);

        this.bind('moves', this.layout.board);
        this.bind('winner', this.layout.board);
        this.bind('isDraw', this.layout.board);

        this.bind('moves', this.sound);
        this.bind('winner', this.sound);
        this.bind('isDraw', this.sound);

        this.layout.board.bind('newgame', this.gear, 'reset');
    }
}

new App(window);

export { App };
//# sourceMappingURL=bundle.js.map
