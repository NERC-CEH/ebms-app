import React from 'react';
import PropTypes from 'prop-types';
import { NavContext } from '@ionic/react';
import Page from 'Lib/Page';
import Main from 'Lib/Main';
import Header from 'Lib/Header';
import SliderInput from 'Lib/SliderInput';
import { observer } from 'mobx-react';
import config from 'config';

@observer
class Component extends React.Component {
  static contextType = NavContext;

  static propTypes = {
    sample: PropTypes.object.isRequired,
    match: PropTypes.object,
  };

  constructor(props) {
    super(props);
    const { match, sample: transectSample } = props;

    this.attrName = 'cloud';

    this.sample = transectSample.samples.find(
      ({ cid }) => cid === match.params.sectionId
    );
    const value = this.sample.attrs[this.attrName];
    this.state = { currentVal: value };

    this.attrConfig = config.indicia.surveys.transect.attrs.cloud;
  }

  onChange = val => {
    this.setState({ currentVal: val });
    this.sample.attrs[this.attrName] = val;
    this.sample.save();

    if (this.attrConfig.type === 'radio') {
      this.context.goBack();
    }
  };

  render() {
    return (
      <Page id="transect-sections-edit-cloud">
        <Header title={t(this.attrConfig.label)} />
        <Main>
          <SliderInput
            type="text"
            config={this.attrConfig}
            default={this.state.currentVal}
            onChange={val => this.onChange(val)}
          />
        </Main>
      </Page>
    );
  }
}
export default Component;
