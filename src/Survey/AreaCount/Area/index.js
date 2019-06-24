import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import Header from './Header';
import Main from './Main';
import './styles.scss';

@observer
class Container extends React.Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    savedSamples: PropTypes.object.isRequired,
  };

  state = {};

  toggleGPStracking = () => {
    const { match, savedSamples } = this.props;
    const sample = savedSamples.get(match.params.id);
    sample.toggleGPStracking();
  };

  setLocation = shape => {
    const { match, savedSamples } = this.props;
    const sample = savedSamples.get(match.params.id);
    // console.log(JSON.stringify(shape.coordinates.map(coordinates =>
    //   [...coordinates].reverse().map(float => Number.parseFloat(float))
    // )));

    sample.setLocation(shape);
  };

  render() {
    const { match, savedSamples } = this.props;

    const sample = savedSamples.get(match.params.id);
    const location = sample.get('location') || {};
    const isGPSTracking = sample.isGPSRunning();

    return (
      <>
        <Header
          sample={sample}
          toggleGPStracking={this.toggleGPStracking}
          isGPSTracking={isGPSTracking}
        />
        <Main
          isGPSTracking={isGPSTracking}
          location={location}
          setLocation={this.setLocation}
        />
      </>
    );
  }
}

export default Container;
