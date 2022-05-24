import { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { Page, Header } from '@flumens';

import Main from './Main';

@observer
class Controller extends Component {
  static propTypes = {
    sample: PropTypes.object.isRequired,
  };

  render() {
    return (
      <Page id="survey-area-count-detail-edit">
        <Header title="Additional Details" />
        <Main {...this.props} />
      </Page>
    );
  }
}

export default Controller;
