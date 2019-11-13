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

class Component extends React.Component {
  static contextType = IonLifeCycleContext;

  constructor(props) {
    super(props);

    this.map = React.createRef();
    this.speciesMap = React.createRef();
  }

  render() {
    const { species } = this.props;

    return (
      <IonContent id="species-profile" class="ion-padding">
        <img src={`/images/${species.image}_image.jpg`} alt="species" />

        <IonCardHeader>
          <IonCardTitle>{t(species.english)}</IonCardTitle>
          <IonCardSubtitle>{species.taxon}</IonCardSubtitle>
        </IonCardHeader>

        <IonCardContent>{t(species.descriptionKey, true)}</IonCardContent>
      </IonContent>
    );
  }
}

Component.propTypes = {
  species: PropTypes.object.isRequired,
};

export default Component;
