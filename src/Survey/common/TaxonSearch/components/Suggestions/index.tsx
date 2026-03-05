import type { ReactNode } from 'react';
import i18n from 'i18next';
import { Button } from 'common/flumens';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import Species from './components/Species';
import { getTaxonName, type SuggestionResult } from './types';

type SuggestionsProps = {
  searchResults?: SuggestionResult[];
  searchPhrase: string;
  onSpeciesSelected: (species: SuggestionResult, edit?: boolean) => void;
  onOutsideSearch: () => void;
  hasProjectsOrSiteLists: boolean;
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

const Suggestions = ({
  searchResults,
  searchPhrase,
  onSpeciesSelected,
  hasProjectsOrSiteLists,
  onOutsideSearch,
}: SuggestionsProps) => {
  if (!searchResults) {
    return (
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
  }

  let suggestionsList: ReactNode;
  if (!searchResults.length) {
    suggestionsList = (
      <>
        <InfoBackgroundMessage className="mb-2">
          No species found with this name
        </InfoBackgroundMessage>

        {hasProjectsOrSiteLists && (
          <InfoBackgroundMessage className="mt-0">
            Search outside my current project or site list.
            <Button
              className="mx-auto py-1.5 px-4 mt-3 mb-2 text-sm"
              onPress={onOutsideSearch}
            >
              Search
            </Button>
          </InfoBackgroundMessage>
        )}
      </>
    );
  } else {
    const deDuped = deDuplicateSuggestions(searchResults);

    const getSpeciesEntry = (species: SuggestionResult) => (
      <Species
        key={`${species.warehouseId}-${species.foundInName}-${species.isFavourite}`}
        species={species}
        searchPhrase={searchPhrase}
        onSelect={onSpeciesSelected}
      />
    );
    suggestionsList = deDuped.map(getSpeciesEntry);
  }

  return <div className="px-2">{suggestionsList}</div>;
};

export default Suggestions;
