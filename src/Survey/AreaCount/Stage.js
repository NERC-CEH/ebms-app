import React from 'react';
import PropTypes from 'prop-types';
import { IonContent, IonPage, NavContext } from '@ionic/react';
import AppHeader from 'Components/Header';
import RadioInput from 'Components/RadioInput';
import Input from 'Components/Input';
import Textarea from 'Components/Textarea';
import { observer } from 'mobx-react';
import config from 'config';

@observer
class Component extends React.Component {
  static contextType = NavContext;

  static propTypes = {
    match: PropTypes.object,
    savedSamples: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    const { match, savedSamples } = props;

    const { id: sampleId, occId } = match.params;
    this.attrName = 'stage'; // match.params.attr;
    const sample = savedSamples.get(sampleId);
    this.sample = sample;
    this.occ = sample.occurrences.find(occ => occ.cid === occId);

    this.model = this.occ;

    const value = this.model.get(this.attrName);
    this.state = { currentVal: value };

    this.attrConfig =
      this.attrName === 'date'
        ? config.indicia.attrs.smp.date
        : config.indicia.attrs.occ[this.attrName];
  }

  onChange = val => {
    this.setState({ currentVal: val });
    this.model.set(this.attrName, val);
    this.model.save();

    if (this.attrConfig.type === 'radio') {
      this.context.goBack();
    }
  };

  getAttr = () => {
    switch (this.attrConfig.type) {
      case 'date':
        return (
          <Input
            type="date"
            config={this.attrConfig}
            default={this.state.currentVal}
            onChange={val => this.onChange(val)}
          />
        );
      case 'textarea':
        return (
          <Textarea
            config={this.attrConfig}
            info={t('Please add any extra info about this record.')}
            default={this.state.currentVal}
            onChange={val => this.onChange(val)}
          />
        );

      case 'radio':
        return (
          <RadioInput
            config={this.attrConfig}
            default={this.state.currentVal}
            onChange={val => this.onChange(val)}
          />
        );

      default:
        // TODO: show 404
        return null;
    }
  };

  render() {
    return (
      <IonPage>
        <AppHeader title={t(this.attrConfig.label)} />
        <IonContent id="record-edit-attr">{this.getAttr()}</IonContent>
      </IonPage>
    );
  }
}
export default Component;
