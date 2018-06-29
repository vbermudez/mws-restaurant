/**
 * Common img helper functions.
 */
export class IMGHelper {
    static imageUrlForRestaurant(restaurant) {
        return `/img/${restaurant.id}.webp`;
    }

    static createImageEl(restaurant) {
        const img = document.createElement('img');
        
        img.src = IMGHelper.imageUrlForRestaurant(restaurant);
        img.setAttribute('alt', restaurant.name);
        img.className = 'restaurant-img';

        return img;
    }

    static getResponsiveImgSources(restaurant) {
        const mediaQueries = {
            '(max-width:700px)': '-380_',
            '(min-width:701px)': '-512_'
        };
        const sources = [];
        
        for (const key of Object.keys(mediaQueries)) {
            const filePart = mediaQueries[key];
            const s = document.createElement('source');
            const img1x = `/img/${restaurant.id}${filePart}1x.webp 1x`; 
            const img2x = `/img/${restaurant.id}${filePart}2x.webp 2x`; 
        
            s.setAttribute('media', key);
            s.setAttribute('srcset', `${img1x},${img2x}`);
            sources.push(s);
        }

        sources.push( IMGHelper.createImageEl(restaurant) );
        
        return sources;
    };
}