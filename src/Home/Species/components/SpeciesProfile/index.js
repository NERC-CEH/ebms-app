import React from 'react';
import {
  IonContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardContent,
  IonCardTitle,
  IonLifeCycleContext,
} from '@ionic/react';
import PropTypes from 'prop-types';
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

  constructor(props) {
    super(props);

    this.map = React.createRef();
    this.speciesMap = React.createRef();
  }

  render() {
    const { species, country } = this.props;

    const status = statuses[species[country]];

    return (
      <IonContent id="species-profile" class="ion-padding">
        <img src={`/images/${species.image}_image.jpg`} alt="species" />

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
    );
  }
}

Component.propTypes = {
  species: PropTypes.object.isRequired,
  country: PropTypes.string.isRequired,
};

export default Component;
