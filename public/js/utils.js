'use strict';

class Utils {
    static async forEach(callback) {
        if (this == null || typeof this === 'undefined') return;
        if (!callback || typeof callback !== 'function') return;

        if (this instanceof Array) {
			for (let i = 0; i < this.length; ++i) {
				await callback(this[i], i, this);
			}
		} else {
            const keys = Object.keys(this);

			for (let key of keys) {
                await callback(key, this[key], this);
			}
		}
    }

    static configureAsyncExtensions() {
        const parent = typeof window === 'undefined' ? self : window;

        parent.addEventListener('unhandledrejection', function(event) {
            console.error('Unhandled rejection (promise: ', event.promise, ', reason: ', event.reason, ').');
        });

        if (!Array.prototype.asyncEach) {
            Object.defineProperty(Array.prototype, 'asyncEach', {
                value: Utils.forEach,
                configurable: true,
                enumerable: false,
                writeable: true
            });
        }
    }
}

Utils.configureAsyncExtensions();