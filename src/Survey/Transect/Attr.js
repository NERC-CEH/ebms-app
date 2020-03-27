import React from 'react';
import PropTypes from 'prop-types';
import { IonPage, NavContext } from '@ionic/react';
import Main from 'Components/Main';
import AppHeader from 'Components/Header';
import RadioInput from 'Components/RadioInput';
import Input from 'Components/Input';
import SliderInput from 'Components/SliderInput';
import Textarea from 'Components/Textarea';
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
    const { match, sample } = props;

    this.attrName = match.params.attr;

    const value = sample.attrs[this.attrName];
    this.state = { currentVal: value };

    this.attrConfig = config.indicia.surveys.transect.attrs.smp[this.attrName];
  }

  onChange = val => {
    const { sample } = this.props;
    this.setState({ currentVal: val });
    sample.attrs[this.attrName] = val;
    sample.save();

    if (this.attrConfig.type === 'radio') {
      this.context.goBack();
    }
  };

  getAttr = () => {
    switch (this.attrConfig.type) {
      case 'number':
      case 'text':
      case 'time':
      case 'date':
        return (
          <Input
            type={this.attrConfig.type}
            config={this.attrConfig}
            default={this.state.currentVal}
            onChange={val => this.onChange(val)}
          />
        );

      case 'slider':
        return (
          <SliderInput
            type={this.attrConfig.type}
            config={this.attrConfig}
            default={this.state.currentVal}
            onChange={val => this.onChange(val)}
          />
        );

      case 'textarea':
        return (
          <Textarea
            config={this.attrConfig}
            info="Please add any extra info about this record."
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
        <Main id="record-edit-attr">{this.getAttr()}</Main>
      </IonPage>
    );
  }
}
export default Component;
