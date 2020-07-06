/** ****************************************************************************
 * Generates species list suggestions.
 **************************************************************************** */
import species from 'common/data/species';
import searchSciNames from './scientificNamesSearch';
import searchCommonNames from './commonNamesSearch';

const loading = false;

const MAX = 20;

const API = {
  async init() {
    // empty
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

      return Promise.resolve([]);
    }

    const maxResults = options.maxResults || MAX;
    const informalGroups = options.informalGroups || [];

    // normalize the search phrase
    const normSearchPhrase = searchPhrase.toLowerCase();

    searchCommonNames(normSearchPhrase, results);

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

export { API as default };
