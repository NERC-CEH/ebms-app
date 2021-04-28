import React from 'react';
import PropTypes from 'prop-types';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import Sample from 'sample';
import { Page, toast, loader, device } from '@apps';
import Header from './Header';
import Main from './Main';

const { success, error, warn } = toast;

@observer
class index extends React.Component {
  static propTypes = {
    sample: PropTypes.object.isRequired,
    appModel: PropTypes.object.isRequired,
    userModel: PropTypes.object.isRequired,
  };

  refreshUserTransects = async () => {
    const { userModel, appModel } = this.props;

    if (!device.isOnline()) {
      warn(t("Sorry, looks like you're offline."));
      return;
    }

    await loader.show({
      message: t('Please wait...'),
    });

    try {
      await appModel.updateUserTransects(userModel);

      success(t('Transect list was successfully updated.'));
    } catch (e) {
      error(e.message);
    }
    await loader.hide();
  };

  addSectionSubSamples = () => {
    const { sample } = this.props;
    const transect = sample.attrs.location;
    const survey = sample.getSurvey();
    transect.sections.forEach(section => {
      const sectionSample = survey.smp.create(Sample, section);
      sample.samples.push(sectionSample);
    });
    sample.save();
  };

  onTransectSelect = transect => {
    const { sample } = this.props;

    const location = toJS(transect);
    sample.attrs.location = location;
    this.addSectionSubSamples();
  };

  componentDidMount = () => {
    const { appModel } = this.props;
    if (!appModel.attrs.transects.length && device.isOnline()) {
      this.refreshUserTransects();
    }
  };

  render() {
    const { sample, appModel } = this.props;
    const transect = sample.attrs.location;

    return (
      <Page id="transect-sections-list">
        <Header
          showRefreshButton={!transect}
          onRefresh={() => this.refreshUserTransects()}
        />
        <Main
          sample={sample}
          appModel={appModel}
          onTransectSelect={this.onTransectSelect}
        />
      </Page>
    );
  }
}

export default index;
