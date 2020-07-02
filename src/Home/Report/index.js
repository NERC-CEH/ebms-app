import React from 'react';
import PropTypes from 'prop-types';
import {
  IonList,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonIcon,
} from '@ionic/react';
import { book, helpBuoy } from 'ionicons/icons';
import Log from 'helpers/log';
import { warn, error } from 'helpers/toast';
import alert from '@bit/flumens.apps.helpers.alert';
import { Trans as T } from 'react-i18next';
import Device from 'helpers/device';
import Page from 'Lib/Page';
import Main from 'Lib/Main';
import { fetchSpeciesReport } from './services';
import './styles.scss';

class Report extends React.Component {
  static propTypes = {
    appModel: PropTypes.object.isRequired,
  };

  state = {
    species: [],
    refreshing: false,
  };

  showInfoGuideTip = () => {
    const { appModel } = this.props;

    if (!appModel.attrs.showGuideHelpTip) {
      return;
    }

    alert({
      header: t('Tip: Finding Help'),
      message: (
        <>
          <T>
            Please visit the Guide{' '}
            <IonIcon icon={book} style={{ marginBottom: '-3px' }} /> and Help{' '}
            <IonIcon icon={helpBuoy} style={{ marginBottom: '-3px' }} /> pages
            before using the app!
          </T>
        </>
      ),
      buttons: [
        {
          text: t('OK, got it'),
          role: 'cancel',
          cssClass: 'primary',
        },
      ],
    });
    appModel.attrs.showGuideHelpTip = false;
    appModel.save();
  };

  componentDidMount = async () => {
    const { appModel } = this.props;

    this.showInfoGuideTip();

    if (!appModel.speciesReport.length && Device.isOnline()) {
      this.refreshReport();
      return;
    }

    this.setState({ species: [...appModel.speciesReport] });
  };

  refreshReport = async () => {
    const { appModel } = this.props;

    this.setState({ refreshing: true });
    try {
      const species = await fetchSpeciesReport();
      appModel.speciesReport = [...species];
      this.setState({ species, refreshing: false });
    } catch (err) {
      this.setState({ refreshing: false });
      throw err;
    }
  };

  onListRefreshPull = async e => {
    if (!Device.isOnline()) {
      warn(t("Sorry, looks like you're offline."));
      e && e.detail.complete(); // refresh pull update
      return;
    }

    try {
      await this.refreshReport();
    } catch (err) {
      Log(err, 'e');
      error(t(err.message));
    }
    e && e.detail.complete(); // refresh pull update
  };

  getUsersReportList = () => {
    // {/* <IonItemDivider>
    //           <IonLabel>{t('TOP RECORDERS')}</IonLabel>
    //         </IonItemDivider>
    //         <IonItem>
    //           <small>{t('Not enough data yet')}</small>
    //         </IonItem> */}
  };

  getSpeciesReportList = () => {
    const { species } = this.state;

    if (!species.length) {
      return null;
    }

    const speciesList = [...species].splice(0, 5);

    const listComponents = speciesList.map(sp => {
      const scientificName = sp.key;
      const commonName = t(scientificName, null, true);

      return (
        <IonItem key={sp.key}>
          <IonLabel style={{ margin: 0, padding: '7px 0' }}>
            {commonName && (
              <IonLabel
                class="ion-text-wrap report-common-name-label"
                position="stacked"
              >
                <b style={{ fontSize: '1.1em' }}>{commonName}</b>
              </IonLabel>
            )}

            <IonLabel
              class="ion-text-wrap report-taxon-label"
              position="stacked"
            >
              <i>{scientificName}</i>
            </IonLabel>
          </IonLabel>
          <IonLabel slot="end" class="report-count-label">
            {sp.doc_count}
          </IonLabel>
        </IonItem>
      );
    });

    return (
      <>
        <IonItemDivider>
          <IonLabel className="home-report-label">
            {t('Top Species from all timed counts')}
          </IonLabel>
        </IonItemDivider>
        <IonItem lines="full" className="list-header-labels">
          <IonLabel>
            <small>{t('Species')}</small>
          </IonLabel>
          <IonLabel class="ion-text-right">
            <small>{t('Counts')}</small>
          </IonLabel>
        </IonItem>

        {listComponents}
      </>
    );
  };

  showEmptyDataMessage = () => {};

  getReport = () => {
    const { refreshing, species } = this.state;

    if (!species.length && !refreshing) {
      return (
        <IonItem class="empty">
          <span>
            <p>{t('Sorry, no report data is available at the moment.')}</p>
          </span>
        </IonItem>
      );
    }

    return (
      <IonList lines="none" className={refreshing ? 'refreshing' : ''}>
        {this.showEmptyDataMessage()}

        {this.getUsersReportList()}
        {this.getSpeciesReportList()}
      </IonList>
    );
  };

  render() {
    const { refreshing, species } = this.state;
    if (!species.length && refreshing) {
      return (
        <Page id="home-report">
          <Main>
            <IonSpinner class="centered" />
          </Main>
        </Page>
      );
    }

    return (
      <Page id="home-report">
        <Main>
          <IonRefresher slot="fixed" onIonRefresh={this.onListRefreshPull}>
            <IonRefresherContent />
          </IonRefresher>
          {this.getReport()}
          {this.showInfoGuideTip()}
        </Main>
      </Page>
    );
  }
}

export default Report;
