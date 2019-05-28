/** ****************************************************************************
 * Generates species list suggestions.
 **************************************************************************** */
import Backbone from 'backbone';
import _ from 'lodash';
import Log from 'helpers/log';
import species from 'common/data/species.data.json';
import searchSciNames from './scientificNamesSearch';

let loading = false;

const MAX = 20;

const API = {
  async init() {
    Log('Taxon search engine: initializing.');
    loading = true;
    // data = await import(/* webpackChunkName: "data" */ 'common/data/species_names.data.json');
    // commonNamePointers = data.data;
    loading = false;
    this.trigger('data:loaded');
  },

  /**
   * Returns an array of species in format
   {
     array_id: "Genus array index"
     species_id: "Species array index"
     species_name_id: "Species name index" //to know where found
     warehouse_id: "Warehouse id"
     group: "Species group"
     scientific_name: "Scientific name"
     common_name: "Common name"
     synonym: "Common name synonym"
   }
   */
  async search(searchPhrase, options = {}) {
    // todo Accent Folding: https://alistapart.com/article/accent-folding-for-auto-complete

    const results = [];

    if (!searchPhrase) {
      return results;
    }

    // check if data exists
    if (!species) {
      // initialise data load
      if (!loading) {
        await API.init();
        return API.search(searchPhrase || '', options);
      }

      // wait until loaded
      return new Promise(resolve => {
        // the process has started, wait until done
        this.on('data:loaded', () => {
          API.search(searchPhrase || '', options).then(resolve);
        });
      });
    }

    const maxResults = options.maxResults || MAX;
    const informalGroups = options.informalGroups || [];

    // normalize the search phrase
    const normSearchPhrase = searchPhrase.toLowerCase();

    // search sci names
    searchSciNames(
      species,
      normSearchPhrase,
      results,
      maxResults,
      null,
      informalGroups
    );

    // return results in the order
    return results;
  },
};

_.extend(API, Backbone.Events);

export { API as default };
