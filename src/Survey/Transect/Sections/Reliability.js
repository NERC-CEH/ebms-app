import React from 'react';
import PropTypes from 'prop-types';
import { IonContent, IonPage, NavContext } from '@ionic/react';
import AppHeader from 'Components/Header';
import RadioInput from 'Components/RadioInput';
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

    this.attrName = 'reliability';

    this.sample = transectSample.samples.models.find(
      ({ cid }) => cid === match.params.sectionId
    );
    const value = this.sample.get(this.attrName);
    this.state = { currentVal: value };

    this.attrConfig = config.indicia.surveys.transect.attrs.smp.reliability;
  }

  onChange = val => {
    this.setState({ currentVal: val });
    this.sample.set(this.attrName, val);
    this.sample.save();

    if (this.attrConfig.type === 'radio') {
      this.context.goBack();
    }
  };

  render() {
    return (
      <IonPage>
        <AppHeader title={t(this.attrConfig.label)} />
        <IonContent id="record-edit-attr">
          <RadioInput
            config={this.attrConfig}
            default={this.state.currentVal}
            onChange={val => this.onChange(val)}
          />
        </IonContent>
      </IonPage>
    );
  }
}
export default Component;
