import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Device from 'helpers/device';
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

export default class index extends Component {
  static propTypes = {
    onSpeciesSelected: PropTypes.func.isRequired,
    recordedTaxa: PropTypes.array,
  };

  constructor(props) {
    super(props);

    SpeciesSearchEngine.init();

    this.inputEl = React.createRef();
    this.onInputKeystroke = this.onInputKeystroke.bind(this);
    this.onInputClear = this.onInputClear.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.state = getDefaultState();
  }

  annotateRecordedTaxa = searchResults => {
    const recordedTaxa = this.props.recordedTaxa || [];
    return searchResults.map(result =>
      recordedTaxa.includes(result.warehouse_id)
        ? { ...result, ...{ isRecorded: true } }
        : result
    );
  };

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
    return (
      <>
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
          onSpeciesSelected={this.props.onSpeciesSelected}
        />
      </>
    );
  }
}
