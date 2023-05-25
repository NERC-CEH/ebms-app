/** ****************************************************************************
 * App Model past locations functions.
 **************************************************************************** */

import { hashCode } from 'helpers/UUID';

export const MAX_SAVED = 60;

export default {
  async setLocation(origLocation, allowedMaxSaved = MAX_SAVED) {
    let locations = [...this.attrs.locations];
    const location = JSON.parse(JSON.stringify(origLocation));

    if (!location.latitude) {
      throw new Error('invalid location');
    }

    const hash = this._getLocationHash(location);

    const existingLocation = locations.find(({ id }) => id === hash);
    if (existingLocation) {
      existingLocation.name = location.name;
      existingLocation.favourite = location.favourite;
      await this.save();
      return;
    }

    // add new one
    location.id = hash;
    const date = new Date();

    location.name = `${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()}`;

    if (locations.length >= allowedMaxSaved) {
      const removed = this._removeNonFavouriteBackwards(locations);
      if (!removed) {
        return; // all favourites
      }
    }

    locations = [location, ...locations];

    this.attrs.locations = locations;
    await this.save();
  },

  async removeLocation(locationId) {
    const { locations } = this.attrs;

    this.attrs.locations = locations.filter(loc => loc.id !== locationId);
    await this.save();
  },

  _removeNonFavouriteBackwards(locations) {
    locations.reverse();
    const nonFavLocationIndex = locations.findIndex(loc => !loc.favourite);
    if (nonFavLocationIndex < 0) {
      return false;
    }

    locations.splice(nonFavLocationIndex, 1);
    locations.reverse();
    return true;
  },

  _getLocationHash({ latitude, longitude }) {
    const str = JSON.stringify({ latitude, longitude });
    return hashCode(str);
  },
};
