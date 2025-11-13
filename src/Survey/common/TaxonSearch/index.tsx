import { useState, useRef } from 'react';
import { and, eq, inArray, not, or, SQL, sql } from 'drizzle-orm';
import { useTranslation } from 'react-i18next';
import { IonButton, IonSearchbar, useIonViewDidEnter } from '@ionic/react';
import { getLanguageIso } from 'common/config/languages';
import groups from 'common/data/groups';
import { InfoMessage } from 'common/flumens';
import speciesSearch, { type SearchResult } from 'common/helpers/taxonSearch';
import speciesListsCollection from 'common/models/collections/speciesLists';
import { speciesStore } from 'common/models/store';
import appModel from 'models/app';
import Suggestions from './components/Suggestions';
import './styles.scss';

type SearchResults = SearchResult[];

const MIN_SEARCH_LENGTH = 2;

type Props = {
  speciesGroups?: number[];
  recordedTaxa: any;
  useDayFlyingMothsOnly: any;
  onSpeciesSelected: any;
};

const TaxonSearch = ({
  speciesGroups,
  recordedTaxa,
  useDayFlyingMothsOnly,
  onSpeciesSelected,
}: Props) => {
  const { t } = useTranslation();

  const inputEl = useRef<any>(null);

  const [searchResults, setSearchResults] = useState<SearchResult[]>();
  const [searchPhrase, setSearchPhrase] = useState('');

  const annotateRecordedTaxa = (newSearchResults: SearchResults) =>
    newSearchResults.map((result: SearchResult) =>
      recordedTaxa?.includes(result.preferredId || result.warehouse_id)
        ? { ...result, ...{ isRecorded: true } }
        : result
    );

  const filterDayFlyingMoths = (table: typeof speciesStore.table): SQL => {
    const useDayMothsFilter =
      useDayFlyingMothsOnly && appModel.data.useDayFlyingMothsOnly;
    if (!useDayMothsFilter) return sql`1`;

    // filter for day-flying moths only
    return or(
      not(eq(table.taxon_group_id, groups.moths.id)),
      sql`json_extract(${table.data}, '$.Day-active') not null`
    ) as SQL<any>;
  };

  const isPresent = (table: typeof speciesStore.table): SQL => {
    const { country, useGlobalSpeciesList } = appModel.data;
    if (useGlobalSpeciesList || country === 'ELSEWHERE') return sql`1`;

    // convert UK to GB for country code
    const countryCode = country === 'UK' ? 'GB' : country;
    if (!countryCode) return sql`1`;

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

  const onInputKeystroke = async (e: any) => {
    let newSearchPhrase = e.target.value;

    const isValidSearch =
      typeof newSearchPhrase === 'string' &&
      newSearchPhrase.length >= MIN_SEARCH_LENGTH;
    if (!isValidSearch) {
      setSearchResults(undefined);
      setSearchPhrase('');
      return;
    }

    newSearchPhrase = newSearchPhrase.toLowerCase();

    const speciesGroup = (table: typeof speciesStore.table): SQL => {
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

    const language = getLanguageIso(appModel.data.language);

    // search
    const newSearchResults = await speciesSearch({
      store: speciesStore,
      searchPhrase: newSearchPhrase,
      language,
      where: (table: typeof speciesStore.table): any =>
        and(speciesGroup(table), isPresent(table), filterDayFlyingMoths(table)),
    });

    const annotatedSearchResults = annotateRecordedTaxa(newSearchResults);

    setSearchResults(annotatedSearchResults);
    setSearchPhrase(newSearchPhrase);
  };

  const onInputClear = () => {
    setSearchResults(undefined);
    setSearchPhrase('');
  };

  useIonViewDidEnter(() => {
    if (inputEl.current) {
      inputEl.current.setFocus();
    }
  });

  const hasMissingSpeciesGroupLists = !!speciesGroups?.filter(
    sg =>
      !speciesListsCollection.find(list => list.data.taxonGroups.includes(sg))
  ).length;

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
        <InfoMessage color="warning" className="mx-2 text-center">
          Some species groups are missing from your current downloaded lists.
          <IonButton
            routerLink="/settings/species-lists"
            fill="outline"
            size="small"
            color="warning"
            className="-mt-2"
          >
            Species Lists
          </IonButton>
        </InfoMessage>
      )}

      <Suggestions
        searchResults={searchResults}
        searchPhrase={searchPhrase}
        onSpeciesSelected={onSpeciesSelected}
      />
    </>
  );
};

export default TaxonSearch;
