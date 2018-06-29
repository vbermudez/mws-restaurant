'use strict';

import { Utils } from './utils.js';
import { DBHelper } from './dbhelper.js';
import { IMGHelper } from './imghelper.js';
import { MapHelper } from './maphelper.js';

Utils.configureAsyncExtensions();
Utils.configureEvents();

class App {
  constructor() {
    this.restaurants = [];
    this.neighborhoods = [];
    this.cuisines = [];
    this.mapHelper = null;
    this.observer = new IntersectionObserver((changes, observer) => {
      changes.forEach(change => {
        if (change.intersectionRatio <= 0) return;
      
        const image = change.target;
        const restaurant = { id: image.dataset.restaurant };
        const sources = IMGHelper.getResponsiveImgSources(restaurant);
        
        for (const source of sources) {
          image.append(source);
        }
    
        observer.unobserve(image);
      });
    });
  }

  /**
   * Fetch all neighborhoods and set their HTML.
   */
  async fetchNeighborhoods() {
    this.neighborhoods = await DBHelper.fetchNeighborhoods();
    this.fillNeighborhoodsHTML(); 
  }

  /**
   * Set neighborhoods HTML.
   */
  async fillNeighborhoodsHTML(neighborhoods = this.neighborhoods) {
    const select = document.getElementById('neighborhoods-select');
    
    await neighborhoods.asyncEach(async (neighborhood) => {
      const option = document.createElement('option');
      
      option.innerHTML = neighborhood;
      option.value = neighborhood;
      select.append(option);
    });
  }

  /**
   * Fetch all cuisines and set their HTML.
   */
  async fetchCuisines() {
    this.cuisines = await DBHelper.fetchCuisines();
    this.fillCuisinesHTML();
  }

  /**
   * Set cuisines HTML.
   */
  async fillCuisinesHTML(cuisines = this.cuisines) {
    const select = document.getElementById('cuisines-select');

    await cuisines.forEach(async (cuisine) => {
      const option = document.createElement('option');
      
      option.innerHTML = cuisine;
      option.value = cuisine;
      select.append(option);
    });
  }

  /**
   * Update page and map for current restaurants.
   */
  async updateRestaurants() {
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');
    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;
    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;
    const restaurants = await DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood);

    this.resetRestaurants(restaurants);
    this.fillRestaurantsHTML();
    
    return restaurants;
  }

  /**
   * Clear current restaurants, their HTML and remove their map markers.
   */
  resetRestaurants(restaurants) {
    // Remove all restaurants
    this.restaurants = [];

    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';
    
    // Remove all map markers
    this.mapHelper.removeMarkers();
    this.restaurants = restaurants;
  }

  /**
   * Create all restaurants HTML and add them to the webpage.
   */
  async fillRestaurantsHTML(restaurants = this.restaurants) {
    const ul = document.getElementById('restaurants-list');
    
    await restaurants.asyncEach(async (restaurant) => {
      ul.append( this.createRestaurantHTML(restaurant) );
    });
    await this.mapHelper.addMarkersToMap(restaurants);
  }

  /**
   * Create restaurant HTML.
   */
  createRestaurantHTML(restaurant) {
    const li = document.createElement('li');

    const image = document.createElement('picture');
    image.className = 'restaurant-img';
    image.setAttribute('role', 'presentation'); //'img');
    image.setAttribute('alt', restaurant.name);
    image.classList.add('observable');
    image.dataset.restaurant = restaurant.id;    
    li.append(image);
    this.observer.observe(image);

    const name = document.createElement('h3');
    name.innerHTML = restaurant.name;
    li.append(name);

    const neighborhood = document.createElement('p');
    neighborhood.innerHTML = restaurant.neighborhood;
    li.append(neighborhood);

    const address = document.createElement('p');
    address.innerHTML = restaurant.address;
    li.append(address);

    const more = document.createElement('a');
    more.innerHTML = 'View Details';
    more.href = DBHelper.urlForRestaurant(restaurant);
    li.append(more);

    return li;
  }

  /**
   * Initialize Google map, called from HTML.
   */
  initMap() {
    if (this.mapHelper == null) this.mapHelper = new MapHelper();

    const loc = {
      lat: 40.722216,
      lng: -73.987501
    };
    const zoom = 12;
    
    this.mapHelper.initMap(loc, zoom);
    this.updateRestaurants();
  }
}

const app = new App();

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
// window.addEventListener('load', event => {
document.addEventListener('DOMContentLoaded', event => {
// window.onload = _ => {
  app.fetchNeighborhoods();
  app.fetchCuisines();

  document.querySelector('#neighborhoods-select').addEventListener('change', app.updateRestaurants, false);
  document.querySelector('#cuisines-select').addEventListener('change', app.updateRestaurants, false);
// }; 
});

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  app.initMap();
}

