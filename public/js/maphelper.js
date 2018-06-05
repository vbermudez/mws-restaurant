'use strict';

class MapHelper {
    constructor(selector = '#map') {
        this.el = document.querySelector(selector);
        this.map = null;
        this.markers = [];
    }

    initMap(loc, zoom) {
        this.map = new google.maps.Map(this.el, {
            zoom: zoom,
            center: loc,
            scrollwheel: false
        });    
    }

    /**
     * Add markers for current restaurants to the map. Asynced just for
     */
    async addMarkersToMap(restaurants) {
        await restaurants.asyncEach(async (restaurant) => {
            const marker = this.mapMarkerForRestaurant(restaurant);
                
            google.maps.event.addListener(marker, 'click', (e) => {
                window.location.href = marker.url;
            });

            this.markers.push(marker);
        });
    }

    /**
     * Map marker for a restaurant.
     */
    mapMarkerForRestaurant(restaurant) {
        const marker = new google.maps.Marker({
            position: restaurant.latlng,
            title: restaurant.name,
            url: DBHelper.urlForRestaurant(restaurant),
            map: this.map,
            animation: google.maps.Animation.DROP
        });

        return marker;
    }

    async removeMarkers() {
        await this.markers.asyncEach(async (m) => m.setMap(null));
        this.markers = [];
    }
}