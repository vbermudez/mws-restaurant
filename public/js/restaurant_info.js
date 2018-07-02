'use strict';

class RestaurantInfo {
  constructor() {
    this.restaurant = null;
    this.mapHelper = null;
  }

  /*
   * Fetches the restaurant using the id form url's queryString.
   */
  async fetchRestaurantFromURL() {
    if (this.restaurant) return this.restaurant;

    const id = this.getParameterByName('id');

    if (!id) throw new Error('No restaurant id in URL');

    this.restaurant = await DBHelper.fetchRestaurantById(id);

    if (!this.restaurant) {
      throw new Error('No restaurant id in URL');
    }

    this.fillRestaurantHTML();

    return this.restaurant;
  }

  async fetchReviews() {
    if (!this.restaurant) this.restaurant = await this.fetchRestaurantFromURL();

    const restaurant_id = this.restaurant.id;

    return await DBHelper.fetchReviewsByRestaurant(restaurant_id);
  }

  /**
   * Create restaurant HTML and add it to the webpage
   */
  async fillRestaurantHTML() {
    const name = document.querySelector('#restaurant-name');
    name.innerHTML = this.restaurant.name;

    const address = document.querySelector('#restaurant-address');
    address.innerHTML = this.restaurant.address;

    const image = document.querySelector('#restaurant-img');
    image.setAttribute('role', 'presentation');
    image.setAttribute('alt', this.restaurant.name);

    const sources = await IMGHelper.getResponsiveImgSources(this.restaurant);

    for (const source of sources) {
      image.append(source);
    }

    const cuisine = document.querySelector('#restaurant-cuisine');
    cuisine.innerHTML = this.restaurant.cuisine_type;

    // fill operating hours
    if (this.restaurant.operating_hours) {
      this.fillRestaurantHoursHTML();
    }

    this.fillFavorite();

    // fill reviews
    this.fillReviewsHTML();
  }

  fillFavorite() {
    const fav = document.createElement('a');

    fav.href = '#';

    if (this.restaurant.is_favorite) {
      fav.setAttribute('aria-label', 'Unmark as favorite');
      fav.className = 'favorite is-fav';
      fav.innerHTML = '★';
    } else {
      fav.setAttribute('aria-label', 'Mark as favorite');
      fav.className = 'favorite';
      fav.innerHTML = '☆';
    }
    
    fav.onclick = Utils.favoriteOnClick;
    fav.dataset.restaurant = JSON.stringify(this.restaurant);

    const name = document.querySelector('#restaurant-name');
    name.prepend(fav);
  }

  /**
   * Create restaurant operating hours HTML table and add it to the webpage.
   */
  fillRestaurantHoursHTML() {
    const operatingHours = this.restaurant.operating_hours;
    const hours = document.querySelector('#restaurant-hours');

    for (let key in operatingHours) {
      const row = document.createElement('tr');
      const day = document.createElement('td');

      day.innerHTML = key;
      row.appendChild(day);
  
      const time = document.createElement('td');

      time.innerHTML = operatingHours[key];
      row.appendChild(time);
      hours.appendChild(row);
    }
  }

  /**
   * Create all reviews HTML and add them to the webpage.
   */
  async fillReviewsHTML() {
    const reviews = await this.fetchReviews();
    const container = document.querySelector('#reviews-container');
    // const title = document.createElement('h2');
    
    // title.innerHTML = 'Reviews';
    // container.appendChild(title);

    if (!reviews) {
      const noReviews = document.createElement('p');
      
      noReviews.innerHTML = 'No reviews yet!';
      container.appendChild(noReviews);
      
      return;
    }

    const ul = document.querySelector('#reviews-list');

    reviews.forEach(review => {
      ul.appendChild( this.createReviewHTML(review) );
    });

    // container.appendChild(ul);
  }

  /**
   * Create review HTML and add it to the webpage.
   */
  createReviewHTML(review) {
    const li = document.createElement('li');

    const name = document.createElement('p');
    name.innerHTML = review.name;
    li.appendChild(name);

    const date = document.createElement('p');
    date.innerHTML = (new Date(review.updatedAt)).toString();
    li.appendChild(date);

    const rating = document.createElement('p');
    rating.innerHTML = `Rating: ${review.rating}`;
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.innerHTML = unescape(review.comments);
    li.appendChild(comments);

    return li;
  }

  /**
   * Add restaurant name to the breadcrumb navigation menu
   */
  fillBreadcrumb() {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');

    li.innerHTML = this.restaurant.name;
    breadcrumb.appendChild(li);
  }

  /**
   * Get a parameter by name from page URL.
   */
  getParameterByName(name, url) {
    if (!url) url = window.location.href;

    name = name.replace(/[\[\]]/g, '\\$&');

    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
    const results = regex.exec(url);

    if (!results) return null;
    if (!results[2]) return '';

    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  hideForm() {
    const form = document.querySelector('#reviewForm');
    const aside = form.parentElement;

    aside.classList.remove('overlay');
    aside.classList.add('hide');
  } 

  resetForm(e) {
    this.hideForm();
  }

  showForm() {
    const form = document.querySelector('#reviewForm');
    const aside = form.parentElement;

    aside.classList.add('overlay');
    aside.classList.remove('hide');
  }

  async createReview(e) {
    e.preventDefault();

    const form = e.target;
    const restaurant_id = this.restaurant.id;
    const name = form.name.value;
    const rating = form.rating.value;
    const comments = form.comments.value;
    const review = await DBHelper.addRestaurantReview({
      restaurant_id: parseInt(restaurant_id, 10),
      name: name,
      rating: parseInt(rating, 10), 
      comments: comments
    });

    if (!review.updatedAt) {
      review.updatedAt = new Date();
    }

    const ul = document.querySelector('#reviews-list');

    ul.appendChild( this.createReviewHTML(review) );
    form.reset();

    return false;
  }

  async initMap() {
    if (this.mapHelper == null) this.mapHelper = new MapHelper();

    await this.fetchRestaurantFromURL();

    const loc = this.restaurant.latlng;
    const zoom = 16;
    
    this.mapHelper.initMap(loc, zoom);
    this.fillBreadcrumb();
    this.mapHelper.addMarkersToMap([ this.restaurant ]);

    const addReview = document.querySelector('.add-review');
    const form = document.querySelector('#reviewForm');
    
    addReview.addEventListener('click', this.showForm, false);
    form.onsubmit = this.createReview.bind(this);
    form.onreset = this.resetForm.bind(this);
  }
}

const restInfo = new RestaurantInfo();

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  restInfo.initMap();
}
