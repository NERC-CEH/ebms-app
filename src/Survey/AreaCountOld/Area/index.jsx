import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { Page } from '@apps';
import Header from './Header';
import Main from '../../AreaCount/Area/Main';
import './styles.scss';

@observer
class Container extends React.Component {
  static propTypes = {
    sample: PropTypes.object.isRequired,
  };

  state = {};

  toggleGPStracking = on => {
    const { sample } = this.props;
    sample.toggleGPStracking(on);
  };

  setLocation = shape => {
    const { sample } = this.props;
    sample.setLocation(shape);
  };

  render() {
    const { sample } = this.props;

    const location = sample.attrs.location || {};
    const isGPSTracking = sample.isGPSRunning();

    const { area } = location;

    let areaPretty;
    if (area) {
      areaPretty = `${t('Selected area')}: ${area.toLocaleString()} m²`;
    } else {
      areaPretty = t('Please draw your area on the map');
    }

    const isDisabled = !!sample.metadata.synced_on;

    return (
      <Page id="area">
        <Header
          toggleGPStracking={this.toggleGPStracking}
          isGPSTracking={isGPSTracking}
          isDisabled={isDisabled}
        />
        <Main
          areaPretty={areaPretty}
          isGPSTracking={isGPSTracking}
          location={location}
          setLocation={this.setLocation}
          isDisabled={isDisabled}
        />
      </Page>
    );
  }
}

export default Container;
