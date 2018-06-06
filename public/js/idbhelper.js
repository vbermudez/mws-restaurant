'use strict';

class IDBHelper {
    constructor(parent = window || self) {
        this.indexedDB = parent.indexedDB || parent.mozIndexedDB || parent.webkitIndexedDB || parent.msIndexedDB;
        this.dbName = 'restaurantsDB';
        this.dbVersion = 1;
        this.storeName = 'restaurants';
        this.db = null;
    }

    async open() {
        this.db = await new Promise((resolve, reject) => {
            const req = this.indexedDB.open(this.dbName, this.dbVersion);

            req.onupgradeneeded = event => {
                console.log(`Database ${this.dbName} requires an upgrade!`);
                
                const db = event.target.result;
                const store = db.createObjectStore(this.storeName, { keyPath: 'id' });

                store.transaction.oncomplete = e => {
                    console.log(`ObjectStore ${store.name} upgraded!`);
                };
            };

            req.onerror = event => {
                console.error(`Error opening database ${this.dbName}`, event);
                reject(event);
            };

            req.onsuccess = event => {
                const db = event.target.result;

                console.log(`Success opening database ${this.dbName}`);
                resolve(db);
            };
        });

        return this;
    }

    async add(restaurant) {
        if (this.db == null) await this.open();

        const tx = this.db.transaction([ this.storeName ], 'readwrite');
        const store = tx.objectStore(this.storeName);

        return new Promise((resolve, reject) => {
            const req = store.put(restaurant);
            req.onsuccess = event => resolve(event.target.result);
            req.onerror = event => reject(event);
        });
        
    }

    async addAll(restaurants) {
        if (this.db == null) await this.open();
        
        const tx = this.db.transaction([ this.storeName ], 'readwrite');
        const store = tx.objectStore(this.storeName);

        await restaurants.asyncEach( 
            async (restaurant) => new Promise((resolve, reject) => {
                const req = store.put(restaurant);
                req.onsuccess = event => resolve(event.target.result);
                req.onerror = event => reject(event);
            }) 
        );
    }

    async get(id) {
        if (!id || isNaN(id)) throw new Error(`Id is null or empty, or is not a number`);
        if (this.db == null) await this.open();
        
        const tx = this.db.transaction([ this.storeName ], 'readonly');
        const store = tx.objectStore(this.storeName);

        return new Promise((resolve, reject) => {
            const req = store.get( parseInt(id, 10) );
            req.onsuccess = event => resolve(event.target.result);
            req.onerror = event => reject(event);
        });
    }

    async getAll() {
        if (this.db == null) await this.open();
        
        const tx = this.db.transaction([ this.storeName ], 'readonly');
        const store = tx.objectStore(this.storeName);

        return new Promise((resolve, reject) => {
            const req = store.getAll();
            req.onsuccess = event => resolve(event.target.result);
            req.onerror = event => reject(event);
        });
    }

    close() {
        if (this.db != null) this.db.close();

        this.db = null;
    }
}