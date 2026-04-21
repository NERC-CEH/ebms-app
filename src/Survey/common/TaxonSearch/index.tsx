import { useState, useRef, useEffect } from 'react';
import { and, eq, inArray, not, or, SQL, sql } from 'drizzle-orm';
import { useTranslation } from 'react-i18next';
import { IonSearchbar, useIonViewDidEnter } from '@ionic/react';
import { getLanguageIso } from 'common/config/languages';
import groups from 'common/data/groups';
import speciesSearch, { type SearchResult } from 'common/helpers/taxonSearch';
import taxonLists from 'common/models/collections/taxonLists';
import { ClassifierSuggestion, Taxon } from 'common/models/occurrence';
import { taxaStore } from 'common/models/store';
import appModel from 'models/app';
import MissingListsMessage from './components/MissingListsMessage';
import Suggestions from './components/Suggestions';

type SearchResults = SearchResult[];

const MIN_SEARCH_LENGTH = 2;

const annotateRecordedTaxa = (
  newSearchResults: SearchResults,
  recordedTaxa?: number[]
) =>
  newSearchResults.map((result: SearchResult) =>
    recordedTaxa?.includes(result.preferredId || result.warehouseId)
      ? { ...result, ...{ isRecorded: true } }
      : result
  );

const useDefaultSpecies = (
  taxonListCids?: string[],
  recordedTaxa?: number[]
) => {
  const [defaultSpecies, setDefaultSpecies] = useState<SearchResult[]>();

  // load all species by default if there are fewer than 200
  useEffect(() => {
    const language = getLanguageIso(appModel.data.language);

    const fetchDefaultSpecies = async () => {
      const lists = taxonLists.filter(list =>
        taxonListCids?.includes(list.cid)
      );

      let speciesCount = 0;
      lists.forEach(list => {
        speciesCount += list.data.size || 0;
      });
      if (!speciesCount || speciesCount > 200) return;

      const species: SearchResult[] = [];
      await Promise.all(
        lists.map(async list => {
          const listSpecies = await list.fetchSpecies(language);
          species.push(...listSpecies);
        })
      );

      const annotated = annotateRecordedTaxa(species, recordedTaxa);

      // sort by preferred name type (common vs scientific)
      const { taxonNameDisplay } = appModel.data;
      const preferCommonNames = taxonNameDisplay !== 'scientificOnly';
      annotated.sort((a, b) => {
        const nameA = preferCommonNames ? a.commonName : a.scientificName;
        const nameB = preferCommonNames ? b.commonName : b.scientificName;
        if (!nameA) return 1;
        if (!nameB) return -1;
        return nameA.localeCompare(nameB);
      });

      setDefaultSpecies(annotated);
    };

    fetchDefaultSpecies();
  }, []);

  return defaultSpecies;
};

const filterDayFlyingMoths = (
  table: typeof taxaStore.table,
  useDayFlyingMothsOnly?: boolean
): SQL => {
  const useDayMothsFilter =
    useDayFlyingMothsOnly || appModel.data.useDayFlyingMothsOnly;
  if (!useDayMothsFilter) return sql`1`;

  // filter for day-flying moths only
  return or(
    not(eq(table.taxon_group_id, groups.moths.id)),
    sql`json_extract(${table.data}, '$.Day-active') not null`
  ) as SQL<any>;
};

const speciesGroupFilter = (
  table: typeof taxaStore.table,
  speciesGroups?: number[]
): SQL => {
  const getGroupId = (group: any) => {
    if (typeof group === 'string') return (groups as any)[group]?.id; // backward compatibility
    return group;
  };
  const informalGroups = speciesGroups?.map(getGroupId) || [];
  if (!informalGroups.length) return sql`1`;

  return or(
    ...informalGroups.map((g: any) => eq(table.taxon_group_id, g))
  ) as SQL<any>;
};

