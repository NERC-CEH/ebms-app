import React from 'react';
import PropTypes from 'prop-types';
import { NavContext } from '@ionic/react';
import Page from 'Components/Page';
import Main from 'Components/Main';
import Header from 'Components/Header';
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
    sample: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    const { match, sample } = props;

    const { occId } = match.params;
    this.attrName = 'stage'; // match.params.attr;
    this.occ = sample.occurrences.find(occ => occ.cid === occId);

    this.model = this.occ;

    const value = this.model.attrs[this.attrName];
    this.state = { currentVal: value };

    const survey = sample.getSurvey();

    this.attrConfig =
      this.attrName === 'date'
        ? config.indicia.surveys[survey].attrs.smp.date
        : config.indicia.surveys[survey].attrs.occ[this.attrName];
  }

  onChange = val => {
    this.setState({ currentVal: val });
    this.model.attrs[this.attrName] = val;
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
      <Page id="area-count-edit-stage">
        <Header title={t(this.attrConfig.label)} />
        <Main>{this.getAttr()}</Main>
      </Page>
    );
  }
}
export default Component;
