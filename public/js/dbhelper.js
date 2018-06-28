'use strict';

/**
 * Common database helper functions.
 */
let _DBHelper_IDB_ = null;
let _min_review_id = 1000;

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

  static get REVIEWS_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/reviews`;
  }

  static async getTempReviewId() {
    const num = await DBHelper.idb().countReviews();

    return num + _min_review_id;
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
   * Fetch all reviews 
   */
  static async fetchReviews() {
    let reviews = await DBHelper.idb().getAllReviews();

    if (reviews && reviews.length) return reviews;
    
    const res = await fetch(DBHelper.REVIEWS_URL);
    reviews = await res.json();

    await DBHelper.idb().addAllReviews(reviews);

    return reviews;
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
   * Fetch a review by its ID.
   */
  static async fetchReviewById(id) {
    let review = await DBHelper.idb().getReview(id);

    if (!review) { // If not in IDB, fetch and add to IDB
      const res = await fetch(`${DBHelper.REVIEWS_URL}/${id}`);
      review = await res.json();

      await DBHelper.idb().addReview(review);
    }

    return review;
  }

  /**
   * Fetch a reviews by restaurant ID.
   */
  static async fetchReviewsByRestaurant(restaurant_id) {
    let reviews = await DBHelper.idb().getRestaurantReviews(restaurant_id);

    if (reviews && reviews.length) return reviews;

    const res = await fetch(`${DBHelper.REVIEWS_URL}?restaurant_id=${restaurant_id}`);
    reviews = await res.json();

    await DBHelper.idb().addAllReviews(reviews);

    return reviews;
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

  static async updateFavorite(restaurant, favorite) {
    restaurant.is_favorite = favorite;
    
    await DBHelper.idb().update(restaurant);

    if (Utils.online) {
      await fetch(`${DBHelper.DATABASE_URL}/${restaurant.id}?is_favorite=${favorite.toString()}`, {
        method: 'put'
      });
    }
  }

  static onFavRestaurant(e) {
    const restaurant = e.detail.restaurant;
    const favorite = e.detail.favorite;

    DBHelper.updateFavorite(restaurant, favorite);
  }

  static async addRestaurantReview(review) {
    if (!Utils.online) {
      review.id = await DBHelper.getTempReviewId();

      await DBHelper.idb().addReview(review);

      return review;
    } else {
      const res = await fetch(DBHelper.REVIEWS_URL, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(review)
      });
      const reviewRes = await res.json();

      await DBHelper.idb().addReview(reviewRes);

      return reviewRes;
    }
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }
}

window.addEventListener('favorite', DBHelper.onFavRestaurant);
