import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { IonModal, IonGrid, IonRow, IonPage, IonCol } from '@ionic/react';
import { Trans as T } from 'react-i18next';
import Main from 'Components/Main';
import ModalHeader from 'Components/ModalHeader';
import speciesProfiles from 'common/data/species.profiles.data.json';
import SpeciesProfile from './components/SpeciesProfile';
import UserFeedbackRequest from './components/UserFeedbackRequest';
import './images';
import './thumbnails';
import './styles.scss';

function getInfoMessage(countrySpeciesCount, totalSpeciesCountryCount) {
  return (
    <div className="info-message">
      <p>
        <T>
          This guide is still in development. It covers{' '}
          {{ countrySpeciesCount }} butterfly species out of the{' '}
          {{ totalSpeciesCountryCount }} species in your selected country.
        </T>
      </p>
    </div>
  );
}

@observer
class Component extends React.Component {
  static propTypes = {
    appModel: PropTypes.object.isRequired,
    savedSamples: PropTypes.array.isRequired,
  };

  state = { showModal: false, species: null };

  showSpeciesModal = id => {
    this.setState({
      showModal: true,
      species: speciesProfiles.find(sp => sp.id === id),
    });
  };

  hideSpeciesModal = () => {
    this.setState({ showModal: false });
  };

  getSpecies = country => {
    const byCountry = sp => {
      const isPresent = !['A', 'Ex'].includes(sp[country]);
      return country === 'ELSEWHERE' || isPresent;
    };
    const byNotEmptyContent = sp => {
      const hasDescription = t(sp.descriptionKey, true);
      return sp.image && hasDescription;
    };
    const bySpeciesId = (sp1, sp2) => sp1.sort_id - sp2.sort_id;

    let filteredSpecies = [...speciesProfiles].filter(byCountry);
    const totalSpeciesCountryCount = filteredSpecies.length;

    filteredSpecies = filteredSpecies
      .filter(byNotEmptyContent)
      .sort(bySpeciesId);

    return [filteredSpecies, totalSpeciesCountryCount];
  };

  getSpeciesGrid(speciesList) {
    const getSpeciesElement = sp => {
      const { id, taxon, image } = sp;

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
            <span className="label">{t(taxon, null, true) || taxon}</span>
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

  render() {
    const { savedSamples, appModel } = this.props;
    let { country } = appModel.attrs;
    country = country === 'UK' ? 'GB' : country;

    const samplesLength = savedSamples.length;
    const [speciesList, totalSpeciesCountryCount] = this.getSpecies(country);
    const countrySpeciesCount = speciesList.length;

    return (
      <IonPage>
        <Main id="home-species" class="ion-padding">
          {getInfoMessage(countrySpeciesCount, totalSpeciesCountryCount)}

          <UserFeedbackRequest
            samplesLength={samplesLength}
            appModel={this.props.appModel}
          />

          {this.getSpeciesGrid(speciesList)}

          <IonModal isOpen={this.state.showModal} backdropDismiss={false}>
            <ModalHeader title={t('Species')} onClose={this.hideSpeciesModal} />
            {this.state.showModal && (
              <SpeciesProfile species={this.state.species} country={country} />
            )}
          </IonModal>
        </Main>
      </IonPage>
    );
  }
}

export default Component;
