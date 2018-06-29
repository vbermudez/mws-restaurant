'use strict';

let _onlineState = true;

class Utils {
    static get online() { return _onlineState; }
    static set online(value) { _onlineState = value; }

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

    static async map(callback) {
        if (this == null || typeof this === 'undefined') return;
        if (!callback || typeof callback !== 'function') return;

        let results = [];

        if (this instanceof Array) {
            results = this.map(async (item) => await callback(item, this));
		} else {
            const keys = Object.keys(this);

            results = keys.map(async (key) => await callback(key, this[key], this));
        }
        
        return Promise.all(results);
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

            Object.defineProperty(Array.prototype, 'asyncMap', {
                value: Utils.map,
                configurable: true,
                enumerable: false,
                writeable: true
            });
        }
    }

    static configureEvents() {
        if (typeof window !== 'undefined') {
            window.addEventListener('online', Utils.handleOnlineStateChange);
            window.addEventListener('offline', Utils.handleOnlineStateChange);
        }
    }

    static favoriteOnClick(e) {
        e.preventDefault();

        const fav = e.target;
        const isFav = fav.classList.contains('is-fav');

        if (isFav) {
            fav.innerHTML = '☆';
            fav.classList.remove('is-fav');
        } else {
            fav.innerHTML = '★';
            fav.classList.add('is-fav');
        }

        if (typeof window !== 'undefined') {
            const restaurant = JSON.parse(fav.dataset.restaurant);
            const evt = new CustomEvent('favorite', { detail: { restaurant: restaurant, favorite: !isFav } });

            window.dispatchEvent(evt);
        }
    }

    static handleOnlineStateChange(e) {
        Utils.online = navigator.onLine;
    }
}
