import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IonSearchbar, useIonViewDidEnter } from '@ionic/react';
import groups from 'common/data/groups';
import appModel from 'models/app';
import Suggestions from './components/Suggestions';
import './styles.scss';
import SpeciesSearchEngine from './utils/taxon_search_engine';

type Taxon = any;
type SearchResults = any;

const MIN_SEARCH_LENGTH = 2;

type Props = {
  speciesGroups: any;
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

  const [searchResults, setSearchResults] = useState<Taxon[]>();
  const [searchPhrase, setSearchPhrase] = useState('');

  const annotateRecordedTaxa = (newSearchResults: SearchResults) =>
    newSearchResults.map((result: Taxon) =>
      recordedTaxa?.includes(result.preferredId || result.warehouse_id)
        ? { ...result, ...{ isRecorded: true } }
        : result
    );

  const filterDayFlyingMoths = ({ isDayFlying, group }: any) => {
    if (group !== groups.moths.id) return true;

    const useDayMothsFilter =
      useDayFlyingMothsOnly && appModel.data.useDayFlyingMothsOnly;

    return useDayMothsFilter ? isDayFlying : true;
  };

  const isPresent = (taxon: any) => {
    if (taxon.group !== groups.butterflies.id) return true; // abundance available only for butterflies

    const { country, useGlobalSpeciesList } = appModel.data;
    if (useGlobalSpeciesList || country === 'ELSEWHERE') return true;

    const countryCode: any = country === 'UK' ? 'GB' : country;
    const presenceStatus = taxon[countryCode];
    return ['P', 'P?', 'M', 'I'].includes(presenceStatus);
  };

  const attrFilter = (options: any) =>
    filterDayFlyingMoths(options) && isPresent(options);

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

    const getGroupId = (group: any) => (groups as any)[group]?.id;
    // search
    const informalGroups = speciesGroups && speciesGroups.map(getGroupId);
    const newSearchResults = await SpeciesSearchEngine.search(newSearchPhrase, {
      informalGroups,
      attrFilter,
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

  return (
    <>
      <IonSearchbar
        id="taxon"
        ref={inputEl}
        placeholder={t('Species name')}
        debounce={300}
        onIonInput={onInputKeystroke}
        onIonClear={onInputClear}
        showCancelButton="never"
      />

      <Suggestions
        searchResults={searchResults}
        searchPhrase={searchPhrase}
        onSpeciesSelected={onSpeciesSelected}
      />
    </>
  );
};

export default TaxonSearch;
