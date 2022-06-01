import * as React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { IonModal, IonGrid, IonRow, IonCol } from '@ionic/react';
import { informationCircle } from 'ionicons/icons';
import {
  Page,
  Main,
  ModalHeader,
  UserFeedbackRequest,
  InfoMessage,
} from '@flumens';
import speciesProfiles from 'common/data/profiles/index.json';
import config from 'common/config';
import SpeciesProfile from './components/SpeciesProfile';
import './images';
import './thumbnails';
import './styles.scss';

@observer
class Component extends React.Component {
  static propTypes = {
    appModel: PropTypes.object.isRequired,
    userModel: PropTypes.object.isRequired,
    savedSamples: PropTypes.array.isRequired,
  };

  state = { showModal: false, species: null };

  showSpeciesModal = id => {
    const bySpeciesId = sp => sp.id === id;
    this.setState({
      showModal: true,
      species: speciesProfiles.find(bySpeciesId),
    });
  };

  hideSpeciesModal = () => {
    this.setState({ showModal: false });
  };

  getSpecies = country => {
    const existInCountry = sp => {
      if (country === 'ELSEWHERE') {
        return true;
      }

      const abundanceStatus = sp.abundance[country];
      if (!abundanceStatus) {
        return false;
      }

      const isPresent = !['A', 'Ex'].includes(abundanceStatus);
      return isPresent;
    };
    const byNotEmptyContent = sp => {
      const hasDescription = t(sp.descriptionKey, true);
      return sp.image && hasDescription;
    };
    const bySpeciesId = (sp1, sp2) => sp1.sort_id - sp2.sort_id;

    let filteredSpecies = [...speciesProfiles].filter(existInCountry);
    const totalSpeciesCountryCount = filteredSpecies.length;

    filteredSpecies = filteredSpecies
      .filter(byNotEmptyContent)
      .sort(bySpeciesId);

    return [filteredSpecies, totalSpeciesCountryCount];
  };

  getSpeciesGrid(speciesList) {
    const { appModel } = this.props;
    const { showCommonNamesInGuide } = appModel.attrs;

    const getSpeciesElement = sp => {
      const { id, taxon, image } = sp;

      let label = taxon;
      if (showCommonNamesInGuide) {
        label = t(taxon, null, true) || label; // might not have translation
      }

      const onClick = () => this.showSpeciesModal(id);

      return (
        <IonCol
          key={id}
          className="species-list-item"
          onClick={onClick}
          size="6"
          size-lg
          class="ion-no-padding ion-no-margin"
        >
          <div
            style={{
              backgroundImage: `url('/images/${image}_thumbnail.jpg')`,
            }}
          >
            <span className="label">{label}</span>
          </div>
        </IonCol>
      );
    };

    const speciesColumns = speciesList.map(getSpeciesElement);

    return (
      <IonGrid class="ion-no-padding ion-no-margin">
        <IonRow class="ion-no-padding ion-no-margin">{speciesColumns}</IonRow>
      </IonGrid>
    );
  }

  onFeedbackDone = () => {
    const { appModel } = this.props;

    appModel.attrs.feedbackGiven = true;
    appModel.save();
  };

  showFeedback = () => {
    const { savedSamples, appModel, userModel } = this.props;
    if (appModel.attrs.feedbackGiven) {
      return false;
    }

    if (appModel.attrs.useTraining) {
      return false;
    }

    if (!userModel.isLoggedIn()) {
      return false;
    }

    return savedSamples.length > 5;
  };

  render() {
    const { appModel } = this.props;
    let { country } = appModel.attrs;
    country = country === 'UK' ? 'GB' : country;

    const [speciesList, totalSpeciesCountryCount] = this.getSpecies(country);
    const countrySpeciesCount = speciesList.length;

    const feedbackPanel = this.showFeedback() && (
      <UserFeedbackRequest
        email={config.feedbackEmail}
        onFeedbackDone={this.onFeedbackDone}
      />
    );

    return (
      <Page id="home-species">
        <Main className="ion-padding">
          <InfoMessage className="blue" icon={informationCircle}>
            This guide is still in development. It covers{' '}
            {{ countrySpeciesCount }} butterfly species out of the{' '}
            {{ totalSpeciesCountryCount }} species in your selected country.
          </InfoMessage>

          {feedbackPanel}

          {this.getSpeciesGrid(speciesList)}

          <IonModal isOpen={this.state.showModal} backdropDismiss={false}>
            <ModalHeader title={t('Species')} onClose={this.hideSpeciesModal} />
            {this.state.showModal && (
              <SpeciesProfile species={this.state.species} country={country} />
            )}
          </IonModal>
        </Main>
      </Page>
    );
  }
}

export default Component;
