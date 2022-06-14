import { createRef, Component } from 'react';
import PropTypes from 'prop-types';
import { IonSearchbar, withIonLifeCycle } from '@ionic/react';
import appModel from 'models/app';
import groups from 'common/data/species/groups.json';
import SpeciesSearchEngine from './utils/taxon_search_engine';
import Suggestions from './components/Suggestions';
import './styles.scss';

const MIN_SEARCH_LENGTH = 2;

function getDefaultState() {
  return {
    searchResults: null,
    searchPhrase: '',
  };
}

class index extends Component {
  static propTypes = {
    onSpeciesSelected: PropTypes.func.isRequired,
    recordedTaxa: PropTypes.array,
    speciesGroups: PropTypes.array,
  };

  input = createRef();

  constructor(props) {
    super(props);

    SpeciesSearchEngine.init();

    this.state = getDefaultState();
  }

  annotateRecordedTaxa = searchResults => {
    const recordedTaxa = this.props.recordedTaxa || [];
    // eslint-disable-next-line @getify/proper-arrows/name
    return searchResults.map(result =>
      recordedTaxa.includes(result.preferredId || result.warehouse_id)
        ? { ...result, ...{ isRecorded: true } }
        : result
    );
  };

  filterDayFlyingMoths = ({ isDayFlying, group }) => {
    if (group !== groups.moths.id) return true;

    return appModel.attrs.useDayFlyingMothsOnly ? isDayFlying : true;
  };

  isPresent = taxon => {
    if (taxon.group !== groups.butterflies.id) return true; // abundance available only for butterflies

    let { country } = appModel.attrs;
    country = country === 'UK' ? 'GB' : country;

    if (country === 'ELSEWHERE') return true;

    const abundanceStatus = taxon[country];
    return !['A', 'Ex'].includes(abundanceStatus);
  };

  attrFilter = options =>
    this.isPresent(options) && this.filterDayFlyingMoths(options);

  onInputKeystroke = async e => {
    const { speciesGroups } = this.props;

    let searchPhrase = e.target.value;

    const isValidSearch =
      typeof searchPhrase === 'string' &&
      searchPhrase.length >= MIN_SEARCH_LENGTH;
    if (!isValidSearch) {
      this.setState(getDefaultState());
      return;
    }

    searchPhrase = searchPhrase.toLowerCase();

    const getGroupId = group => groups[group].id;
    // search
    const informalGroups = speciesGroups && speciesGroups.map(getGroupId);
    const searchResults = await SpeciesSearchEngine.search(searchPhrase, {
      informalGroups,
      attrFilter: this.attrFilter,
    });
    const annotatedSearchResults = this.annotateRecordedTaxa(searchResults);

    this.setState({
      searchResults: annotatedSearchResults,
      searchPhrase,
    });
  };

  onInputClear = () => {
    this.setState(getDefaultState());
  };

  ionViewDidEnter() {
    if (this.input.current) {
      this.input.current.setFocus();
    }
  }

  render() {
    return (
      <>
        <IonSearchbar
          id="taxon"
          ref={this.input}
          placeholder={t('Species name')}
          debounce="300"
          onIonChange={this.onInputKeystroke}
          onIonClear={this.onInputClear}
          showCancelButton="never"
        />

        <Suggestions
          searchResults={this.state.searchResults}
          searchPhrase={this.state.searchPhrase}
          onSpeciesSelected={this.props.onSpeciesSelected}
        />
      </>
    );
  }
}

export default withIonLifeCycle(index);
