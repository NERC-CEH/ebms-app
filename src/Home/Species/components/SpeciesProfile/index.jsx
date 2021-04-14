import React from 'react';
import {
  IonCardHeader,
  IonCardSubtitle,
  IonCardContent,
  IonCardTitle,
  IonLifeCycleContext,
} from '@ionic/react';
import PropTypes from 'prop-types';
import { Main, Gallery } from '@apps';
import { Trans as T } from 'react-i18next';
import './styles.scss';

const statuses = {
  A: 'Absent',
  P: 'Present',
  'P?': 'Possibly present',
  M: 'Regular migrant',
  I: 'Irregular vagrant',
  Ex: 'Regionally extinct',
};

class Component extends React.Component {
  static contextType = IonLifeCycleContext;

  state = {
    showGallery: false,
  };

  constructor(props) {
    super(props);

    this.map = React.createRef();
    this.speciesMap = React.createRef();
  }

  getFullScreenPhotoViewer = () => {
    const { species } = this.props;
    const { showGallery } = this.state;

    if (!showGallery) {
      return null;
    }

    const items = [
      {
        src: `/images/${species.image}_image.jpg`,
        footer: `© ${species.image_copyright}`,
      },
    ];

    return (
      <Gallery
        isOpen
        items={items}
        onClose={() => this.setState({ showGallery: false })}
        mode="md"
      />
    );
  };

  render() {
    const { species, country } = this.props;

    const status = statuses[species.abundance[country]];

    /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
    return (
      <>
        {this.getFullScreenPhotoViewer()}

        <Main id="species-profile" class="ion-padding">
          <img
            src={`/images/${species.image}_image.jpg`}
            alt="species"
            onClick={() => this.setState({ showGallery: 1 })}
          />

          <IonCardHeader>
            <IonCardTitle>{t(species.taxon, null, true)}</IonCardTitle>
            <IonCardSubtitle>{species.taxon}</IonCardSubtitle>
          </IonCardHeader>

          {status && (
            <IonCardContent>
              <h3 className="species-label inline-label">
                <T>Status</T>:
              </h3>
              <span>
                <T>{status}</T>
              </span>
            </IonCardContent>
          )}

          <IonCardContent>
            <h3 className="species-label">
              <T>Description</T>:
            </h3>
            {t(species.descriptionKey, true)}
          </IonCardContent>
        </Main>
      </>
    );
    /* eslint-enable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
  }
}

Component.propTypes = {
  species: PropTypes.object.isRequired,
  country: PropTypes.string.isRequired,
};

export default Component;
