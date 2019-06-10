import React from 'react';
import Device from 'helpers/device';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import AppHeader from 'common/Components/Header';
import { IonContent } from '@ionic/react';
import Occurrence from 'occurrence';
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

@observer
class Controller extends React.Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    savedSamples: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    SpeciesSearchEngine.init();

    this.inputEl = React.createRef();
    this.onInputKeystroke = this.onInputKeystroke.bind(this);
    this.onInputClear = this.onInputClear.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.state = getDefaultState();

    const { match, savedSamples } = props;

    const sampleID = match.params.id;
    const sample = savedSamples.get(sampleID);
    this.sample = sample;

    this.recordedTaxa = this.sample.occurrences.models.map(
      occ => occ.get('taxon').warehouse_id
    );
  }

  filterOutRecordedTaxa = searchResults =>
    searchResults.filter(
      result => !this.recordedTaxa.includes(result.warehouse_id)
    );

  async onInputKeystroke(e) {
    let searchPhrase = e.target.value;

    const isValidSearch =
      typeof searchPhrase === 'string' &&
      searchPhrase.length >= MIN_SEARCH_LENGTH;
    if (!isValidSearch) {
      this.setState(getDefaultState());
      return;
    }

    searchPhrase = searchPhrase.toLowerCase();

    // search
    const searchResults = await SpeciesSearchEngine.search(searchPhrase);

    const uniqueSearchResults = this.filterOutRecordedTaxa(searchResults);

    this.setState({
      searchResults: uniqueSearchResults,
      searchPhrase,
    });
  }

  onInputClear() {
    this.setState(getDefaultState());
  }

  onFocus() {
    this.clearFocusSetUp();

    if (window.cordova && Device.isAndroid()) {
      window.Keyboard.show();
    }
  }

  clearFocusSetUp() {
    this.inputEl.current.removeEventListener('ionFocus', this.onFocus);
    this.focus = clearInterval(this.focus);
  }

  componentDidMount() {
    this.inputEl.current.addEventListener('ionInput', this.onInputKeystroke);
    this.inputEl.current.addEventListener('ionClear', this.onInputClear);
    this.inputEl.current.addEventListener('ionFocus', this.onFocus);

    this.focus = setInterval(() => {
      this.inputEl.current.setFocus();
    }, 150);
  }

  componentWillUnmount() {
    this.inputEl.current.removeEventListener('ionInput', this.onInputKeystroke);
    this.inputEl.current.removeEventListener('ionClear', this.onInputClear);
    this.clearFocusSetUp();
  }

  render() {
    const { match } = this.props;
    const occID = match.params.occId;

    const onSpeciesSelected = async taxon => {
      if (occID) {
        const occurrence = this.sample.occurrences.models.find(
          occ => occ.cid === occID
        );
        occurrence.set('taxon', taxon);
      } else {
        const occurrence = new Occurrence({ taxon });
        this.sample.addOccurrence(occurrence);
      }

      await this.sample.save();
      window.history.back();
    };

    return (
      <>
        <AppHeader title={t('Species')} />
        <IonContent id="area-count-taxa">
          <ion-searchbar
            id="taxon"
            ref={this.inputEl}
            placeholder={t('Species name')}
            autocorrect="off"
            autocomplete="off"
            debounce="300"
          />

          <Suggestions
            searchResults={this.state.searchResults}
            searchPhrase={this.state.searchPhrase}
            onSpeciesSelected={onSpeciesSelected}
          />
        </IonContent>
      </>
    );
  }
}

export default Controller;
