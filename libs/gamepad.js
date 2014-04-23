(function () {

    'use strict';

    var keyMapping = {
        'ps3': {
            'x': 0,
            'circle': 1,
            'square': 2,
            'triangle': 3,
            'shoulder_top_left': 4,
            'shoulder_top_right': 5,
            'shoulder_bottom_left': 6,
            'shoulder_bottom_right': 7,
            'select': 8,
            'start': 9,
            'stick_button_left': 10,
            'stick_button_right': 11,
            'd_pad_up': 12,
            'd_pad_down': 13,
            'd_pad_left': 14,
            'd_pad_right': 15,
            'ps': 16
        }
    };

    function getGamepadType (id) {

        if (id.match(/PLAYSTATION\(R\)3/i)) {

            return 'ps3';

        }

    }

    function Gamepad () {

        this.listeners = [];

        requestAnimationFrame(this.loop.bind(this));

    }

    Gamepad.prototype.loop = function () {

        var controller = window.navigator.webkitGetGamepads()[0],
            keys;

        if (!controller) { requestAnimationFrame(this.loop.bind(this)); return false; }

        keys = keyMapping[getGamepadType(controller.id)];

        this.listeners.forEach((function (listener) {

            if (controller.buttons[keys[listener.button]] && String(typeof listener.callback) === 'function') {

                if (listener.options.delay) {

                    if (!listener.delay) {

                        listener.delay = listener.options.delay;

                    } else if (listener.delay) {

                        listener.delay = listener.delay - 1;

                        return false;

                    }

                }

                if (listener.options.once && listener.triggered) {

                    return false;

                }

                listener.triggered = true;

                listener.callback(listener.button);

            } else {

                delete listener.delay;
                delete listener.triggered;

            }

        }).bind(this));

        requestAnimationFrame(this.loop.bind(this));

    };

    Gamepad.prototype.on = function (button, options, callback) {

        this.listeners.push({
            button: button,
            options: options,
            callback: callback
        });

    };

    Gamepad.prototype.off = function (button) {

        this.listeners.forEach(function (listener) {

            if (listener.button === button) {

                this.listeners.splice(this.listeners.indexOf(listener), 1);

            }

        });

    };

    if (String(typeof window.define) === 'function' && window.define.hasOwnProperty('amd')) {

        window.define([], function () { return Gamepad; });

    } else {

        window.Gamepad = Gamepad;

    }

}());
