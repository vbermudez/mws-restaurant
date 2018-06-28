'use strict';

class IDBHelper {
    constructor(parent = window || self) {
        this.indexedDB = parent.indexedDB || parent.mozIndexedDB || parent.webkitIndexedDB || parent.msIndexedDB;
        this.dbName = 'restaurantsDB';
        this.dbVersion = 2;
        this.storeName = 'restaurants';
        this.reviewsStoreName = 'reviews';
        this.db = null;
    }

    _createStore(db, name, opts = { keyPath: 'id' }) {
        const store = db.createObjectStore(name, opts);

        store.transaction.oncomplete = e => {
            console.log(`ObjectStore ${store.name} upgraded!`);
        };

        return store;
    }

    _createIndex(store, name, opts = { unique: false }) {
        store.createIndex(name, name, opts);
    }

    async open() {
        this.db = await new Promise((resolve, reject) => {
            const req = this.indexedDB.open(this.dbName, this.dbVersion);

            req.onupgradeneeded = event => {
                console.log(`Database ${this.dbName} requires an upgrade!`);
                
                const db = event.target.result;
                const upgradeTransaction = event.target.transaction;

                if (event.oldVersion < 1) {
                    this._createStore(db, this.storeName);
                }
                
                if (event.oldVersion < 2) {
                    const store = this._createStore(db, this.reviewsStoreName, { keyPath: 'id' });

                    this._createIndex(store, 'restaurant_id');
                    this._createIndex(store, 'pending');

                    const restaurantStore = upgradeTransaction.objectStore(this.storeName);

                    this._createIndex(restaurantStore, 'pending');
                }
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
            restaurant.pending = Utils.online ? 0 : 1;

            const req = store.put(restaurant);
            req.onsuccess = event => resolve(event.target.result);
            req.onerror = event => reject(event);
        });
        
    }

    async update(restaurant) {
        return await this.add(restaurant);
    }

    async addReview(review) {
        if (this.db == null) await this.open();

        const tx = this.db.transaction([ this.reviewsStoreName ], 'readwrite');
        const store = tx.objectStore(this.reviewsStoreName);

        return new Promise((resolve, reject) => {
            review.pending = Utils.online ? 0 : 1;
            
            const req = store.put(review);
            req.onsuccess = event => resolve(event.target.result);
            req.onerror = event => reject(event);
        });
    }

    async updateReview(restaurant) {
        return await this.addReview(restaurant);
    }

    async addAll(restaurants) {
        if (this.db == null) await this.open();
        
        const tx = this.db.transaction([ this.storeName ], 'readwrite');
        const store = tx.objectStore(this.storeName);

        await restaurants.asyncEach( 
            async (restaurant) => new Promise((resolve, reject) => {
                restaurant.pending = Utils.online ? 0 : 1;
            
                const req = store.put(restaurant);
                req.onsuccess = event => resolve(event.target.result);
                req.onerror = event => reject(event);
            }) 
        );
    }

    async addAllReviews(reviews) {
        if (this.db == null) await this.open();
        
        const tx = this.db.transaction([ this.reviewsStoreName ], 'readwrite');
        const store = tx.objectStore(this.reviewsStoreName);

        await reviews.asyncEach( 
            async (review) => new Promise((resolve, reject) => {
                review.pending = Utils.online ? 0 : 1;
            
                const req = store.put(review);
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

    async getReview(id) {
        if (!id || isNaN(id)) throw new Error(`Id is null or empty, or is not a number`);
        if (this.db == null) await this.open();
        
        const tx = this.db.transaction([ this.reviewsStoreName ], 'readonly');
        const store = tx.objectStore(this.reviewsStoreName);

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

    async getAllKeys() {
        if (this.db == null) await this.open();
        
        const tx = this.db.transaction([ this.storeName ], 'readonly');
        const store = tx.objectStore(this.storeName);

        return new Promise((resolve, reject) => {
            const req = store.getAllKeys();
            req.onsuccess = event => resolve(event.target.result);
            req.onerror = event => reject(event);
        });
    }

    async getAllReviews() {
        if (this.db == null) await this.open();
        
        const tx = this.db.transaction([ this.reviewsStoreName ], 'readonly');
        const store = tx.objectStore(this.reviewsStoreName);

        return new Promise((resolve, reject) => {
            const req = store.getAll();
            req.onsuccess = event => resolve(event.target.result);
            req.onerror = event => reject(event);
        });
    }

    async getAllReviewKeys() {
        if (this.db == null) await this.open();
        
        const tx = this.db.transaction([ this.reviewsStoreName ], 'readonly');
        const store = tx.objectStore(this.reviewsStoreName);

        return new Promise((resolve, reject) => {
            const req = store.getAllKeys();
            req.onsuccess = event => resolve(event.target.result);
            req.onerror = event => reject(event);
        });
    }

    async getRestaurantReviews(restaurant_id) {
        if (this.db == null) await this.open();

        const tx = this.db.transaction([ this.reviewsStoreName ], 'readonly');
        const store = tx.objectStore(this.reviewsStoreName);
        const index = store.index('restaurant_id');

        return new Promise((resolve, reject) => {
            const req = index.getAll(restaurant_id);

            req.onsuccess = event => resolve(event.target.result);
            req.onerror = event => reject(event);
        });
    }

    async removeReview(id) {
        if (!id || isNaN(id)) throw new Error(`Id is null or empty, or is not a number`);
        if (this.db == null) await this.open();
        
        const tx = this.db.transaction([ this.reviewsStoreName ], 'readwrite');
        const store = tx.objectStore(this.reviewsStoreName);

        return new Promise((resolve, reject) => {
            const req = store.delete( parseInt(id, 10) );
            req.onsuccess = event => resolve(event.target.result);
            req.onerror = event => reject(event);
        });
    }

    async countReviews() {
        if (this.db == null) await this.open();
        
        const tx = this.db.transaction([ this.reviewsStoreName ], 'readonly');
        const store = tx.objectStore(this.reviewsStoreName);

        return new Promise((resolve, reject) => {
            const req = store.count();
            req.onsuccess = event => resolve(event.target.result);
            req.onerror = event => reject(event);
        });
    }

    async getPendingRestaurantUpdates() {
        if (this.db == null) await this.open();

        const tx = this.db.transaction([ this.storeName ], 'readonly');
        const store = tx.objectStore(this.storeName);
        const index = store.index('pending');

        return new Promise((resolve, reject) => {
            const req = index.getAll(1);

            req.onsuccess = event => resolve(event.target.result);
            req.onerror = event => reject(event);
        });
    }

    async getPendingReviews() {
        if (this.db == null) await this.open();

        const tx = this.db.transaction([ this.reviewsStoreName ], 'readonly');
        const store = tx.objectStore(this.reviewsStoreName);
        const index = store.index('pending');

        return new Promise((resolve, reject) => {
            const req = index.getAll(1);

            req.onsuccess = event => resolve(event.target.result);
            req.onerror = event => reject(event);
        });
    }

    close() {
        if (this.db != null) this.db.close();

        this.db = null;
    }
}