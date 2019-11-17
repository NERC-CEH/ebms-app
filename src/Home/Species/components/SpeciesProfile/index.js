import React from 'react';
import {
  IonContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardContent,
  IonCardTitle,
  IonLifeCycleContext,
} from '@ionic/react';
import { PhotoSwipe } from 'react-photoswipe';
import PropTypes from 'prop-types';
import 'react-photoswipe/lib/photoswipe.css';
import 'react-photoswipe/dist/default-skin.svg';
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

  getGallery = () => {
    const { species } = this.props;
    const { showGallery } = this.state;

    const items = [
      {
        src: `/images/${species.image}_image.jpg`,
        w: species.image_width || 800,
        h: species.image_height || 800,
        title: `© ${species.image_copyright}`,
      },
    ];
    
    return (
      <PhotoSwipe
        isOpen={!!showGallery}
        items={items}
        options={{
          index: showGallery - 1,
          shareEl: false,
          fullscreenEl: false,
        }}
        onClose={() => this.setState({ showGallery: false })}
      />
    );
  };

  render() {
    const { species, country } = this.props;

    const status = statuses[species[country]];
    
    /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
    return (
      <>
        {this.getGallery()}

        <IonContent id="species-profile" class="ion-padding">
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
              <h3 className="species-label inline-label">{`${t('Status')}:`}</h3>
              <span>{t(status)}</span>
            </IonCardContent>
          )}

          <IonCardContent>
            <h3 className="species-label">{`${t('Description')}:`}</h3>
            {t(species.descriptionKey, true)}
          </IonCardContent>
        </IonContent>
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
