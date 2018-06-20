'use strict';

/**
 * Common database helper functions.
 */
let _DBHelper_IDB_ = null;

class DBHelper {
  static idb() {
    if (_DBHelper_IDB_ == null) _DBHelper_IDB_ = new IDBHelper(window);

    return _DBHelper_IDB_;
  }
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  static async fetchRestaurants() {
    let restaurants = await DBHelper.idb().getAll();

    // If IDB had been populated, return results
    if (restaurants && restaurants.length) return restaurants;

    // Else, fetch and add to IDB ...
    const res = await fetch(DBHelper.DATABASE_URL);
    restaurants = await res.json();

    await DBHelper.idb().addAll(restaurants);

    return restaurants;
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static async fetchRestaurantById(id) {
    let restaurant = await DBHelper.idb().get(id);

    if (!restaurant) { // If not in IDB, fetch and add to IDB
      const res = await fetch(`${DBHelper.DATABASE_URL}/${id}`);
      restaurant = await res.json();

      await DBHelper.idb().add(restaurant);
    }

    return restaurant;
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static async fetchRestaurantByCuisine(cuisine) {
    const restaurants = await DBHelper.fetchRestaurants();

    return restaurants.filter(r => r.cuisine_type == cuisine);
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static async fetchRestaurantByNeighborhood(neighborhood) {
    const restaurants = await DBHelper.fetchRestaurants();

    return restaurants.filter(r => r.neighborhood == neighborhood);
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static async fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood) {
    const restaurants = await DBHelper.fetchRestaurants();
    let results = restaurants;
      
    if (cuisine != 'all') { 
      // filter by cuisine
      results = results.filter(r => r.cuisine_type == cuisine);
    }
    
    if (neighborhood != 'all') { 
      // filter by neighborhood
      results = results.filter(r => r.neighborhood == neighborhood);
    }

    return results;
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static async fetchNeighborhoods() {
    const restaurants = await DBHelper.fetchRestaurants();
    const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        
    return neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static async fetchCuisines() {
    const restaurants = await DBHelper.fetchRestaurants();
    const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);

    return cuisines.filter((v, i) => cuisines.indexOf(v) == i);
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }
}
