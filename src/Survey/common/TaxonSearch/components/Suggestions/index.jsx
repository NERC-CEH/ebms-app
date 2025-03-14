import i18n from 'i18next';
import { IonList } from '@ionic/react';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import Species from './components/Species';

/**
 * Some common names might be identical so needs to add
 * a latin name next to it.
 * @param suggestions
 */
function deDuplicateSuggestions(suggestions) {
  let previous = {};
  const results = [];

  const taxonSuggestion = taxon => {
    const name = taxon[taxon.found_in_name] || '';
    const nameNormalized = name.toLocaleLowerCase();

    const previousName = previous[previous.found_in_name] || '';
    const previousNameNormalized = previousName.toLocaleLowerCase();

    const noCommonNames = !nameNormalized || !previousNameNormalized;
    const isUnique = noCommonNames || nameNormalized !== previousNameNormalized;

    if (!isUnique) {
      return;
    }

    results.push(taxon);
    previous = taxon;
  };
  suggestions.forEach(taxonSuggestion);

  return results;
}

const getSearchInfo = () => (
  <InfoBackgroundMessage className="text-left" skipTranslation>
    {i18n.t(
      'For quicker searching of the taxa you can use different shortcuts. For example, to find'
    )}{' '}
    <i>Lopinga achine</i> {i18n.t('you can type in the search bar')}
    :
    <br />
    <br />
    <i>lop ach</i>
    <br />
    <i>lopac</i>
    <br />
    <i>lop .ne</i>
    <br />
    <i>. achine</i>
  </InfoBackgroundMessage>
);

// Suggestions.propTypes = {
//   searchResults: PropTypes.array,
//   searchPhrase: PropTypes.string.isRequired,
//   onSpeciesSelected: PropTypes.func.isRequired,
// };

const Suggestions = ({ searchResults, searchPhrase, onSpeciesSelected }) => {
  if (!searchResults) {
    return (
      <IonList id="suggestions" lines="none">
        {getSearchInfo()}
      </IonList>
    );
  }

  let suggestionsList;
  if (!searchResults.length) {
    suggestionsList = (
      <InfoBackgroundMessage>
        No species found with this name
      </InfoBackgroundMessage>
    );
  } else {
    const deDuped = deDuplicateSuggestions(searchResults);

    const getSpeciesEntry = species => {
      const key = `${species.warehouse_id}-${species.found_in_name}-${species.isFavourite}`;
      return (
        <Species
          key={key}
          species={species}
          searchPhrase={searchPhrase}
          onSelect={onSpeciesSelected}
        />
      );
    };
    suggestionsList = deDuped.map(getSpeciesEntry);
  }

  return (
    <IonList id="suggestions" lines="none">
      {suggestionsList}
    </IonList>
  );
};

export default Suggestions;
