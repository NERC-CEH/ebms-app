import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import {
  IonContent,
  IonModal,
  IonGrid,
  IonRow,
  IonPage,
  IonCol,
} from '@ionic/react';
import ModalHeader from 'Components/ModalHeader';
import speciesProfiles from 'common/data/species.profiles.data.json';
import SpeciesProfile from './components/SpeciesProfile';
import UserFeedbackRequest from './components/UserFeedbackRequest';
import './images';
import './thumbnails';
import './styles.scss';

@observer
class Component extends React.Component {
  static propTypes = {
    appModel: PropTypes.object.isRequired,
    savedSamples: PropTypes.object.isRequired,
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

  getSpecies = () => {
    const { appModel } = this.props;
    let country = appModel.get('country');

    country = country === 'UK' ? 'GB' : country;

    const byCountry = sp => country === 'ELSEWHERE' || sp[country] === 'P';
    const byNotEmptyContent = sp => sp.image && sp.description;
    const bySpeciesId = (sp1, sp2) => sp1.sort_id - sp2.sort_id;

    const filteredSpecies = [...speciesProfiles]
      .filter(byNotEmptyContent)
      .filter(byCountry)
      .sort(bySpeciesId);

    return filteredSpecies;
  };

  getSpeciesGrid() {
    const speciesList = this.getSpecies();

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
            <span className="label">{taxon}</span>
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

  getList = () => {
    const { savedSamples } = this.props;

    const samplesLength = savedSamples.length;

    return (
      <IonContent id="home-species" class="ion-padding">
        <UserFeedbackRequest
          samplesLength={samplesLength}
          appModel={this.props.appModel}
        />

        {this.getSpeciesGrid()}

        <IonModal isOpen={this.state.showModal}>
          <ModalHeader title={t('Species')} onClose={this.hideSpeciesModal} />
          {this.state.showModal && (
            <SpeciesProfile species={this.state.species} />
          )}
        </IonModal>
      </IonContent>
    );
  };

  render() {
    return <IonPage>{this.getList()}</IonPage>;
  }
}

export default Component;
