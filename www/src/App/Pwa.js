import { Component } from '../../lib/jenyx/components/Component/Component.js'

export class Pwa extends Component {
    constructor (options) {
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

    static async init () {
        window.addEventListener('beforeinstallprompt', event => {
            this.deferedPrompt = event;
            event.preventDefault();
        });

        this.bind('serviceWorkerFileName', this.registerServiceWorker);
    };

    install () {
        this.deferedPrompt.prompt();

        this.deferedPrompt.userChoice.then(choiceResult => {
            if (choiceResult.outcome === 'accepted') {
                this.deferedPrompt = null;
            }
        });
    }
};

export class RegisterServiceWorker extends Component {
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
};