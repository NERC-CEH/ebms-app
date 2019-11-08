import React from 'react';
import Device from 'helpers/device';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import AppHeader from 'common/Components/Header';
import { IonContent, IonPage, NavContext } from '@ionic/react';
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
    match: PropTypes.object,
    sample: PropTypes.object.isRequired,
  };

  static contextType = NavContext;

  constructor(props) {
    super(props);

    SpeciesSearchEngine.init();

    this.inputEl = React.createRef();
    this.onInputKeystroke = this.onInputKeystroke.bind(this);
    this.onInputClear = this.onInputClear.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.state = getDefaultState();

    const { sample: transectSample, match } = props;
    const sectionSampleId = match.params.sectionId;
    const sample = transectSample.getSectionSample(sectionSampleId);

    this.recordedTaxa = sample.occurrences.models.map(
      occ => occ.get('taxon').warehouse_id
    );
  }

  annotateRecordedTaxa = searchResults =>
    searchResults.map(result =>
      this.recordedTaxa.includes(result.warehouse_id)
        ? { ...result, ...{ isRecorded: true } }
        : result
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

    const annotatedSearchResults = this.annotateRecordedTaxa(searchResults);

    this.setState({
      searchResults: annotatedSearchResults,
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
    const { sample: transectSample, match } = this.props;
    const sectionSampleId = match.params.sectionId;
    const sample = transectSample.getSectionSample(sectionSampleId);

    const occID = match.params.occId;

    const onSpeciesSelected = async taxon => {
      if (occID) {
        const occurrence = sample.occurrences.models.find(
          occ => occ.cid === occID
        );
        occurrence.set('taxon', taxon);
      } else {
        const occurrence = new Occurrence({ taxon });
        sample.addOccurrence(occurrence);
      }

      await sample.save();
      this.context.goBack();
    };

    return (
      <IonPage>
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
      </IonPage>
    );
  }
}

export default Controller;
