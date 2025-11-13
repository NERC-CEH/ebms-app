import type { ReactNode } from 'react';
import i18n from 'i18next';
import { IonList } from '@ionic/react';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import Species from './components/Species';
import { getTaxonName, type SuggestionResult } from './types';

type SuggestionsProps = {
  searchResults?: SuggestionResult[];
  searchPhrase: string;
  onSpeciesSelected: (species: SuggestionResult, edit?: boolean) => void;
};

/**
 * Some common names might be identical so needs to add
 * a latin name next to it.
 * @param suggestions
 */
function deDuplicateSuggestions(
  suggestions: SuggestionResult[]
): SuggestionResult[] {
  let previous: SuggestionResult | null = null;
  const results: SuggestionResult[] = [];

  const taxonSuggestion = (taxon: SuggestionResult) => {
    const name = getTaxonName(taxon);
    const nameNormalized = name.toLocaleLowerCase();

    const previousName = previous ? getTaxonName(previous) : '';
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

const getSearchInfo = (): ReactNode => (
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

const Suggestions = ({
  searchResults,
  searchPhrase,
  onSpeciesSelected,
}: SuggestionsProps) => {
  if (!searchResults) {
    return (
      <IonList id="suggestions" lines="none">
        {getSearchInfo()}
      </IonList>
    );
  }

  let suggestionsList: ReactNode;
  if (!searchResults.length) {
    suggestionsList = (
      <InfoBackgroundMessage>
        No species found with this name
      </InfoBackgroundMessage>
    );
  } else {
    const deDuped = deDuplicateSuggestions(searchResults);

    const getSpeciesEntry = (species: SuggestionResult) => {
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
