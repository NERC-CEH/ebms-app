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

  render() {
    const { match, savedSamples } = this.props;

    const sample = savedSamples.get(match.params.id);

    return (
      <>
        <Header sample={sample} />
        <Main sample={sample} />
      </>
    );
  }
}

export default Container;
