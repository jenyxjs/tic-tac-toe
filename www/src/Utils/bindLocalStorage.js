export function bindLocalStorage (property, target, name) {
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

function load (property, target, name) {
    name ||= property;
    var value = localStorage[name];

    if (value != undefined) {
        target[property] = JSON.parse(localStorage[name]);
    }
}

function save (property, target, name) {
    name ||= property;
    localStorage[name] = JSON.stringify(target[property]);
}