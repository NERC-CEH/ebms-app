import React from 'react';
import PropTypes from 'prop-types';
import { IonPage } from '@ionic/react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import Device from 'common/helpers/device';
import loader from 'common/helpers/loader';
import toast from 'common/helpers/toast';
import Header from './Header';
import Main from './Main';

@observer
class index extends React.Component {
  static propTypes = {
    sample: PropTypes.object.isRequired,
    onTransectSelect: PropTypes.func.isRequired,
    appModel: PropTypes.object.isRequired,
    userModel: PropTypes.object.isRequired,
    match: PropTypes.object,
  };

  refreshUserTransects = async () => {
    const { userModel, appModel } = this.props;

    if (!Device.isOnline()) {
      toast({
        message: t("Sorry, looks like you're offline."),
        duration: 2000,
        color: 'warning',
      });
      return;
    }

    await loader.show({
      message: t('Please wait...'),
    });

    try {
      await appModel.updateUserTransects(userModel);

      toast({
        message: t('Transect list was successfully updated.'),
        duration: 2000,
        color: 'success',
      });
    } catch (e) {
      toast({
        header: t('Sorry'),
        message: `${e.message}`,
        duration: 2000,
        color: 'danger',
      });
    }
    await loader.hide();
  };

  onTransectSelect = transect => {
    const { sample, onTransectSelect: onTransectSelectParent } = this.props;

    const location = toJS(transect);
    sample.set('location', location);
    onTransectSelectParent();
  };

  componentDidMount = () => {
    const { appModel } = this.props;
    if (!appModel.attrs.transects.length && Device.isOnline()) {
      this.refreshUserTransects();
    }
  };

  render() {
    const { sample, appModel, match } = this.props;
    const transect = sample.get('location');

    return (
      <IonPage>
        <Header
          showRefreshButton={!transect}
          onRefresh={() => this.refreshUserTransects()}
        />
        <Main
          sample={sample}
          appModel={appModel}
          onTransectSelect={this.onTransectSelect}
          match={match}
        />
      </IonPage>
    );
  }
}

export default index;
