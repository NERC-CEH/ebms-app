import type { ReactNode } from 'react';
import i18n from 'i18next';
import { Trans as T } from 'react-i18next';
import { Button, hashCode } from 'common/flumens';
import { ClassifierSuggestion } from 'common/models/occurrence';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import Species from './components/Species';
import { getTaxonName, type SuggestionResult } from './types';

type SuggestionsProps = {
  searchResults?: SuggestionResult[];
  suggestedSpecies?: ClassifierSuggestion[];
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

const getSearchInfo = (): ReactNode => (
  <InfoBackgroundMessage className="text-left" skipTranslation>
    {i18n.t('survey.quickerSearchingTaxa')} <i>Lopinga achine</i>{' '}
    {i18n.t('common.canTypeSearch')}
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
  suggestedSpecies,
  searchPhrase,
  onSpeciesSelected,
  hasProjectsOrSiteLists,
  onOutsideSearch,
}: SuggestionsProps) => {
  const getSuggestedSpecies = (species: ClassifierSuggestion[]) => {
    const getSuggestion = (s: ClassifierSuggestion) => (
      <Species
        key={hashCode(JSON.stringify(s))}
        species={s}
        probability={s.probability}
        onSelect={onSpeciesSelected}
      />
    );

    return (
      <>
        <div>{/* quick hack to fix odd css style */}</div>
        <h3>
          <T>common.suggestions</T>:
        </h3>
        {species.map(getSuggestion)}
      </>
    );
  };

  const getAllSuggestions = () => {
    if (!searchResults) {
      if (suggestedSpecies?.length)
        return getSuggestedSpecies(suggestedSpecies);

      return getSearchInfo();
    }

    const noSpeciesFound = searchResults.length === 0;
    if (noSpeciesFound) {
      return (
        <>
          <InfoBackgroundMessage className="mb-2">
            survey.noSpeciesFound
          </InfoBackgroundMessage>

          {hasProjectsOrSiteLists && (
            <InfoBackgroundMessage className="mt-0" skipTranslation>
              <T i18nKey="survey.searchOutsideLists">
                Search outside my current project or site list.
                <Button
                  className="mx-auto py-1.5 px-4 mt-3 mb-2 text-sm"
                  onPress={onOutsideSearch}
                  skipTranslation
                >
                  Search
                </Button>
              </T>
            </InfoBackgroundMessage>
          )}
        </>
      );
    }

    const getSpeciesEntry = (species: SuggestionResult) => (
      <Species
        key={`${species.warehouseId}-${species.foundInName}-${species.isFavourite}`}
        species={species}
        searchPhrase={searchPhrase}
        onSelect={onSpeciesSelected}
      />
    );

    const deDuped = deDuplicateSuggestions(searchResults);
    return deDuped.map(getSpeciesEntry);
  };

  return <div className="px-2">{getAllSuggestions()}</div>;
};

export default Suggestions;
