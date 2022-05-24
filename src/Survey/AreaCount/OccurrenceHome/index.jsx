import { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { Page, Header } from '@flumens';
import Main from './Main';
import './styles.scss';

@observer
class Container extends Component {
  static propTypes = {
    sample: PropTypes.object.isRequired,
    subSample: PropTypes.object.isRequired,
    occurrence: PropTypes.object.isRequired,
  };

  render() {
    const { sample, subSample, occurrence } = this.props;
    const isDisabled = !!sample.metadata.synced_on;

    return (
      <Page id="precise-area-count-edit-occurrence">
        <Header title="Edit Occurrence" />
        <Main
          occurrence={occurrence}
          subSample={subSample}
          isDisabled={isDisabled}
        />
      </Page>
    );
  }
}

export default Container;