const isPresent = (table: typeof taxaStore.table): SQL => {
  const { country } = appModel.data;
  if (country === 'ELSEWHERE') return sql`1`;

  // convert UK to GB for country code
  let countryCode = country === 'UK' ? 'GB' : country;
  if (!countryCode) return sql`1`;

  const countryCodeWithSubregion = countryCode.includes('_');
  if (countryCodeWithSubregion) {
    countryCode = countryCode.replaceAll('_', ': '); // normalize it to match the data format
  }

  return or(
    not(eq(table.taxon_group_id, groups.butterflies.id)), // abundance available only for butterflies group
    inArray(sql`json_extract(${table.data}, '$.' || ${countryCode})`, [
      'P',
      'P?',
      'M',
      'I',
    ])
  ) as SQL<any>;
};

const taxonListFilter = (
  table: typeof taxaStore.table,
  taxonListCids?: string[],
  isDisabled = false
): SQL =>
  !taxonListCids?.length || isDisabled
    ? sql`1`
    : inArray(table.list_cid, taxonListCids);

type Props = {
  recordedTaxa: number[] | undefined;
  onSpeciesSelected: (taxon: Taxon) => void;
  useDayFlyingMothsOnly?: boolean;
  taxonListCids?: string[];
  speciesGroups?: number[];
  suggestedSpecies?: ClassifierSuggestion[];
};

const TaxonSearch = ({
  recordedTaxa,
  suggestedSpecies,
  onSpeciesSelected,
  speciesGroups,
  useDayFlyingMothsOnly,
  taxonListCids,
}: Props) => {
  const { t } = useTranslation();

  const inputEl = useRef<any>(null);

  const [searchResults, setSearchResults] = useState<SearchResult[]>();
  const [searchPhrase, setSearchPhrase] = useState('');
  const defaultSpecies = useDefaultSpecies(taxonListCids, recordedTaxa);

  const [searchOutsideTaxonLists, setSearchOutsideTaxonLists] = useState(false);

  const onSearch = async (newSearchPhrase: string, skipTaxonLists: boolean) => {
    const isValidSearch =
      typeof newSearchPhrase === 'string' &&
      newSearchPhrase.length >= MIN_SEARCH_LENGTH;
    if (!isValidSearch) {
      setSearchResults(undefined);
      setSearchPhrase('');
      return;
    }

    const language = getLanguageIso(appModel.data.language);

    // search
    const newSearchResults = await speciesSearch({
      store: taxaStore,
      searchPhrase: newSearchPhrase,
      language,
      where: (table: typeof taxaStore.table): any =>
        and(
          speciesGroupFilter(table, speciesGroups),
          taxonListFilter(table, taxonListCids, skipTaxonLists),
          isPresent(table),
          filterDayFlyingMoths(table, useDayFlyingMothsOnly)
        ),
    });

    const annotatedSearchResults = annotateRecordedTaxa(
      newSearchResults,
      recordedTaxa
    );

    setSearchResults(annotatedSearchResults);
    setSearchPhrase(newSearchPhrase);
  };

  const onInputKeystroke = async (e: any) =>
    onSearch(e.target.value?.toLowerCase(), searchOutsideTaxonLists);

  const onInputClear = () => {
    setSearchResults(undefined);
    setSearchPhrase('');
  };

  useIonViewDidEnter(
    () => !defaultSpecies?.length && inputEl.current?.setFocus()
  );

  const hasMissingSpeciesGroupLists = !!speciesGroups?.filter(
    sg => !taxonLists.find(list => list.data.taxonGroups.includes(sg))
  ).length;

  const onOutsideSearch = () => {
    setSearchOutsideTaxonLists(true);
    onSearch(searchPhrase, true);
  };

  return (
    <>
      <IonSearchbar
        id="taxon"
        ref={inputEl}
        placeholder={t('Species name')}
        debounce={200}
        onIonInput={onInputKeystroke}
        onIonClear={onInputClear}
        showCancelButton="never"
      />

      {hasMissingSpeciesGroupLists && !searchResults?.length && (
        <MissingListsMessage />
      )}

      <Suggestions
        searchResults={searchResults || defaultSpecies}
        suggestedSpecies={suggestedSpecies}
        searchPhrase={searchPhrase}
        onSpeciesSelected={onSpeciesSelected}
        onOutsideSearch={onOutsideSearch}
        hasProjectsOrSiteLists={
          !!taxonListCids?.length && !searchOutsideTaxonLists
        }
      />
    </>
  );
};

export default TaxonSearch;
