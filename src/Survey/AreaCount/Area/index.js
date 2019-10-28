import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { IonPage } from '@ionic/react';
import Header from './Header';
import Main from './Main';
import './styles.scss';

@observer
class Container extends React.Component {
  static propTypes = {
    sample: PropTypes.object.isRequired,
  };

  state = {};

  toggleGPStracking = () => {
    const { sample } = this.props;
    sample.toggleGPStracking();
  };

  setLocation = shape => {
    const { sample } = this.props;
    sample.setLocation(shape);
  };

  render() {
    const { sample } = this.props;

    const location = sample.get('location') || {};
    const isGPSTracking = sample.isGPSRunning();

    const { area } = location;

    let areaPretty;
    if (area) {
      areaPretty = `${t('Selected area')}: ${area.toLocaleString()} m²`;
    } else {
      areaPretty = t('Please draw your area on the map');
    }

    return (
      <IonPage>
        <Header
          toggleGPStracking={this.toggleGPStracking}
          isGPSTracking={isGPSTracking}
        />
        <Main
          areaPretty={areaPretty}
          isGPSTracking={isGPSTracking}
          location={location}
          setLocation={this.setLocation}
        />
      </IonPage>
    );
  }
}

export default Container;
